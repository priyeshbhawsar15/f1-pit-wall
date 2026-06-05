# PositionChart

**File**: `PositionChart.tsx`  
**Type**: Client Component  
**Category**: Live Dashboard — Charts tab

---

## What It Does

Renders a **Recharts `LineChart`** showing race position over time (per lap) for all human players. The Y-axis is inverted so P1 is at the top. Same driver filtering and selection-dimming logic as [`LapTimeChart`](LapTimeChart.md).

---

## Store Dependencies

| Slice | Used for |
|---|---|
| `positionHistory` | Array of `{ carIndex, lap, position }` — one entry per lap per car |
| `drivers` | Filter for human drivers, name, team colour |
| `lapData` | Current race position (for sorting `activeDrivers`) |
| `selectedCarIndex` | Dims non-selected lines |

---

## Used On

| Page / Tab |
|---|
| `/` — Charts tab (right of `LapTimeChart` in 2-col grid) |

---

## Child Components

- **`CustomTooltip`** (inline) — shows each driver's position sorted by P1 first for the hovered lap

---

## Key Logic

### Inverted Y-axis
```tsx
<YAxis
  reversed
  domain={[1, 'dataMax']}
  tickFormatter={(v) => `P${v}`}
/>
```
P1 sits at the top of the chart.

### Chart data pivot (identical to `LapTimeChart`)
```ts
row[`car_${entry.carIndex}`] = entry.position;
```

### Dimming logic (identical to `LapTimeChart`)
```ts
opacity={!hasSelectedHumanDriver || d.i === selectedCarIndex ? 1 : 0.45}
```

---

## Related Components

- [`LapTimeChart`](LapTimeChart.md) — companion chart on the same tab with identical filtering/dimming
