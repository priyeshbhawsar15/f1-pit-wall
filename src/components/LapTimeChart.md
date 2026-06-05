# LapTimeChart

**File**: `LapTimeChart.tsx`  
**Type**: Client Component  
**Category**: Live Dashboard — Charts tab

---

## What It Does

Renders a **Recharts `LineChart`** showing lap-by-lap times for all human players. One line per human driver, coloured by team colour. Restricted to human drivers only (`driver.ai === 0`) and capped at the top 2 by race position.

When a human driver's car is selected (`selectedCarIndex`), all other lines dim to 45% opacity. The selected line gets a slightly thicker stroke.

---

## Store Dependencies

| Slice | Used for |
|---|---|
| `lapHistory` | Array of `{ carIndex, lap, lapTimeMs, s1Ms, s2Ms, s3Ms }` entries — one per completed lap |
| `drivers` | Filter for human drivers, name, team colour |
| `lapData` | Current race position (for sorting `activeDrivers`) |
| `selectedCarIndex` | Dims non-selected lines |

---

## Used On

| Page / Tab |
|---|
| `/` — Charts tab (left of `PositionChart` in 2-col grid) |

---

## Child Components

- **`CustomTooltip`** (inline) — shows driver name + formatted lap time for each line on hover

---

## Key Logic

### Chart data pivot (`useMemo`)
```ts
const lapMap = new Map<number, Record<string, number>>();
for (const entry of lapHistory) {
  lapMap.get(entry.lap)![`car_${entry.carIndex}`] = entry.lapTimeMs;
}
// Result: [{ lap: 1, car_0: 82430, car_3: 83001 }, ...]
```
Pivots the flat `lapHistory` array into a per-lap object that Recharts can consume.

### Active driver filter
```ts
const activeDrivers = drivers
  .filter((d) => d.ai === 0 && seen.has(d.i))
  .sort(byCurrentPosition)
  .slice(0, 2);
```
Only shows drivers who have at least one lap history entry.

### Dimming non-selected lines
```ts
opacity={!hasSelectedHumanDriver || d.i === selectedCarIndex ? 1 : 0.45}
```
`hasSelectedHumanDriver` is `true` only when the selected car is one of the human drivers being charted.

### Y-axis formatter
```ts
tickFormatter={(v) => formatLapTime(v)}
domain={['dataMin - 2000', 'dataMax + 2000']}
```
Formats raw milliseconds into `m:ss.mmm` strings and adds a 2-second padding above/below.

---

## Related Components

- [`PositionChart`](PositionChart.md) — shows race positions on the same tab, with identical filtering logic
