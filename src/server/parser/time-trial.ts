import { PacketHeader } from './header';
import { HEADER_SIZE } from '../../lib/constants';

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

function parseTimeTrialDataSet(buf: Buffer, offset: number): { data: TimeTrialDataSet; newOffset: number } {
  const carIdx = buf.readUInt8(offset); offset += 1;
  const teamId = buf.readUInt8(offset); offset += 1;
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

  const r1 = parseTimeTrialDataSet(buf, offset); offset = r1.newOffset;
  const r2 = parseTimeTrialDataSet(buf, offset); offset = r2.newOffset;
  const r3 = parseTimeTrialDataSet(buf, offset); offset = r3.newOffset;

  return {
    header,
    playerSessionBestDataSet: r1.data,
    personalBestDataSet: r2.data,
    rivalDataSet: r3.data,
  };
}
