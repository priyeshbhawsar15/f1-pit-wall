import { PacketHeader } from './header';
import { HEADER_SIZE, BYTES_PER_CAR_MOTION_2025, BYTES_PER_CAR_MOTION_2026 } from '../../lib/constants';
import { getCarCount, TelemetryFormat } from './format';

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

export function parseMotionData(buf: Buffer, header: PacketHeader, format: TelemetryFormat): PacketMotionData {
  const carMotionData: CarMotionData[] = [];
  let offset = HEADER_SIZE;
  const is2026 = format === 2026;
  const bytesPerCar = is2026 ? BYTES_PER_CAR_MOTION_2026 : BYTES_PER_CAR_MOTION_2025;
  const maxCars = Math.min(
    Math.floor((buf.length - HEADER_SIZE) / bytesPerCar),
    getCarCount(format),
  );

  for (let i = 0; i < maxCars; i++) {
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
    let gForceLateral: number;
    let gForceLongitudinal: number;
    let gForceVertical: number;
    if (is2026) {
      gForceLateral      = buf.readInt16LE(offset) / 1000; offset += 2;
      gForceLongitudinal = buf.readInt16LE(offset) / 1000; offset += 2;
      gForceVertical     = buf.readInt16LE(offset) / 1000; offset += 2;
    } else {
      gForceLateral      = buf.readFloatLE(offset); offset += 4;
      gForceLongitudinal = buf.readFloatLE(offset); offset += 4;
      gForceVertical     = buf.readFloatLE(offset); offset += 4;
    }
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
