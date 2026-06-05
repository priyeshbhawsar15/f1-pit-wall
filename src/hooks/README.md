# Hooks — `src/hooks/`

---

## `useSocket` — `useSocket.ts`

The single custom hook responsible for **establishing and maintaining the Socket.IO connection** between the browser and the Node.js server, and mapping every incoming socket event to a Zustand store setter.

### Usage

Called once at the top of the live dashboard page (`app/page.tsx`):

```ts
useSocket();
```

### How It Works

```
Socket.IO server (ws://same-origin:3333)
    │
    │  emit('session', data)
    │  emit('lapdata', data)
    │  emit('motion', data)
    │  ...
    ▼
useSocket (in browser)
    │
    │  store.setSession(data)
    │  store.setLapData(data.cars)
    │  store.setMotion(data.cars)
    │  ...
    ▼
useTelemetryStore (Zustand)
    │
    ▼
React components re-render
```

### URL Resolution

```ts
const configuredUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
const url = configuredUrl || window.location.origin;
```

Defaults to `window.location.origin` so that remote clients (e.g. phone on the same LAN) connect to the correct host. Override with `NEXT_PUBLIC_SOCKET_URL` env var if needed.

### Socket Events → Store Setters

| Socket Event | Store Method | Payload |
|---|---|---|
| `connect` | `setConnected(true)` | — |
| `disconnect` | `setConnected(false)` | — |
| `connect_error` | `setConnected(false)` | Logged to console |
| `motion` | `setMotion(data.cars)` | `CarMotionSlim[]` |
| `session` | `setSession(data)` | `SessionInfo` |
| `lapdata` | `setLapData(data.cars)` | `CarLapSlim[]` |
| `telemetry` | `setTelemetry(data.cars)` | `CarTelemetrySlim[]` |
| `carstatus` | `setCarStatus(data.cars)` | `CarStatusSlim[]` |
| `cardamage` | `setCarDamage(data.cars)` | `CarDamageSlim[]` |
| `participants` | `setDrivers(data.drivers)` | `DriverInfo[]` |
| `event` | `addEvent(data)` | `EventInfo` |
| `carsetups` | `setCarSetups(data.cars)` | `CarSetupSlim[]` |
| `laphistory` | `addLapHistory(data.entries)` | `LapHistoryEntry[]` |
| `positionhistory` | `addPositionHistory(data.entries)` | `PositionHistoryEntry[]` |
| `cartelemetry2` | `setCarTelemetry2(data.cars)` | `CarTelemetry2Slim[]` |

### Connection Lifecycle

The hook uses a `useRef` to store the socket instance and cleans up on unmount:

```ts
return () => { socket.disconnect(); };
```

### Related

- [`src/stores/README.md`](../stores/README.md) — all store setters called here
- [`src/server/realtime/socket.ts`](../server/README.md) — server side that emits these events
