import { HEADER_SIZE } from '../../lib/constants';

export interface PacketHeader {
  packetFormat: number;
  gameYear: number;
  gameMajorVersion: number;
  gameMinorVersion: number;
  packetVersion: number;
  packetId: number;
  sessionUID: bigint;
  sessionTime: number;
  frameIdentifier: number;
  overallFrameIdentifier: number;
  playerCarIndex: number;
  secondaryPlayerCarIndex: number;
}

export function parseHeader(buf: Buffer): PacketHeader {
  let offset = 0;

  const packetFormat = buf.readUInt16LE(offset); offset += 2;
  const gameYear = buf.readUInt8(offset); offset += 1;
  const gameMajorVersion = buf.readUInt8(offset); offset += 1;
  const gameMinorVersion = buf.readUInt8(offset); offset += 1;
  const packetVersion = buf.readUInt8(offset); offset += 1;
  const packetId = buf.readUInt8(offset); offset += 1;
  const sessionUID = buf.readBigUInt64LE(offset); offset += 8;
  const sessionTime = buf.readFloatLE(offset); offset += 4;
  const frameIdentifier = buf.readUInt32LE(offset); offset += 4;
  const overallFrameIdentifier = buf.readUInt32LE(offset); offset += 4;
  const playerCarIndex = buf.readUInt8(offset); offset += 1;
  const secondaryPlayerCarIndex = buf.readUInt8(offset); offset += 1;

  return {
    packetFormat,
    gameYear,
    gameMajorVersion,
    gameMinorVersion,
    packetVersion,
    packetId,
    sessionUID,
    sessionTime,
    frameIdentifier,
    overallFrameIdentifier,
    playerCarIndex,
    secondaryPlayerCarIndex,
  };
}
