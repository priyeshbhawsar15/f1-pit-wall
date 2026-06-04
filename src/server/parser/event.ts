import { PacketHeader } from './header';
import { HEADER_SIZE, isFormat2026 } from '../../lib/constants';

export interface EventDataDetails {
  fastestLap?: { vehicleIdx: number; lapTime: number };
  retirement?: { vehicleIdx: number; reason: number };
  teamMateInPits?: { vehicleIdx: number };
  raceWinner?: { vehicleIdx: number };
  penalty?: {
    penaltyType: number; infringementType: number; vehicleIdx: number;
    otherVehicleIdx: number; time: number; lapNum: number; placesGained: number;
  };
  speedTrap?: {
    vehicleIdx: number; speed: number; isOverallFastestInSession: number;
    isDriverFastestInSession: number; fastestVehicleIdxInSession: number;
    fastestSpeedInSession: number;
  };
  startLights?: { numLights: number };
  driveThroughPenaltyServed?: { vehicleIdx: number };
  stopGoPenaltyServed?: { vehicleIdx: number; stopTime: number };
  flashback?: { flashbackFrameIdentifier: number; flashbackSessionTime: number };
  buttons?: { buttonStatus: number };
  overtake?: { overtakingVehicleIdx: number; beingOvertakenVehicleIdx: number };
  safetyCar?: { safetyCarType: number; eventType: number };
  collision?: { vehicle1Idx: number; vehicle2Idx: number; severity?: number };
  drsDisabled?: { reason: number };
}

export interface PacketEventData {
  header: PacketHeader;
  eventStringCode: string;
  eventDetails: EventDataDetails;
}

export function parseEventData(buf: Buffer, header: PacketHeader): PacketEventData {
  let offset = HEADER_SIZE;

  const eventStringCode = buf.toString('utf8', offset, offset + 4).replace(/\0/g, '');
  offset += 4;

  const eventDetails: EventDataDetails = {};

  switch (eventStringCode) {
    case 'FTLP':
      eventDetails.fastestLap = {
        vehicleIdx: buf.readUInt8(offset),
        lapTime: buf.readFloatLE(offset + 1),
      };
      break;
    case 'RTMT':
      eventDetails.retirement = {
        vehicleIdx: buf.readUInt8(offset),
        reason: buf.readUInt8(offset + 1),
      };
      break;
    case 'TMPT':
      eventDetails.teamMateInPits = { vehicleIdx: buf.readUInt8(offset) };
      break;
    case 'RCWN':
      eventDetails.raceWinner = { vehicleIdx: buf.readUInt8(offset) };
      break;
    case 'PENA':
      eventDetails.penalty = {
        penaltyType: buf.readUInt8(offset),
        infringementType: buf.readUInt8(offset + 1),
        vehicleIdx: buf.readUInt8(offset + 2),
        otherVehicleIdx: buf.readUInt8(offset + 3),
        time: buf.readUInt8(offset + 4),
        lapNum: buf.readUInt8(offset + 5),
        placesGained: buf.readUInt8(offset + 6),
      };
      break;
    case 'SPTP':
      eventDetails.speedTrap = {
        vehicleIdx: buf.readUInt8(offset),
        speed: buf.readFloatLE(offset + 1),
        isOverallFastestInSession: buf.readUInt8(offset + 5),
        isDriverFastestInSession: buf.readUInt8(offset + 6),
        fastestVehicleIdxInSession: buf.readUInt8(offset + 7),
        fastestSpeedInSession: buf.readFloatLE(offset + 8),
      };
      break;
    case 'STLG':
      eventDetails.startLights = { numLights: buf.readUInt8(offset) };
      break;
    case 'DTSV':
      eventDetails.driveThroughPenaltyServed = { vehicleIdx: buf.readUInt8(offset) };
      break;
    case 'SGSV':
      eventDetails.stopGoPenaltyServed = {
        vehicleIdx: buf.readUInt8(offset),
        stopTime: buf.readFloatLE(offset + 1),
      };
      break;
    case 'FLBK':
      eventDetails.flashback = {
        flashbackFrameIdentifier: buf.readUInt32LE(offset),
        flashbackSessionTime: buf.readFloatLE(offset + 4),
      };
      break;
    case 'BUTN':
      eventDetails.buttons = { buttonStatus: buf.readUInt32LE(offset) };
      break;
    case 'OVTK':
      eventDetails.overtake = {
        overtakingVehicleIdx: buf.readUInt8(offset),
        beingOvertakenVehicleIdx: buf.readUInt8(offset + 1),
      };
      break;
    case 'SCAR':
      eventDetails.safetyCar = {
        safetyCarType: buf.readUInt8(offset),
        eventType: buf.readUInt8(offset + 1),
      };
      break;
    case 'COLL':
      eventDetails.collision = {
        vehicle1Idx: buf.readUInt8(offset),
        vehicle2Idx: buf.readUInt8(offset + 1),
        ...(isFormat2026(header.packetFormat, header.gameYear) && { severity: buf.readUInt8(offset + 2) }),
      };
      break;
    case 'DRSD':
      eventDetails.drsDisabled = { reason: buf.readUInt8(offset) };
      break;
  }

  return { header, eventStringCode, eventDetails };
}
