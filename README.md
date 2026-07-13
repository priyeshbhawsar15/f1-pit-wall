# F1 25 Live Telemetry Dashboard

Real-time telemetry dashboard for EA F1 25 that connects to the game's UDP telemetry stream, stores data in TimescaleDB, and displays it in a Next.js web app.

## Features

### Live Dashboard
- **Track Map** — 2D canvas rendering of all 22 car positions, color-coded by team with trailing paths
- **Leaderboard** — Position, driver name, team, gap to leader/car in front, last lap, tyre info, pit status
- **Telemetry Panel** — Speed, throttle/brake bars, gear, DRS status, RPM, tyre & engine temps
- **ERS Monitor** — Energy store, deploy mode, ICE/MGU-K power output, harvest rates
- **Tyre Strategy** — Compound, age, wear %, surface/inner temps, pressure, DRS availability, fuel
- **Event Feed** — Live log of overtakes, penalties, collisions, fastest laps, safety cars, DRS events
- **Session Info Bar** — Track, session type, weather, temperatures, time remaining, safety car status

### Session Replay
- Browse all recorded sessions at `/sessions`
- Replay any session with play/pause, speed controls (0.5x–4x), and timeline scrubbing
- Full track visualization with all car positions animated from stored data

## Architecture

```
F1 25 Game → UDP :20777 → Next.js Custom Server (parser + socket.io + DB writer) → TimescaleDB + Redis → Browser
```

**3 Docker containers:**
- `web` — Next.js 14 app with embedded UDP listener and socket.io WebSocket server
- `timescaledb` — PostgreSQL 16 + TimescaleDB extension (time-series hypertables with auto-compression)
- `redis` — Redis 7 for real-time pub/sub between UDP ingestion and WebSocket broadcasting

## Quick Start

### With Docker (recommended)

```bash
docker-compose up --build
```

This starts all 3 services. Open http://localhost:3333 in your browser.

### F1 25 Game Settings

1. Go to **Settings → Telemetry**
2. Set **UDP Telemetry** to **On**
3. Set **UDP IP Address** to the machine running this app (or `127.0.0.1` if same machine)
4. Set **UDP Port** to `20777`
5. Set **UDP Send Rate** to `30Hz` or higher
6. Set **UDP Format** to `2025` or `2026`; both layouts are detected automatically

### Local Development

```bash
# Start TimescaleDB and Redis
docker-compose up timescaledb redis

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Apply TimescaleDB hypertables (run once)
psql postgresql://postgres:postgres@localhost:5432/f1telemetry -f prisma/migrations/init/migration.sql

# Start dev server
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/f1telemetry` | TimescaleDB connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `UDP_PORT` | `20777` | UDP port to listen for F1 telemetry |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:3000` | WebSocket URL for the browser client |

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Lucide icons |
| State | Zustand |
| Real-time | Socket.IO, Redis pub/sub |
| Database | TimescaleDB (PostgreSQL 16) |
| UDP Parser | Node.js dgram, custom binary parsers |
| ORM | Prisma 6 |
| Containers | Docker, Docker Compose |
| 5 | Car Setups | Setup comparison (future) |
| 6 | Car Telemetry | Speed, brakes, temps |
| 7 | Car Status | ERS, DRS, tyres, fuel |
| 8 | Final Classification | Race results |
| 9 | Lobby Info | Multiplayer lobby |
| 10 | Car Damage | Wear, damage levels |
| 11 | Session History | Lap/sector history |
| 12 | Tyre Sets | Available tyre sets |
| 13 | Motion Ex | Extended player motion |
| 14 | Time Trial | Time trial data |
| 15 | Lap Positions | Position history per lap |

## Database Schema

**Prisma-managed (relational):** `sessions`, `participants`, `events`, `final_classifications`

**TimescaleDB hypertables (time-series):** `motion_samples`, `telemetry_samples`, `lap_data_samples`, `car_status_samples`, `car_damage_samples` — with automatic compression after 1 day

## Project Structure

```
f1-app/
├── server.ts                  # Custom server: Next.js + UDP + socket.io
├── docker-compose.yml
├── Dockerfile
├── prisma/
│   ├── schema.prisma          # Relational models
│   └── migrations/init/       # TimescaleDB hypertable SQL
├── src/
│   ├── app/                   # Next.js pages & API routes
│   │   ├── page.tsx           # Live dashboard
│   │   ├── sessions/          # Session history & replay
│   │   └── api/               # REST endpoints
│   ├── components/            # React UI components
│   ├── hooks/useSocket.ts     # Socket.IO client hook
│   ├── stores/                # Zustand state store
│   ├── lib/                   # Constants, utils, DB client
│   └── server/                # Server-only code
│       ├── udp-listener.ts    # UDP socket + dispatcher
│       ├── parser/            # Binary packet parsers (16 types)
│       ├── db/writers.ts      # TimescaleDB batch writers
│       └── realtime/          # Redis pub/sub + socket.io
└── .env
```
