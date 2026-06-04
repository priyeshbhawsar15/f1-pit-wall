import { PacketHeader } from './header';
import { HEADER_SIZE, maxCarsForFormat, isFormat2026 } from '../../lib/constants';

export interface CarTelemetry2Data {
  activeAeroMode: number;               // 0 = corner mode, 1 = straight mode
  activeAeroAvailable: number;          // 0/1
  activeAeroActivationDistance: number; // metres until available
  overtakeAvailable: number;            // 0/1
  overtakeActive: number;               // 0/1
  overtakeActivationDistance: number;   // metres until available
  regulations2026: number;              // 1 = running 2026 regs
  drivingWrongWay: number;              // 0/1
}

export interface PacketCarTelemetry2Data {
  header: PacketHeader;
  carTelemetry2Data: CarTelemetry2Data[];
}

export function parseCarTelemetry2Data(buf: Buffer, header: PacketHeader): PacketCarTelemetry2Data {
  const carTelemetry2Data: CarTelemetry2Data[] = [];
  let offset = HEADER_SIZE;
  const maxCars = maxCarsForFormat(header.packetFormat, header.gameYear);

  for (let i = 0; i < maxCars; i++) {
    const activeAeroMode               = buf.readUInt8(offset);   offset += 1;
    const activeAeroAvailable          = buf.readUInt8(offset);   offset += 1;
    const activeAeroActivationDistance = buf.readUInt16LE(offset); offset += 2;
    const overtakeAvailable            = buf.readUInt8(offset);   offset += 1;
    const overtakeActive               = buf.readUInt8(offset);   offset += 1;
    const overtakeActivationDistance   = buf.readUInt16LE(offset); offset += 2;
    const regulations2026              = buf.readUInt8(offset);   offset += 1;
    const drivingWrongWay              = buf.readUInt8(offset);   offset += 1;

    carTelemetry2Data.push({
      activeAeroMode, activeAeroAvailable, activeAeroActivationDistance,
      overtakeAvailable, overtakeActive, overtakeActivationDistance,
      regulations2026, drivingWrongWay,
    });
  }

  return { header, carTelemetry2Data };
}
