# F1 Telemetry Pit Wall

**Live dashboard and race replay for EA SPORTS F1 25 UDP telemetry**

F1 Telemetry Pit Wall turns a live F1 25 UDP stream into a readable race story for two human drivers. It combines an on-track dashboard, player-focused telemetry, session history, replay controls, driver profiles, seasons, and standings in a self-hosted Next.js application.

> This is an independent open-source project. It is not affiliated with, endorsed by, or sponsored by Formula 1, EA, or any of their partners. The project uses original interface styling and does not bundle official logos, fonts, or other branded assets.

![F1 Telemetry Pit Wall dashboard](docs/screenshots/dashboard.png)

## What it does

- **Live race theater** — Follow the two-player battle, running order, live interval, track position, weather, time remaining, race-control state, and recent moments.
- **Track stage** — View the field on a 2D track map with driver labels, team colors, player emphasis, and motion trails.
- **Selected-car telemetry** — Inspect speed, gear, throttle, brake, fuel, and ERS for the selected driver.
- **Live analysis** — Switch between race context, lap history, position history, and setup comparison as packets arrive.
- **Session archive** — Browse recorded sessions, classified results, weather, race distance, and event counts.
- **Race replay** — Load persisted motion and lap data, play or pause the map, scrub the timeline, step frames, and choose 0.5×, 1×, 2×, or 4× playback.
- **Driver profiles and head-to-head** — Connect anonymous car indexes to two human profiles, compare shared races, and keep career records readable.
- **Seasons and standings** — Group sessions into championships, add rounds, filter points by season or date, and link each result back to replay.
- **2025 and 2026 packet formats** — The parser resolves the supported F1 25 telemetry layouts from packet format, packet size, and session context. The repository includes tests for both formats.

## Architecture

```text
┌──────────────────┐       UDP :20777       ┌──────────────────────────────────────┐
│                  │ ─────────────────────► │ Custom Node server                   │
│  EA SPORTS F1 25 │                        │ UDP listener + format-aware parsers  │
│  game            │                        │ Next.js + Socket.IO                  │
└──────────────────┘                        └───────────────┬───────────┬──────────┘
                                                            │           │
                                             Redis pub/sub  │           │ Prisma + SQL
                                                            ▼           ▼
                                                     ┌───────────┐ ┌───────────────┐
                                                     │  Redis    │ │ TimescaleDB   │
                                                     │ realtime  │ │ history       │
                                                     └─────┬─────┘ └───────┬───────┘
                                                           │               │
                                                           └───────┬───────┘
                                                                   ▼
                                                        ┌──────────────────┐
                                                        │ Browser           │
                                                        │ React + Zustand  │
                                                        │ dashboard/replay │
                                                        └──────────────────┘
```

The Docker Compose stack contains three services:

| Service | Role | Ports |
| --- | --- | --- |
| `web` | Next.js application, custom HTTP server, UDP listener, and Socket.IO server | `3333/tcp`, `20777/udp` |
| `timescaledb` | PostgreSQL 16 with TimescaleDB for relational and time-series history | `5432/tcp` |
| `redis` | Pub/sub broker between telemetry ingestion and browser clients | `6379/tcp` |

High-frequency motion, telemetry, lap, car-status, and damage samples are stored in TimescaleDB hypertables. Sessions, participants, events, classifications, driver profiles, seasons, and race links use Prisma-managed relational tables. Redis carries the live stream from the UDP ingestion path to Socket.IO clients.

## UI routes

| Route | Purpose |
| --- | --- |
| `/` | Live race theater with Race, Analysis, and Setup views |
| `/sessions` | Recorded-session archive and replay entry points |
| `/sessions/[id]` | Map-dominant session replay with timeline and driver assignments |
| `/players` | Human driver profiles and archive identity management |
| `/players/[id]` | Career record, race history, and circuit benchmarks |
| `/players/h2h` | Head-to-head comparison for two driver profiles |
| `/seasons` | Championship collections and active/archived seasons |
| `/seasons/[id]` | Season standings, linked rounds, and replay links |
| `/standings` | Filterable all-time or season-scoped championship order |

## Prerequisites

For the Docker workflow:

- Docker Engine or Docker Desktop with Docker Compose
- A machine that can receive UDP traffic from the game
- An EA SPORTS F1 25 installation with UDP telemetry enabled

For local development without the `web` container:

- Node.js 20 or newer
- npm
- Docker Compose for TimescaleDB and Redis, or equivalent local PostgreSQL 16 + TimescaleDB and Redis services

The application is designed for a private/self-hosted environment. Do not expose the database, Redis, or UDP listener to the public internet without adding your own network controls.

## Quick start with Docker

From the repository root:

```bash
docker compose up --build
```

The first database startup applies the SQL files mounted by `docker-compose.yml`, including the TimescaleDB hypertable setup. Open the dashboard at <http://localhost:3333>.

To stop the stack:

```bash
docker compose down
```

To remove the local database volume as well (destructive to captured history):

```bash
docker compose down -v
```

The Compose file uses development credentials for the local stack. Treat them as local-only defaults and replace them before using the deployment outside a trusted machine.

## Configure F1 25 telemetry

In the game, open **Settings → Telemetry → UDP** and use values that point to the machine running the `web` service:

| Game setting | Value |
| --- | --- |
| UDP telemetry | On |
| UDP broadcast mode | Off when direct targeting is available |
| UDP IP address | The server machine’s LAN address, or `127.0.0.1` when game and app share a machine |
| UDP port | `20777` |
| UDP send rate | `20Hz` or `60Hz` |
| UDP format | `2025` or `2026` |

The server listens on `UDP_HOST` and `UDP_PORT`; Docker binds UDP port `20777` from the host into the `web` container. If the game runs on another machine, allow inbound UDP `20777` through the server machine’s firewall and use its LAN address in the game.

## Local development

Use Docker for only the infrastructure services, then run the custom server with `ts-node`:

```bash
cp .env.example .env
# For a host process, change the Docker service names in .env:
# DATABASE_URL=postgresql://postgres:<local-password>@localhost:5432/f1telemetry
# REDIS_URL=redis://localhost:6379

npm install
npx prisma generate
docker compose up -d timescaledb redis
npx prisma db push
npm run dev
```

Open <http://localhost:3333>. The custom server is required: it starts Next.js, attaches Socket.IO, and binds the UDP listener in one process. Do not replace `npm run dev` with `next dev` when testing live telemetry.

Useful package scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the custom development server |
| `npm run build` | Create the production Next.js build |
| `npm run start` | Start the compiled production server from `dist/server.js` |
| `npm run test` | Run telemetry parser format tests |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:push` | Synchronize Prisma schema in development |
| `npm run db:migrate` | Apply committed Prisma migrations |

## Configuration

Copy `.env.example` to `.env` for local development. Do not commit `.env` or real credentials.

| Variable | Default in the repository | Description |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://postgres:postgres@timescaledb:5432/f1telemetry` | PostgreSQL/TimescaleDB connection string. Use `localhost` when the app runs on the host. |
| `REDIS_URL` | `redis://redis:6379` | Redis connection string. Use `localhost` when the app runs on the host. |
| `UDP_HOST` | `192.168.2.90` in `.env.example`; server fallback `0.0.0.0` | Local interface used by the UDP listener. Set it to `0.0.0.0` in a container or to a local host interface. |
| `UDP_PORT` | `20777` | UDP port receiving game telemetry. Keep it aligned with the game setting and Compose mapping. |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:3333` | Browser URL used for the Socket.IO connection. |
| `PORT` | `3333` in the custom server fallback | HTTP port for the Next.js application. |
| `NODE_ENV` | Development unless overridden | Runtime mode; Docker sets production in the final image. |

The sample connection strings intentionally use placeholder local development credentials. Use a secret manager or environment injection for any shared or deployed environment.

## Validation

Run the project’s parser tests and production build before submitting a change:

```bash
npm run test
git diff --check
npm run build
```

The parser tests cover packet sizes, format detection, car-slot counts, and format-specific fields for both 2025 and 2026 layouts. No lint script is currently defined in `package.json`.

## Project structure

```text
.
├── server.ts                 # Custom HTTP + Socket.IO + UDP entry point
├── docker-compose.yml        # web, TimescaleDB, and Redis services
├── Dockerfile                # Multi-stage Node 20 production image
├── prisma/
│   ├── schema.prisma         # Relational models
│   └── migrations/           # Database and hypertable SQL
├── sample_telemetry_data/    # Packet-format reference material
├── src/
│   ├── app/                  # Next.js routes and API handlers
│   ├── components/           # Dashboard, map, replay, and shared UI
│   ├── hooks/                # Browser resource and Socket.IO hooks
│   ├── lib/                  # Presentation helpers, constants, and database client
│   └── server/               # UDP parsers, realtime relay, and database writers
├── tests/                    # Telemetry-format parser tests
└── docs/screenshots/         # Repository-friendly UI evidence
```

## Contributing and limitations

Contributions are welcome when they keep the telemetry pipeline and UI behavior understandable. For a focused change:

1. Create a branch from `main`.
2. Keep packet-format or schema changes paired with the relevant reference material and tests.
3. Run `npm run test`, `npm run build`, and `git diff --check`.
4. Describe telemetry assumptions, migration needs, and validation in the pull request. Include screenshots for visual changes.

Current limitations include:

- The app expects the supported F1 25 UDP packet formats and does not claim compatibility with other game versions.
- Replay quality depends on the samples persisted during the original session; the replay API currently exposes motion and lap timing rather than every live telemetry field.
- This repository does not provide a public hosted service, authentication layer, or production secret-management policy.
- Database retention, firewalling, backups, and operational monitoring remain deployment responsibilities.

## License

No license file is currently included. Until a license is added, treat the repository as source-available and ask the maintainers before redistributing it.
