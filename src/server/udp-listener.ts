import dgram from 'dgram';
import { PacketHeader, parseHeader } from './parser/header';
import { parseMotionData } from './parser/motion';
import { parseSessionData } from './parser/session';
import { parseLapData } from './parser/lap-data';
import { PacketEventData, parseEventData } from './parser/event';
import { PacketParticipantsData, parseParticipantsData } from './parser/participants';
import { parseCarSetupData } from './parser/car-setup';
import { parseCarTelemetryData } from './parser/car-telemetry';
import { parseCarStatusData } from './parser/car-status';
import { parseFinalClassificationData } from './parser/final-classification';
import { parseCarDamageData } from './parser/car-damage';
import { parseSessionHistoryData } from './parser/session-history';
import { parseTyreSetsData } from './parser/tyre-sets';
import { parseMotionExData } from './parser/motion-ex';
import { parseTimeTrialData } from './parser/time-trial';
import { parseLapPositionsData } from './parser/lap-positions';
import { parseCarTelemetry2Data } from './parser/car-telemetry2';
import { PacketId, DEFAULT_UDP_PORT, MAX_CARS, maxCarsForFormat, isFormat2026, HEADER_SIZE, MAX_CARS_2025, MAX_CARS_2026, BYTES_PER_CAR_MOTION_2025 } from '../lib/constants';
import { publish, RedisChannel } from './realtime/redis';
import {
  writeMotionSamples,
  writeTelemetrySamples,
  writeLapDataSamples,
  writeCarDamageSamples,
  upsertSession,
  upsertParticipants,
  writeEvent,
  writeFinalClassification,
} from './db/writers';

let motionThrottleCounter = 0;
let telemetryThrottleCounter = 0;
let lapDataThrottleCounter = 0;
let statusThrottleCounter = 0;
let damageThrottleCounter = 0;
let formatLoggedForSession = '';

const humanCarIndicesBySession = new Map<string, Set<number>>();
const pendingEventsBySession = new Map<string, PacketEventData[]>();

const DB_WRITE_INTERVAL = 5;
const REALTIME_THROTTLE = 2;

function getOrCreateHumanCarIndices(sessionUID: string): Set<number> {
  let indices = humanCarIndicesBySession.get(sessionUID);
  if (!indices) {
    indices = new Set<number>();
    humanCarIndicesBySession.set(sessionUID, indices);
  }
  return indices;
}

function rememberHumanCarIndicesFromHeader(sessionUID: string, header: PacketHeader): Set<number> {
  const indices = getOrCreateHumanCarIndices(sessionUID);

  if (header.playerCarIndex >= 0 && header.playerCarIndex < MAX_CARS) {
    indices.add(header.playerCarIndex);
  }

  if (header.secondaryPlayerCarIndex >= 0 && header.secondaryPlayerCarIndex < MAX_CARS) {
    indices.add(header.secondaryPlayerCarIndex);
  }

  return indices;
}

function rememberHumanCarIndicesFromParticipants(sessionUID: string, packet: PacketParticipantsData): Set<number> {
  const indices = rememberHumanCarIndicesFromHeader(sessionUID, packet.header);

  for (let i = 0; i < packet.numActiveCars; i++) {
    if (packet.participants[i]?.aiControlled === 0) {
      indices.add(i);
    }
  }

  return indices;
}

function queuePendingEvent(packet: PacketEventData): void {
  const sessionUID = packet.header.sessionUID.toString();
  const queued = pendingEventsBySession.get(sessionUID) ?? [];
  queued.push(packet);
  pendingEventsBySession.set(sessionUID, queued);
}

async function flushPendingEvents(sessionUID: string): Promise<void> {
  const queued = pendingEventsBySession.get(sessionUID);
  if (!queued || queued.length === 0) return;

  const remaining: PacketEventData[] = [];

  for (const packet of queued) {
    try {
      const persisted = await writeEvent(packet);
      if (!persisted) {
        remaining.push(packet);
      }
    } catch (e: any) {
      console.error('[DB] Event flush error:', e.message);
      remaining.push(packet);
    }
  }

  if (remaining.length > 0) {
    pendingEventsBySession.set(sessionUID, remaining);
    return;
  }

  pendingEventsBySession.delete(sessionUID);
}

export function startUDPListener(): dgram.Socket {
  const port = parseInt(process.env.UDP_PORT || String(DEFAULT_UDP_PORT), 10);
  const host = process.env.UDP_HOST || '0.0.0.0';
  const server = dgram.createSocket('udp4');

  server.on('message', (msg: Buffer) => {
    try {
      if (msg.length < 29) return;
      const header = parseHeader(msg);
      const sessionUID = header.sessionUID.toString();

      switch (header.packetId) {
        case PacketId.Motion: {
          if (formatLoggedForSession !== sessionUID) {
            formatLoggedForSession = sessionUID;
            const expected2025Motion = HEADER_SIZE + MAX_CARS_2025 * BYTES_PER_CAR_MOTION_2025;
            const fmt26 = isFormat2026(header.packetFormat, header.gameYear, msg.length, expected2025Motion);
            console.log(`[UDP] Session ${sessionUID} — packetFormat=${header.packetFormat} gameYear=${header.gameYear} bufLen=${msg.length} → treating as ${fmt26 ? '2026' : '2025'} (${fmt26 ? MAX_CARS_2026 : MAX_CARS_2025} cars)`);
          }
          const packet = parseMotionData(msg, header);
          motionThrottleCounter++;
          if (motionThrottleCounter % REALTIME_THROTTLE === 0) {
            const slim = packet.carMotionData.map((m, idx) => ({
              i: idx,
              x: Math.round(m.worldPositionX * 10) / 10,
              z: Math.round(m.worldPositionZ * 10) / 10,
              yaw: Math.round(m.yaw * 100) / 100,
            }));
            publish(RedisChannel.Motion, { sessionUID, cars: slim });
          }
          if (motionThrottleCounter % DB_WRITE_INTERVAL === 0) {
            writeMotionSamples(packet).catch((e) => console.error('[DB] Motion write error:', e.message));
          }
          break;
        }

        case PacketId.Session: {
          const packet = parseSessionData(msg, header);
          publish(RedisChannel.Session, {
            sessionUID,
            trackId: packet.trackId,
            sessionType: packet.sessionType,
            weather: packet.weather,
            trackTemperature: packet.trackTemperature,
            airTemperature: packet.airTemperature,
            totalLaps: packet.totalLaps,
            trackLength: packet.trackLength,
            sessionTimeLeft: packet.sessionTimeLeft,
            sessionDuration: packet.sessionDuration,
            safetyCarStatus: packet.safetyCarStatus,
            formula: packet.formula,
            pitStopWindowIdealLap: packet.pitStopWindowIdealLap,
            pitStopWindowLatestLap: packet.pitStopWindowLatestLap,
            sector2LapDistanceStart: packet.sector2LapDistanceStart,
            sector3LapDistanceStart: packet.sector3LapDistanceStart,
            weatherForecast: packet.weatherForecastSamples.slice(0, packet.numWeatherForecastSamples),
          });
          upsertSession(packet)
            .then(() => flushPendingEvents(sessionUID))
            .catch((e) => console.error('[DB] Session write error:', e.message));
          break;
        }

        case PacketId.LapData: {
          const packet = parseLapData(msg, header);
          lapDataThrottleCounter++;
          if (lapDataThrottleCounter % REALTIME_THROTTLE === 0) {
            const slim = packet.lapData.map((l, idx) => ({
              i: idx,
              pos: l.carPosition,
              lap: l.currentLapNum,
              lastLap: l.lastLapTimeInMS,
              curLap: l.currentLapTimeInMS,
              s1: l.sector1TimeMinutesPart * 60000 + l.sector1TimeMSPart,
              s2: l.sector2TimeMinutesPart * 60000 + l.sector2TimeMSPart,
              dFront: l.deltaToCarInFrontMinutesPart * 60000 + l.deltaToCarInFrontMSPart,
              dLeader: l.deltaToRaceLeaderMinutesPart * 60000 + l.deltaToRaceLeaderMSPart,
              pit: l.pitStatus,
              sector: l.sector,
              status: l.driverStatus,
              result: l.resultStatus,
              penalties: l.penalties,
              grid: l.gridPosition,
              dist: Math.round(l.lapDistance),
              speedTrap: l.speedTrapFastestSpeed,
            }));
            publish(RedisChannel.LapData, { sessionUID, cars: slim });
          }
          if (lapDataThrottleCounter % DB_WRITE_INTERVAL === 0) {
            writeLapDataSamples(packet).catch((e) => console.error('[DB] LapData write error:', e.message));
          }
          break;
        }

        case PacketId.Event: {
          const packet = parseEventData(msg, header);
          if (packet.eventStringCode !== 'BUTN') {
            publish(RedisChannel.Event, {
              sessionUID,
              code: packet.eventStringCode,
              details: packet.eventDetails,
            });
            writeEvent(packet)
              .then((persisted) => {
                if (!persisted) {
                  queuePendingEvent(packet);
                }
              })
              .catch((e) => console.error('[DB] Event write error:', e.message));
          }
          break;
        }

        case PacketId.Participants: {
          const packet = parseParticipantsData(msg, header);
          if (formatLoggedForSession === sessionUID) {
            const teams = packet.participants.slice(0, Math.min(5, packet.numActiveCars)).map((p) => p.teamId);
            console.log(`[UDP] Participants bufLen=${msg.length} numActive=${packet.numActiveCars} first5teams=${JSON.stringify(teams)}`);
            formatLoggedForSession = '';
          }
          rememberHumanCarIndicesFromParticipants(sessionUID, packet);
          const slim = packet.participants.slice(0, packet.numActiveCars).map((p, idx) => ({
            i: idx,
            name: p.name,
            team: p.teamId,
            num: p.raceNumber,
            ai: p.aiControlled,
            nat: p.nationality,
          }));
          publish(RedisChannel.Participants, {
            sessionUID,
            numActive: packet.numActiveCars,
            drivers: slim,
          });
          upsertParticipants(packet).catch((e) => console.error('[DB] Participants write error:', e.message));
          break;
        }

        case PacketId.CarTelemetry: {
          const packet = parseCarTelemetryData(msg, header);
          const humanCarIndices = rememberHumanCarIndicesFromHeader(sessionUID, header);
          telemetryThrottleCounter++;
          if (telemetryThrottleCounter % REALTIME_THROTTLE === 0) {
            const slim = packet.carTelemetryData.map((t, idx) => ({
              i: idx,
              spd: t.speed,
              thr: Math.round(t.throttle * 100) / 100,
              brk: Math.round(t.brake * 100) / 100,
              str: Math.round(t.steer * 100) / 100,
              gear: t.gear,
              rpm: t.engineRPM,
              drs: t.drs,
              eTemp: t.engineTemperature,
              tSurf: t.tyresSurfaceTemperature,
              tInner: t.tyresInnerTemperature,
              bTemp: t.brakesTemperature,
              tPress: t.tyresPressure.map((p) => Math.round(p * 10) / 10),
            }));
            publish(RedisChannel.Telemetry, {
              sessionUID,
              cars: slim,
              suggestedGear: packet.suggestedGear,
            });
          }
          if (telemetryThrottleCounter % DB_WRITE_INTERVAL === 0) {
            writeTelemetrySamples(packet, humanCarIndices).catch((e) => console.error('[DB] Telemetry write error:', e.message));
          }
          break;
        }

        case PacketId.CarStatus: {
          const packet = parseCarStatusData(msg, header);
          statusThrottleCounter++;
          if (statusThrottleCounter % REALTIME_THROTTLE === 0) {
            const slim = packet.carStatusData.map((s, idx) => ({
              i: idx,
              fuel: Math.round(s.fuelInTank * 100) / 100,
              fuelLaps: Math.round(s.fuelRemainingLaps * 100) / 100,
              drsOk: s.drsAllowed,
              drsDist: s.drsActivationDistance,
              tyre: s.visualTyreCompound,
              tyreActual: s.actualTyreCompound,
              tyreAge: s.tyresAgeLaps,
              ersStore: Math.round(s.ersStoreEnergy),
              ersMode: s.ersDeployMode,
              ersK: Math.round(s.ersHarvestedThisLapMGUK),
              ersH: Math.round(s.ersHarvestedThisLapMGUH),
              ersLimit: Math.round(s.ersHarvestLimitPerLap),
              ersDeployed: Math.round(s.ersDeployedThisLap),
              iceW: Math.round(s.enginePowerICE),
              mgukW: Math.round(s.enginePowerMGUK),
              flags: s.vehicleFIAFlags,
            }));
            publish(RedisChannel.CarStatus, { sessionUID, cars: slim });
          }
          break;
        }

        case PacketId.FinalClassification: {
          const packet = parseFinalClassificationData(msg, header);
          publish(RedisChannel.FinalClassification, {
            sessionUID,
            numCars: packet.numCars,
            results: packet.classificationData.slice(0, packet.numCars).map((c, idx) => ({
              i: idx,
              pos: c.position,
              laps: c.numLaps,
              grid: c.gridPosition,
              pts: c.points,
              pits: c.numPitStops,
              bestLap: c.bestLapTimeInMS,
              totalTime: c.totalRaceTime,
              penalties: c.penaltiesTime,
              status: c.resultStatus,
            })),
          });
          writeFinalClassification(packet).catch((e) => console.error('[DB] Classification write error:', e.message));
          break;
        }

        case PacketId.CarDamage: {
          const packet = parseCarDamageData(msg, header);
          const humanCarIndices = rememberHumanCarIndicesFromHeader(sessionUID, header);
          damageThrottleCounter++;
          if (damageThrottleCounter % (REALTIME_THROTTLE * 5) === 0) {
            const slim = packet.carDamageData.map((d, idx) => ({
              i: idx,
              tyreWear: d.tyresWear.map((w) => Math.round(w * 10) / 10),
              flWing: d.frontLeftWingDamage,
              frWing: d.frontRightWingDamage,
              rWing: d.rearWingDamage,
              floor: d.floorDamage,
              engine: d.engineDamage,
              gearbox: d.gearBoxDamage,
            }));
            publish(RedisChannel.CarDamage, { sessionUID, cars: slim });
          }
          if (damageThrottleCounter % (DB_WRITE_INTERVAL * 5) === 0) {
            writeCarDamageSamples(packet, humanCarIndices).catch((e) => console.error('[DB] CarDamage write error:', e.message));
          }
          break;
        }

        case PacketId.CarSetups: {
          const packet = parseCarSetupData(msg, header);
          const slim = packet.carSetupData.map((s, idx) => ({
            i: idx,
            frontWing: s.frontWing,
            rearWing: s.rearWing,
            onThrottle: s.onThrottle,
            offThrottle: s.offThrottle,
            frontCamber: Math.round(s.frontCamber * 100) / 100,
            rearCamber: Math.round(s.rearCamber * 100) / 100,
            frontToe: Math.round(s.frontToe * 1000) / 1000,
            rearToe: Math.round(s.rearToe * 1000) / 1000,
            frontSuspension: s.frontSuspension,
            rearSuspension: s.rearSuspension,
            frontAntiRollBar: s.frontAntiRollBar,
            rearAntiRollBar: s.rearAntiRollBar,
            frontSuspensionHeight: s.frontSuspensionHeight,
            rearSuspensionHeight: s.rearSuspensionHeight,
            brakePressure: s.brakePressure,
            brakeBias: s.brakeBias,
            rearLeftTyrePressure: Math.round(s.rearLeftTyrePressure * 10) / 10,
            rearRightTyrePressure: Math.round(s.rearRightTyrePressure * 10) / 10,
            frontLeftTyrePressure: Math.round(s.frontLeftTyrePressure * 10) / 10,
            frontRightTyrePressure: Math.round(s.frontRightTyrePressure * 10) / 10,
            fuelLoad: Math.round(s.fuelLoad * 100) / 100,
          }));
          publish(RedisChannel.CarSetups, { sessionUID, cars: slim });
          break;
        }

        case PacketId.SessionHistory: {
          const packet = parseSessionHistoryData(msg, header);
          const entries = [];
          for (let i = 0; i < packet.numLaps; i++) {
            const lh = packet.lapHistoryData[i];
            if (lh.lapTimeInMS === 0) continue;
            const s1 = lh.sector1TimeMinutesPart * 60000 + lh.sector1TimeMSPart;
            const s2 = lh.sector2TimeMinutesPart * 60000 + lh.sector2TimeMSPart;
            const s3 = lh.sector3TimeMinutesPart * 60000 + lh.sector3TimeMSPart;
            entries.push({
              carIndex: packet.carIdx,
              lap: i + 1,
              lapTimeMs: lh.lapTimeInMS,
              s1Ms: s1,
              s2Ms: s2,
              s3Ms: s3,
            });
          }
          if (entries.length > 0) {
            publish(RedisChannel.LapHistory, { sessionUID, entries });
          }
          break;
        }

        case PacketId.LapPositions: {
          const packet = parseLapPositionsData(msg, header);
          const entries = [];
          for (let lap = 0; lap < packet.numLaps; lap++) {
            const lapPositions = packet.positionForVehicleIdx[lap] ?? [];
            for (let car = 0; car < lapPositions.length; car++) {
              const pos = packet.positionForVehicleIdx[lap][car];
              if (pos > 0) {
                entries.push({
                  carIndex: car,
                  lap: packet.lapStart + lap + 1,
                  position: pos,
                });
              }
            }
          }
          if (entries.length > 0) {
            publish(RedisChannel.PositionHistory, { sessionUID, entries });
          }
          break;
        }

        case PacketId.CarTelemetry2: {
          const packet = parseCarTelemetry2Data(msg, header);
          const slim = packet.carTelemetry2Data.map((t, idx) => ({
            i: idx,
            aeroMode: t.activeAeroMode,
            aeroAvail: t.activeAeroAvailable,
            aeroDist: t.activeAeroActivationDistance,
            otAvail: t.overtakeAvailable,
            otActive: t.overtakeActive,
            otDist: t.overtakeActivationDistance,
            is26: t.regulations2026,
            wrongWay: t.drivingWrongWay,
          }));
          publish(RedisChannel.CarTelemetry2, { sessionUID, cars: slim });
          break;
        }

        case PacketId.LobbyInfo:
        case PacketId.TyreSets:
        case PacketId.MotionEx:
        case PacketId.TimeTrial:
          break;
      }
    } catch (err: any) {
      console.error('[UDP] Packet processing error:', err.message);
    }
  });

  server.on('error', (err) => {
    console.error('[UDP] Server error:', err);
    server.close();
  });

  server.bind(port, host, () => {
    console.log(`[UDP] Listening on ${host}:${port}`);
  });

  return server;
}
