import { PacketHeader } from './header';
import { HEADER_SIZE, isFormat2026 } from '../../lib/constants';

export interface TimeTrialDataSet {
  carIdx: number;
  teamId: number;
  lapTimeInMS: number;
  sector1TimeInMS: number;
  sector2TimeInMS: number;
  sector3TimeInMS: number;
  tractionControl: number;
  gearboxAssist: number;
  antiLockBrakes: number;
  equalCarPerformance: number;
  customSetup: number;
  valid: number;
}

export interface PacketTimeTrialData {
  header: PacketHeader;
  playerSessionBestDataSet: TimeTrialDataSet;
  personalBestDataSet: TimeTrialDataSet;
  rivalDataSet: TimeTrialDataSet;
}

function parseTimeTrialDataSet(buf: Buffer, offset: number, is2026: boolean): { data: TimeTrialDataSet; newOffset: number } {
  const carIdx = buf.readUInt8(offset); offset += 1;
  const teamId = is2026 ? buf.readUInt16LE(offset) : buf.readUInt8(offset); offset += is2026 ? 2 : 1;
  const lapTimeInMS = buf.readUInt32LE(offset); offset += 4;
  const sector1TimeInMS = buf.readUInt32LE(offset); offset += 4;
  const sector2TimeInMS = buf.readUInt32LE(offset); offset += 4;
  const sector3TimeInMS = buf.readUInt32LE(offset); offset += 4;
  const tractionControl = buf.readUInt8(offset); offset += 1;
  const gearboxAssist = buf.readUInt8(offset); offset += 1;
  const antiLockBrakes = buf.readUInt8(offset); offset += 1;
  const equalCarPerformance = buf.readUInt8(offset); offset += 1;
  const customSetup = buf.readUInt8(offset); offset += 1;
  const valid = buf.readUInt8(offset); offset += 1;

  return {
    data: {
      carIdx, teamId, lapTimeInMS, sector1TimeInMS, sector2TimeInMS, sector3TimeInMS,
      tractionControl, gearboxAssist, antiLockBrakes, equalCarPerformance, customSetup, valid,
    },
    newOffset: offset,
  };
}

export function parseTimeTrialData(buf: Buffer, header: PacketHeader): PacketTimeTrialData {
  let offset = HEADER_SIZE;
  const is2026 = isFormat2026(header.packetFormat, header.gameYear);

  const r1 = parseTimeTrialDataSet(buf, offset, is2026); offset = r1.newOffset;
  const r2 = parseTimeTrialDataSet(buf, offset, is2026); offset = r2.newOffset;
  const r3 = parseTimeTrialDataSet(buf, offset, is2026); offset = r3.newOffset;

  return {
    header,
    playerSessionBestDataSet: r1.data,
    personalBestDataSet: r2.data,
    rivalDataSet: r3.data,
  };
}
