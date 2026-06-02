import { prisma } from '../../lib/db';
import { Prisma } from '@prisma/client';
import { PacketMotionData } from '../parser/motion';
import { PacketCarTelemetryData } from '../parser/car-telemetry';
import { PacketLapData, getSectorTimeMS, getDeltaMS } from '../parser/lap-data';
import { PacketCarDamageData } from '../parser/car-damage';
import { PacketSessionData } from '../parser/session';
import { PacketParticipantsData } from '../parser/participants';
import { PacketEventData } from '../parser/event';
import { PacketFinalClassificationData } from '../parser/final-classification';

export async function writeMotionSamples(packet: PacketMotionData): Promise<void> {
  const now = new Date();
  const sessionUID = BigInt.asIntN(64, packet.header.sessionUID).toString();
  const values: string[] = [];

  for (let i = 0; i < packet.carMotionData.length; i++) {
    const m = packet.carMotionData[i];
    if (m.worldPositionX === 0 && m.worldPositionZ === 0) continue;
    values.push(
      `('${now.toISOString()}', ${sessionUID}, ${i}, ${m.worldPositionX}, ${m.worldPositionY}, ${m.worldPositionZ}, ` +
      `${m.worldVelocityX}, ${m.worldVelocityY}, ${m.worldVelocityZ}, ` +
      `${m.gForceLateral}, ${m.gForceLongitudinal}, ${m.gForceVertical}, ` +
      `${m.yaw}, ${m.pitch}, ${m.roll})`
    );
  }

  if (values.length === 0) return;

  await prisma.$executeRawUnsafe(
    `INSERT INTO motion_samples (time, session_uid, car_index, world_position_x, world_position_y, world_position_z, ` +
    `world_velocity_x, world_velocity_y, world_velocity_z, g_force_lateral, g_force_longitudinal, g_force_vertical, ` +
    `yaw, pitch, roll) VALUES ${values.join(',')}`
  );
}

export async function writeTelemetrySamples(packet: PacketCarTelemetryData, humanCarIndices: Set<number>): Promise<void> {
  const now = new Date();
  const sessionUID = BigInt.asIntN(64, packet.header.sessionUID).toString();
  const values: string[] = [];

  for (let i = 0; i < packet.carTelemetryData.length; i++) {
    if (!humanCarIndices.has(i)) continue;
    const t = packet.carTelemetryData[i];
    if (t.speed === 0 && t.engineRPM === 0) continue;
    values.push(
      `('${now.toISOString()}', ${sessionUID}, ${i}, ${t.speed}, ${t.throttle}, ${t.steer}, ${t.brake}, ` +
      `${t.clutch}, ${t.gear}, ${t.engineRPM}, ${t.drs})`
    );
  }

  if (values.length === 0) return;

  await prisma.$executeRawUnsafe(
    `INSERT INTO telemetry_samples (time, session_uid, car_index, speed, throttle, steer, brake, clutch, gear, ` +
    `engine_rpm, drs) VALUES ${values.join(',')}`
  );
}

export async function writeLapDataSamples(packet: PacketLapData): Promise<void> {
  const now = new Date();
  const sessionUID = BigInt.asIntN(64, packet.header.sessionUID).toString();
  const values: string[] = [];

  for (let i = 0; i < packet.lapData.length; i++) {
    const l = packet.lapData[i];
    if (l.resultStatus === 0) continue;
    const s1 = getSectorTimeMS(l.sector1TimeMinutesPart, l.sector1TimeMSPart);
    const s2 = getSectorTimeMS(l.sector2TimeMinutesPart, l.sector2TimeMSPart);
    const deltaFront = getDeltaMS(l.deltaToCarInFrontMinutesPart, l.deltaToCarInFrontMSPart);
    const deltaLeader = getDeltaMS(l.deltaToRaceLeaderMinutesPart, l.deltaToRaceLeaderMSPart);

    values.push(
      `('${now.toISOString()}', ${sessionUID}, ${i}, ${l.currentLapTimeInMS}, ${l.lastLapTimeInMS}, ` +
      `${s1}, ${s2}, ${deltaFront}, ${deltaLeader}, ${l.lapDistance}, ${l.totalDistance}, ` +
      `${l.carPosition}, ${l.currentLapNum}, ${l.pitStatus}, ${l.numPitStops}, ${l.sector}, ` +
      `${l.currentLapInvalid}, ${l.penalties}, ${l.driverStatus}, ${l.resultStatus}, ` +
      `${l.speedTrapFastestSpeed}, ${l.gridPosition})`
    );
  }

  if (values.length === 0) return;

  await prisma.$executeRawUnsafe(
    `INSERT INTO lap_data_samples (time, session_uid, car_index, current_lap_time_ms, last_lap_time_ms, ` +
    `sector1_time_ms, sector2_time_ms, delta_to_car_in_front_ms, delta_to_race_leader_ms, ` +
    `lap_distance, total_distance, car_position, current_lap_num, pit_status, num_pit_stops, ` +
    `sector, current_lap_invalid, penalties, driver_status, result_status, ` +
    `speed_trap_fastest_speed, grid_position) VALUES ${values.join(',')}`
  );
}

export async function writeCarDamageSamples(packet: PacketCarDamageData, humanCarIndices: Set<number>): Promise<void> {
  const now = new Date();
  const sessionUID = BigInt.asIntN(64, packet.header.sessionUID).toString();
  const values: string[] = [];

  for (let i = 0; i < packet.carDamageData.length; i++) {
    if (!humanCarIndices.has(i)) continue;
    const d = packet.carDamageData[i];
    values.push(
      `('${now.toISOString()}', ${sessionUID}, ${i}, ` +
      `${d.tyresWear[0]}, ${d.tyresWear[1]}, ${d.tyresWear[2]}, ${d.tyresWear[3]}, ` +
      `${d.frontLeftWingDamage}, ${d.frontRightWingDamage}, ${d.rearWingDamage}, ` +
      `${d.floorDamage}, ${d.gearBoxDamage}, ${d.engineDamage})`
    );
  }

  if (values.length === 0) return;

  await prisma.$executeRawUnsafe(
    `INSERT INTO car_damage_samples (time, session_uid, car_index, tyres_wear_rl, tyres_wear_rr, tyres_wear_fl, tyres_wear_fr, ` +
    `front_left_wing_damage, front_right_wing_damage, rear_wing_damage, ` +
    `floor_damage, gearbox_damage, engine_damage) VALUES ${values.join(',')}`
  );
}

export async function upsertSession(packet: PacketSessionData): Promise<void> {
  const uid = BigInt.asIntN(64, packet.header.sessionUID);
  const existing = await prisma.session.findUnique({ where: { sessionUID: uid } });

  const session = await prisma.session.upsert({
    where: { sessionUID: uid },
    update: {
      weather: packet.weather,
      airTemperature: packet.airTemperature,
      trackTemperature: packet.trackTemperature,
      safetyCarStatus: packet.safetyCarStatus,
    },
    create: {
      sessionUID: uid,
      trackId: packet.trackId,
      sessionType: packet.sessionType,
      weather: packet.weather,
      totalLaps: packet.totalLaps,
      trackLength: packet.trackLength,
      formula: packet.formula,
      airTemperature: packet.airTemperature,
      trackTemperature: packet.trackTemperature,
      safetyCarStatus: packet.safetyCarStatus,
      networkGame: packet.networkGame,
    },
  });

  // Auto-link to active seasons if this is a new session
  if (!existing) {
    const activeSeasons = await prisma.season.findMany({ where: { isActive: true } });
    for (const season of activeSeasons) {
      await prisma.seasonRace.upsert({
        where: { seasonId_sessionId: { seasonId: season.id, sessionId: session.id } },
        update: {},
        create: { seasonId: season.id, sessionId: session.id },
      });
    }
  }
}

export async function upsertParticipants(packet: PacketParticipantsData): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { sessionUID: BigInt.asIntN(64, packet.header.sessionUID) },
  });
  if (!session) return;

  for (let i = 0; i < packet.numActiveCars; i++) {
    const p = packet.participants[i];
    await prisma.participant.upsert({
      where: {
        sessionId_carIndex: { sessionId: session.id, carIndex: i },
      },
      update: {
        driverId: p.driverId,
        teamId: p.teamId,
        raceNumber: p.raceNumber,
        nationality: p.nationality,
        name: p.name,
        aiControlled: p.aiControlled === 1,
        platform: p.platform,
      },
      create: {
        sessionId: session.id,
        carIndex: i,
        driverId: p.driverId,
        teamId: p.teamId,
        raceNumber: p.raceNumber,
        nationality: p.nationality,
        name: p.name,
        aiControlled: p.aiControlled === 1,
        platform: p.platform,
      },
    });
  }
}

export async function writeEvent(packet: PacketEventData): Promise<boolean> {
  const session = await prisma.session.findUnique({
    where: { sessionUID: BigInt.asIntN(64, packet.header.sessionUID) },
  });
  if (!session) return false;

  const sessionTimeMs = Number.isFinite(packet.header.sessionTime)
    ? Math.max(0, Math.round(packet.header.sessionTime * 1000))
    : null;
  const details = JSON.stringify(packet.eventDetails ?? null);

  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO events ("sessionId", "eventCode", timestamp, "sessionTimeMs", details)
      VALUES (${session.id}, ${packet.eventStringCode}, ${new Date()}, ${sessionTimeMs}, CAST(${details} AS JSONB))
    `
  );

  return true;
}

export async function writeFinalClassification(packet: PacketFinalClassificationData): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { sessionUID: BigInt.asIntN(64, packet.header.sessionUID) },
  });
  if (!session) return;

  for (let i = 0; i < packet.numCars; i++) {
    const c = packet.classificationData[i];
    await prisma.finalClassification.upsert({
      where: {
        sessionId_carIndex: { sessionId: session.id, carIndex: i },
      },
      update: {
        position: c.position,
        bestLapTimeInMS: c.bestLapTimeInMS,
        totalRaceTime: c.totalRaceTime,
      },
      create: {
        sessionId: session.id,
        carIndex: i,
        position: c.position,
        numLaps: c.numLaps,
        gridPosition: c.gridPosition,
        points: c.points,
        numPitStops: c.numPitStops,
        resultStatus: c.resultStatus,
        bestLapTimeInMS: c.bestLapTimeInMS,
        totalRaceTime: c.totalRaceTime,
        penaltiesTime: c.penaltiesTime,
        tyreStints: {
          actual: c.tyreStintsActual.slice(0, c.numTyreStints),
          visual: c.tyreStintsVisual.slice(0, c.numTyreStints),
          endLaps: c.tyreStintsEndLaps.slice(0, c.numTyreStints),
        },
      },
    });
  }
}
