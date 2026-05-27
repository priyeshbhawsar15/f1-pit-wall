import { PacketHeader } from './header';
import { HEADER_SIZE, MAX_CARS } from '../../lib/constants';

export interface CarDamageData {
  tyresWear: number[];
  tyresDamage: number[];
  brakesDamage: number[];
  tyreBlisters: number[];
  frontLeftWingDamage: number;
  frontRightWingDamage: number;
  rearWingDamage: number;
  floorDamage: number;
  diffuserDamage: number;
  sidepodDamage: number;
  drsFault: number;
  ersFault: number;
  gearBoxDamage: number;
  engineDamage: number;
  engineMGUHWear: number;
  engineESWear: number;
  engineCEWear: number;
  engineICEWear: number;
  engineMGUKWear: number;
  engineTCWear: number;
  engineBlown: number;
  engineSeized: number;
}

export interface PacketCarDamageData {
  header: PacketHeader;
  carDamageData: CarDamageData[];
}

export function parseCarDamageData(buf: Buffer, header: PacketHeader): PacketCarDamageData {
  const carDamageData: CarDamageData[] = [];
  let offset = HEADER_SIZE;

  for (let i = 0; i < MAX_CARS; i++) {
    const tyresWear: number[] = [];
    for (let j = 0; j < 4; j++) { tyresWear.push(buf.readFloatLE(offset)); offset += 4; }

    const tyresDamage: number[] = [];
    for (let j = 0; j < 4; j++) { tyresDamage.push(buf.readUInt8(offset)); offset += 1; }

    const brakesDamage: number[] = [];
    for (let j = 0; j < 4; j++) { brakesDamage.push(buf.readUInt8(offset)); offset += 1; }

    const tyreBlisters: number[] = [];
    for (let j = 0; j < 4; j++) { tyreBlisters.push(buf.readUInt8(offset)); offset += 1; }

    const frontLeftWingDamage = buf.readUInt8(offset); offset += 1;
    const frontRightWingDamage = buf.readUInt8(offset); offset += 1;
    const rearWingDamage = buf.readUInt8(offset); offset += 1;
    const floorDamage = buf.readUInt8(offset); offset += 1;
    const diffuserDamage = buf.readUInt8(offset); offset += 1;
    const sidepodDamage = buf.readUInt8(offset); offset += 1;
    const drsFault = buf.readUInt8(offset); offset += 1;
    const ersFault = buf.readUInt8(offset); offset += 1;
    const gearBoxDamage = buf.readUInt8(offset); offset += 1;
    const engineDamage = buf.readUInt8(offset); offset += 1;
    const engineMGUHWear = buf.readUInt8(offset); offset += 1;
    const engineESWear = buf.readUInt8(offset); offset += 1;
    const engineCEWear = buf.readUInt8(offset); offset += 1;
    const engineICEWear = buf.readUInt8(offset); offset += 1;
    const engineMGUKWear = buf.readUInt8(offset); offset += 1;
    const engineTCWear = buf.readUInt8(offset); offset += 1;
    const engineBlown = buf.readUInt8(offset); offset += 1;
    const engineSeized = buf.readUInt8(offset); offset += 1;

    carDamageData.push({
      tyresWear, tyresDamage, brakesDamage, tyreBlisters,
      frontLeftWingDamage, frontRightWingDamage, rearWingDamage,
      floorDamage, diffuserDamage, sidepodDamage, drsFault, ersFault,
      gearBoxDamage, engineDamage, engineMGUHWear, engineESWear,
      engineCEWear, engineICEWear, engineMGUKWear, engineTCWear,
      engineBlown, engineSeized,
    });
  }

  return { header, carDamageData };
}
