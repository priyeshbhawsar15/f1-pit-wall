# StandingsHighlights

**File**: `StandingsHighlights.tsx`  
**Type**: Client Component  
**Category**: Standings / Seasons pages (shared)

---

## What It Does

Renders **four highlight stat cards** above the standings table — one per "most impressive" metric derived from the same standings data:

| Card | Metric | Colour |
|---|---|---|
| Most Wins | Player with highest `stats.wins` | Gold |
| Most Overtakes | Player with highest `stats.overtakes` | Green |
| Most Collisions | Player with highest `stats.collisions` | Red |
| Fastest Lap | Player with lowest non-null `stats.bestLapMs` | Purple |

Returns `null` if `standings` is empty.

---

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `standings` | `StandingsPlayer[]` | Yes | Same array passed to `StandingsTable` |

---

## Used On

| Page |
|---|
| `/standings` — rendered above `StandingsTable` |
| `/seasons/[id]` — rendered above the season standings table |

---

## Child Components

None.

---

## Key Logic

### Leader derivation (each sorted independently)
```ts
const mostWins      = [...standings].sort((a, b) => b.stats.wins - a.stats.wins)[0];
const mostOvertakes = [...standings].sort((a, b) => b.stats.overtakes - a.stats.overtakes)[0];
const mostCollisions= [...standings].sort((a, b) => b.stats.collisions - a.stats.collisions)[0];
const fastestLap    = [...standings]
  .filter((s) => s.stats.bestLapMs)
  .sort((a, b) => (a.stats.bestLapMs || 0) - (b.stats.bestLapMs || 0))[0];
```

---

## Related Components

- [`StandingsTable`](StandingsTable.md) — always rendered below, shares the same `standings` prop
