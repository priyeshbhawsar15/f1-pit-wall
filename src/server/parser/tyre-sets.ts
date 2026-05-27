import { PacketHeader } from './header';
import { HEADER_SIZE, MAX_TYRE_SETS } from '../../lib/constants';

export interface TyreSetData {
  actualTyreCompound: number;
  visualTyreCompound: number;
  wear: number;
  available: number;
  recommendedSession: number;
  lifeSpan: number;
  usableLife: number;
  lapDeltaTime: number;
  fitted: number;
}

export interface PacketTyreSetsData {
  header: PacketHeader;
  carIdx: number;
  tyreSetData: TyreSetData[];
  fittedIdx: number;
}

export function parseTyreSetsData(buf: Buffer, header: PacketHeader): PacketTyreSetsData {
  let offset = HEADER_SIZE;

  const carIdx = buf.readUInt8(offset); offset += 1;

  const tyreSetData: TyreSetData[] = [];
  for (let i = 0; i < MAX_TYRE_SETS; i++) {
    const actualTyreCompound = buf.readUInt8(offset); offset += 1;
    const visualTyreCompound = buf.readUInt8(offset); offset += 1;
    const wear = buf.readUInt8(offset); offset += 1;
    const available = buf.readUInt8(offset); offset += 1;
    const recommendedSession = buf.readUInt8(offset); offset += 1;
    const lifeSpan = buf.readUInt8(offset); offset += 1;
    const usableLife = buf.readUInt8(offset); offset += 1;
    const lapDeltaTime = buf.readInt16LE(offset); offset += 2;
    const fitted = buf.readUInt8(offset); offset += 1;

    tyreSetData.push({
      actualTyreCompound, visualTyreCompound, wear, available,
      recommendedSession, lifeSpan, usableLife, lapDeltaTime, fitted,
    });
  }

  const fittedIdx = buf.readUInt8(offset); offset += 1;

  return { header, carIdx, tyreSetData, fittedIdx };
}
