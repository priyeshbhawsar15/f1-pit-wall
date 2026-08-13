'use client';

import { useEffect, useRef } from 'react';
import { Route } from 'lucide-react';
import { teamColor } from '@/lib/presentation';

export interface MapCar {
  i: number;
  x: number;
  z: number;
  name: string;
  team?: number;
  player?: boolean;
  position?: number;
  progress?: number;
}

function fallbackCircuit(width: number, height: number) {
  return [
    [width * .17, height * .62], [width * .12, height * .44], [width * .24, height * .22],
    [width * .51, height * .15], [width * .71, height * .24], [width * .87, height * .42],
    [width * .78, height * .66], [width * .58, height * .78], [width * .34, height * .73], [width * .17, height * .62],
  ];
}

export function TrackStage({
  cars,
  label = 'Live position map',
  trackPoints,
}: {
  cars: MapCar[];
  label?: string;
  trackPoints?: Array<{ x: number; z: number }>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const drawingContext = canvasElement.getContext('2d');
    if (!drawingContext) return;
    const canvas = canvasElement;
    const context = drawingContext;

    function draw() {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      const active = cars.filter((car) => Number.isFinite(car.x) && Number.isFinite(car.z));
      const providedTrack = trackPoints?.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.z)) ?? [];
      const track = providedTrack.length >= 3
        ? providedTrack.map((point) => [point.x, point.z])
        : fallbackCircuit(rect.width, rect.height);

      let minX = Math.min(...track.map((point) => point[0]));
      let maxX = Math.max(...track.map((point) => point[0]));
      let minZ = Math.min(...track.map((point) => point[1]));
      let maxZ = Math.max(...track.map((point) => point[1]));
      if (maxX - minX < 1) { minX -= 1; maxX += 1; }
      if (maxZ - minZ < 1) { minZ -= 1; maxZ += 1; }
      const padding = Math.min(rect.width, rect.height) * .14;
      const scale = Math.min((rect.width - padding * 2) / (maxX - minX), (rect.height - padding * 2) / (maxZ - minZ));
      const offsetX = (rect.width - (maxX - minX) * scale) / 2;
      const offsetY = (rect.height - (maxZ - minZ) * scale) / 2;
      const point = (x: number, z: number) => [offsetX + (x - minX) * scale, offsetY + (z - minZ) * scale] as const;

      const circuit = providedTrack.length >= 3 ? providedTrack.map((trackPoint) => point(trackPoint.x, trackPoint.z)) : track;
      const firstCircuitPoint = circuit[0];
      const lastCircuitPoint = circuit[circuit.length - 1];
      const endpointDistance = Math.hypot(lastCircuitPoint[0] - firstCircuitPoint[0], lastCircuitPoint[1] - firstCircuitPoint[1]);
      const circuitIsClosed = providedTrack.length < 3 || endpointDistance <= Math.min(rect.width, rect.height) * .06;
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.strokeStyle = '#292929';
      context.lineWidth = 18;
      context.beginPath();
      circuit.forEach(([x, y], index) => index === 0 ? context.moveTo(x, y) : context.lineTo(x, y));
      if (circuitIsClosed) context.closePath();
      context.stroke();
      context.strokeStyle = '#a8a8a8';
      context.lineWidth = 2;
      context.stroke();

      const fallbackPoint = (progress: number) => {
        const segmentProgress = Math.max(0, Math.min(progress, .999999)) * (circuit.length - 1);
        const segment = Math.floor(segmentProgress);
        const offset = segmentProgress - segment;
        const start = circuit[segment];
        const end = circuit[segment + 1];
        return [start[0] + (end[0] - start[0]) * offset, start[1] + (end[1] - start[1]) * offset] as const;
      };

      active.forEach((car) => {
        const [x, y] = providedTrack.length >= 3
          ? point(car.x, car.z)
          : fallbackPoint(car.progress ?? 0);
        const radius = car.player ? 8 : 4;
        context.fillStyle = car.player ? '#ff1801' : teamColor(car.team);
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        if (car.player) {
          context.strokeStyle = '#ffffff';
          context.lineWidth = 3;
          context.stroke();
        }
      });
    }

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [cars, trackPoints]);

  return (
    <div className="track-stage">
      <div className="track-stage-label"><Route aria-hidden="true" /><span>{label}</span></div>
      <canvas ref={canvasRef} aria-label={`${label}. ${cars.length} cars are plotted; player cars use red markers with white outlines.`} />
      <div className="map-key"><span><i className="player-dot" />Players</span><span><i />Field</span></div>
    </div>
  );
}
