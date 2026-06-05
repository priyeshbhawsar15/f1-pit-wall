import { create } from 'zustand';

export interface CarMotionSlim {
  i: number;
  x: number;
  z: number;
  yaw: number;
}

export interface CarLapSlim {
  i: number;
  pos: number;
  lap: number;
  lastLap: number;
  curLap: number;
  s1: number;
  s2: number;
  dFront: number;
  dLeader: number;
  pit: number;
  sector: number;
  status: number;
  result: number;
  penalties: number;
  grid: number;
  dist: number;
  speedTrap: number;
}

export interface CarTelemetrySlim {
  i: number;
  spd: number;
  thr: number;
  brk: number;
  str: number;
  gear: number;
  rpm: number;
  drs: number;
  eTemp: number;
  tSurf: number[];
  tInner: number[];
  bTemp: number[];
  tPress: number[];
}

export interface CarStatusSlim {
  i: number;
  fuel: number;
  fuelLaps: number;
  drsOk: number;
  drsDist: number;
  tyre: number;
  tyreActual: number;
  tyreAge: number;
  ersStore: number;
  ersMode: number;
  ersK: number;
  ersH: number;
  ersLimit: number;
  ersDeployed: number;
  iceW: number;
  mgukW: number;
  flags: number;
}

export interface CarTelemetry2Slim {
  i: number;
  aeroMode: number;    // 0 = corner, 1 = straight
  aeroAvail: number;   // 0/1
  aeroDist: number;    // metres until available
  otAvail: number;     // 0/1
  otActive: number;    // 0/1
  otDist: number;      // metres until available
  is26: number;        // 1 = 2026 regulations
  wrongWay: number;    // 0/1
}

export interface CarDamageSlim {
  i: number;
  tyreWear: number[];
  flWing: number;
  frWing: number;
  rWing: number;
  floor: number;
  engine: number;
  gearbox: number;
}

export interface DriverInfo {
  i: number;
  name: string;
  team: number;
  num: number;
  ai: number;
  nat: number;
  tel: number;
}

export interface SessionInfo {
  sessionUID: string;
  trackId: number;
  sessionType: number;
  weather: number;
  trackTemperature: number;
  airTemperature: number;
  totalLaps: number;
  trackLength: number;
  sessionTimeLeft: number;
  sessionDuration: number;
  safetyCarStatus: number;
  formula: number;
  is2026: boolean;
  pitStopWindowIdealLap: number;
  pitStopWindowLatestLap: number;
  sector2LapDistanceStart: number;
  sector3LapDistanceStart: number;
  weatherForecast: any[];
}

export interface EventInfo {
  sessionUID: string;
  code: string;
  details: any;
  timestamp?: number;
}

export interface LapHistoryEntry {
  carIndex: number;
  lap: number;
  lapTimeMs: number;
  s1Ms: number;
  s2Ms: number;
  s3Ms: number;
}

export interface PositionHistoryEntry {
  carIndex: number;
  lap: number;
  position: number;
}

export interface CarSetupSlim {
  i: number;
  frontWing: number;
  rearWing: number;
  onThrottle: number;
  offThrottle: number;
  frontCamber: number;
  rearCamber: number;
  frontToe: number;
  rearToe: number;
  frontSuspension: number;
  rearSuspension: number;
  frontAntiRollBar: number;
  rearAntiRollBar: number;
  frontSuspensionHeight: number;
  rearSuspensionHeight: number;
  brakePressure: number;
  brakeBias: number;
  rearLeftTyrePressure: number;
  rearRightTyrePressure: number;
  frontLeftTyrePressure: number;
  frontRightTyrePressure: number;
  fuelLoad: number;
}

export interface TelemetryState {
  connected: boolean;
  session: SessionInfo | null;
  drivers: DriverInfo[];
  motion: CarMotionSlim[];
  lapData: CarLapSlim[];
  telemetry: CarTelemetrySlim[];
  carStatus: CarStatusSlim[];
  carDamage: CarDamageSlim[];
  carSetups: CarSetupSlim[];
  carTelemetry2: CarTelemetry2Slim[];
  events: EventInfo[];
  lapHistory: LapHistoryEntry[];
  positionHistory: PositionHistoryEntry[];
  selectedCarIndex: number | null;
  activeTab: 'live' | 'charts' | 'setup';

  setConnected: (v: boolean) => void;
  setSession: (s: SessionInfo) => void;
  setDrivers: (d: DriverInfo[]) => void;
  setMotion: (m: CarMotionSlim[]) => void;
  setLapData: (l: CarLapSlim[]) => void;
  setTelemetry: (t: CarTelemetrySlim[]) => void;
  setCarStatus: (s: CarStatusSlim[]) => void;
  setCarDamage: (d: CarDamageSlim[]) => void;
  setCarSetups: (s: CarSetupSlim[]) => void;
  setCarTelemetry2: (d: CarTelemetry2Slim[]) => void;
  addEvent: (e: EventInfo) => void;
  addLapHistory: (entries: LapHistoryEntry[]) => void;
  addPositionHistory: (entries: PositionHistoryEntry[]) => void;
  setSelectedCarIndex: (i: number | null) => void;
  setActiveTab: (tab: 'live' | 'charts' | 'setup') => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  connected: false,
  session: null,
  drivers: [],
  motion: [],
  lapData: [],
  telemetry: [],
  carStatus: [],
  carDamage: [],
  carSetups: [],
  carTelemetry2: [],
  events: [],
  lapHistory: [],
  positionHistory: [],
  selectedCarIndex: null,
  activeTab: 'live',

  setConnected: (v) => set({ connected: v }),
  setSession: (s) => set({ session: s }),
  setDrivers: (d) => set({ drivers: d }),
  setMotion: (m) => set({ motion: m }),
  setLapData: (l) => set({ lapData: l }),
  setTelemetry: (t) => set({ telemetry: t }),
  setCarStatus: (s) => set({ carStatus: s }),
  setCarDamage: (d) => set({ carDamage: d }),
  setCarSetups: (s) => set({ carSetups: s }),
  setCarTelemetry2: (d) => set({ carTelemetry2: d }),
  addEvent: (e) =>
    set((state) => ({
      events: [{ ...e, timestamp: Date.now() }, ...state.events].slice(0, 50),
    })),
  addLapHistory: (entries) =>
    set((state) => {
      const existing = new Set(state.lapHistory.map((e) => `${e.carIndex}_${e.lap}`));
      const newEntries = entries.filter((e) => !existing.has(`${e.carIndex}_${e.lap}`));
      return { lapHistory: [...state.lapHistory, ...newEntries] };
    }),
  addPositionHistory: (entries) =>
    set((state) => {
      const existing = new Set(state.positionHistory.map((e) => `${e.carIndex}_${e.lap}`));
      const newEntries = entries.filter((e) => !existing.has(`${e.carIndex}_${e.lap}`));
      return { positionHistory: [...state.positionHistory, ...newEntries] };
    }),
  setSelectedCarIndex: (i) => set({ selectedCarIndex: i }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
