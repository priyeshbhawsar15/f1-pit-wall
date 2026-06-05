# ERSMonitor

**File**: `ERSMonitor.tsx`  
**Type**: Client Component  
**Category**: Live Dashboard — Live tab (selection-gated)

---

## What It Does

Shows **detailed ERS (Energy Recovery System) data** for the currently selected car. Only renders when `selectedCarIndex !== null`.

Displays:
- Energy store bar (0 → 4 MJ, colour: green > 50%, yellow 20–50%, red < 20%)
- Energy store value in MJ
- Deploy mode badge (None / Medium / Hotlap / Overtake / Boost) with distinct colour per mode
- Power grid: ICE output (kW), MGU-K output (kW), MGU-K harvest (MJ), MGU-H harvest (MJ)
- Energy deployed this lap (MJ)
- **2026 only**: Harvest limit bar showing % of the per-lap harvest limit already consumed

---

## Store Dependencies

| Slice | Used for |
|---|---|
| `selectedCarIndex` | Which car to show — null guard |
| `carStatus` | `ersStore`, `ersMode`, `iceW`, `mgukW`, `ersK`, `ersH`, `ersDeployed`, `ersLimit` (2026) |

---

## Used On

| Page / Tab | Context |
|---|---|
| `/` — Live tab | Middle panel in the 3-col selected-car grid |

---

## Child Components

None.

---

## Key Logic

### Energy store percentage
```ts
const storePct = status ? Math.min((status.ersStore / 4_000_000) * 100, 100) : 0;
```
Max ERS store is 4 MJ (4,000,000 Joules) per F1 regulations.

### Bar colour threshold
```ts
const barColor = storePct > 50 ? 'var(--success)' : storePct > 20 ? 'var(--warning)' : 'var(--m-red)';
```

### Deploy mode lookup
```ts
const deployMode = status ? (ERS_DEPLOY_MODES[status.ersMode] || 'Unknown') : '---';
// ERS_DEPLOY_MODES: { 0: 'None', 1: 'Medium', 2: 'Hotlap', 3: 'Overtake' }
```
Mode name is also used to look up `modeColor`.

### 2026 harvest limit bar
```ts
const harvestLimitPct = status && status.ersLimit > 0
  ? Math.min((status.ersK + status.ersH) / status.ersLimit * 100, 100)
  : null;
```
Only shown when `status.ersLimit > 0` (i.e., 2026 format is active and data is populated).

---

## Constants Used

- `ERS_DEPLOY_MODES` — from `constants.ts`, maps mode integer to label string

---

## Related Components

- [`TelemetryPanel`](TelemetryPanel.md) — companion panel (same selection gate)
- [`TyreStrategy`](TyreStrategy.md) — companion panel (same selection gate)
- [`HumanPlayersOverview`](HumanPlayersOverview.md) — shows a simpler ERS % in the summary card
