import { PacketHeader } from './header';
import { HEADER_SIZE, MAX_PARTICIPANT_NAME_LEN, BYTES_PER_CAR_PARTICIPANTS_2025, BYTES_PER_CAR_PARTICIPANTS_2026 } from '../../lib/constants';
import { getCarCount, TelemetryFormat } from './format';

export interface ParticipantData {
  aiControlled: number;
  driverId: number;
  networkId: number;
  teamId: number;
  myTeam: number;
  raceNumber: number;
  nationality: number;
  name: string;
  yourTelemetry: number;
  showOnlineNames: number;
  techLevel: number;
  platform: number;
  numColours: number;
  liveryColours: { red: number; green: number; blue: number }[];
}

export interface PacketParticipantsData {
  header: PacketHeader;
  numActiveCars: number;
  participants: ParticipantData[];
}

export function parseParticipantsData(buf: Buffer, header: PacketHeader, format: TelemetryFormat): PacketParticipantsData {
  let offset = HEADER_SIZE;
  const is2026 = format === 2026;
  const bytesPerCar = is2026 ? BYTES_PER_CAR_PARTICIPANTS_2026 : BYTES_PER_CAR_PARTICIPANTS_2025;
  const maxCars = Math.min(
    Math.floor((buf.length - HEADER_SIZE - 1) / bytesPerCar),
    getCarCount(format),
  );

  const numActiveCars = Math.min(buf.readUInt8(offset), maxCars); offset += 1;

  const participants: ParticipantData[] = [];
  for (let i = 0; i < maxCars; i++) {
    const aiControlled = buf.readUInt8(offset); offset += 1;
    const driverId  = is2026 ? buf.readUInt16LE(offset) : buf.readUInt8(offset); offset += is2026 ? 2 : 1;
    const networkId = is2026 ? buf.readUInt16LE(offset) : buf.readUInt8(offset); offset += is2026 ? 2 : 1;
    const teamId    = is2026 ? buf.readUInt16LE(offset) : buf.readUInt8(offset); offset += is2026 ? 2 : 1;
    const myTeam = buf.readUInt8(offset); offset += 1;
    const raceNumber = buf.readUInt8(offset); offset += 1;
    const nationality = buf.readUInt8(offset); offset += 1;

    const nameBytes = buf.subarray(offset, offset + MAX_PARTICIPANT_NAME_LEN);
    const nullIdx = nameBytes.indexOf(0);
    const name = nameBytes.toString('utf8', 0, nullIdx >= 0 ? nullIdx : MAX_PARTICIPANT_NAME_LEN);
    offset += MAX_PARTICIPANT_NAME_LEN;

    const yourTelemetry = buf.readUInt8(offset); offset += 1;
    const showOnlineNames = buf.readUInt8(offset); offset += 1;
    const techLevel = buf.readUInt16LE(offset); offset += 2;
    const platform = buf.readUInt8(offset); offset += 1;
    const numColours = buf.readUInt8(offset); offset += 1;

    const liveryColours: { red: number; green: number; blue: number }[] = [];
    for (let c = 0; c < 4; c++) {
      const red = buf.readUInt8(offset); offset += 1;
      const green = buf.readUInt8(offset); offset += 1;
      const blue = buf.readUInt8(offset); offset += 1;
      liveryColours.push({ red, green, blue });
    }

    participants.push({
      aiControlled, driverId, networkId, teamId, myTeam, raceNumber,
      nationality, name, yourTelemetry, showOnlineNames, techLevel,
      platform, numColours, liveryColours,
    });
  }

  return { header, numActiveCars, participants };
}
