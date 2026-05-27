import { PacketHeader } from './header';
import { HEADER_SIZE, MAX_MARSHAL_ZONES, MAX_WEATHER_FORECAST_SAMPLES, MAX_SESSIONS_IN_WEEKEND } from '../../lib/constants';

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
}

export function parseSessionData(buf: Buffer, header: PacketHeader): PacketSessionData {
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

  // Skip several assist fields (steeringAssist through formationLapExperience)
  offset += 30;

  const safetyCarExperience = buf.readUInt8(offset); offset += 1;

  // Skip remaining settings fields until numSessionsInWeekend
  offset += 3;

  const numSessionsInWeekend = buf.readUInt8(offset); offset += 1;

  const weekendStructure: number[] = [];
  for (let i = 0; i < MAX_SESSIONS_IN_WEEKEND; i++) {
    weekendStructure.push(buf.readUInt8(offset)); offset += 1;
  }

  const sector2LapDistanceStart = buf.readFloatLE(offset); offset += 4;
  const sector3LapDistanceStart = buf.readFloatLE(offset); offset += 4;

  return {
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
}
