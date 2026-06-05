# TelemetryPanel

**File**: `TelemetryPanel.tsx`  
**Type**: Client Component  
**Category**: Live Dashboard — Live tab / Setup tab (selection-gated)

---

## What It Does

Shows **real-time telemetry data for the currently selected car**. Only renders when `selectedCarIndex !== null`.

Displays:
- Driver name + nationality flag + team logo in header (coloured with team colour)
- Large speed readout (km/h) + gear + DRS badge (F1 2025) or AA/OT badges (F1 2026)
- RPM readout
- Throttle and brake animated progress bars (green / red)
- 4-corner tyre surface temperature grid (colour: green→red by temperature)
- Engine temperature

---

## Store Dependencies

| Slice | Used for |
|---|---|
| `selectedCarIndex` | Which car to show — returns `null` guard |
| `telemetry` | Speed, gear, throttle, brake, RPM, engine temp, tyre surface/inner/pressure temps |
| `drivers` | Driver name, team ID for branding |
| `session` | `is2026` flag to switch DRS → AA/OT badges |
| `carTelemetry2` | 2026 Active Aero mode (`aeroAvail`, `aeroMode`) and Overtake system (`otAvail`, `otActive`, `otDist`) |

---

## Used On

| Page / Tab | Context |
|---|---|
| `/` — Live tab | Shown in 3-col grid when a car is selected |
| `/` — Setup tab | Shown in right panel when a car is selected |

---

## Child Components

None.

---

## Key Logic

### Gear label normalisation
```ts
const gearLabel = car
  ? car.gear === -1 ? 'R' : car.gear === 0 ? 'N' : String(car.gear)
  : '-';
```

### Throttle / brake bar widths
```ts
const throttlePct = Math.min((car?.thr ?? 0) * 100, 100);
const brakePct    = Math.min((car?.brk ?? 0) * 100, 100);
```
Raw values from the game are `0.0–1.0` floats.

### Tyre temperature heat map
```ts
const hue = Math.max(0, 120 - temp);
// hue 120 = green (cool), hue 0 = red (hot)
```
Maps temperature value to HSL hue so tiles shift green → yellow → red.

### 2026 DRS → AA/OT badge switch
```tsx
{!is2026 ? (
  <span>DRS</span>
) : (
  <>
    <span>AA {aero?.aeroMode === 1 ? 'STR' : 'CRN'}</span>
    <span>{aero?.otActive ? 'OT ON' : aero?.otAvail ? 'OT RDY' : `OT ${aero?.otDist ?? '--'}m`}</span>
  </>
)}
```

### Tyre corner index mapping
The `tSurf` array from the server is ordered `[RL, RR, FL, FR]` but displayed as `[FL, FR, RL, RR]`:
```ts
const surfIdx = [2, 3, 0, 1][idx]; // idx 0=FL, 1=FR, 2=RL, 3=RR
```

---

## Related Components

- [`ERSMonitor`](ERSMonitor.md) — ERS companion panel (same selection gate)
- [`TyreStrategy`](TyreStrategy.md) — tyre + fuel companion panel (same selection gate)
- [`Leaderboard`](Leaderboard.md) — sets `selectedCarIndex`
