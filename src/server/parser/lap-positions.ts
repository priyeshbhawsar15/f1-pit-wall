import { PacketHeader } from './header';
import { HEADER_SIZE, MAX_LAPS_IN_POSITIONS, MAX_CARS } from '../../lib/constants';

export interface PacketLapPositionsData {
  header: PacketHeader;
  numLaps: number;
  lapStart: number;
  positionForVehicleIdx: number[][];
}

export function parseLapPositionsData(buf: Buffer, header: PacketHeader): PacketLapPositionsData {
  let offset = HEADER_SIZE;

  const numLaps = buf.readUInt8(offset); offset += 1;
  const lapStart = buf.readUInt8(offset); offset += 1;

  const positionForVehicleIdx: number[][] = [];
  for (let lap = 0; lap < MAX_LAPS_IN_POSITIONS; lap++) {
    const positions: number[] = [];
    for (let car = 0; car < MAX_CARS; car++) {
      positions.push(buf.readUInt8(offset)); offset += 1;
    }
    positionForVehicleIdx.push(positions);
  }

  return { header, numLaps, lapStart, positionForVehicleIdx };
}
