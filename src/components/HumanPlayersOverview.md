# HumanPlayersOverview

**File**: `HumanPlayersOverview.tsx`  
**Type**: Client Component  
**Category**: Live Dashboard — Live tab

---

## What It Does

Displays a focused **summary card for up to 2 human players** (filtered by `driver.ai === 0`). Each player card shows:

- Race position badge · nationality flag · driver name · team logo + name
- SELECTED badge when the player's car is the active `selectedCarIndex`
- Stats grid: Gap, Lap, Last Lap, Tyres (compound + age), ERS %, Fuel (laps), Penalties, State (RUN / PIT / Xs PEN)
- For **2026 format** (`session.is2026 === true`): adds Overtake system status and Active Aero mode to the grid
- If player telemetry is **restricted** (`driver.tel === 0`): ERS and Fuel show `RESTRICTED` instead of values
- Footer hint telling the user to select a leaderboard row for detailed panels

Players are sorted by race position (ascending). The list is capped at 2 (`slice(0, 2)`).

---

## Store Dependencies

| Slice | Used for |
|---|---|
| `drivers` | Filter for humans (`ai === 0`), name, team, `tel` flag |
| `lapData` | Position, lap number, last lap, gap, pit flag, penalties |
| `carStatus` | Tyre compound/age, ERS store, fuel, fuel laps |
| `carTelemetry2` | 2026 Active Aero mode + Overtake system availability; aero mode remains valid when activation availability is `0` |
| `session` | `is2026` flag to branch 2026-specific stat rows |
| `selectedCarIndex` | Shows SELECTED badge on the matching card |

---

## Used On

| Page / Context |
|---|
| `/` — Live tab (right column, above EventFeed) |

---

## Child Components

None. Inline JSX with Framer Motion animations.

---

## Key Logic

### Human player filtering and data assembly (`useMemo`)
```ts
const humanPlayers = useMemo(() => {
  return drivers
    .filter((driver) => driver.ai === 0)
    .map((driver) => {
      const lap    = lapData.find((entry) => entry.i === driver.i);
      const status = carStatus.find((entry) => entry.i === driver.i);
      const aero   = carTelemetry2.find((entry) => entry.i === driver.i);
      const tyreInfo  = status ? VISUAL_TYRE_COMPOUNDS[status.tyre] : null;
      const restricted = driver.tel === 0;
      const ersPct = (!restricted && status) ? Math.min((status.ersStore / 4_000_000) * 100, 100) : null;
      ...
    })
    .sort(...)
    .slice(0, 2);
}, [carStatus, carTelemetry2, drivers, lapData]);
```

### 2026 branch in stats grid
```ts
...(is2026
  ? [{ label: 'Overtake', ... }, { label: 'Aero', ... }]
  : [{ label: 'ERS', ... }, { label: 'Fuel', ... }]
),
...(!is2026 ? [] : [{ label: 'ERS', ... }, { label: 'Fuel', ... }]),
```
Non-2026: ERS + Fuel only. 2026: Overtake + Aero + ERS + Fuel.

### Restricted telemetry guard
```ts
const restricted = driver.tel === 0;
// tel === 0 = Restricted, tel === 1 = Public (F1 spec)
value: restricted ? 'RESTRICTED' : ersPct !== null ? `${Math.round(ersPct)}%` : '---'
```

### Gap formatting
```ts
lap.pos === 1   ? 'LEADER'
: lap.dFront > 0 ? formatGap(lap.dFront)
: lap.dLeader > 0 ? formatGap(lap.dLeader)
: '---'
```

---

## Constants Used

- `VISUAL_TYRE_COMPOUNDS` — maps tyre compound ID → `{ name, color }`
- `TEAM_COLORS`, `TEAM_LOGOS`, `TEAM_NAMES`, `DRIVER_FLAGS` — team and driver branding
- `MAX_ERS_STORE = 4_000_000` Joules (defined locally)

---

## Related Components

- [`Leaderboard`](Leaderboard.md) — shows all cars; clicking sets `selectedCarIndex`
- [`ERSMonitor`](ERSMonitor.md) — detailed ERS view for selected car
- [`TyreStrategy`](TyreStrategy.md) — detailed tyre view for selected car
- [`TelemetryPanel`](TelemetryPanel.md) — detailed telemetry view for selected car
