# F1 Pit Wall — Component Map

Full-stack real-time F1 telemetry dashboard. This document is the master index of every major component, page, server module, store, hook, and lib utility in the project.

---

## Architecture Overview

```
Game UDP (port 20777)
    │
    ▼
[udp-listener.ts]  ─── parse packets ──▶  [server/parser/*]
    │
    ▼ publish(RedisChannel, data)
[Redis pub/sub]
    │
    ▼ subscribe + relay
[Socket.IO server]  ─── emit(eventName, data) ──▶  Browser
    │
    ▼
[useSocket hook]  ─── store.setXxx() ──▶  [telemetryStore (Zustand)]
    │
    ▼
React components  ─── useTelemetryStore((s) => …) ──▶  Live UI
```

- **Frontend**: Next.js 14 App Router, React, Zustand, Framer Motion, Recharts, TailwindCSS
- **Backend**: Node.js / ts-node, UDP socket listener, Redis pub/sub, Socket.IO
- **Database**: PostgreSQL via Prisma ORM + TimescaleDB hypertables for time-series data

---

## Pages (`src/app/`)

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Live dashboard — Leaderboard, telemetry panels, track map, charts |
| `/sessions` | `app/sessions/page.tsx` | Race history list with delete support |
| `/sessions/[id]` | `app/sessions/[id]/page.tsx` | Session replay — motion playback + race moments |
| `/players` | `app/players/page.tsx` | Player profile management (create, edit, assign) |
| `/players/[id]` | `app/players/[id]/page.tsx` | Individual player stats and race history |
| `/players/h2h` | `app/players/h2h/page.tsx` | Head-to-head comparison between two players |
| `/standings` | `app/standings/page.tsx` | Driver championship standings across all sessions |
| `/seasons` | `app/seasons/page.tsx` | Season list |
| `/seasons/[id]` | `app/seasons/[id]/page.tsx` | Per-season standings and race calendar |

> See [`src/app/README.md`](src/app/README.md) for full page documentation.

---

## UI Components (`src/components/`)

### Navigation & Layout
| Component | File | Description |
|---|---|---|
| [`AppHeader`](src/components/AppHeader.md) | `AppHeader.tsx` | Global nav bar used on all non-dashboard pages |
| [`SessionInfo`](src/components/SessionInfo.md) | `SessionInfo.tsx` | Live dashboard header — session meta, LIVE/OFFLINE pill, tab switcher |

### Live Dashboard — Live Tab
| Component | File | Description |
|---|---|---|
| [`Leaderboard`](src/components/Leaderboard.md) | `Leaderboard.tsx` | Sorted race order with team colours, tyre, gap, lap time |
| [`HumanPlayersOverview`](src/components/HumanPlayersOverview.md) | `HumanPlayersOverview.tsx` | Summary card for up to 2 human players — tyres, ERS, fuel, overtake/aero (2026) |
| [`TelemetryPanel`](src/components/TelemetryPanel.md) | `TelemetryPanel.tsx` | Selected car live telemetry — speed, gear, throttle, brakes, tyre temps |
| [`ERSMonitor`](src/components/ERSMonitor.md) | `ERSMonitor.tsx` | Selected car ERS energy store, deploy mode, harvest data |
| [`TyreStrategy`](src/components/TyreStrategy.md) | `TyreStrategy.tsx` | Selected car tyre compound, wear per corner, temps, fuel |
| [`EventFeed`](src/components/EventFeed.md) | `EventFeed.tsx` | Scrolling live race event log (overtakes, penalties, safety car, etc.) |
| [`TrackMap`](src/components/TrackMap.md) | `TrackMap.tsx` | Canvas-rendered real-time track map with car positions and trails |

### Live Dashboard — Charts Tab
| Component | File | Description |
|---|---|---|
| [`LapTimeChart`](src/components/LapTimeChart.md) | `LapTimeChart.tsx` | Line chart of human player lap times per lap |
| [`PositionChart`](src/components/PositionChart.md) | `PositionChart.tsx` | Line chart of human player race positions per lap |

### Live Dashboard — Setup Tab
| Component | File | Description |
|---|---|---|
| [`CarSetupComparison`](src/components/CarSetupComparison.md) | `CarSetupComparison.tsx` | Side-by-side bar chart comparison of car setup parameters |

### History & Standings (shared)
| Component | File | Description |
|---|---|---|
| [`RaceResultCard`](src/components/RaceResultCard.md) | `RaceResultCard.tsx` | Reusable race result row — track flag, session type, player positions |
| [`RaceMomentsTimeline`](src/components/RaceMomentsTimeline.md) | `RaceMomentsTimeline.tsx` | Filterable timeline of persisted race events for a completed session |
| [`StandingsTable`](src/components/StandingsTable.md) | `StandingsTable.tsx` | Driver championship table with full stats columns |
| [`StandingsHighlights`](src/components/StandingsHighlights.md) | `StandingsHighlights.tsx` | Highlight cards — most wins, most overtakes, most collisions, fastest lap |

---

## State Management (`src/stores/`)

| Store | File | Description |
|---|---|---|
| `useTelemetryStore` | `telemetryStore.ts` | Single Zustand store for all live telemetry state |

Key slices: `session`, `drivers`, `motion`, `lapData`, `telemetry`, `carStatus`, `carDamage`, `carSetups`, `carTelemetry2`, `events`, `lapHistory`, `positionHistory`, `selectedCarIndex`, `activeTab`

> See [`src/stores/README.md`](src/stores/README.md)

---

## Hooks (`src/hooks/`)

| Hook | File | Description |
|---|---|---|
| `useSocket` | `useSocket.ts` | Manages Socket.IO connection, maps all incoming events to store setters |

> See [`src/hooks/README.md`](src/hooks/README.md)

---

## Server (`src/server/`)

| Module | File | Description |
|---|---|---|
| UDP Listener | `udp-listener.ts` | Binds UDP port, parses every packet, publishes to Redis |
| DB Writers | `db/writers.ts` | Persists session, participants, telemetry, damage, events to DB |
| Socket.IO | `realtime/socket.ts` | Subscribes to Redis channels, relays to all connected Socket.IO clients |
| Redis | `realtime/redis.ts` | Singleton publisher/subscriber + `RedisChannel` enum + `publish()` helper |

### Parsers (`src/server/parser/`)
| Parser | Packet ID | Description |
|---|---|---|
| `header.ts` | — | 29-byte `PacketHeader` parser |
| `motion.ts` | 0 | Car position (x, z, yaw), g-forces — 2025/2026 branched |
| `session.ts` | 1 | Track, weather, formula, safety car, pit windows — 2026 aero/DRS zones |
| `lap-data.ts` | 2 | Per-car position, lap time, sector times, pit status, gaps |
| `event.ts` | 3 | Race events (FTLP, OVTK, PENA, COLL, etc.) |
| `participants.ts` | 4 | Driver names, team IDs, AI flag, telemetry flag |
| `car-setup.ts` | 5 | Wing, suspension, tyre pressure, brake, fuel |
| `car-telemetry.ts` | 6 | Speed, throttle, brake, gear, RPM, tyre temps |
| `car-status.ts` | 7 | Fuel, tyres, ERS store/mode, DRS — 2026 adds harvest limit |
| `final-classification.ts` | 8 | End-of-race results |
| `session-history.ts` | 11 | Per-car lap-by-lap time history |
| `car-damage.ts` | 12 | Wing, floor, engine, gearbox damage + tyre wear |
| `car-telemetry2.ts` | 16 | **2026 only** — Active Aero mode + Overtake system |
| `tyre-sets.ts` | 18 | Tyre set availability |
| `motion-ex.ts` | 19 | Extended motion data (suspension, slip angles) |
| `time-trial.ts` | 21 | Time trial dataset |
| `lap-positions.ts` | 22 | Per-lap position snapshots for history chart |

> See [`src/server/README.md`](src/server/README.md)

---

## Lib (`src/lib/`)

| Module | File | Description |
|---|---|---|
| `constants.ts` | `constants.ts` | All lookup maps — team names/colours/logos, track names, tyre compounds, session types, ERS modes, 2026 format detection helpers |
| `team-logos.ts` | `team-logos.ts` | Team ID → logo URL mapping (2025 + 2026 IDs) |
| `utils.ts` | `utils.ts` | `formatLapTime`, `formatGap`, `formatDelta`, `cn` |
| `db.ts` | `db.ts` | Prisma client singleton |

> See [`src/lib/README.md`](src/lib/README.md)

---

## API Routes (`src/app/api/`)

| Route | Methods | Description |
|---|---|---|
| `/api/sessions` | GET | List all sessions (with participants, events count) |
| `/api/sessions/[id]` | GET, DELETE | Get or delete a single session |
| `/api/sessions/[id]/events` | GET | Race events for replay timeline |
| `/api/players` | GET, POST | List or create player profiles |
| `/api/players/[id]` | GET, PATCH, DELETE | Get, update, or delete a player |
| `/api/players/[id]/stats` | GET | Aggregated career stats for a player |
| `/api/standings` | GET | Championship standings across all sessions |
| `/api/seasons` | GET, POST | List or create seasons |
| `/api/seasons/[id]` | GET, PATCH, DELETE | Get, update or delete a season |
| `/api/replay` | GET | Paginated motion frames for session replay |
| `/api/telemetry` | GET | *[purpose TBD — add description here]* |

---

## Data Flow Summary

```
UDP Packet → Parser → udp-listener.ts
    ├── [throttled] publish(Redis) → Socket.IO → useSocket → Zustand store → React re-render
    └── [persisted] db/writers.ts → PostgreSQL / TimescaleDB
```

**Throttling**: High-frequency packets (motion, telemetry, lap data) are throttled via counters in `udp-listener.ts` to avoid overwhelming Redis and the browser.

**2026 DLC Detection**: `isFormat2026(packetFormat, gameYear, bufLen?, expected2025Size?)` in `constants.ts` auto-detects packet format on every packet — no manual config needed.
