import { PacketHeader } from './header';
import { HEADER_SIZE, MAX_CARS } from '../../lib/constants';

export interface CarTelemetryData {
  speed: number;
  throttle: number;
  steer: number;
  brake: number;
  clutch: number;
  gear: number;
  engineRPM: number;
  drs: number;
  revLightsPercent: number;
  revLightsBitValue: number;
  brakesTemperature: number[];
  tyresSurfaceTemperature: number[];
  tyresInnerTemperature: number[];
  engineTemperature: number;
  tyresPressure: number[];
  surfaceType: number[];
}

export interface PacketCarTelemetryData {
  header: PacketHeader;
  carTelemetryData: CarTelemetryData[];
  mfdPanelIndex: number;
  mfdPanelIndexSecondaryPlayer: number;
  suggestedGear: number;
}

export function parseCarTelemetryData(buf: Buffer, header: PacketHeader): PacketCarTelemetryData {
  const carTelemetryData: CarTelemetryData[] = [];
  let offset = HEADER_SIZE;

  for (let i = 0; i < MAX_CARS; i++) {
    const speed = buf.readUInt16LE(offset); offset += 2;
    const throttle = buf.readFloatLE(offset); offset += 4;
    const steer = buf.readFloatLE(offset); offset += 4;
    const brake = buf.readFloatLE(offset); offset += 4;
    const clutch = buf.readUInt8(offset); offset += 1;
    const gear = buf.readInt8(offset); offset += 1;
    const engineRPM = buf.readUInt16LE(offset); offset += 2;
    const drs = buf.readUInt8(offset); offset += 1;
    const revLightsPercent = buf.readUInt8(offset); offset += 1;
    const revLightsBitValue = buf.readUInt16LE(offset); offset += 2;

    const brakesTemperature: number[] = [];
    for (let j = 0; j < 4; j++) { brakesTemperature.push(buf.readUInt16LE(offset)); offset += 2; }

    const tyresSurfaceTemperature: number[] = [];
    for (let j = 0; j < 4; j++) { tyresSurfaceTemperature.push(buf.readUInt8(offset)); offset += 1; }

    const tyresInnerTemperature: number[] = [];
    for (let j = 0; j < 4; j++) { tyresInnerTemperature.push(buf.readUInt8(offset)); offset += 1; }

    const engineTemperature = buf.readUInt16LE(offset); offset += 2;

    const tyresPressure: number[] = [];
    for (let j = 0; j < 4; j++) { tyresPressure.push(buf.readFloatLE(offset)); offset += 4; }

    const surfaceType: number[] = [];
    for (let j = 0; j < 4; j++) { surfaceType.push(buf.readUInt8(offset)); offset += 1; }

    carTelemetryData.push({
      speed, throttle, steer, brake, clutch, gear, engineRPM, drs,
      revLightsPercent, revLightsBitValue, brakesTemperature,
      tyresSurfaceTemperature, tyresInnerTemperature, engineTemperature,
      tyresPressure, surfaceType,
    });
  }

  const mfdPanelIndex = buf.readUInt8(offset); offset += 1;
  const mfdPanelIndexSecondaryPlayer = buf.readUInt8(offset); offset += 1;
  const suggestedGear = buf.readInt8(offset); offset += 1;

  return { header, carTelemetryData, mfdPanelIndex, mfdPanelIndexSecondaryPlayer, suggestedGear };
}
