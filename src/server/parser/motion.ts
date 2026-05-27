import { PacketHeader } from './header';
import { HEADER_SIZE, MAX_CARS } from '../../lib/constants';

export interface CarMotionData {
  worldPositionX: number;
  worldPositionY: number;
  worldPositionZ: number;
  worldVelocityX: number;
  worldVelocityY: number;
  worldVelocityZ: number;
  worldForwardDirX: number;
  worldForwardDirY: number;
  worldForwardDirZ: number;
  worldRightDirX: number;
  worldRightDirY: number;
  worldRightDirZ: number;
  gForceLateral: number;
  gForceLongitudinal: number;
  gForceVertical: number;
  yaw: number;
  pitch: number;
  roll: number;
}

export interface PacketMotionData {
  header: PacketHeader;
  carMotionData: CarMotionData[];
}

const CAR_MOTION_SIZE = 60; // 6 floats (24) + 6 int16 (12) + 6 floats (24) = 60 bytes

export function parseMotionData(buf: Buffer, header: PacketHeader): PacketMotionData {
  const carMotionData: CarMotionData[] = [];
  let offset = HEADER_SIZE;

  for (let i = 0; i < MAX_CARS; i++) {
    const worldPositionX = buf.readFloatLE(offset); offset += 4;
    const worldPositionY = buf.readFloatLE(offset); offset += 4;
    const worldPositionZ = buf.readFloatLE(offset); offset += 4;
    const worldVelocityX = buf.readFloatLE(offset); offset += 4;
    const worldVelocityY = buf.readFloatLE(offset); offset += 4;
    const worldVelocityZ = buf.readFloatLE(offset); offset += 4;
    const worldForwardDirX = buf.readInt16LE(offset); offset += 2;
    const worldForwardDirY = buf.readInt16LE(offset); offset += 2;
    const worldForwardDirZ = buf.readInt16LE(offset); offset += 2;
    const worldRightDirX = buf.readInt16LE(offset); offset += 2;
    const worldRightDirY = buf.readInt16LE(offset); offset += 2;
    const worldRightDirZ = buf.readInt16LE(offset); offset += 2;
    const gForceLateral = buf.readFloatLE(offset); offset += 4;
    const gForceLongitudinal = buf.readFloatLE(offset); offset += 4;
    const gForceVertical = buf.readFloatLE(offset); offset += 4;
    const yaw = buf.readFloatLE(offset); offset += 4;
    const pitch = buf.readFloatLE(offset); offset += 4;
    const roll = buf.readFloatLE(offset); offset += 4;

    carMotionData.push({
      worldPositionX, worldPositionY, worldPositionZ,
      worldVelocityX, worldVelocityY, worldVelocityZ,
      worldForwardDirX, worldForwardDirY, worldForwardDirZ,
      worldRightDirX, worldRightDirY, worldRightDirZ,
      gForceLateral, gForceLongitudinal, gForceVertical,
      yaw, pitch, roll,
    });
  }

  return { header, carMotionData };
}
