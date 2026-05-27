import { PacketHeader } from './header';
import { HEADER_SIZE, MAX_LAPS_IN_HISTORY, MAX_TYRE_STINTS } from '../../lib/constants';

export interface LapHistoryData {
  lapTimeInMS: number;
  sector1TimeMSPart: number;
  sector1TimeMinutesPart: number;
  sector2TimeMSPart: number;
  sector2TimeMinutesPart: number;
  sector3TimeMSPart: number;
  sector3TimeMinutesPart: number;
  lapValidBitFlags: number;
}

export interface TyreStintHistoryData {
  endLap: number;
  tyreActualCompound: number;
  tyreVisualCompound: number;
}

export interface PacketSessionHistoryData {
  header: PacketHeader;
  carIdx: number;
  numLaps: number;
  numTyreStints: number;
  bestLapTimeLapNum: number;
  bestSector1LapNum: number;
  bestSector2LapNum: number;
  bestSector3LapNum: number;
  lapHistoryData: LapHistoryData[];
  tyreStintsHistoryData: TyreStintHistoryData[];
}

export function parseSessionHistoryData(buf: Buffer, header: PacketHeader): PacketSessionHistoryData {
  let offset = HEADER_SIZE;

  const carIdx = buf.readUInt8(offset); offset += 1;
  const numLaps = buf.readUInt8(offset); offset += 1;
  const numTyreStints = buf.readUInt8(offset); offset += 1;
  const bestLapTimeLapNum = buf.readUInt8(offset); offset += 1;
  const bestSector1LapNum = buf.readUInt8(offset); offset += 1;
  const bestSector2LapNum = buf.readUInt8(offset); offset += 1;
  const bestSector3LapNum = buf.readUInt8(offset); offset += 1;

  const lapHistoryData: LapHistoryData[] = [];
  for (let i = 0; i < MAX_LAPS_IN_HISTORY; i++) {
    const lapTimeInMS = buf.readUInt32LE(offset); offset += 4;
    const sector1TimeMSPart = buf.readUInt16LE(offset); offset += 2;
    const sector1TimeMinutesPart = buf.readUInt8(offset); offset += 1;
    const sector2TimeMSPart = buf.readUInt16LE(offset); offset += 2;
    const sector2TimeMinutesPart = buf.readUInt8(offset); offset += 1;
    const sector3TimeMSPart = buf.readUInt16LE(offset); offset += 2;
    const sector3TimeMinutesPart = buf.readUInt8(offset); offset += 1;
    const lapValidBitFlags = buf.readUInt8(offset); offset += 1;

    lapHistoryData.push({
      lapTimeInMS, sector1TimeMSPart, sector1TimeMinutesPart,
      sector2TimeMSPart, sector2TimeMinutesPart,
      sector3TimeMSPart, sector3TimeMinutesPart,
      lapValidBitFlags,
    });
  }

  const tyreStintsHistoryData: TyreStintHistoryData[] = [];
  for (let i = 0; i < MAX_TYRE_STINTS; i++) {
    const endLap = buf.readUInt8(offset); offset += 1;
    const tyreActualCompound = buf.readUInt8(offset); offset += 1;
    const tyreVisualCompound = buf.readUInt8(offset); offset += 1;
    tyreStintsHistoryData.push({ endLap, tyreActualCompound, tyreVisualCompound });
  }

  return {
    header, carIdx, numLaps, numTyreStints,
    bestLapTimeLapNum, bestSector1LapNum, bestSector2LapNum, bestSector3LapNum,
    lapHistoryData, tyreStintsHistoryData,
  };
}
