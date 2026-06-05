# Lib — `src/lib/`

Shared utilities, lookup constants, and infrastructure singletons used by both the client and server.

---

## `constants.ts`

The central lookup dictionary for everything that maps a numeric game ID to a human-readable value or visual attribute.

### Format Detection (2025 vs 2026)

```ts
export function isFormat2026(
  packetFormat: number,
  gameYear: number,
  bufLen?: number,
  expected2025Size?: number
): boolean
```
Returns `true` if `packetFormat === 2026` OR `gameYear === 26`, with an optional fallback: if `bufLen !== expected2025Size`. Called by every parser and `udp-listener.ts`. No manual config needed.

```ts
export function maxCarsForFormat(packetFormat: number, gameYear: number): number
// Returns 24 for 2026, 22 for 2025
```

### Bytes-per-Car Constants

| Constant | Value | Used by |
|---|---|---|
| `BYTES_PER_CAR_MOTION_2025` | 60 | `motion.ts` |
| `BYTES_PER_CAR_MOTION_2026` | 54 | `motion.ts` |
| `BYTES_PER_CAR_PARTICIPANTS_2025` | 57 | `participants.ts` |
| `BYTES_PER_CAR_PARTICIPANTS_2026` | 60 | `participants.ts` |
| `BYTES_PER_CAR_TELEMETRY_2025` | 60 | `car-telemetry.ts` |
| `BYTES_PER_CAR_TELEMETRY_2026` | 59 | `car-telemetry.ts` |
| `BYTES_PER_CAR_STATUS_2025` | 55 | `car-status.ts` |
| `BYTES_PER_CAR_STATUS_2026` | 59 | `car-status.ts` |

### Lookup Maps

| Export | Key | Value | Used by |
|---|---|---|---|
| `TRACK_NAMES` | trackId `number` | Track name string | `SessionInfo`, `RaceResultCard` |
| `TRACK_FLAGS` | trackId `number` | Flag emoji | `RaceResultCard`, `AppHeader` |
| `TEAM_NAMES` | teamId `number` | Team name | `Leaderboard`, `HumanPlayersOverview` |
| `TEAM_COLORS` | teamId `number` | Hex colour string | All components with team branding |
| `SESSION_TYPES` | sessionType `number` | Label string | `SessionInfo`, `RaceResultCard` |
| `WEATHER_TYPES` | weather `number` | Label string | `SessionInfo`, `/sessions` page |
| `VISUAL_TYRE_COMPOUNDS` | compound ID | `{ name, color }` | `Leaderboard`, `TyreStrategy`, `HumanPlayersOverview` |
| `TYRE_COMPOUNDS` | compound ID | Full compound name | — |
| `ERS_DEPLOY_MODES` | mode `number` | Label string | `ERSMonitor` |
| `EVENT_CODES` | 4-char code | Readable label | `EventFeed`, `RaceMomentsTimeline` |
| `DRIVER_FLAGS` | driver name | Flag image URL | `Leaderboard`, `TelemetryPanel`, `HumanPlayersOverview` |
| `RESULT_STATUS` | status `number` | Label (DNF, DSQ…) | `RaceResultCard` |
| `PacketId` | enum | Packet type IDs 0–22 | `udp-listener.ts` |

### 2026 Team IDs

Standard 2026 team IDs are offset `+256` from 2025 equivalents:
- `256–265`: Standard teams (256=Mercedes … 265=Audi)
- `476–485`: My Team equivalents

All added to `TEAM_NAMES`, `TEAM_COLORS`, and `DRIVER_FLAGS`.

---

## `team-logos.ts`

```ts
export const TEAM_LOGOS: Record<number, string>
```

Maps team ID → logo CDN URL. Covers both 2025 IDs (`0–9`, `220–229`) and 2026 IDs (`256–265`, `476–485`).

Used by: `Leaderboard`, `TelemetryPanel`, `HumanPlayersOverview`.

---

## `utils.ts`

| Function | Signature | Description |
|---|---|---|
| `formatLapTime(ms)` | `number → string` | `82431` → `"1:22.431"`. Returns `"--:--.---"` for `0`. |
| `formatGap(ms)` | `number → string` | `1234` → `"+1.234"`. Returns `"---"` for `0`. |
| `formatDelta(ms)` | `number → string` | `±ms` → `"+1.234"` / `"-1.234"`. Returns `"---.---"` for `0`. |
| `cn(...inputs)` | `ClassValue[] → string` | `clsx` + `tailwind-merge` helper for conditional class composition. |

---

## `db.ts`

Exports a singleton `PrismaClient` instance:

```ts
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
```

Prevents multiple Prisma instances in Next.js development hot-reload. Also patches `BigInt.prototype.toJSON` globally so `sessionUID` (a `bigint`) serialises correctly in `JSON.stringify`.

Used by: all API routes (`src/app/api/**`) and `src/server/db/writers.ts`.
