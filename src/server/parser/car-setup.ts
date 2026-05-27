import { PacketHeader } from './header';
import { HEADER_SIZE, MAX_CARS } from '../../lib/constants';

export interface CarSetupData {
  frontWing: number;
  rearWing: number;
  onThrottle: number;
  offThrottle: number;
  frontCamber: number;
  rearCamber: number;
  frontToe: number;
  rearToe: number;
  frontSuspension: number;
  rearSuspension: number;
  frontAntiRollBar: number;
  rearAntiRollBar: number;
  frontSuspensionHeight: number;
  rearSuspensionHeight: number;
  brakePressure: number;
  brakeBias: number;
  engineBraking: number;
  rearLeftTyrePressure: number;
  rearRightTyrePressure: number;
  frontLeftTyrePressure: number;
  frontRightTyrePressure: number;
  ballast: number;
  fuelLoad: number;
}

export interface PacketCarSetupData {
  header: PacketHeader;
  carSetupData: CarSetupData[];
  nextFrontWingValue: number;
}

export function parseCarSetupData(buf: Buffer, header: PacketHeader): PacketCarSetupData {
  const carSetupData: CarSetupData[] = [];
  let offset = HEADER_SIZE;

  for (let i = 0; i < MAX_CARS; i++) {
    const frontWing = buf.readUInt8(offset); offset += 1;
    const rearWing = buf.readUInt8(offset); offset += 1;
    const onThrottle = buf.readUInt8(offset); offset += 1;
    const offThrottle = buf.readUInt8(offset); offset += 1;
    const frontCamber = buf.readFloatLE(offset); offset += 4;
    const rearCamber = buf.readFloatLE(offset); offset += 4;
    const frontToe = buf.readFloatLE(offset); offset += 4;
    const rearToe = buf.readFloatLE(offset); offset += 4;
    const frontSuspension = buf.readUInt8(offset); offset += 1;
    const rearSuspension = buf.readUInt8(offset); offset += 1;
    const frontAntiRollBar = buf.readUInt8(offset); offset += 1;
    const rearAntiRollBar = buf.readUInt8(offset); offset += 1;
    const frontSuspensionHeight = buf.readUInt8(offset); offset += 1;
    const rearSuspensionHeight = buf.readUInt8(offset); offset += 1;
    const brakePressure = buf.readUInt8(offset); offset += 1;
    const brakeBias = buf.readUInt8(offset); offset += 1;
    const engineBraking = buf.readUInt8(offset); offset += 1;
    const rearLeftTyrePressure = buf.readFloatLE(offset); offset += 4;
    const rearRightTyrePressure = buf.readFloatLE(offset); offset += 4;
    const frontLeftTyrePressure = buf.readFloatLE(offset); offset += 4;
    const frontRightTyrePressure = buf.readFloatLE(offset); offset += 4;
    const ballast = buf.readUInt8(offset); offset += 1;
    const fuelLoad = buf.readFloatLE(offset); offset += 4;

    carSetupData.push({
      frontWing, rearWing, onThrottle, offThrottle, frontCamber, rearCamber,
      frontToe, rearToe, frontSuspension, rearSuspension, frontAntiRollBar,
      rearAntiRollBar, frontSuspensionHeight, rearSuspensionHeight,
      brakePressure, brakeBias, engineBraking, rearLeftTyrePressure,
      rearRightTyrePressure, frontLeftTyrePressure, frontRightTyrePressure,
      ballast, fuelLoad,
    });
  }

  const nextFrontWingValue = buf.readFloatLE(offset); offset += 4;

  return { header, carSetupData, nextFrontWingValue };
}
