# EventFeed

**File**: `EventFeed.tsx`  
**Type**: Client Component  
**Category**: Live Dashboard — Live tab / Charts tab

---

## What It Does

Renders a **live scrolling log of race events** received over Socket.IO during an active session. Events appear at the top and are stored in the Zustand store (capped at 50). Each row shows:

- Event type icon (colour-coded per event code)
- Human-readable event name (`EVENT_CODES` lookup)
- Formatted detail string (driver name, time, speed, etc.)
- Wall-clock timestamp

---

## Store Dependencies

| Slice | Used for |
|---|---|
| `events` | Array of `EventInfo` objects (code, details, timestamp) |
| `drivers` | Name lookup for car indices in event details |

---

## Used On

| Page / Tab | Context |
|---|---|
| `/` — Live tab | Below `HumanPlayersOverview`, above `TrackMap` |
| `/` — Charts tab | Below the two charts |

---

## Child Components

None.

---

## Key Logic

### `getDriverName(idx)`
```ts
const d = drivers.find((dr) => dr.i === idx);
return d?.name || `Car ${idx}`;
```
Used throughout `formatEventDetails` to resolve car indices to names.

### `formatEventDetails(code, details)`
Switch on event code to produce a human-readable string:

| Code | Format |
|---|---|
| `FTLP` | `{driver} - {lapTime}s` |
| `RTMT` | `{driver}` |
| `OVTK` | `{overtaker} overtook {overtaken}` |
| `PENA` | `{driver} - {time}s` |
| `SPTP` | `{driver} - {speed} km/h` |
| `COLL` | `{driver1} & {driver2} · Low/Medium/High` (2026 severity) |
| `SCAR` | `Deployed / Returning / Returned / Resume` |

### Icon mapping
```ts
const eventIcons: Record<string, React.ReactNode> = {
  FTLP: <Zap ... />,    // fastest lap
  RTMT: <AlertTriangle ... />,
  DRSE: <Zap ... />,    // DRS enabled
  DRSD: <Zap ... />,    // DRS disabled
  CHQF: <Flag ... />,   // chequered flag
  RCWN: <Flag ... />,   // race winner
  PENA: <ShieldAlert ... />,
  OVTK: <Car ... />,
  SCAR: <AlertTriangle ... />,
  COLL: <AlertTriangle ... />,   // 2026 collision with severity
  RDFL: <Flag ... />,   // red flag
  SPTP: <Zap ... />,    // speed trap
  ...
};
```

---

## Constants Used

- `EVENT_CODES` — from `constants.ts`, maps 4-char code to readable label (e.g. `'FTLP' → 'Fastest Lap'`)

---

## Related Components

- [`RaceMomentsTimeline`](RaceMomentsTimeline.md) — persisted, filterable version of events shown on the session detail page
