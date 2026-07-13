import { PacketHeader } from './header';
import { HEADER_SIZE } from '../../lib/constants';
import { getCarCount, TelemetryFormat } from './format';

export interface LapData {
  lastLapTimeInMS: number;
  currentLapTimeInMS: number;
  sector1TimeMSPart: number;
  sector1TimeMinutesPart: number;
  sector2TimeMSPart: number;
  sector2TimeMinutesPart: number;
  deltaToCarInFrontMSPart: number;
  deltaToCarInFrontMinutesPart: number;
  deltaToRaceLeaderMSPart: number;
  deltaToRaceLeaderMinutesPart: number;
  lapDistance: number;
  totalDistance: number;
  safetyCarDelta: number;
  carPosition: number;
  currentLapNum: number;
  pitStatus: number;
  numPitStops: number;
  sector: number;
  currentLapInvalid: number;
  penalties: number;
  totalWarnings: number;
  cornerCuttingWarnings: number;
  numUnservedDriveThroughPens: number;
  numUnservedStopGoPens: number;
  gridPosition: number;
  driverStatus: number;
  resultStatus: number;
  pitLaneTimerActive: number;
  pitLaneTimeInLaneInMS: number;
  pitStopTimerInMS: number;
  pitStopShouldServePen: number;
  speedTrapFastestSpeed: number;
  speedTrapFastestLap: number;
}

export interface PacketLapData {
  header: PacketHeader;
  lapData: LapData[];
  timeTrialPBCarIdx: number;
  timeTrialRivalCarIdx: number;
}

export function parseLapData(buf: Buffer, header: PacketHeader, format: TelemetryFormat): PacketLapData {
  const lapData: LapData[] = [];
  let offset = HEADER_SIZE;

  for (let i = 0; i < getCarCount(format); i++) {
    const lastLapTimeInMS = buf.readUInt32LE(offset); offset += 4;
    const currentLapTimeInMS = buf.readUInt32LE(offset); offset += 4;
    const sector1TimeMSPart = buf.readUInt16LE(offset); offset += 2;
    const sector1TimeMinutesPart = buf.readUInt8(offset); offset += 1;
    const sector2TimeMSPart = buf.readUInt16LE(offset); offset += 2;
    const sector2TimeMinutesPart = buf.readUInt8(offset); offset += 1;
    const deltaToCarInFrontMSPart = buf.readUInt16LE(offset); offset += 2;
    const deltaToCarInFrontMinutesPart = buf.readUInt8(offset); offset += 1;
    const deltaToRaceLeaderMSPart = buf.readUInt16LE(offset); offset += 2;
    const deltaToRaceLeaderMinutesPart = buf.readUInt8(offset); offset += 1;
    const lapDistance = buf.readFloatLE(offset); offset += 4;
    const totalDistance = buf.readFloatLE(offset); offset += 4;
    const safetyCarDelta = buf.readFloatLE(offset); offset += 4;
    const carPosition = buf.readUInt8(offset); offset += 1;
    const currentLapNum = buf.readUInt8(offset); offset += 1;
    const pitStatus = buf.readUInt8(offset); offset += 1;
    const numPitStops = buf.readUInt8(offset); offset += 1;
    const sector = buf.readUInt8(offset); offset += 1;
    const currentLapInvalid = buf.readUInt8(offset); offset += 1;
    const penalties = buf.readUInt8(offset); offset += 1;
    const totalWarnings = buf.readUInt8(offset); offset += 1;
    const cornerCuttingWarnings = buf.readUInt8(offset); offset += 1;
    const numUnservedDriveThroughPens = buf.readUInt8(offset); offset += 1;
    const numUnservedStopGoPens = buf.readUInt8(offset); offset += 1;
    const gridPosition = buf.readUInt8(offset); offset += 1;
    const driverStatus = buf.readUInt8(offset); offset += 1;
    const resultStatus = buf.readUInt8(offset); offset += 1;
    const pitLaneTimerActive = buf.readUInt8(offset); offset += 1;
    const pitLaneTimeInLaneInMS = buf.readUInt16LE(offset); offset += 2;
    const pitStopTimerInMS = buf.readUInt16LE(offset); offset += 2;
    const pitStopShouldServePen = buf.readUInt8(offset); offset += 1;
    const speedTrapFastestSpeed = buf.readFloatLE(offset); offset += 4;
    const speedTrapFastestLap = buf.readUInt8(offset); offset += 1;

    lapData.push({
      lastLapTimeInMS, currentLapTimeInMS,
      sector1TimeMSPart, sector1TimeMinutesPart,
      sector2TimeMSPart, sector2TimeMinutesPart,
      deltaToCarInFrontMSPart, deltaToCarInFrontMinutesPart,
      deltaToRaceLeaderMSPart, deltaToRaceLeaderMinutesPart,
      lapDistance, totalDistance, safetyCarDelta,
      carPosition, currentLapNum, pitStatus, numPitStops,
      sector, currentLapInvalid, penalties, totalWarnings,
      cornerCuttingWarnings, numUnservedDriveThroughPens,
      numUnservedStopGoPens, gridPosition, driverStatus,
      resultStatus, pitLaneTimerActive, pitLaneTimeInLaneInMS,
      pitStopTimerInMS, pitStopShouldServePen,
      speedTrapFastestSpeed, speedTrapFastestLap,
    });
  }

  const timeTrialPBCarIdx = buf.readUInt8(offset); offset += 1;
  const timeTrialRivalCarIdx = buf.readUInt8(offset); offset += 1;

  return { header, lapData, timeTrialPBCarIdx, timeTrialRivalCarIdx };
}

export function getSectorTimeMS(minutesPart: number, msPart: number): number {
  return minutesPart * 60000 + msPart;
}

export function getDeltaMS(minutesPart: number, msPart: number): number {
  return minutesPart * 60000 + msPart;
}
