# Pages — `src/app/`

Next.js 14 App Router pages. All pages are server-rendered by default except where marked `'use client'`.

---

## `/` — Live Dashboard

**File**: `app/page.tsx`  
**Type**: Client Component

The main live telemetry dashboard. Calls `useSocket()` to establish the Socket.IO connection. Layout is controlled by `activeTab` from the store.

### Tab layouts

#### Live tab
```
[SessionInfo header — full width]
├── col-span-4:  Leaderboard (full height, scrollable)
└── col-span-8:  HumanPlayersOverview
                 ├── (if car selected) TelemetryPanel | ERSMonitor | TyreStrategy
                 EventFeed
                 TrackMap
```

#### Charts tab
```
├── col-span-3:  Leaderboard
└── col-span-9:  LapTimeChart | PositionChart (2-col)
                 EventFeed
```

#### Setup tab
```
├── col-span-3:  Leaderboard
├── col-span-5:  CarSetupComparison
└── col-span-4:  (if car selected) TelemetryPanel + TyreStrategy
                 (else) "Select a driver" placeholder
```

### Components used
[`SessionInfo`](../components/SessionInfo.md), [`Leaderboard`](../components/Leaderboard.md), [`HumanPlayersOverview`](../components/HumanPlayersOverview.md), [`TelemetryPanel`](../components/TelemetryPanel.md), [`ERSMonitor`](../components/ERSMonitor.md), [`TyreStrategy`](../components/TyreStrategy.md), [`EventFeed`](../components/EventFeed.md), [`TrackMap`](../components/TrackMap.md), [`LapTimeChart`](../components/LapTimeChart.md), [`PositionChart`](../components/PositionChart.md), [`CarSetupComparison`](../components/CarSetupComparison.md)

---

## `/sessions` — Race History

**File**: `app/sessions/page.tsx`  
**Type**: Client Component

Lists all saved race sessions (most recent first, max 50). Features:

- Summary analytics row: total sessions, tracks, drivers, laps, events
- Per-session [`RaceResultCard`](../components/RaceResultCard.md) with delete button on hover
- `deleteSession(id)` — calls `DELETE /api/sessions/{id}`, only removes from UI state on confirmed `res.ok`

### API calls
- `GET /api/sessions` — on mount
- `DELETE /api/sessions/{id}` — on delete confirm

---

## `/sessions/[id]` — Session Replay

**File**: `app/sessions/[id]/page.tsx`

Shows a completed session with:
- Motion replay — fetches paginated motion frames from `/api/replay?sessionUID=…&cursor=…` and plays them back on a canvas track map
- [`RaceMomentsTimeline`](../components/RaceMomentsTimeline.md) — filtered event timeline

### API calls
- `GET /api/sessions/{id}` — session metadata
- `GET /api/replay?sessionUID={uid}&cursor={ts}` — paginated motion frames (aggregated client-side for full-race playback)
- `GET /api/sessions/{id}/events` — race events (consumed by `RaceMomentsTimeline`)

---

## `/players` — Player Management

**File**: `app/players/page.tsx`  
**Type**: Client Component

Full CRUD interface for human player profiles. Features:

- Player profile cards with avatar, colour, career stats summary
- Create player modal (name, colour picker, optional avatar URL)
- Edit / delete player inline
- Assign players to past sessions (link participant rows to a `HumanProfile`)
- Link to `/players/{id}` (stats) and `/players/h2h` (comparison)

### API calls
- `GET /api/players`
- `POST /api/players`
- `PATCH /api/players/{id}`
- `DELETE /api/players/{id}`

---

## `/players/[id]` — Player Profile

**File**: `app/players/[id]/page.tsx`

Per-player stats page showing:
- Career highlights (wins, podiums, fastest laps, avg position)
- Race-by-race results list using [`RaceResultCard`](../components/RaceResultCard.md)
- Aggregated stats table

### API calls
- `GET /api/players/{id}`
- `GET /api/players/{id}/stats`

---

## `/players/h2h` — Head-to-Head

**File**: `app/players/h2h/page.tsx`

Side-by-side comparison of two player profiles. Both players selected from dropdowns. Shows:
- Career stat comparison bars
- Head-to-head race results where both players participated

### API calls
- `GET /api/players` — to populate the selector dropdowns
- `GET /api/players/{id}/stats` — for each selected player

---

## `/standings` — Championship Standings

**File**: `app/standings/page.tsx`

Global driver championship across all sessions. Uses shared components:
- [`StandingsHighlights`](../components/StandingsHighlights.md) — top stat cards
- [`StandingsTable`](../components/StandingsTable.md) — full stats table

### API calls
- `GET /api/standings`

---

## `/seasons` — Season List

**File**: `app/seasons/page.tsx`

Lists all created seasons. Features:
- Create season form (name, year)
- Season cards linking to `/seasons/{id}`

### API calls
- `GET /api/seasons`
- `POST /api/seasons`

---

## `/seasons/[id]` — Season Detail

**File**: `app/seasons/[id]/page.tsx`

Per-season view with:
- Season standings: [`StandingsHighlights`](../components/StandingsHighlights.md) + [`StandingsTable`](../components/StandingsTable.md)
- Race calendar: list of sessions in the season using [`RaceResultCard`](../components/RaceResultCard.md)
- Manage sessions (add/remove session from season)

### API calls
- `GET /api/seasons/{id}`
- `PATCH /api/seasons/{id}`
- `DELETE /api/seasons/{id}`

---

## API Routes (`app/api/`)

| Route | Methods | Handler description |
|---|---|---|
| `/api/sessions` | GET | Returns all sessions with participants, final classifications, event counts |
| `/api/sessions/[id]` | GET, DELETE | GET returns full session detail. DELETE removes TimescaleDB rows (with `to_regclass` existence check) then deletes Prisma row |
| `/api/sessions/[id]/events` | GET | Returns events + participants + session start time for `RaceMomentsTimeline` |
| `/api/players` | GET, POST | List all `HumanProfile` rows or create a new one |
| `/api/players/[id]` | GET, PATCH, DELETE | Profile CRUD |
| `/api/players/[id]/stats` | GET | Aggregates career stats from events, classifications, and lap history |
| `/api/standings` | GET | Aggregated championship standings across all sessions |
| `/api/seasons` | GET, POST | Season CRUD |
| `/api/seasons/[id]` | GET, PATCH, DELETE | Per-season detail + race management |
| `/api/replay` | GET | Paginated motion frames — `cursor` (timestamp) + `hasMore` for full-race playback |
| `/api/telemetry` | GET | *[TODO — add description here]* |

---

## `layout.tsx`

Root layout wrapping all pages. Sets the dark theme, loads fonts, and provides the `<html>` / `<body>` shell. No custom logic.

## `globals.css`

All Tailwind base styles + custom CSS variables (`--f1-red`, `--m-blue-dark`, `--font-ui`, etc.), card component styles, pill styles, and animation keyframes.
