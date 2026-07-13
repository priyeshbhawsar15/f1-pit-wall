import { PacketHeader } from './header';
import { HEADER_SIZE, MAX_TYRE_STINTS } from '../../lib/constants';
import { getCarCount, TelemetryFormat } from './format';

export interface FinalClassificationData {
  position: number;
  numLaps: number;
  gridPosition: number;
  points: number;
  numPitStops: number;
  resultStatus: number;
  resultReason: number;
  bestLapTimeInMS: number;
  totalRaceTime: number;
  penaltiesTime: number;
  numPenalties: number;
  numTyreStints: number;
  tyreStintsActual: number[];
  tyreStintsVisual: number[];
  tyreStintsEndLaps: number[];
}

export interface PacketFinalClassificationData {
  header: PacketHeader;
  numCars: number;
  classificationData: FinalClassificationData[];
}

export function parseFinalClassificationData(buf: Buffer, header: PacketHeader, format: TelemetryFormat): PacketFinalClassificationData {
  let offset = HEADER_SIZE;

  const numCars = Math.min(buf.readUInt8(offset), getCarCount(format)); offset += 1;

  const classificationData: FinalClassificationData[] = [];
  for (let i = 0; i < getCarCount(format); i++) {
    const position = buf.readUInt8(offset); offset += 1;
    const numLaps = buf.readUInt8(offset); offset += 1;
    const gridPosition = buf.readUInt8(offset); offset += 1;
    const points = buf.readUInt8(offset); offset += 1;
    const numPitStops = buf.readUInt8(offset); offset += 1;
    const resultStatus = buf.readUInt8(offset); offset += 1;
    const resultReason = buf.readUInt8(offset); offset += 1;
    const bestLapTimeInMS = buf.readUInt32LE(offset); offset += 4;
    const totalRaceTime = buf.readDoubleLE(offset); offset += 8;
    const penaltiesTime = buf.readUInt8(offset); offset += 1;
    const numPenalties = buf.readUInt8(offset); offset += 1;
    const numTyreStints = buf.readUInt8(offset); offset += 1;

    const tyreStintsActual: number[] = [];
    for (let j = 0; j < MAX_TYRE_STINTS; j++) { tyreStintsActual.push(buf.readUInt8(offset)); offset += 1; }

    const tyreStintsVisual: number[] = [];
    for (let j = 0; j < MAX_TYRE_STINTS; j++) { tyreStintsVisual.push(buf.readUInt8(offset)); offset += 1; }

    const tyreStintsEndLaps: number[] = [];
    for (let j = 0; j < MAX_TYRE_STINTS; j++) { tyreStintsEndLaps.push(buf.readUInt8(offset)); offset += 1; }

    classificationData.push({
      position, numLaps, gridPosition, points, numPitStops,
      resultStatus, resultReason, bestLapTimeInMS, totalRaceTime,
      penaltiesTime, numPenalties, numTyreStints,
      tyreStintsActual, tyreStintsVisual, tyreStintsEndLaps,
    });
  }

  return { header, numCars, classificationData };
}
