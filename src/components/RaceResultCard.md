# RaceResultCard

**File**: `RaceResultCard.tsx`  
**Type**: Client Component  
**Category**: Shared — History & Seasons pages

---

## What It Does

A **reusable race result row card** used in both the session history list (`/sessions`) and the season race calendar (`/seasons/[id]`). Shows:

- Track flag emoji + track name + session type label
- Optional date/time or custom `details` slot
- List of player result chips: avatar, name, points, finishing position (P1/P2/P3 gold/silver/bronze)
- Optional `badge` slot to override the track flag (e.g. round number)
- Optional `trailing` slot (e.g. `→` chevron on clickable cards)
- Optional `action` slot (e.g. delete button on hover in `/sessions`)

When `href` is provided, the entire card becomes clickable and navigates to that URL.

---

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `trackId` | `number` | Yes | Resolved to flag emoji + name via `TRACK_FLAGS` / `TRACK_NAMES` |
| `sessionType` | `number` | Yes | Resolved to label via `SESSION_TYPES` |
| `createdAt` | `string` | Yes | ISO date string — shown if no `details` slot provided |
| `players` | `RaceResultCardPlayer[]` | Yes | List of human players with position/points |
| `details` | `ReactNode` | No | Custom content below track name (replaces date) |
| `badge` | `ReactNode` | No | Replaces the track flag in the left icon box |
| `trailing` | `ReactNode` | No | Appended after the main content (e.g. chevron) |
| `action` | `ReactNode` | No | Appended last — typically a delete/edit button |
| `href` | `string` | No | Makes the card a router-push link |
| `emptyPlayersText` | `string` | No | Shown when `players` is empty (default: "No linked players") |
| `className` | `string` | No | Extra Tailwind classes |

---

## `RaceResultCardPlayer` Interface

```ts
interface RaceResultCardPlayer {
  id: string;
  name: string;
  color: string;        // used for avatar background
  avatarUrl?: string | null;
  position: number | null;
  points: number;
  resultStatus?: number | null;  // used as fallback when position is null
}
```

---

## Used On

| Page | Usage |
|---|---|
| `/sessions` | Each row in the session list — with delete action and `→` trailing |
| `/seasons/[id]` | Each race in the season calendar |

---

## Child Components

None.

---

## Key Logic

### Position colour
```ts
const positionColor = position === 1 ? '#FFD700' : position === 2 ? '#C0C0C0' : position === 3 ? '#CD7F32' : undefined;
```

### Status label fallback
```ts
const statusLabel = player.position
  ? `P${player.position}`
  : (player.resultStatus ? RESULT_STATUS[player.resultStatus] || '—' : '—');
```
`RESULT_STATUS` maps numeric codes to labels like `DNF`, `DSQ`, `RET`.

### Navigation
```ts
const clickable = Boolean(href);
onClick={clickable ? () => router.push(href!) : undefined}
```

---

## Related Components

- [`StandingsTable`](StandingsTable.md) — shows aggregated career standings, not per-race results
- [`RaceMomentsTimeline`](RaceMomentsTimeline.md) — shown below on the session detail page
