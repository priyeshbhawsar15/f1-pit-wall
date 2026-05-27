import { PacketHeader } from './header';
import { HEADER_SIZE } from '../../lib/constants';

export interface PacketMotionExData {
  header: PacketHeader;
  suspensionPosition: number[];
  suspensionVelocity: number[];
  suspensionAcceleration: number[];
  wheelSpeed: number[];
  wheelSlipRatio: number[];
  wheelSlipAngle: number[];
  wheelLatForce: number[];
  wheelLongForce: number[];
  heightOfCOGAboveGround: number;
  localVelocityX: number;
  localVelocityY: number;
  localVelocityZ: number;
  angularVelocityX: number;
  angularVelocityY: number;
  angularVelocityZ: number;
  angularAccelerationX: number;
  angularAccelerationY: number;
  angularAccelerationZ: number;
  frontWheelsAngle: number;
  wheelVertForce: number[];
  frontAeroHeight: number;
  rearAeroHeight: number;
  frontRollAngle: number;
  rearRollAngle: number;
  chassisYaw: number;
  chassisPitch: number;
  wheelCamber: number[];
  wheelCamberGain: number[];
}

function readFloatArray(buf: Buffer, offset: number, count: number): { values: number[]; newOffset: number } {
  const values: number[] = [];
  for (let i = 0; i < count; i++) {
    values.push(buf.readFloatLE(offset));
    offset += 4;
  }
  return { values, newOffset: offset };
}

export function parseMotionExData(buf: Buffer, header: PacketHeader): PacketMotionExData {
  let offset = HEADER_SIZE;
  let result;

  result = readFloatArray(buf, offset, 4); const suspensionPosition = result.values; offset = result.newOffset;
  result = readFloatArray(buf, offset, 4); const suspensionVelocity = result.values; offset = result.newOffset;
  result = readFloatArray(buf, offset, 4); const suspensionAcceleration = result.values; offset = result.newOffset;
  result = readFloatArray(buf, offset, 4); const wheelSpeed = result.values; offset = result.newOffset;
  result = readFloatArray(buf, offset, 4); const wheelSlipRatio = result.values; offset = result.newOffset;
  result = readFloatArray(buf, offset, 4); const wheelSlipAngle = result.values; offset = result.newOffset;
  result = readFloatArray(buf, offset, 4); const wheelLatForce = result.values; offset = result.newOffset;
  result = readFloatArray(buf, offset, 4); const wheelLongForce = result.values; offset = result.newOffset;

  const heightOfCOGAboveGround = buf.readFloatLE(offset); offset += 4;
  const localVelocityX = buf.readFloatLE(offset); offset += 4;
  const localVelocityY = buf.readFloatLE(offset); offset += 4;
  const localVelocityZ = buf.readFloatLE(offset); offset += 4;
  const angularVelocityX = buf.readFloatLE(offset); offset += 4;
  const angularVelocityY = buf.readFloatLE(offset); offset += 4;
  const angularVelocityZ = buf.readFloatLE(offset); offset += 4;
  const angularAccelerationX = buf.readFloatLE(offset); offset += 4;
  const angularAccelerationY = buf.readFloatLE(offset); offset += 4;
  const angularAccelerationZ = buf.readFloatLE(offset); offset += 4;
  const frontWheelsAngle = buf.readFloatLE(offset); offset += 4;

  result = readFloatArray(buf, offset, 4); const wheelVertForce = result.values; offset = result.newOffset;

  const frontAeroHeight = buf.readFloatLE(offset); offset += 4;
  const rearAeroHeight = buf.readFloatLE(offset); offset += 4;
  const frontRollAngle = buf.readFloatLE(offset); offset += 4;
  const rearRollAngle = buf.readFloatLE(offset); offset += 4;
  const chassisYaw = buf.readFloatLE(offset); offset += 4;
  const chassisPitch = buf.readFloatLE(offset); offset += 4;

  result = readFloatArray(buf, offset, 4); const wheelCamber = result.values; offset = result.newOffset;
  result = readFloatArray(buf, offset, 4); const wheelCamberGain = result.values; offset = result.newOffset;

  return {
    header, suspensionPosition, suspensionVelocity, suspensionAcceleration,
    wheelSpeed, wheelSlipRatio, wheelSlipAngle, wheelLatForce, wheelLongForce,
    heightOfCOGAboveGround, localVelocityX, localVelocityY, localVelocityZ,
    angularVelocityX, angularVelocityY, angularVelocityZ,
    angularAccelerationX, angularAccelerationY, angularAccelerationZ,
    frontWheelsAngle, wheelVertForce, frontAeroHeight, rearAeroHeight,
    frontRollAngle, rearRollAngle, chassisYaw, chassisPitch,
    wheelCamber, wheelCamberGain,
  };
}
