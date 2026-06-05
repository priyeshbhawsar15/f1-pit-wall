# RaceMomentsTimeline

**File**: `RaceMomentsTimeline.tsx`  
**Type**: Client Component  
**Category**: Session detail page

---

## What It Does

Renders a **filterable timeline of persisted race events** for a completed session. Fetches events from the API on mount, then displays them in chronological order with race-relative timestamps.

Supports filtering by event type: All / Overtakes / Collisions / Fastest Laps / Penalties.

Each event row shows:
- Colour-coded icon for the event type
- Event label + human-readable description (resolves car indices to driver names)
- Race time offset (`+m:ss` from session start, or from `sessionTimeMs` if available)

---

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `sessionId` | `string` | Yes | Prisma session `id` — used to fetch `/api/sessions/{id}/events` |

---

## Used On

| Page |
|---|
| `/sessions/[id]` (session detail / replay page) |

---

## Child Components

None. All rendering is inline.

---

## Data Fetching

```ts
useEffect(() => {
  fetch(`/api/sessions/${sessionId}/events`)
    .then((r) => r.json())
    .then((data) => {
      setEvents(data.events);
      setParticipants(data.participants);
      setSessionStart(data.sessionCreatedAt);
    });
}, [sessionId]);
```

The API returns:
- `events[]` — `{ id, eventCode, timestamp, sessionTimeMs, details }`
- `participants[]` — to resolve car indices to driver names
- `sessionCreatedAt` — wall-clock fallback for `formatRaceTime`

---

## Key Logic

### `formatRaceTime(event, sessionStart)`
```ts
const elapsed = typeof event.sessionTimeMs === 'number'
  ? Math.max(0, Math.floor(event.sessionTimeMs / 1000))
  : sessionStart
    ? Math.floor((new Date(event.timestamp) - new Date(sessionStart)) / 1000)
    : -1;
```
Prefers `sessionTimeMs` (in-game race time from the UDP packet header). Falls back to wall-clock delta if not available. Returns `--:--` if neither is available.

### `describeEvent(code, details, participants)`
Produces a full human-readable sentence per event:
- `OVTK`: `"Driver A overtook Driver B"`
- `COLL`: `"Driver A & Driver B collided"`
- `FTLP`: `"Driver A set fastest lap"`
- `PENA`: `"Driver A — infringementType"`
- `RTMT`: `"Driver A retired"`
- `RCWN`: `"Driver A wins!"`

### `getDriverName(idx, participants)`
Resolves car index → `humanProfile.name` (preferred) → `participant.name` → `Car {idx}`.

### Filter state
```ts
const [filter, setFilter] = useState<string>('all');
const filtered = events.filter((e) => SHOWN_CODES.includes(e.eventCode) && (filter === 'all' || e.eventCode === filter));
```
`SHOWN_CODES = ['OVTK', 'COLL', 'FTLP', 'PENA', 'RTMT', 'RCWN', 'SCAR', 'RDFL', 'CHQF']`

---

## `EVENT_META` mapping

```ts
{
  OVTK: { icon, color: 'var(--green)',  label: 'Overtake' },
  COLL: { icon, color: 'var(--f1-red)', label: 'Collision' },
  FTLP: { icon, color: 'var(--purple)', label: 'Fastest Lap' },
  PENA: { icon, color: 'var(--yellow)', label: 'Penalty' },
  RTMT: { icon, color: 'var(--f1-red)', label: 'Retirement' },
  RCWN: { icon, color: '#FFD700',        label: 'Race Winner' },
  SCAR: { icon, color: 'var(--blue)',   label: 'Safety Car' },
  DRSE: { icon, color: 'var(--green)',  label: 'DRS Enabled' },
  RDFL: { icon, color: 'var(--f1-red)', label: 'Red Flag' },
  CHQF: { icon, color: '#FFD700',        label: 'Chequered Flag' },
}
```

---

## Related Components

- [`EventFeed`](EventFeed.md) — live event log during an active session (reads from Zustand store, not API)
