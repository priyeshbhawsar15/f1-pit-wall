# Leaderboard

**File**: `Leaderboard.tsx`  
**Type**: Client Component  
**Category**: Live Dashboard — Live / Charts / Setup tabs

---

## What It Does

Displays a **real-time sorted race order** for all active cars. Each row shows:

- Team colour stripe
- Race position badge (P1/P2/P3 get gold/silver/bronze styling)
- Driver nationality flag + name + HUMAN badge (if human) + PIT badge (if in pit lane)
- Team logo + team name
- Visual tyre compound colour dot + tyre age (laps)
- Gap to car ahead (`dFront`) or "INTERVAL" for leader
- Last lap time (flashes green on new fastest lap)

Clicking a row **selects** that car (`setSelectedCarIndex`). Clicking again **deselects** it. Selection drives [`TelemetryPanel`](TelemetryPanel.md), [`ERSMonitor`](ERSMonitor.md), and [`TyreStrategy`](TyreStrategy.md).

---

## Store Dependencies

| Slice | Used for |
|---|---|
| `lapData` | Positions, gaps, last lap times, pit status — sorted to derive race order |
| `drivers` | Name, team ID, AI flag per car index |
| `carStatus` | Visual tyre compound + tyre age |
| `selectedCarIndex` | Highlights the selected row |
| `setSelectedCarIndex` | Toggle selection on click |

---

## Used On

| Page / Context |
|---|
| `/` — Live tab (full width left column) |
| `/` — Charts tab (narrow left column) |
| `/` — Setup tab (narrow left column) |

---

## Child Components

None. All rendering is inline with Framer Motion `AnimatePresence` for animated position changes.

---

## Key Logic

### Race order sorting
```ts
const sorted = [...lapData]
  .filter((l) => l.result >= 2)   // only active / racing cars
  .sort((a, b) => a.pos - b.pos);
```
`result >= 2` filters out invalid / retired entries.

### Battle detector
Highlights human-vs-human battles in blue when two humans are within 1 second:
```ts
if (car.dFront > 0 && car.dFront < 1000) {
  const carInFront = sorted.find((c) => c.pos === car.pos - 1);
  if (carInFront && humanCarIndices.has(carInFront.i)) {
    battlingHumans.add(car.i);
    battlingHumans.add(carInFront.i);
  }
}
```

### Animated last lap time
```tsx
<motion.div
  key={car.lastLap}         // re-triggers on new lap
  initial={{ color: '#0fa336' }}
  animate={{ color: 'var(--foreground)' }}
  transition={{ duration: 1.5 }}
>
```
Flashes green for 1.5 s after a new lap is registered.

### Toggle selection
```ts
onClick={() => setSelectedCarIndex(isSelected ? null : car.i)}
```

---

## Related Components

- [`HumanPlayersOverview`](HumanPlayersOverview.md) — shows a focused view for human players only
- [`TelemetryPanel`](TelemetryPanel.md) — renders when a car is selected
- [`ERSMonitor`](ERSMonitor.md) — renders when a car is selected
- [`TyreStrategy`](TyreStrategy.md) — renders when a car is selected
