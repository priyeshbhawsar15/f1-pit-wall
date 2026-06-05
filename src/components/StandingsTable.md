# StandingsTable

**File**: `StandingsTable.tsx`  
**Type**: Client Component  
**Category**: Standings / Seasons pages (shared)

---

## What It Does

Renders a **scrollable championship standings table** with full career stats per player. Each row is clickable and navigates to `/players/{id}`. The table adapts its header/empty text via props so it can be used in both the global standings view and a per-season view.

Columns: `#` · Driver · Races · PTS · Wins · Podiums · DNFs · Overtakes · Collisions · FL · Pens · Avg Pos · Best Lap

---

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `standings` | `StandingsPlayer[]` | Yes | Array of players with aggregated stats |
| `headerTitle` | `string` | No | Card title (default: `"Driver Championship"`) |
| `emptyTitle` | `string` | No | Title shown when no standings data |
| `emptyMessage` | `string` | No | Subtitle shown when no standings data |

---

## `StandingsPlayer` Interface

```ts
interface StandingsPlayer {
  id: string;
  name: string;
  color: string;
  avatarUrl: string | null;
  stats: {
    races, points, wins, podiums, dnfs, collisions, overtakes,
    fastestLaps, penalties, penaltySeconds, pitStops,
    avgPosition: number | null,
    bestLapMs: number | null,
  };
}
```
Exported so the API response type can be validated against it.

---

## Used On

| Page | Usage |
|---|---|
| `/standings` | Global driver championship table |
| `/seasons/[id]` | Season-specific standings with `headerTitle="Season Standings"` |

---

## Child Components

- [`StandingsHighlights`](StandingsHighlights.md) — rendered above the table on both pages

---

## Key Logic

### Position colour
```ts
const positionColor = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : undefined;
```
Applied to the rank number in column 1.

### Row click navigation
```ts
onClick={() => { window.location.href = `/players/${player.id}`; }}
```
Full page navigation to the player profile.

### Best lap formatting
```ts
player.stats.bestLapMs ? formatLapTime(player.stats.bestLapMs) : '—'
```

### `STANDINGS_COLUMNS` (exported constant)
```ts
export const STANDINGS_COLUMNS = [
  { key: 'points',    label: 'PTS' },
  { key: 'wins',      label: 'Wins',      color: '#FFD700' },
  { key: 'podiums',   label: 'Podiums' },
  { key: 'dnfs',      label: 'DNFs',      color: 'var(--f1-red)' },
  { key: 'overtakes', label: 'Overtakes', color: 'var(--green)' },
  { key: 'collisions',label: 'Collisions',color: 'var(--f1-red)' },
  { key: 'fastestLaps',label: 'FL',       color: 'var(--purple)' },
  { key: 'penalties', label: 'Pens',      color: 'var(--yellow)' },
  { key: 'avgPosition',label: 'Avg Pos' },
];
```
Exported so other components can iterate the same column definition.

---

## Related Components

- [`StandingsHighlights`](StandingsHighlights.md) — highlight stat cards shown above the table
- [`RaceResultCard`](RaceResultCard.md) — shows individual race results (different view)
