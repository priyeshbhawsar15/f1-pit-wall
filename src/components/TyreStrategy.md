# TyreStrategy

**File**: `TyreStrategy.tsx`  
**Type**: Client Component  
**Category**: Live Dashboard — Live tab / Setup tab (selection-gated)

---

## What It Does

Shows **detailed tyre and fuel data** for the currently selected car. Only renders when `selectedCarIndex !== null`.

Displays:
- Tyre compound badge (animated letter, colour-coded per compound)
- Compound name + age in laps
- 4-corner wear grid (RL / RR / FL / FR) with:
  - Wear % coloured green → yellow → red
  - Animated wear bar
  - Surface temp / inner temp / pressure per corner
- Fuel load in kg and estimated fuel laps remaining (red when < 1 lap)

---

## Store Dependencies

| Slice | Used for |
|---|---|
| `selectedCarIndex` | Which car to show — null guard |
| `carStatus` | Visual tyre compound, tyre age, fuel kg, fuel laps |
| `carDamage` | Per-corner tyre wear percentages |
| `telemetry` | Per-corner surface temp, inner temp, pressure |

---

## Used On

| Page / Tab | Context |
|---|---|
| `/` — Live tab | Right panel in the 3-col selected-car grid |
| `/` — Setup tab | Right panel when a car is selected |

---

## Child Components

None.

---

## Key Logic

### Corner order
```ts
const tyreLabels = ['RL', 'RR', 'FL', 'FR'];
// damage.tyreWear[0] = RL, [1] = RR, [2] = FL, [3] = FR
```

### Wear colour thresholds
```ts
const wearColor = wear < 30 ? 'var(--success)' : wear < 60 ? 'var(--warning)' : 'var(--m-red)';
```

### Fuel warning
```tsx
<div className={status && status.fuelLaps < 1 ? 'text-[var(--m-red)]' : ''}>
  {status?.fuelLaps ?? '---'}
</div>
```

### Compound lookup
```ts
const tyreInfo = status ? VISUAL_TYRE_COMPOUNDS[status.tyre] : null;
// VISUAL_TYRE_COMPOUNDS: { 16: { name: 'Soft', color: '#e8002d' }, ... }
```

---

## Constants Used

- `VISUAL_TYRE_COMPOUNDS` — maps compound ID (`7`, `8`, `16`, `17`, `18`) to `{ name, color }`

---

## Related Components

- [`TelemetryPanel`](TelemetryPanel.md) — shows tyre surface temps independently
- [`ERSMonitor`](ERSMonitor.md) — companion ERS panel
- [`HumanPlayersOverview`](HumanPlayersOverview.md) — shows compound + age in summary card
