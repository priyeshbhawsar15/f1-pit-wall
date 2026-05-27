import { PacketHeader } from './header';
import { HEADER_SIZE, MAX_CARS, MAX_PARTICIPANT_NAME_LEN } from '../../lib/constants';

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

export function parseParticipantsData(buf: Buffer, header: PacketHeader): PacketParticipantsData {
  let offset = HEADER_SIZE;

  const numActiveCars = buf.readUInt8(offset); offset += 1;

  const participants: ParticipantData[] = [];
  for (let i = 0; i < MAX_CARS; i++) {
    const aiControlled = buf.readUInt8(offset); offset += 1;
    const driverId = buf.readUInt8(offset); offset += 1;
    const networkId = buf.readUInt8(offset); offset += 1;
    const teamId = buf.readUInt8(offset); offset += 1;
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
