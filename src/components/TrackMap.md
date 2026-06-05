# TrackMap

**File**: `TrackMap.tsx`  
**Type**: Client Component  
**Category**: Live Dashboard — Live tab

---

## What It Does

Renders a **real-time top-down track map** using an HTML `<canvas>` element. Draws:

- A trailing path (last 60 positions) per car, coloured by team colour at 25% opacity
- Filled circle per active car, sized up if selected
- Glow ring around the selected car
- Race position number drawn inside each car dot

The map auto-scales to the current bounding box of all car positions, with a 40px padding. Car positions come from the `motion` store slice (UDP `PacketMotionData`).

---

## Store Dependencies

The component uses `useTelemetryStore.subscribe()` (not `useTelemetryStore()`) for performance — it reads from refs instead of triggering React re-renders, since the canvas is redrawn via `requestAnimationFrame` at ~60fps.

| Slice | Used for |
|---|---|
| `motion` | Car world coordinates (x, z) and car index |
| `drivers` | Team ID per car for colour lookup |
| `selectedCarIndex` | Enlarges and glows the selected car dot |
| `lapData` | Position number shown inside each dot |

---

## Used On

| Page / Tab |
|---|
| `/` — Live tab (below EventFeed) |

---

## Child Components

None. Pure canvas rendering.

---

## Key Logic

### rAF render loop
```ts
useEffect(() => {
  let animId: number;
  const loop = () => { draw(); animId = requestAnimationFrame(loop); };
  animId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(animId);
}, [draw]);
```
Continuous 60fps canvas redraw without React state updates.

### Store subscription via ref (not hook)
```ts
useEffect(() => {
  const unsub = useTelemetryStore.subscribe((s) => {
    motionRef.current   = s.motion;
    driversRef.current  = s.drivers;
    selectedRef.current = s.selectedCarIndex;
  });
  return unsub;
}, []);
```
Avoids re-renders — reads from `motionRef.current` inside `draw()`.

### Auto-scaling
```ts
const scale = Math.min(drawSize / rangeX, drawSize / rangeZ);
const mapX = (x: number) => padding + (x - minX) * scale + (drawSize - rangeX * scale) / 2;
const mapZ = (z: number) => padding + (z - minZ) * scale + (drawSize - rangeZ * scale) / 2;
```
Fits all cars and trail history into a 500×500 canvas with equal padding.

### Trail buffer
```ts
trail.push({ x: car.x, z: car.z });
if (trail.length > TRAIL_LENGTH) trail.shift(); // TRAIL_LENGTH = 60
```
Maintains a sliding window of the last 60 positions per car.

---

## Constants

```ts
const CANVAS_SIZE  = 500;
const CAR_RADIUS   = 5;
const TRAIL_LENGTH = 60;
```

---

## Related Components

- [`Leaderboard`](Leaderboard.md) — sets `selectedCarIndex`, which highlights a car on the map
