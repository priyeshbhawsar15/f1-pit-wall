# Server — `src/server/`

Node.js / ts-node backend. Receives F1 UDP telemetry, parses packets, publishes to Redis, and persists data to the database.

---

## Entry Point

The server boots from `server.ts` at the project root, which:
1. Starts the Next.js HTTP server
2. Attaches Socket.IO via `initSocketIO(httpServer)`
3. Starts the UDP listener via `startUDPListener()`
4. Runs DB bootstrap (Prisma migrations, schema checks)

---

## `udp-listener.ts`

The core server module. Binds a UDP socket on `0.0.0.0:20777` (configurable via `UDP_PORT` env), receives raw buffers from the F1 game, and dispatches each packet by `PacketId`.

### Packet dispatch loop
```ts
socket.on('message', (msg, rinfo) => {
  const header = parseHeader(msg);
  switch (header.packetId) {
    case PacketId.Motion:       // → parseMotionData → publish + write
    case PacketId.Session:      // → parseSessionData → publish + upsertSession
    case PacketId.LapData:      // → parseLapData → publish
    case PacketId.Event:        // → parseEventData → publish + writeEvent
    case PacketId.Participants: // → parseParticipantsData → publish + upsertParticipants
    case PacketId.CarSetup:     // → parseCarSetupData → publish
    case PacketId.CarTelemetry: // → parseCarTelemetryData → publish + writeTelemetrySamples
    case PacketId.CarStatus:    // → parseCarStatusData → publish
    case PacketId.FinalClassification: // → parseFinalClassification → publish + writeFinalClassification
    case PacketId.SessionHistory:      // → publish lap/position history
    case PacketId.CarDamage:    // → parseCarDamageData → publish + writeCarDamage
    case PacketId.CarTelemetry2: // (2026 only) → parseCarTelemetry2Data → publish
    case PacketId.LapPositions: // → publish positionHistory
  }
});
```

### Throttling
High-frequency packets are throttled with counters to avoid flooding Redis:

| Packet | Throttle (`REALTIME_THROTTLE`) |
|---|---|
| Motion | Every N frames |
| CarTelemetry | Every N frames |
| LapData | Every N frames |
| CarStatus | Every N frames |

> `REALTIME_THROTTLE` constant controls how many UDP frames are skipped between publishes.

### 2026 detection
```ts
isFormat2026(header.packetFormat, header.gameYear, msg.length, expectedSize)
```
Checked per-packet. A one-time diagnostic log is emitted for the first motion packet per session:
```
[UDP] Session {uid} — packetFormat=2026 gameYear=25 bufLen=1325 → treating as 2026 (24 cars)
```

### Slim mapping
Before publishing to Redis, raw parsed structs are mapped to lean "slim" objects to reduce payload size. Example for participants:
```ts
const slim = packet.participants.slice(0, numActiveCars).map((p, idx) => ({
  i: idx, name: p.name, team: p.teamId, num: p.raceNumber,
  ai: p.aiControlled, nat: p.nationality, tel: p.yourTelemetry,
}));
```

---

## `db/writers.ts`

Handles all **database persistence** for a live session.

| Function | Description |
|---|---|
| `upsertSession(packet)` | Creates or updates the `Session` row when a session packet arrives |
| `upsertParticipants(packet)` | Upserts `Participant` rows; links to `HumanProfile` via `humanCarIndices` |
| `writeEvent(sessionUID, code, details, sessionTime)` | Persists a race event via `prisma.event.create()` |
| `writeTelemetrySamples(sessionUID, packet)` | Writes slim telemetry rows (speed, throttle, steer, brake, clutch, gear, rpm, drs) to `telemetry_samples` TimescaleDB table — **human drivers only** |
| `writeMotionSamples(sessionUID, packet)` | Writes car position rows to `motion_samples` TimescaleDB table |
| `writeCarDamage(sessionUID, packet)` | Writes tyre wear + core damage to `car_damage_samples` — **human drivers only** |
| `writeFinalClassification(sessionUID, packet)` | Persists end-of-race `FinalClassification` rows |
| `flushPendingEvents(sessionUID)` | Flushes any events that arrived before the session row was committed |

### Human car index tracking
```ts
function rememberHumanCarIndicesFromHeader(sessionUID, header)
function rememberHumanCarIndicesFromParticipants(sessionUID, packet)
function getOrCreateHumanCarIndices(sessionUID): Set<number>
```
Maintains a `Map<sessionUID, Set<carIndex>>` so that telemetry and damage writers can filter to human drivers only.

### TimescaleDB tables
- `motion_samples` — `(time, session_uid, car_index, x, y, z, yaw)`
- `telemetry_samples` — `(time, session_uid, car_index, speed, throttle, …)`
- `car_damage_samples` — `(time, session_uid, car_index, tyre_wear_rl, …)`
- `lap_data_samples` — `(time, session_uid, car_index, position, lap, …)`

---

## `realtime/redis.ts`

Singleton Redis publisher and subscriber using `ioredis`.

```ts
export function getPublisher(): Redis  // lazy-init singleton
export function getSubscriber(): Redis // lazy-init singleton

export function publish(channel: RedisChannel, data: unknown): void
// Serialises to JSON (handles BigInt), publishes to channel
```

### `RedisChannel` enum

```ts
enum RedisChannel {
  Motion          = 'f1:motion',
  Telemetry       = 'f1:telemetry',
  LapData         = 'f1:lapdata',
  CarStatus       = 'f1:carstatus',
  CarDamage       = 'f1:cardamage',
  Session         = 'f1:session',
  Participants    = 'f1:participants',
  Event           = 'f1:event',
  FinalClassification = 'f1:classification',
  CarSetups       = 'f1:carsetups',
  LapHistory      = 'f1:laphistory',
  PositionHistory = 'f1:positionhistory',
  CarTelemetry2   = 'f1:cartelemetry2',
}
```

---

## `realtime/socket.ts`

Attaches Socket.IO to the HTTP server, subscribes to all Redis channels, and relays messages to all connected clients.

```ts
export function initSocketIO(httpServer: HttpServer): SocketIOServer
```

Channel name → Socket.IO event name mapping:
```ts
const eventName = channel.replace('f1:', '');
// 'f1:motion' → emits 'motion' to all clients
io.emit(eventName, data);
```

Connection logs are emitted on connect, disconnect, and `connection_error`.

---

## `parser/` — Packet Parsers

Each parser receives a raw `Buffer` and a `PacketHeader`, returns a typed struct.

### Format branching pattern (all parsers)
```ts
const is2026 = isFormat2026(header.packetFormat, header.gameYear, buf.length, EXPECTED_2025_SIZE);
const bytesPerCar = is2026 ? BYTES_PER_CAR_2026 : BYTES_PER_CAR_2025;
const maxCars = Math.min(
  Math.floor((buf.length - HEADER_SIZE) / bytesPerCar),
  is2026 ? MAX_CARS_2026 : MAX_CARS_2025
);
```
`maxCars` is derived from the actual buffer length to handle DLC hybrid scenarios where the game reports 2025 format but sends 2026-sized packets.

### Key per-format differences

| Field | 2025 | 2026 |
|---|---|---|
| `driverId`, `networkId`, `teamId` in participants | `uint8` | `uint16` |
| g-forces in motion | `float` | `int16 ÷ 1000` |
| `engineTemperature` in car telemetry | `uint16` | `uint8` |
| `ersHarvestLimitPerLap` in car status | not present | `float` after `ersHarvestedMGUH` |
| `teamId` in time trial | `uint8` | `uint16` |
| Max cars | 22 | 24 |

### `car-telemetry2.ts` (2026 only — Packet ID 16)
Parses the new Active Aero + Overtake system packet. Published to `RedisChannel.CarTelemetry2`. Only received when `packetFormat === 2026`.
