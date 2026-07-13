import { PacketHeader } from './header';
import { HEADER_SIZE, MAX_MARSHAL_ZONES, MAX_WEATHER_FORECAST_SAMPLES, MAX_SESSIONS_IN_WEEKEND } from '../../lib/constants';
import { TelemetryFormat } from './format';

export interface MarshalZone {
  zoneStart: number;
  zoneFlag: number;
}

export interface WeatherForecastSample {
  sessionType: number;
  timeOffset: number;
  weather: number;
  trackTemperature: number;
  trackTemperatureChange: number;
  airTemperature: number;
  airTemperatureChange: number;
  rainPercentage: number;
}

export interface AeroZone {
  zoneStart: number;
  zoneEnd: number;
}

export interface PacketSessionData {
  header: PacketHeader;
  weather: number;
  trackTemperature: number;
  airTemperature: number;
  totalLaps: number;
  trackLength: number;
  sessionType: number;
  trackId: number;
  formula: number;
  sessionTimeLeft: number;
  sessionDuration: number;
  pitSpeedLimit: number;
  gamePaused: number;
  isSpectating: number;
  spectatorCarIndex: number;
  sliProNativeSupport: number;
  numMarshalZones: number;
  marshalZones: MarshalZone[];
  safetyCarStatus: number;
  networkGame: number;
  numWeatherForecastSamples: number;
  weatherForecastSamples: WeatherForecastSample[];
  forecastAccuracy: number;
  aiDifficulty: number;
  seasonLinkIdentifier: number;
  weekendLinkIdentifier: number;
  sessionLinkIdentifier: number;
  pitStopWindowIdealLap: number;
  pitStopWindowLatestLap: number;
  pitStopRejoinPosition: number;
  safetyCarExperience: number;
  numSessionsInWeekend: number;
  weekendStructure: number[];
  sector2LapDistanceStart: number;
  sector3LapDistanceStart: number;
  // 2026-only fields
  activeAeroTrackStatus?: number;
  numActiveAeroZonesFull?: number;
  activeAeroZonesFull?: AeroZone[];
  numActiveAeroZonesPartial?: number;
  activeAeroZonesPartial?: AeroZone[];
  numDrsZones?: number;
  drsZones?: AeroZone[];
  startReactionTime?: number;
}

export function parseSessionData(buf: Buffer, header: PacketHeader, format: TelemetryFormat): PacketSessionData {
  let offset = HEADER_SIZE;

  const weather = buf.readUInt8(offset); offset += 1;
  const trackTemperature = buf.readInt8(offset); offset += 1;
  const airTemperature = buf.readInt8(offset); offset += 1;
  const totalLaps = buf.readUInt8(offset); offset += 1;
  const trackLength = buf.readUInt16LE(offset); offset += 2;
  const sessionType = buf.readUInt8(offset); offset += 1;
  const trackId = buf.readInt8(offset); offset += 1;
  const formula = buf.readUInt8(offset); offset += 1;
  const sessionTimeLeft = buf.readUInt16LE(offset); offset += 2;
  const sessionDuration = buf.readUInt16LE(offset); offset += 2;
  const pitSpeedLimit = buf.readUInt8(offset); offset += 1;
  const gamePaused = buf.readUInt8(offset); offset += 1;
  const isSpectating = buf.readUInt8(offset); offset += 1;
  const spectatorCarIndex = buf.readUInt8(offset); offset += 1;
  const sliProNativeSupport = buf.readUInt8(offset); offset += 1;
  const numMarshalZones = buf.readUInt8(offset); offset += 1;

  const marshalZones: MarshalZone[] = [];
  for (let i = 0; i < MAX_MARSHAL_ZONES; i++) {
    const zoneStart = buf.readFloatLE(offset); offset += 4;
    const zoneFlag = buf.readInt8(offset); offset += 1;
    marshalZones.push({ zoneStart, zoneFlag });
  }

  const safetyCarStatus = buf.readUInt8(offset); offset += 1;
  const networkGame = buf.readUInt8(offset); offset += 1;
  const numWeatherForecastSamples = buf.readUInt8(offset); offset += 1;

  const weatherForecastSamples: WeatherForecastSample[] = [];
  for (let i = 0; i < MAX_WEATHER_FORECAST_SAMPLES; i++) {
    const sType = buf.readUInt8(offset); offset += 1;
    const timeOffset = buf.readUInt8(offset); offset += 1;
    const w = buf.readUInt8(offset); offset += 1;
    const trackTemp = buf.readInt8(offset); offset += 1;
    const trackTempChange = buf.readInt8(offset); offset += 1;
    const airTemp = buf.readInt8(offset); offset += 1;
    const airTempChange = buf.readInt8(offset); offset += 1;
    const rainPercentage = buf.readUInt8(offset); offset += 1;
    weatherForecastSamples.push({
      sessionType: sType, timeOffset, weather: w,
      trackTemperature: trackTemp, trackTemperatureChange: trackTempChange,
      airTemperature: airTemp, airTemperatureChange: airTempChange,
      rainPercentage,
    });
  }

  const forecastAccuracy = buf.readUInt8(offset); offset += 1;
  const aiDifficulty = buf.readUInt8(offset); offset += 1;
  const seasonLinkIdentifier = buf.readUInt32LE(offset); offset += 4;
  const weekendLinkIdentifier = buf.readUInt32LE(offset); offset += 4;
  const sessionLinkIdentifier = buf.readUInt32LE(offset); offset += 4;
  const pitStopWindowIdealLap = buf.readUInt8(offset); offset += 1;
  const pitStopWindowLatestLap = buf.readUInt8(offset); offset += 1;
  const pitStopRejoinPosition = buf.readUInt8(offset); offset += 1;

  // Steering assist through safety car settings.
  offset += 41;

  const safetyCarExperience = buf.readUInt8(offset); offset += 1;

  // Formation lap, formation lap experience, red flags, and licence-level flags.
  offset += 5;

  const numSessionsInWeekend = buf.readUInt8(offset); offset += 1;

  const weekendStructure: number[] = [];
  for (let i = 0; i < MAX_SESSIONS_IN_WEEKEND; i++) {
    weekendStructure.push(buf.readUInt8(offset)); offset += 1;
  }

  const sector2LapDistanceStart = buf.readFloatLE(offset); offset += 4;
  const sector3LapDistanceStart = buf.readFloatLE(offset); offset += 4;

  const base = {
    header, weather, trackTemperature, airTemperature, totalLaps, trackLength,
    sessionType, trackId, formula, sessionTimeLeft, sessionDuration,
    pitSpeedLimit, gamePaused, isSpectating, spectatorCarIndex,
    sliProNativeSupport, numMarshalZones, marshalZones, safetyCarStatus,
    networkGame, numWeatherForecastSamples, weatherForecastSamples,
    forecastAccuracy, aiDifficulty, seasonLinkIdentifier, weekendLinkIdentifier,
    sessionLinkIdentifier, pitStopWindowIdealLap, pitStopWindowLatestLap,
    pitStopRejoinPosition, safetyCarExperience, numSessionsInWeekend,
    weekendStructure, sector2LapDistanceStart, sector3LapDistanceStart,
  };

  if (format !== 2026) return base;

  // 2026-only tail fields
  const activeAeroTrackStatus = buf.readUInt8(offset); offset += 1;

  const numActiveAeroZonesFull = buf.readUInt8(offset); offset += 1;
  const activeAeroZonesFull: AeroZone[] = [];
  for (let i = 0; i < 8; i++) {
    const zoneStart = buf.readFloatLE(offset); offset += 4;
    const zoneEnd   = buf.readFloatLE(offset); offset += 4;
    activeAeroZonesFull.push({ zoneStart, zoneEnd });
  }

  const numActiveAeroZonesPartial = buf.readUInt8(offset); offset += 1;
  const activeAeroZonesPartial: AeroZone[] = [];
  for (let i = 0; i < 8; i++) {
    const zoneStart = buf.readFloatLE(offset); offset += 4;
    const zoneEnd   = buf.readFloatLE(offset); offset += 4;
    activeAeroZonesPartial.push({ zoneStart, zoneEnd });
  }

  const numDrsZones = buf.readUInt8(offset); offset += 1;
  const drsZones: AeroZone[] = [];
  for (let i = 0; i < 4; i++) {
    const zoneStart = buf.readFloatLE(offset); offset += 4;
    const zoneEnd   = buf.readFloatLE(offset); offset += 4;
    drsZones.push({ zoneStart, zoneEnd });
  }

  const startReactionTime = buf.readFloatLE(offset); offset += 4;
  // 5 new uint8 assist flags (antiLockBrakesAssist, tractionControlAssist,
  // dynamicRacingLineHiVis, dynamicRacingLineColourBlind, recurringRewindPrompt)
  offset += 5;

  return {
    ...base,
    activeAeroTrackStatus,
    numActiveAeroZonesFull, activeAeroZonesFull,
    numActiveAeroZonesPartial, activeAeroZonesPartial,
    numDrsZones, drsZones,
    startReactionTime,
  };
}
