# CarSetupComparison

**File**: `CarSetupComparison.tsx`  
**Type**: Client Component  
**Category**: Live Dashboard — Setup tab

---

## What It Does

Renders a **side-by-side car setup comparison** between any two drivers currently in the session. For each of 21 setup parameters, it shows:

- Parameter name + both drivers' values (with units)
- Two small animated bar charts positioned relative to the parameter's min/max range

The user picks Driver 1 and Driver 2 from dropdown selectors populated from the current `drivers` list.

---

## Store Dependencies

| Slice | Used for |
|---|---|
| `drivers` | Populate the two driver selector dropdowns |
| `carSetups` | Setup values per car index |

---

## Used On

| Page / Tab |
|---|
| `/` — Setup tab (centre column) |

---

## Child Components

### `SetupBar` (inline)
```tsx
function SetupBar({ value, min, max, color }: ...) {
  const pct = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  // animated bar showing where the value falls in the min–max range
}
```
A 3px-tall animated bar that fills proportionally within the parameter's valid range. Each driver gets their own bar in a 2-col grid.

---

## Key Logic

### Driver selection state
```ts
const [car1Idx, setCar1Idx] = useState(0);
const [car2Idx, setCar2Idx] = useState(1);
```
Defaults to car indices 0 and 1. User can change via `<select>` dropdowns.

### Setup lookup
```ts
const setup1 = carSetups.find((s) => s.i === car1Idx);
const setup2 = carSetups.find((s) => s.i === car2Idx);
```
If no setup data received yet, shows "WAITING FOR SETUP DATA".

### Value formatting
```ts
const formatted = typeof v === 'number'
  ? (Number.isInteger(v) ? v : v.toFixed(2))
  : v;
```

---

## Setup Parameters (21 total)

Front Wing, Rear Wing, Diff On/Off Throttle, Front/Rear Camber, Front/Rear Toe, Front/Rear Suspension, Front/Rear Anti-Roll Bar, Front/Rear Ride Height, Brake Pressure, Brake Bias, RL/RR/FL/FR Tyre Pressure, Fuel Load.

---

## Related Components

- [`TelemetryPanel`](TelemetryPanel.md) — shown alongside in the Setup tab right column
- [`TyreStrategy`](TyreStrategy.md) — shown alongside in the Setup tab right column
