export interface HumanProfile {
  id: string;
  name: string;
  color: string;
  avatarUrl: string | null;
  createdAt?: string;
  _count?: { participants: number };
}

export interface Participant {
  id?: string;
  carIndex: number;
  name: string;
  teamId: number;
  aiControlled?: boolean;
  humanProfileId: string | null;
  humanProfile?: HumanProfile | null;
}

export interface FinalClassification {
  carIndex: number;
  position: number;
  points: number;
  gridPosition: number;
  resultStatus: number;
  bestLapTimeInMS: number;
  numPitStops?: number;
  penaltiesTime?: number;
}

export interface SessionRow {
  id: string;
  sessionUID: string;
  trackId: number;
  sessionType: number;
  weather: number;
  totalLaps: number;
  trackLength: number;
  airTemperature: number;
  trackTemperature: number;
  createdAt: string;
  participants: Participant[];
  finalClassifications: FinalClassification[];
  _count: { events: number; finalClassifications: number };
}

export interface StandingsPlayer extends HumanProfile {
  stats: {
    races: number;
    points: number;
    wins: number;
    podiums: number;
    dnfs: number;
    collisions: number;
    overtakes: number;
    fastestLaps: number;
    penalties: number;
    penaltySeconds: number;
    pitStops: number;
    avgPosition: number | null;
    bestLapMs: number | null;
  };
  races: Array<{
    sessionId: string;
    trackId: number;
    sessionType: number;
    createdAt: string;
    carIndex: number;
    position: number | null;
    gridPosition: number | null;
    points: number;
    bestLapTimeInMS: number;
    resultStatus: number;
  }>;
  penaltyDetails: unknown[];
}

export interface SeasonSummary {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  races: Array<{ session: Pick<SessionRow, 'id' | 'trackId' | 'sessionType' | 'createdAt'> }>;
  _count: { races: number };
}

export interface SeasonDetail extends Omit<SeasonSummary, 'races' | '_count'> {
  races: Array<{
    session: SessionRow & { events: Array<{ eventCode: string; details: unknown }> };
  }>;
}

export interface ReplayMotion {
  time: string;
  car_index: number;
  world_position_x: number;
  world_position_z: number;
}

export interface ReplayLap {
  time: string;
  car_index: number;
  car_position: number;
  current_lap_num: number;
  last_lap_time_ms: number;
  delta_to_car_in_front_ms: number;
  delta_to_race_leader_ms: number;
  pit_status: number;
  sector: number;
}

export interface ReplayResponse {
  motion: ReplayMotion[];
  lapData: ReplayLap[];
  carStatus: unknown[];
  telemetry: unknown[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface SessionEvent {
  id: string;
  eventCode: string;
  timestamp: string;
  sessionTimeMs: number | null;
  details: Record<string, unknown> | null;
}
