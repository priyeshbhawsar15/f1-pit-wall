# State Management — `src/stores/`

Single Zustand store that holds **all live telemetry state** for the dashboard. Updated in real-time via [`useSocket`](../hooks/README.md).

---

## File

`telemetryStore.ts`

---

## Store: `useTelemetryStore`

```ts
import { useTelemetryStore } from '@/stores/telemetryStore';
```

All components read from this store via selectors:
```ts
const session = useTelemetryStore((s) => s.session);
```

---

## State Slices

| Slice | Type | Description |
|---|---|---|
| `connected` | `boolean` | Whether Socket.IO is connected to the server |
| `session` | `SessionInfo \| null` | Current track, weather, timer, formula, `is2026` flag |
| `drivers` | `DriverInfo[]` | All active drivers — name, team, AI flag, telemetry permission |
| `motion` | `CarMotionSlim[]` | Car world positions (x, z) + yaw per car index |
| `lapData` | `CarLapSlim[]` | Race position, lap, sector times, gaps, pit status per car |
| `telemetry` | `CarTelemetrySlim[]` | Speed, throttle, brake, gear, RPM, tyre/brake temps per car |
| `carStatus` | `CarStatusSlim[]` | Fuel, tyres, ERS store/mode/harvest, DRS info per car |
| `carDamage` | `CarDamageSlim[]` | Tyre wear, wing/floor/engine/gearbox damage per car |
| `carSetups` | `CarSetupSlim[]` | Wing, suspension, camber, tyre pressure, brake setup per car |
| `carTelemetry2` | `CarTelemetry2Slim[]` | **2026 only** — Active Aero mode + Overtake system per car |
| `events` | `EventInfo[]` | Live event log (capped at 50, newest first) |
| `lapHistory` | `LapHistoryEntry[]` | Per-car lap-by-lap completed lap times (used by `LapTimeChart`) |
| `positionHistory` | `PositionHistoryEntry[]` | Per-car lap-by-lap race positions (used by `PositionChart`) |
| `selectedCarIndex` | `number \| null` | Car index selected in the Leaderboard — drives TelemetryPanel, ERSMonitor, TyreStrategy |
| `activeTab` | `'live' \| 'charts' \| 'setup'` | Active dashboard tab |

---

## Interfaces

### `DriverInfo`
```ts
{ i, name, team, num, ai, nat, tel }
// tel: 0 = Restricted telemetry, 1 = Public
```

### `SessionInfo`
```ts
{ sessionUID, trackId, sessionType, weather, trackTemperature, airTemperature,
  totalLaps, trackLength, sessionTimeLeft, sessionDuration, safetyCarStatus,
  formula, is2026, pitStopWindowIdealLap, pitStopWindowLatestLap,
  sector2LapDistanceStart, sector3LapDistanceStart, weatherForecast[] }
```
`is2026` is set server-side based on `packetFormat === 2026`.

### `CarStatusSlim`
```ts
{ i, fuel, fuelLaps, drsOk, drsDist, tyre, tyreActual, tyreAge,
  ersStore, ersMode, ersK, ersH, ersLimit, ersDeployed, iceW, mgukW, flags }
```
`ersLimit` is 0 for F1 2025 and populated for F1 2026.

### `CarTelemetry2Slim` (2026 only)
```ts
{ i, aeroMode, aeroAvail, aeroDist, otAvail, otActive, otDist, is26, wrongWay }
```

---

## Setters

| Method | Triggered by |
|---|---|
| `setConnected(v)` | Socket connect/disconnect |
| `setSession(s)` | `session` Socket.IO event |
| `setDrivers(d)` | `participants` event |
| `setMotion(m)` | `motion` event |
| `setLapData(l)` | `lapdata` event |
| `setTelemetry(t)` | `telemetry` event |
| `setCarStatus(s)` | `carstatus` event |
| `setCarDamage(d)` | `cardamage` event |
| `setCarSetups(s)` | `carsetups` event |
| `setCarTelemetry2(d)` | `cartelemetry2` event |
| `addEvent(e)` | `event` event — prepends and caps at 50 |
| `addLapHistory(entries)` | `laphistory` event — deduplicates by `carIndex_lap` key |
| `addPositionHistory(entries)` | `positionhistory` event — deduplicates by `carIndex_lap` key |
| `setSelectedCarIndex(i)` | Leaderboard row click (toggles null) |
| `setActiveTab(tab)` | SessionInfo tab button click |

---

## Related

- [`useSocket`](../hooks/README.md) — calls all setters above
- [`src/server/udp-listener.ts`](../server/README.md) — publishes the data that flows into this store
