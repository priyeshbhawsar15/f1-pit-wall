# SessionInfo

**File**: `SessionInfo.tsx`  
**Type**: Client Component  
**Category**: Navigation / Layout

---

## What It Does

The **live dashboard** header (used only on `/`). Replaces [`AppHeader`](AppHeader.md) for the dashboard because it needs to display live telemetry metadata.

Displays in a two-row header:
1. **Top row**: F1 logo · LIVE/OFFLINE pill · Track name + session type · F1 26 badge (if 2026 format) · Weather + temperatures · Session timer · Safety Car pill · nav links
2. **Tab row**: Live / Charts / Setup tab switcher

---

## Store Dependencies

Reads from [`useTelemetryStore`](../stores/README.md):

| Slice | Used for |
|---|---|
| `session` | Track, session type, weather, temperatures, time left, total laps, safety car status, `is2026` flag |
| `connected` | Controls the LIVE / OFFLINE pill |
| `activeTab` | Highlights the active tab button |
| `setActiveTab` | Tab button click handler |

---

## Used On

| Page |
|---|
| `/` (live dashboard `page.tsx`) |

---

## Child Components

None. Pure JSX with Framer Motion animations and `lucide-react` icons.

---

## Key Logic

### LIVE / OFFLINE pill
```tsx
<div className={connected ? 'pill pill-live' : 'pill pill-offline'}>
  {connected && <span className="live-dot" />}
  {connected ? 'LIVE' : 'OFFLINE'}
</div>
```
The animated dot pulses when `connected = true`.

### Session timer
```ts
const timeLeft = `${Math.floor(session.sessionTimeLeft / 60)}:${(session.sessionTimeLeft % 60).toString().padStart(2, '0')}`;
```
Converts raw seconds from the session packet to `mm:ss`.

### Safety car pill
```ts
const safetyCarLabel = ['', 'Safety Car', 'Virtual SC', 'Formation Lap'][session.safetyCarStatus] || '';
```
Appears and disappears with `AnimatePresence`.

### 2026 format badge
```tsx
{session?.is2026 === true && <span>F1 26</span>}
```
`is2026` is set server-side based on `packetFormat === 2026`.

### Tab switching
```ts
const dashTabs = [
  { key: 'live',   label: 'Live',   icon: Radio },
  { key: 'charts', label: 'Charts', icon: BarChart3 },
  { key: 'setup',  label: 'Setup',  icon: Settings2 },
];
```
Clicking a tab calls `setActiveTab(tab.key)`, which changes the `activeTab` slice in the store. The main `page.tsx` reads `activeTab` and renders the corresponding layout.

---

## Related Components

- [`AppHeader`](AppHeader.md) — equivalent nav bar for non-dashboard pages
- [`Leaderboard`](Leaderboard.md) — rendered below in the Live tab
- [`HumanPlayersOverview`](HumanPlayersOverview.md) — rendered in the Live tab
