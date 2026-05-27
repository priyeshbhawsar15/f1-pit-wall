# F1 25 Live Telemetry Dashboard — Technical Documentation

Real-time telemetry dashboard for EA Sports F1 25 that captures the game's UDP telemetry stream, persists time-series data in TimescaleDB, relays it over WebSockets via Redis pub/sub, and renders a broadcast-quality Next.js dashboard with glassmorphic UI and Framer Motion animations.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Data Flow — End to End](#data-flow--end-to-end)
3. [Project Structure](#project-structure)
4. [Tech Stack](#tech-stack)
5. [Environment Variables](#environment-variables)
6. [Getting Started](#getting-started)
7. [F1 25 Game Configuration](#f1-25-game-configuration)
8. [Custom Server](#custom-server)
9. [UDP Listener & Binary Parsers](#udp-listener--binary-parsers)
10. [Real-time Pipeline (Redis to Socket.IO)](#real-time-pipeline-redis-to-socketio)
11. [Database Layer](#database-layer)
12. [REST API Endpoints](#rest-api-endpoints)
13. [Frontend Architecture](#frontend-architecture)
14. [UI Components](#ui-components)
15. [State Management](#state-management)
16. [Styling & Theme](#styling--theme)
17. [Docker Deployment](#docker-deployment)
18. [Troubleshooting](#troubleshooting)

---

## System Architecture

```
┌──────────────────┐       UDP :20777       ┌─────────────────────────────────────┐
│                  │ ─────────────────────►  │           server.ts                 │
│   F1 25 Game     │                         │  ┌───────────────────┐              │
│   (Console/PC)   │                         │  │  udp-listener.ts  │              │
│                  │                         │  │  16 binary parsers│              │
└──────────────────┘                         │  └────────┬──────────┘              │
                                             │           │                         │
                                             │     ┌─────┴──────┐                 │
                                             │     ▼            ▼                 │
                                             │  ┌──────┐  ┌──────────┐           │
                                             │  │Redis │  │TimescaleDB│           │
                                             │  │PubSub│  │Hypertables│           │
                                             │  └──┬───┘  └──────────┘           │
                                             │     ▼                              │
                                             │  ┌──────────┐                      │
                                             │  │Socket.IO │── WebSocket ──┐      │
                                             │  │Server    │               │      │
                                             │  └──────────┘               │      │
                                             │                              │      │
                                             │  ┌──────────┐  Next.js      │      │
                                             │  │ Next.js  │  /api routes  │      │
                                             │  │ App      │  (REST)       │      │
                                             │  └──────────┘               │      │
                                             └─────────────────────────────┘      │
                                                                                   │
                                             ┌─────────────────────────────┐      │
                                             │      Browser (React)        │◄─────┘
                                             │  useSocket() → Zustand      │
                                             │  10 React components        │
                                             │  Framer Motion animations   │
                                             └─────────────────────────────┘
```

### Three Docker Services

| Service | Image | Purpose | Ports |
|---|---|---|---|
| **timescaledb** | `timescale/timescaledb:latest-pg16` | Time-series storage with hypertables + auto-compression | `5432` |
| **redis** | `redis:7-alpine` | Pub/sub message broker between UDP ingestion and WebSocket broadcast | `6379` |
| **web** | Custom Dockerfile (Node 20 Alpine) | Next.js app + custom HTTP server + UDP listener + Socket.IO | `3000` (HTTP), `20777/udp` |

---

## Data Flow — End to End

### Step 1: Game sends UDP packets
The F1 25 game sends binary UDP packets at 20–60 Hz to `UDP_HOST:UDP_PORT`. Each packet starts with a 29-byte header containing: `packetFormat` (uint16), `gameYear` (uint8), `gameMajorVersion` (uint8), `gameMinorVersion` (uint8), `packetVersion` (uint8), `packetId` (uint8), `sessionUID` (uint64), `sessionTime` (float32), `frameIdentifier` (uint32), `overallFrameIdentifier` (uint32), `playerCarIndex` (uint8), `secondaryPlayerCarIndex` (uint8).

### Step 2: Server parses binary data
`udp-listener.ts` receives each datagram via Node's `dgram` module, validates the minimum 29-byte size, reads the header to determine `packetId`, then dispatches to one of 16 type-specific binary parsers in `src/server/parser/`. Each parser reads fields at fixed byte offsets using `Buffer.readUInt8()`, `readUInt16LE()`, `readFloatLE()`, `readBigUInt64LE()`, etc.

### Step 3: Server publishes to Redis
Parsed data is slimmed down (floats rounded, unused fields removed) and JSON-serialized to a Redis pub/sub channel via `ioredis`. BigInts are converted to strings. There are 12 Redis channels (see table below).

### Step 4: Server writes to TimescaleDB
High-frequency packets are batch-inserted into TimescaleDB hypertables using raw SQL (`prisma.$executeRawUnsafe()`). Lower-frequency relational data (sessions, participants, events, classifications) uses Prisma ORM upserts/creates.

### Step 5: Socket.IO relays to browser
`socket.ts` subscribes to all 12 Redis channels. On each message, it strips the `f1:` prefix and emits the parsed JSON to all connected Socket.IO clients. Example: Redis channel `f1:telemetry` becomes Socket.IO event `telemetry`.

### Step 6: Browser updates Zustand store
The `useSocket()` React hook connects via Socket.IO (WebSocket transport with polling fallback) and registers 11 event listeners. Each handler calls a Zustand store setter which triggers React re-renders in subscribed components.

### Step 7: Components render with animations
Each component reads from the Zustand store using selectors. Framer Motion `motion.div` wrappers provide entry animations, layout animations for position changes, and `AnimatePresence` for conditional rendering transitions.

---

## Redis Channels

| Channel | Source Packet ID | Slim Data Shape |
|---|---|---|
| `f1:motion` | 0 (Motion) | `{i, x, z, yaw}` per car |
| `f1:session` | 1 (Session) | Track, weather, timing, safety car, forecast |
| `f1:lapdata` | 2 (LapData) | Position, gaps, sectors, pit status, penalties |
| `f1:event` | 3 (Event) | Event code + details (excludes BUTN) |
| `f1:participants` | 4 (Participants) | Driver name, team, number, AI flag |
| `f1:carsetups` | 5 (CarSetups) | All 21 setup parameters per car |
| `f1:telemetry` | 6 (CarTelemetry) | Speed, gear, throttle, brake, temps, pressures |
| `f1:carstatus` | 7 (CarStatus) | ERS, DRS, tyres, fuel, flags |
| `f1:classification` | 8 (FinalClassification) | Position, laps, best lap, penalties, status |
| `f1:cardamage` | 10 (CarDamage) | Tyre wear, wing/floor/engine damage |
| `f1:laphistory` | 11 (SessionHistory) | Per-driver lap times + sector splits |
| `f1:positionhistory` | 15 (LapPositions) | Position per car per lap |

---

## Write Throttling

High-frequency data is throttled to reduce Redis and database load:

| Data Type | Realtime Publish | DB Write | Effective Rate (at 20Hz input) |
|---|---|---|---|
| Motion | Every 2nd packet | Every 5th packet | 10 Hz realtime / 4 Hz DB |
| Telemetry | Every 2nd packet | Every 5th packet | 10 Hz / 4 Hz |
| Lap Data | Every 2nd packet | Every 5th packet | 10 Hz / 4 Hz |
| Car Status | Every 2nd packet | Every 5th packet | 10 Hz / 4 Hz |
| Car Damage | Every 10th packet | Every 25th packet | 2 Hz / 0.8 Hz |
| Session | Every packet | Every packet | Full rate |
| Participants | Every packet | Every packet | Full rate (infrequent) |
| Events | Every packet | Every packet | Full rate (infrequent) |

---

## Project Structure

```
f1-app/
├── server.ts                          # Entry: HTTP + UDP + Socket.IO
├── tsconfig.server.json               # TS config for server (ES2020, CommonJS)
├── tsconfig.json                      # TS config for Next.js frontend
├── next.config.js                     # Next.js config (standalone output)
├── postcss.config.js                  # PostCSS with Tailwind CSS plugin
├── docker-compose.yml                 # 3-service orchestration
├── Dockerfile                         # Multi-stage build (deps → build → run)
├── .env / .env.example                # Environment variables
│
├── prisma/
│   ├── schema.prisma                  # 4 Prisma ORM models
│   └── migrations/init/
│       └── migration.sql              # 5 TimescaleDB hypertable DDL + compression
│
└── src/
    ├── app/                           # Next.js App Router pages
    │   ├── layout.tsx                 # Root layout (dark mode, ambient-bg class)
    │   ├── globals.css                # Full F1 glassmorphic theme (~500 lines)
    │   ├── page.tsx                   # Main dashboard with 3 tabs
    │   ├── sessions/
    │   │   ├── page.tsx               # Session history list with analytics
    │   │   └── [id]/page.tsx          # Session replay viewer with canvas
    │   └── api/
    │       ├── sessions/route.ts      # GET: list all sessions
    │       ├── telemetry/route.ts     # GET: query hypertable data
    │       └── replay/route.ts        # GET: motion+lap+status for replay
    │
    ├── components/                    # 10 React UI components
    │   ├── SessionInfo.tsx
    │   ├── Leaderboard.tsx
    │   ├── TrackMap.tsx
    │   ├── TelemetryPanel.tsx
    │   ├── ERSMonitor.tsx
    │   ├── TyreStrategy.tsx
    │   ├── EventFeed.tsx
    │   ├── LapTimeChart.tsx
    │   ├── PositionChart.tsx
    │   └── CarSetupComparison.tsx
    │
    ├── hooks/
    │   └── useSocket.ts              # Socket.IO client hook (11 event listeners)
    │
    ├── stores/
    │   └── telemetryStore.ts         # Zustand store with 12 state slices
    │
    ├── lib/
    │   ├── constants.ts              # PacketId enum, team colors/names, track names,
    │   │                             # session types, weather types, tyre compounds,
    │   │                             # ERS modes, driver/result status, event codes
    │   ├── db.ts                     # Prisma client singleton (dev hot-reload safe)
    │   ├── utils.ts                  # formatLapTime(), formatDelta(), formatGap()
    │   └── team-logos.ts             # Team logo URLs, tyre/weather icons, F1 SVG
    │
    └── server/                        # Server-side only
        ├── udp-listener.ts           # UDP socket bind + packet dispatch + throttle
        ├── parser/                    # 16 binary packet parsers
        │   ├── header.ts             # 29-byte common header
        │   ├── motion.ts             # PacketId 0: world positions, velocities, g-forces
        │   ├── session.ts            # PacketId 1: track, weather, timing, marshal zones
        │   ├── lap-data.ts           # PacketId 2: positions, gaps, sectors, pit status
        │   ├── event.ts              # PacketId 3: event codes + typed details
        │   ├── participants.ts       # PacketId 4: driver names, teams, numbers
        │   ├── car-setup.ts          # PacketId 5: 21 setup parameters per car
        │   ├── car-telemetry.ts      # PacketId 6: speed, throttle, brake, temps
        │   ├── car-status.ts         # PacketId 7: ERS, DRS, tyres, fuel, flags
        │   ├── final-classification.ts  # PacketId 8: race results, tyre stints
        │   ├── car-damage.ts         # PacketId 10: wear, wing/floor/engine damage
        │   ├── session-history.ts    # PacketId 11: lap + sector time history
        │   ├── tyre-sets.ts          # PacketId 12: available tyre sets
        │   ├── motion-ex.ts          # PacketId 13: extended motion (player only)
        │   ├── time-trial.ts         # PacketId 14: time trial data
        │   └── lap-positions.ts      # PacketId 15: position per car per lap
        ├── db/
        │   └── writers.ts            # 8 writer functions (5 raw SQL, 3 Prisma ORM)
        └── realtime/
            ├── redis.ts              # Redis publisher + subscriber singletons
            └── socket.ts             # Socket.IO init, Redis→WebSocket relay
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20 (Alpine) |
| Framework | Next.js (App Router) | 14.2 |
| UI Library | React | 18.3 |
| Language | TypeScript | 6.0 |
| Styling | Tailwind CSS | 4.3 |
| Icons | Lucide React | 1.16 |
| Animations | Framer Motion | 12.40 |
| Charts | Recharts | 3.8 |
| State Management | Zustand | 5.0 |
| WebSocket | Socket.IO (server + client) | 4.8 |
| Message Broker | Redis (via ioredis) | 7-alpine |
| Database | TimescaleDB (PostgreSQL 16) | latest |
| ORM | Prisma | 6.19 |
| CSS Utilities | clsx + tailwind-merge | latest |
| Server TS Runner | ts-node | 10.9 |
| Containers | Docker + Docker Compose | - |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/f1telemetry` | PostgreSQL/TimescaleDB connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection for pub/sub |
| `UDP_HOST` | `0.0.0.0` | Network interface to bind UDP listener (`0.0.0.0` = all) |
| `UDP_PORT` | `20777` | UDP port (must match F1 25 setting) |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:3000` | Socket.IO URL for browser |
| `PORT` | `3000` | HTTP server port |
| `NODE_ENV` | `development` | Set to `production` in Docker |

---

## Getting Started

### Option 1: Full Docker (production-like)

```bash
docker-compose up --build
```

Starts all 3 services. DB auto-initializes on first boot. Open `http://localhost:3000`.

### Option 2: Local Dev (DB + Redis in Docker)

```bash
# 1. Start infrastructure
docker-compose up timescaledb redis

# 2. Create .env from template
cp .env.example .env
# IMPORTANT: Change DATABASE_URL host from 'timescaledb' to 'localhost'

# 3. Install, generate, push schema, run
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Hypertables are auto-created by Docker's init script. Prisma tables are created by `db push`.

### Option 3: Fully Local

1. Install PostgreSQL 16 + TimescaleDB extension + Redis
2. Create database: `createdb f1telemetry`
3. Apply hypertables: `psql f1telemetry -f prisma/migrations/init/migration.sql`
4. Follow steps 2-4 from Option 2

---

## F1 25 Game Configuration

In F1 25: **Settings → Telemetry → UDP**

| Setting | Value | Notes |
|---|---|---|
| UDP Telemetry | **On** | Required |
| UDP Broadcast Mode | **Off** | Direct targeting is more reliable |
| UDP IP Address | `<server_ip>` | This machine's IP. `127.0.0.1` if same PC |
| UDP Port | `20777` | Must match `UDP_PORT` |
| UDP Send Rate | 20Hz or 60Hz | Higher = smoother |
| UDP Format | 2025 | F1 25 packet format |

### Network Notes
- Game and server must be on the **same LAN subnet**
- Windows Firewall must allow **inbound UDP 20777**
- To add firewall rule: `netsh advfirewall firewall add rule name="F1 UDP" dir=in action=allow protocol=UDP localport=20777`

---

## Custom Server

**File:** `server.ts`

The app uses a custom Node.js HTTP server instead of Next.js's default because two additional services must attach to the same process:

1. **UDP Listener** — `dgram.createSocket('udp4')` must be created at server startup
2. **Socket.IO** — Must share the HTTP server instance with Next.js

### Boot Sequence

```
1. next({ dev, hostname, port })     → Initialize Next.js app
2. app.prepare()                     → Compile pages
3. createServer(handle)              → Create HTTP server with Next.js handler
4. initSocketIO(httpServer)          → Attach Socket.IO, subscribe to Redis
5. startUDPListener()                → Bind UDP socket, start receiving packets
6. httpServer.listen(3000, '0.0.0.0') → Start serving
```

### Build & Run

| Mode | Command | What Happens |
|---|---|---|
| Development | `npm run dev` | `ts-node server.ts` — live TypeScript execution |
| Production build | `npm run build` | `next build` — compiles Next.js |
| Production server | `npm start` | `node dist/server.js` — compiled JS |

The `tsconfig.server.json` targets ES2020/CommonJS and includes `server.ts`, `src/server/**/*.ts`, and `src/lib/**/*.ts`.

---

## UDP Listener & Binary Parsers

### UDP Listener (`src/server/udp-listener.ts`)

The central dispatcher. It:

1. Creates a `udp4` socket bound to `UDP_HOST:UDP_PORT`
2. On each incoming `Buffer`:
   - Validates length >= 29 bytes
   - Parses the common header via `parseHeader()`
   - Switches on `header.packetId` to dispatch to the correct parser
   - Publishes slim JSON to Redis channel
   - Optionally writes to TimescaleDB (throttled)

### Packet Header (29 bytes)

Every F1 25 UDP packet starts with this header:

| Offset | Size | Type | Field |
|---|---|---|---|
| 0 | 2 | uint16 | packetFormat (2025) |
| 2 | 1 | uint8 | gameYear (25) |
| 3 | 1 | uint8 | gameMajorVersion |
| 4 | 1 | uint8 | gameMinorVersion |
| 5 | 1 | uint8 | packetVersion |
| 6 | 1 | uint8 | packetId (0-15) |
| 7 | 8 | uint64 | sessionUID |
| 15 | 4 | float32 | sessionTime |
| 19 | 4 | uint32 | frameIdentifier |
| 23 | 4 | uint32 | overallFrameIdentifier |
| 27 | 1 | uint8 | playerCarIndex |
| 28 | 1 | uint8 | secondaryPlayerCarIndex |

### All 16 Packet Parsers

| ID | Parser File | Packet Name | Key Fields | Used In |
|---|---|---|---|---|
| 0 | `motion.ts` | Motion | worldPositionX/Y/Z, velocities, g-forces, yaw/pitch/roll | TrackMap (2D positions) |
| 1 | `session.ts` | Session | trackId, sessionType, weather, temps, timeLeft, safetyCarStatus, weatherForecast | SessionInfo header |
| 2 | `lap-data.ts` | LapData | carPosition, currentLapNum, lastLapTimeInMS, sectorTimes, deltas, pitStatus, driverStatus | Leaderboard |
| 3 | `event.ts` | Event | eventStringCode (4-char), typed eventDetails union | EventFeed |
| 4 | `participants.ts` | Participants | name, teamId, raceNumber, nationality, aiControlled | Driver labels everywhere |
| 5 | `car-setup.ts` | CarSetups | frontWing, rearWing, camber, toe, suspension, brakes, tyrePressures, fuelLoad | CarSetupComparison |
| 6 | `car-telemetry.ts` | CarTelemetry | speed, throttle, brake, steer, gear, engineRPM, DRS, temps, pressures | TelemetryPanel |
| 7 | `car-status.ts` | CarStatus | fuelInTank, fuelRemainingLaps, DRS, tyreCompound, tyreAge, ERS (store/mode/harvest) | ERSMonitor, TyreStrategy |
| 8 | `final-classification.ts` | FinalClassification | position, numLaps, gridPosition, points, pitStops, bestLapTime, tyreStints | Session results |
| 9 | — | LobbyInfo | (not processed) | — |
| 10 | `car-damage.ts` | CarDamage | tyresWear[4], wingDamage, floorDamage, engineDamage, gearboxDamage | TyreStrategy (wear bars) |
| 11 | `session-history.ts` | SessionHistory | lapHistoryData[100] with lap/sector times | LapTimeChart |
| 12 | `tyre-sets.ts` | TyreSets | (parsed but not relayed) | — |
| 13 | `motion-ex.ts` | MotionEx | (parsed but not relayed) | — |
| 14 | `time-trial.ts` | TimeTrial | (parsed but not relayed) | — |
| 15 | `lap-positions.ts` | LapPositions | positionForVehicleIdx[50][22] | PositionChart |

### Slim Data Optimization

Before publishing to Redis, each packet's data is "slimmed" to minimize payload:
- Field names shortened (`i` instead of `carIndex`, `spd` instead of `speed`)
- Floats rounded (`Math.round(value * 100) / 100`)
- Zero/inactive cars skipped where possible
- Only relevant fields included

---

## Real-time Pipeline (Redis to Socket.IO)

### Redis Layer (`src/server/realtime/redis.ts`)

- **Publisher singleton** — Created lazily on first publish, shared across all writers
- **Subscriber singleton** — Created lazily by Socket.IO, dedicated to channel subscriptions
- Both connect to `REDIS_URL` via `ioredis`
- `publish()` serializes to JSON with BigInt-to-string conversion

### Socket.IO Layer (`src/server/realtime/socket.ts`)

- **`initSocketIO(httpServer)`** — Creates Socket.IO server attached to the HTTP server
  - CORS: `origin: '*'`
  - Transports: `['websocket', 'polling']`
- Subscribes to all 12 Redis channels
- On each Redis message: parses JSON, strips `f1:` prefix from channel name, emits to all clients
  - `f1:motion` → `socket.emit('motion', data)`
  - `f1:telemetry` → `socket.emit('telemetry', data)`
  - etc.

### Client Hook (`src/hooks/useSocket.ts`)

- Connects to `NEXT_PUBLIC_SOCKET_URL` on component mount
- Registers 11 event listeners that map directly to Zustand setters:

| Socket Event | Store Method | Data Shape |
|---|---|---|
| `motion` | `setMotion(data.cars)` | `CarMotionSlim[]` |
| `session` | `setSession(data)` | `SessionInfo` |
| `lapdata` | `setLapData(data.cars)` | `CarLapSlim[]` |
| `telemetry` | `setTelemetry(data.cars)` | `CarTelemetrySlim[]` |
| `carstatus` | `setCarStatus(data.cars)` | `CarStatusSlim[]` |
| `cardamage` | `setCarDamage(data.cars)` | `CarDamageSlim[]` |
| `participants` | `setDrivers(data.drivers)` | `DriverInfo[]` |
| `event` | `addEvent(data)` | `EventInfo` |
| `carsetups` | `setCarSetups(data.cars)` | `CarSetupSlim[]` |
| `laphistory` | `addLapHistory(data.entries)` | `LapHistoryEntry[]` |
| `positionhistory` | `addPositionHistory(data.entries)` | `PositionHistoryEntry[]` |

---

## Database Layer

### Prisma ORM Models (`prisma/schema.prisma`)

Four relational tables managed by Prisma:

**`sessions`**
- `id` (UUID, PK), `sessionUID` (BigInt, unique), `trackId`, `sessionType`, `weather`, `totalLaps`, `trackLength`, `formula`, `airTemperature`, `trackTemperature`, `safetyCarStatus`, `networkGame`, `createdAt`, `updatedAt`
- Relations: `participants[]`, `events[]`, `finalClassifications[]`

**`participants`**
- `id` (UUID), `sessionId` (FK), `carIndex`, `driverId`, `teamId`, `raceNumber`, `nationality`, `name`, `aiControlled`, `platform`
- Unique constraint: `(sessionId, carIndex)`

**`events`**
- `id` (UUID), `sessionId` (FK), `eventCode` (string), `timestamp`, `details` (JSON)
- Index: `(sessionId, eventCode)`

**`final_classifications`**
- `id` (UUID), `sessionId` (FK), `carIndex`, `position`, `numLaps`, `gridPosition`, `points`, `numPitStops`, `resultStatus`, `bestLapTimeInMS`, `totalRaceTime`, `penaltiesTime`, `tyreStints` (JSON)
- Unique constraint: `(sessionId, carIndex)`

### TimescaleDB Hypertables (`prisma/migrations/init/migration.sql`)

Five time-series hypertables created with raw SQL and TimescaleDB's `create_hypertable()`:

**`telemetry_samples`** — speed, throttle, steer, brake, clutch, gear, RPM, DRS, brake temps (4), tyre surface temps (4), tyre inner temps (4), engine temp, tyre pressures (4)

**`motion_samples`** — world position X/Y/Z, world velocity X/Y/Z, g-forces (lateral/longitudinal/vertical), yaw, pitch, roll

**`lap_data_samples`** — current/last lap time, sector 1/2 times, delta to front/leader, lap distance, total distance, position, lap number, pit status, pit stops, sector, invalid flag, penalties, driver/result status, speed trap, grid position

**`car_status_samples`** — fuel mix, fuel in tank/capacity/remaining laps, DRS allowed/distance, tyre compounds (actual/visual), tyre age, FIA flags, ICE/MGU-K power, ERS store/deploy mode/harvested/deployed

**`car_damage_samples`** — tyre wear (4), tyre damage (4), wing damage (FL/FR/rear), floor, diffuser, sidepod, DRS fault, ERS fault, gearbox, engine damage

All hypertables:
- Partitioned by `time` column
- Indexed on `(session_uid, car_index, time DESC)`
- Auto-compressed after 1 day via `add_compression_policy()`, segmented by `session_uid, car_index`

### DB Writer Functions (`src/server/db/writers.ts`)

| Function | Target | Method |
|---|---|---|
| `writeMotionSamples()` | `motion_samples` | Raw SQL INSERT (batch) |
| `writeTelemetrySamples()` | `telemetry_samples` | Raw SQL INSERT (batch) |
| `writeLapDataSamples()` | `lap_data_samples` | Raw SQL INSERT (batch) |
| `writeCarStatusSamples()` | `car_status_samples` | Raw SQL INSERT (batch) |
| `writeCarDamageSamples()` | `car_damage_samples` | Raw SQL INSERT (batch) |
| `upsertSession()` | `sessions` | Prisma `upsert` (by sessionUID) |
| `upsertParticipants()` | `participants` | Prisma `upsert` (per car index) |
| `writeEvent()` | `events` | Prisma `create` |
| `writeFinalClassification()` | `final_classifications` | Prisma `upsert` (per car index) |

Batch writers construct multi-row `INSERT` statements for performance. Cars with zero positions or inactive result status are skipped.

---

## REST API Endpoints

### `GET /api/sessions`
Returns the 50 most recent sessions with participants and event/classification counts.

**Response:** `SessionRow[]` with `participants[]` and `_count: { events, finalClassifications }`

### `GET /api/telemetry`
Queries any hypertable for a specific session and optional car index with time range filtering.

**Query Parameters:**
| Param | Required | Default | Description |
|---|---|---|---|
| `sessionUID` | Yes | — | Session UID |
| `table` | No | `telemetry_samples` | One of: `telemetry_samples`, `motion_samples`, `lap_data_samples`, `car_status_samples`, `car_damage_samples` |
| `carIndex` | No | all cars | Filter to specific car |
| `from` | No | — | ISO timestamp lower bound |
| `to` | No | — | ISO timestamp upper bound |
| `limit` | No | 500 | Max rows returned |

### `GET /api/replay`
Fetches motion, lap data, car status, and telemetry for a session replay.

**Query Parameters:** `sessionUID` (required), `from`, `to` (optional)

**Response:** `{ motion[], lapData[], carStatus[], telemetry[] }` — up to 10,000 rows per table.

---

## Frontend Architecture

### Pages (Next.js App Router)

| Route | File | Description |
|---|---|---|
| `/` | `src/app/page.tsx` | Main dashboard with 3 tabs (Live, Charts, Setup) |
| `/sessions` | `src/app/sessions/page.tsx` | Session history list with analytics |
| `/sessions/[id]` | `src/app/sessions/[id]/page.tsx` | Session replay viewer |

### Main Dashboard (`/`)

The root page is a client component that:

1. Calls `useSocket()` to establish the WebSocket connection
2. Reads `activeTab` from Zustand store
3. Renders `SessionInfo` header (always visible)
4. Renders a tab bar with 3 tabs (Live, Charts, Setup)
5. Uses `AnimatePresence` with `mode="wait"` for smooth tab transitions

**Tab Layouts:**

| Tab | Left Column (3/12) | Center Column (5/12) | Right Column (4/12) |
|---|---|---|---|
| **Live** | Leaderboard | TrackMap + EventFeed | TelemetryPanel + ERSMonitor + TyreStrategy |
| **Charts** | Leaderboard | LapTimeChart + PositionChart + EventFeed | — (9/12 center) |
| **Setup** | Leaderboard | CarSetupComparison | TelemetryPanel + TyreStrategy |

---

## UI Components

### SessionInfo (`SessionInfo.tsx`)
F1 broadcast-style header bar with:
- F1 logo text with red glow
- Live/Offline connection pill with green pulse animation
- Track name, session type, weather icon
- Air & track temperature
- Session time remaining (countdown)
- Safety car status badge (SC/VSC)
- Link to session history

### Leaderboard (`Leaderboard.tsx`)
Animated driver standings with:
- Framer Motion `layout` animations for position changes
- Team-colored stripe with neon glow
- Angular clipped position badges (P1=red, P2=silver, P3=bronze)
- Driver name, last lap time, formatted gap to leader
- Tyre compound badge
- Pit status indicator
- Click to select car (sets `selectedCarIndex` in store)

### TrackMap (`TrackMap.tsx`)
HTML5 Canvas 2D visualization:
- `requestAnimationFrame` render loop
- Auto-scaling to track bounds with padding
- Team-colored car dots
- Trailing path lines per car
- Driver name labels

### TelemetryPanel (`TelemetryPanel.tsx`)
Selected car's live telemetry:
- Large speed readout (F1 font, 40px)
- Gear indicator with DRS badge
- Animated throttle bar (green gradient) and brake bar (red gradient)
- RPM value
- Tyre surface temps (4 corners)
- Brake temps (4 corners)
- Engine temperature

### ERSMonitor (`ERSMonitor.tsx`)
Energy Recovery System display:
- Animated energy store bar (color changes: green > 50%, yellow > 20%, red < 20%)
- Deploy mode badge (None/Medium/Hotlap/Overtake)
- ICE + MGU-K power output
- MGU-K and MGU-H harvest rates
- Energy deployed this lap

### TyreStrategy (`TyreStrategy.tsx`)
Tyre and fuel information:
- Glowing tyre compound badge (Soft=red, Medium=yellow, Hard=white, Inter=green, Wet=blue)
- Tyre age in laps
- Animated wear bars per corner (FL/FR/RL/RR) with color gradient
- Surface and inner temperatures
- Tyre pressures
- DRS availability and activation distance
- Fuel remaining in laps

### EventFeed (`EventFeed.tsx`)
Race event log with:
- Staggered entry animations via `AnimatePresence`
- Color-coded event icons (green=FTLP, red=PENA, yellow=flags, blue=DRS)
- Event name, details, relative timestamp
- Animated event count badge
- Max 50 events stored (FIFO)

### LapTimeChart (`LapTimeChart.tsx`)
Recharts `LineChart` showing:
- Lap number on X-axis
- Lap time (formatted mm:ss.SSS) on Y-axis
- One line per active driver (team-colored)
- Responsive container
- Custom tooltip

### PositionChart (`PositionChart.tsx`)
Recharts `LineChart` showing:
- Lap number on X-axis
- Position on Y-axis (reversed: P1 at top)
- One line per active driver (team-colored)

### CarSetupComparison (`CarSetupComparison.tsx`)
Side-by-side setup comparison:
- Two driver selectors (dropdowns)
- 21 setup parameters compared
- Animated difference bars (Framer Motion `motion.div`)
- Parameters: front/rear wing, on/off throttle, camber, toe, suspension, suspension height, anti-roll bar, brake pressure, brake bias, tyre pressures (4), fuel load

---

## State Management

### Zustand Store (`src/stores/telemetryStore.ts`)

Single global store with 12 state slices and 13 setter actions:

| State Slice | Type | Updated By |
|---|---|---|
| `connected` | `boolean` | Socket connect/disconnect |
| `session` | `SessionInfo \| null` | Session packet |
| `drivers` | `DriverInfo[]` | Participants packet |
| `motion` | `CarMotionSlim[]` | Motion packet |
| `lapData` | `CarLapSlim[]` | LapData packet |
| `telemetry` | `CarTelemetrySlim[]` | CarTelemetry packet |
| `carStatus` | `CarStatusSlim[]` | CarStatus packet |
| `carDamage` | `CarDamageSlim[]` | CarDamage packet |
| `carSetups` | `CarSetupSlim[]` | CarSetups packet |
| `events` | `EventInfo[]` | Event packet (capped at 50, LIFO) |
| `lapHistory` | `LapHistoryEntry[]` | SessionHistory packet (deduplicated) |
| `positionHistory` | `PositionHistoryEntry[]` | LapPositions packet (deduplicated) |
| `selectedCarIndex` | `number` | User click on Leaderboard |
| `activeTab` | `'live' \| 'charts' \| 'setup'` | User tab selection |

**Deduplication:** `addLapHistory` and `addPositionHistory` use a `Set` of `${carIndex}_${lap}` keys to prevent duplicate entries.

---

## Styling & Theme

### CSS Architecture (`src/app/globals.css`)

The entire UI theme is defined in a single CSS file (~500 lines) using CSS custom properties, no external UI component library.

**Design System:**
- **Background:** `#080810` with ambient color orbs (red, teal, purple radial gradients)
- **Cards:** Glassmorphic panels — `backdrop-filter: blur(20px) saturate(1.4)`, translucent backgrounds, gradient shine overlay, top-edge inner glow
- **Color-coded card variants:** `.card-red` (Leaderboard, TrackMap), `.card-blue` (Telemetry), `.card-green` (ERS), `.card-purple` (Tyres), `.card-accent` (Events)
- **Neon glows:** Pills, badges, and bars emit `box-shadow` matching their color
- **Typography:** Custom `F1` font-face for headers/badges, Inter for body
- **Tab bar:** Glass segmented control with red gradient active state

**Key CSS Classes:**
| Class | Purpose |
|---|---|
| `.card` | Base glassmorphic panel |
| `.card-red/green/blue/purple` | Colored top border + neon glow |
| `.card-accent` | Red gradient top border |
| `.card-header` / `.card-title` | Panel header bar |
| `.pos-badge` / `.p1/.p2/.p3` | Angular clipped position badges |
| `.pill-live` / `.pill-pit` / `.pill-flag-*` | Status badges |
| `.stat-block` | Glass telemetry readout block |
| `.tab-bar` / `.tab-item` | Segmented tab control |
| `.speed-readout` / `.gear-readout` | Large F1 font readouts |
| `.throttle-bar` / `.throttle-bar-fill` | Animated progress bars |
| `.tyre-badge` | Glowing compound circle |
| `.red-bar` | Broadcast-style red accent line |
| `.f1-header` / `.f1-logo-text` | Header bar styling |
| `.team-stripe` | Colored team indicator |
| `.live-dot` | Pulsing green connection dot |
| `.ambient-bg` | Floating red orb background |

---

## Docker Deployment

### Dockerfile (multi-stage)

```
Stage 1: deps     → npm ci + prisma generate
Stage 2: builder  → next build + tsc (server compilation)
Stage 3: runner   → Minimal Alpine with built assets
```

The production image:
- Runs as non-root user `nextjs` (UID 1001)
- Uses Next.js standalone output mode (minimal node_modules)
- Copies compiled server (`dist/server.js`) and Prisma client
- Exposes ports 3000 (HTTP) and 20777/udp
- Entry: `CMD ["node", "dist/server.js"]`

### Docker Compose

```yaml
services:
  timescaledb:      # Auto-initializes with hypertable SQL
  redis:            # Pub/sub broker
  web:              # Depends on both, builds from Dockerfile
```

The TimescaleDB container mounts the migration SQL file into `/docker-entrypoint-initdb.d/` so it runs automatically on first database creation. Both infrastructure services have health checks; the web service waits for both to be healthy before starting.

---

## Troubleshooting

### `EADDRNOTAVAIL` on UDP bind
`UDP_HOST` must be a local interface address or `0.0.0.0`. Do not set it to the game machine's IP — it should be the address this server listens on.

### No data appearing in dashboard
1. Verify F1 25 UDP settings point to this machine's IP
2. Check firewall: `netstat -an | findstr 20777` should show UDP binding
3. Check console for `[UDP] Listening on 0.0.0.0:20777`
4. Ensure the game is actively running a session (not paused in menus)

### Docker pull failures (corporate proxy)
If behind a proxy, configure Docker Desktop: Settings → Resources → Proxies. Or run infrastructure locally.

### Database connection errors
- Verify TimescaleDB container is running and healthy
- Check `DATABASE_URL` points to correct host (`localhost` for local dev, `timescaledb` for Docker)
- Run `npx prisma db push` to ensure Prisma tables exist

### Redis connection errors
- Verify Redis container is running
- Check `REDIS_URL` points to correct host
- Console should show `[Socket.IO] Subscribed to Redis channels: ...`

### Socket.IO not connecting
- Verify `NEXT_PUBLIC_SOCKET_URL` matches the server URL
- Check browser console for WebSocket connection errors
- Ensure the custom server is running (not `next dev` alone)
