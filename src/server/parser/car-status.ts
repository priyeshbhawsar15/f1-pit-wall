import { PacketHeader } from './header';
import { HEADER_SIZE, MAX_CARS_2025, MAX_CARS_2026, isFormat2026, BYTES_PER_CAR_STATUS_2025, BYTES_PER_CAR_STATUS_2026 } from '../../lib/constants';

export interface CarStatusData {
  tractionControl: number;
  antiLockBrakes: number;
  fuelMix: number;
  frontBrakeBias: number;
  pitLimiterStatus: number;
  fuelInTank: number;
  fuelCapacity: number;
  fuelRemainingLaps: number;
  maxRPM: number;
  idleRPM: number;
  maxGears: number;
  drsAllowed: number;
  drsActivationDistance: number;
  actualTyreCompound: number;
  visualTyreCompound: number;
  tyresAgeLaps: number;
  vehicleFIAFlags: number;
  enginePowerICE: number;
  enginePowerMGUK: number;
  ersStoreEnergy: number;
  ersDeployMode: number;
  ersHarvestedThisLapMGUK: number;
  ersHarvestedThisLapMGUH: number;
  ersHarvestLimitPerLap: number;
  ersDeployedThisLap: number;
  networkPaused: number;
}

export interface PacketCarStatusData {
  header: PacketHeader;
  carStatusData: CarStatusData[];
}

export function parseCarStatusData(buf: Buffer, header: PacketHeader): PacketCarStatusData {
  const carStatusData: CarStatusData[] = [];
  let offset = HEADER_SIZE;
  const is2026 = isFormat2026(header.packetFormat, header.gameYear, buf.length, HEADER_SIZE + MAX_CARS_2025 * BYTES_PER_CAR_STATUS_2025);
  const bytesPerCar = is2026 ? BYTES_PER_CAR_STATUS_2026 : BYTES_PER_CAR_STATUS_2025;
  const maxCars = Math.min(
    Math.floor((buf.length - HEADER_SIZE) / bytesPerCar),
    is2026 ? MAX_CARS_2026 : MAX_CARS_2025,
  );

  for (let i = 0; i < maxCars; i++) {
    const tractionControl = buf.readUInt8(offset); offset += 1;
    const antiLockBrakes = buf.readUInt8(offset); offset += 1;
    const fuelMix = buf.readUInt8(offset); offset += 1;
    const frontBrakeBias = buf.readUInt8(offset); offset += 1;
    const pitLimiterStatus = buf.readUInt8(offset); offset += 1;
    const fuelInTank = buf.readFloatLE(offset); offset += 4;
    const fuelCapacity = buf.readFloatLE(offset); offset += 4;
    const fuelRemainingLaps = buf.readFloatLE(offset); offset += 4;
    const maxRPM = buf.readUInt16LE(offset); offset += 2;
    const idleRPM = buf.readUInt16LE(offset); offset += 2;
    const maxGears = buf.readUInt8(offset); offset += 1;
    const drsAllowed = buf.readUInt8(offset); offset += 1;
    const drsActivationDistance = buf.readUInt16LE(offset); offset += 2;
    const actualTyreCompound = buf.readUInt8(offset); offset += 1;
    const visualTyreCompound = buf.readUInt8(offset); offset += 1;
    const tyresAgeLaps = buf.readUInt8(offset); offset += 1;
    const vehicleFIAFlags = buf.readInt8(offset); offset += 1;
    const enginePowerICE = buf.readFloatLE(offset); offset += 4;
    const enginePowerMGUK = buf.readFloatLE(offset); offset += 4;
    const ersStoreEnergy = buf.readFloatLE(offset); offset += 4;
    const ersDeployMode = buf.readUInt8(offset); offset += 1;
    const ersHarvestedThisLapMGUK = buf.readFloatLE(offset); offset += 4;
    const ersHarvestedThisLapMGUH = buf.readFloatLE(offset); offset += 4;
    let ersHarvestLimitPerLap = 0;
    if (is2026) { ersHarvestLimitPerLap = buf.readFloatLE(offset); offset += 4; }
    const ersDeployedThisLap = buf.readFloatLE(offset); offset += 4;
    const networkPaused = buf.readUInt8(offset); offset += 1;

    carStatusData.push({
      tractionControl, antiLockBrakes, fuelMix, frontBrakeBias,
      pitLimiterStatus, fuelInTank, fuelCapacity, fuelRemainingLaps,
      maxRPM, idleRPM, maxGears, drsAllowed, drsActivationDistance,
      actualTyreCompound, visualTyreCompound, tyresAgeLaps,
      vehicleFIAFlags, enginePowerICE, enginePowerMGUK,
      ersStoreEnergy, ersDeployMode, ersHarvestedThisLapMGUK,
      ersHarvestedThisLapMGUH, ersHarvestLimitPerLap, ersDeployedThisLap, networkPaused,
    });
  }

  return { header, carStatusData };
}
