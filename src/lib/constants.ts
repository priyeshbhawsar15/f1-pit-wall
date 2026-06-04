// F1 25 UDP Specification Constants

export const MAX_CARS = 22;
export const MAX_PARTICIPANT_NAME_LEN = 32;
export const MAX_TYRE_STINTS = 8;
export const MAX_TYRE_SETS = 20; // 13 slick + 7 wet
export const MAX_MARSHAL_ZONES = 21;
export const MAX_WEATHER_FORECAST_SAMPLES = 64;
export const MAX_SESSIONS_IN_WEEKEND = 12;
export const MAX_LAPS_IN_HISTORY = 100;
export const MAX_LAPS_IN_POSITIONS = 50;
export const HEADER_SIZE = 29;
export const DEFAULT_UDP_PORT = 20777;

export enum PacketId {
  Motion = 0,
  Session = 1,
  LapData = 2,
  Event = 3,
  Participants = 4,
  CarSetups = 5,
  CarTelemetry = 6,
  CarStatus = 7,
  FinalClassification = 8,
  LobbyInfo = 9,
  CarDamage = 10,
  SessionHistory = 11,
  TyreSets = 12,
  MotionEx = 13,
  TimeTrial = 14,
  LapPositions = 15,
}

export const TRACK_NAMES: Record<number, string> = {
  0: 'Melbourne',
  1: 'Paul Ricard',
  2: 'Shanghai',
  3: 'Sakhir (Bahrain)',
  4: 'Catalunya',
  5: 'Monaco',
  6: 'Montreal',
  7: 'Silverstone',
  8: 'Hockenheim',
  9: 'Hungaroring',
  10: 'Spa',
  11: 'Monza',
  12: 'Singapore',
  13: 'Suzuka',
  14: 'Abu Dhabi',
  15: 'Texas',
  16: 'Brazil',
  17: 'Austria',
  18: 'Sochi',
  19: 'Mexico',
  20: 'Baku',
  21: 'Sakhir Short',
  22: 'Silverstone Short',
  23: 'Texas Short',
  24: 'Suzuka Short',
  25: 'Hanoi',
  26: 'Zandvoort',
  27: 'Imola',
  28: 'Portimão',
  29: 'Jeddah',
  30: 'Miami',
  31: 'Las Vegas',
  32: 'Losail',
  33: 'Lusail Short',
};

export const TRACK_FLAGS: Record<number, string> = {
  0: '🇦🇺',
  1: '🇫🇷',
  2: '🇨🇳',
  3: '🇧🇭',
  4: '🇪🇸',
  5: '🇲🇨',
  6: '🇨🇦',
  7: '🇬🇧',
  8: '🇩🇪',
  9: '🇭🇺',
  10: '🇧🇪',
  11: '🇮🇹',
  12: '🇸🇬',
  13: '🇯🇵',
  14: '🇦🇪',
  15: '🇺🇸',
  16: '🇧🇷',
  17: '🇦🇹',
  18: '🇷🇺',
  19: '🇲🇽',
  20: '🇦🇿',
  21: '🇧🇭',
  22: '🇬🇧',
  23: '🇺🇸',
  24: '🇯🇵',
  25: '🇻🇳',
  26: '🇳🇱',
  27: '🇮🇹',
  28: '🇵🇹',
  29: '🇸🇦',
  30: '🇺🇸',
  31: '🇺🇸',
  32: '🇶🇦',
  33: '🇶🇦',
};

export const TEAM_NAMES: Record<number, string> = {
  0: 'Mercedes',
  1: 'Ferrari',
  2: 'Red Bull Racing',
  3: 'Williams',
  4: 'Aston Martin',
  5: 'Alpine',
  6: 'RB',
  7: 'Haas',
  8: 'McLaren',
  9: 'Sauber',
  // F1 25 My Team IDs (220-229 mirror the 10 standard teams)
  220: 'Mercedes',
  221: 'Ferrari',
  222: 'Red Bull Racing',
  223: 'Williams',
  224: 'Aston Martin',
  225: 'Alpine',
  226: 'RB',
  227: 'Haas',
  228: 'McLaren',
  229: 'Sauber',
};

export const TEAM_COLORS: Record<number, string> = {
  0: '#27F4D2', // Mercedes
  1: '#E80020', // Ferrari
  2: '#3671C6', // Red Bull Racing
  3: '#64C4FF', // Williams
  4: '#229971', // Aston Martin
  5: '#0093CC', // Alpine
  6: '#6692FF', // RB
  7: '#B6BABD', // Haas
  8: '#FF8000', // McLaren
  9: '#52E252', // Sauber
  // F1 25 My Team IDs
  220: '#27F4D2', // Mercedes
  221: '#E80020', // Ferrari
  222: '#3671C6', // Red Bull Racing
  223: '#64C4FF', // Williams
  224: '#229971', // Aston Martin
  225: '#0093CC', // Alpine
  226: '#6692FF', // RB
  227: '#B6BABD', // Haas
  228: '#FF8000', // McLaren
  229: '#52E252', // Sauber
};

export const SESSION_TYPES: Record<number, string> = {
  0: 'Unknown',
  1: 'P1',
  2: 'P2',
  3: 'P3',
  4: 'Short Practice',
  5: 'Q1',
  6: 'Q2',
  7: 'Q3',
  8: 'Short Qualifying',
  9: 'OSQ',
  10: 'R',
  11: 'R2',
  12: 'R3',
  13: 'Time Trial',
  15: 'Race',
};

export const WEATHER_TYPES: Record<number, string> = {
  0: 'Clear',
  1: 'Light Cloud',
  2: 'Overcast',
  3: 'Light Rain',
  4: 'Heavy Rain',
  5: 'Storm',
};

export const TYRE_COMPOUNDS: Record<number, { name: string; color: string }> = {
  16: { name: 'C5', color: '#FF3333' },
  17: { name: 'C4', color: '#FFC300' },
  18: { name: 'C3', color: '#FFFFFF' },
  19: { name: 'C2', color: '#3399FF' },
  20: { name: 'C1', color: '#FF66FF' },
  21: { name: 'C0', color: '#FF33FF' },
  22: { name: 'C6', color: '#FF0000' },
  7: { name: 'Inter', color: '#39B54A' },
  8: { name: 'Wet', color: '#00AEEF' },
};

export const VISUAL_TYRE_COMPOUNDS: Record<number, { name: string; color: string }> = {
  16: { name: 'Soft', color: '#FF3333' },
  17: { name: 'Medium', color: '#FFC300' },
  18: { name: 'Hard', color: '#FFFFFF' },
  7: { name: 'Inter', color: '#39B54A' },
  8: { name: 'Wet', color: '#00AEEF' },
};

export const ERS_DEPLOY_MODES: Record<number, string> = {
  0: 'None',
  1: 'Medium',
  2: 'Hotlap',
  3: 'Overtake',
};

export const DRIVER_STATUS: Record<number, string> = {
  0: 'In Garage',
  1: 'Flying Lap',
  2: 'In Lap',
  3: 'Out Lap',
  4: 'On Track',
};

export const RESULT_STATUS: Record<number, string> = {
  0: 'Invalid',
  1: 'Inactive',
  2: 'Active',
  3: 'Finished',
  4: 'DNF',
  5: 'Disqualified',
  6: 'Not Classified',
  7: 'Retired',
};

export const EVENT_CODES: Record<string, string> = {
  SSTA: 'Session Started',
  SEND: 'Session Ended',
  FTLP: 'Fastest Lap',
  RTMT: 'Retirement',
  DRSE: 'DRS Enabled',
  DRSD: 'DRS Disabled',
  TMPT: 'Team Mate In Pits',
  CHQF: 'Chequered Flag',
  RCWN: 'Race Winner',
  PENA: 'Penalty',
  SPTP: 'Speed Trap',
  STLG: 'Start Lights',
  LGOT: 'Lights Out',
  DTSV: 'Drive Through Served',
  SGSV: 'Stop Go Served',
  FLBK: 'Flashback',
  BUTN: 'Button Status',
  RDFL: 'Red Flag',
  OVTK: 'Overtake',
  SCAR: 'Safety Car',
  COLL: 'Collision',
};

export const TEAM_LOGOS: Record<number, string> = {
  0: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes-AMG_Petronas_F1_Team_Logo.svg',
  1: 'https://upload.wikimedia.org/wikipedia/en/3/36/Scuderia_Ferrari_HP_logo_24.svg',
  2: 'https://upload.wikimedia.org/wikipedia/en/e/ea/Oracle_Red_Bull_Racing_logo.svg',
  3: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Williams_Racing_2020_logo.svg',
  4: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Aston_Martin_Aramco_Cognizant_F1_Team_logo.svg',
  5: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Alpine_F1_Team_Logo.svg',
  6: 'https://upload.wikimedia.org/wikipedia/en/e/ee/Visa_Cash_App_RB_F1_Team_logo.svg',
  7: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Haas_F1_Team_logo.svg',
  8: 'https://upload.wikimedia.org/wikipedia/commons/3/30/McLaren_Racing_logo.png',
  9: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Stake_F1_Team_Kick_Sauber_logo.svg',
  // F1 25 My Team IDs
  220: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes-AMG_Petronas_F1_Team_Logo.svg',
  221: 'https://upload.wikimedia.org/wikipedia/en/3/36/Scuderia_Ferrari_HP_logo_24.svg',
  222: 'https://upload.wikimedia.org/wikipedia/en/e/ea/Oracle_Red_Bull_Racing_logo.svg',
  223: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Williams_Racing_2020_logo.svg',
  224: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Aston_Martin_Aramco_Cognizant_F1_Team_logo.svg',
  225: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Alpine_F1_Team_Logo.svg',
  226: 'https://upload.wikimedia.org/wikipedia/en/e/ee/Visa_Cash_App_RB_F1_Team_logo.svg',
  227: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Haas_F1_Team_logo.svg',
  228: 'https://upload.wikimedia.org/wikipedia/commons/3/30/McLaren_Racing_logo.png',
  229: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Stake_F1_Team_Kick_Sauber_logo.svg',
};

export const DRIVER_FLAGS: Record<string, string> = {
  'Pierre Gasly': 'https://flagcdn.com/w40/fr.png',
  'Jack Doohan': 'https://flagcdn.com/w40/au.png',
  'Fernando Alonso': 'https://flagcdn.com/w40/es.png',
  'Lance Stroll': 'https://flagcdn.com/w40/ca.png',
  'Charles Leclerc': 'https://flagcdn.com/w40/mc.png',
  'Lewis Hamilton': 'https://flagcdn.com/w40/gb.png',
  'Esteban Ocon': 'https://flagcdn.com/w40/fr.png',
  'Oliver Bearman': 'https://flagcdn.com/w40/gb.png',
  'Nico Hülkenberg': 'https://flagcdn.com/w40/de.png',
  'Gabriel Bortoleto': 'https://flagcdn.com/w40/br.png',
  'Lando Norris': 'https://flagcdn.com/w40/gb.png',
  'Oscar Piastri': 'https://flagcdn.com/w40/au.png',
  'George Russell': 'https://flagcdn.com/w40/gb.png',
  'Andrea Kimi Antonelli': 'https://flagcdn.com/w40/it.png',
  'Kimi Antonelli': 'https://flagcdn.com/w40/it.png',
  'Yuki Tsunoda': 'https://flagcdn.com/w40/jp.png',
  'Isack Hadjar': 'https://flagcdn.com/w40/fr.png',
  'Max Verstappen': 'https://flagcdn.com/w40/nl.png',
  'Liam Lawson': 'https://flagcdn.com/w40/nz.png',
  'Alexander Albon': 'https://flagcdn.com/w40/th.png',
  'Carlos Sainz Jr.': 'https://flagcdn.com/w40/es.png',
  'Carlos Sainz': 'https://flagcdn.com/w40/es.png',
  'Nico Hulkenberg': 'https://flagcdn.com/w40/de.png',
};

export const PENALTY_TYPES: Record<number, string> = {
  0: 'Drive Through',
  1: 'Stop Go',
  2: 'Grid Penalty',
  3: 'Penalty Reminder',
  4: 'Time Penalty',
  5: 'Warning',
  6: 'Disqualified',
  7: 'Removed from Formation Lap',
  8: 'Parked too long',
  9: 'Tyre Regulations',
  10: 'This Lap Invalidated',
  11: 'This and Next Lap Invalidated',
  12: 'This Lap Invalidated (no reason)',
  13: 'This and Next Invalidated (no reason)',
  14: 'This and Previous Invalidated',
  15: 'This and Previous Invalidated (no reason)',
  16: 'Retired',
  17: 'Black Flag Timer',
};

export const INFRINGEMENT_TYPES: Record<number, string> = {
  0: 'Blocking by slow driving',
  1: 'Blocking by wrong way driving',
  2: 'Reversing off the start line',
  3: 'Big collision',
  4: 'Small collision',
  5: 'Collision — failed to hand back position (single)',
  6: 'Collision — failed to hand back position (multiple)',
  7: 'Corner cutting — gained time',
  8: 'Corner cutting — overtake (single)',
  9: 'Corner cutting — overtake (multiple)',
  10: 'Crossed pit exit lane',
  11: 'Ignoring blue flags',
  12: 'Ignoring yellow flags',
  13: 'Ignoring drive through',
  14: 'Too many drive throughs',
  15: 'Drive through — reminder (serve within N laps)',
  16: 'Drive through — reminder (serve this lap)',
  17: 'Pit lane speeding',
  18: 'Parked for too long',
  19: 'Ignoring tyre regulations',
  20: 'Too many penalties',
  21: 'Multiple warnings',
  22: 'Approaching disqualification',
  23: 'Tyre regulations — select single',
  24: 'Tyre regulations — select multiple',
  25: 'Lap invalidated — corner cutting',
  26: 'Lap invalidated — running wide',
  27: 'Corner cutting — ran wide (gained time minor)',
  28: 'Corner cutting — ran wide (gained time significant)',
  29: 'Corner cutting — ran wide (gained time extreme)',
  30: 'Lap invalidated — wall riding',
  31: 'Lap invalidated — flashback used',
  32: 'Lap invalidated — reset to track',
  33: 'Blocking the pitlane',
  34: 'Jump start',
  35: 'Safety car to car collision',
  36: 'Safety car illegal overtake',
  37: 'Safety car exceeding allowed pace',
  38: 'Virtual safety car exceeding allowed pace',
  39: 'Formation lap below allowed speed',
  40: 'Formation lap parking',
  41: 'Retired — mechanical failure',
  42: 'Retired — terminally damaged',
  43: 'Safety car falling too far back',
  44: 'Black flag timer',
  45: 'Unserved stop go penalty',
  46: 'Unserved drive through penalty',
  47: 'Engine component change',
  48: 'Gearbox change',
  49: 'Parc fermé change',
  50: 'League grid penalty',
  51: 'Retry penalty',
  52: 'Illegal time gain',
  53: 'Mandatory pitstop',
  54: 'Attribute assigned',
};
