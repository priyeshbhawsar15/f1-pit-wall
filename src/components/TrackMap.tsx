'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useTelemetryStore, CarMotionSlim } from '@/stores/telemetryStore';
import { TEAM_COLORS } from '@/lib/constants';
import { motion } from 'framer-motion';

const CANVAS_SIZE = 500;
const CAR_RADIUS = 5;
const TRAIL_LENGTH = 60;

export default function TrackMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailsRef = useRef<Map<number, { x: number; z: number }[]>>(new Map());
  const motionRef = useRef<CarMotionSlim[]>([]);
  const driversRef = useRef(useTelemetryStore.getState().drivers);
  const selectedRef = useRef(useTelemetryStore.getState().selectedCarIndex);

  useEffect(() => {
    const unsub1 = useTelemetryStore.subscribe((s) => {
      motionRef.current = s.motion;
      driversRef.current = s.drivers;
      selectedRef.current = s.selectedCarIndex;
    });
    return unsub1;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cars = motionRef.current;
    const drivers = driversRef.current;
    const selectedIdx = selectedRef.current;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const activeCars = cars.filter((c) => c.x !== 0 || c.z !== 0);
    if (activeCars.length === 0) {
      ctx.fillStyle = 'var(--muted-foreground)';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for motion data...', CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      return;
    }

    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const car of activeCars) {
      if (car.x < minX) minX = car.x;
      if (car.x > maxX) maxX = car.x;
      if (car.z < minZ) minZ = car.z;
      if (car.z > maxZ) maxZ = car.z;
    }

    // Also consider trail history for bounds
    trailsRef.current.forEach((trail) => {
      for (const p of trail) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.z < minZ) minZ = p.z;
        if (p.z > maxZ) maxZ = p.z;
      }
    });

    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;
    const padding = 40;
    const drawSize = CANVAS_SIZE - padding * 2;
    const scale = Math.min(drawSize / rangeX, drawSize / rangeZ);

    const mapX = (x: number) => padding + (x - minX) * scale + (drawSize - rangeX * scale) / 2;
    const mapZ = (z: number) => padding + (z - minZ) * scale + (drawSize - rangeZ * scale) / 2;

    // Update trails
    for (const car of activeCars) {
      if (!trailsRef.current.has(car.i)) {
        trailsRef.current.set(car.i, []);
      }
      const trail = trailsRef.current.get(car.i)!;
      trail.push({ x: car.x, z: car.z });
      if (trail.length > TRAIL_LENGTH) trail.shift();
    }

    // Draw trails
    trailsRef.current.forEach((trail, carIdx) => {
      if (trail.length < 2) return;
      const driver = drivers.find((d) => d.i === carIdx);
      const color = driver ? (TEAM_COLORS[driver.team] || '#666') : '#444';

      ctx.beginPath();
      ctx.moveTo(mapX(trail[0].x), mapZ(trail[0].z));
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(mapX(trail[i].x), mapZ(trail[i].z));
      }
      ctx.strokeStyle = color + '40';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw cars
    for (const car of activeCars) {
      const driver = drivers.find((d) => d.i === car.i);
      const color = driver ? (TEAM_COLORS[driver.team] || '#666') : '#666';
      const cx = mapX(car.x);
      const cz = mapZ(car.z);
      const isSelected = car.i === selectedIdx;

      // Glow for selected
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(cx, cz, CAR_RADIUS + 4, 0, Math.PI * 2);
        ctx.fillStyle = color + '40';
        ctx.fill();
      }

      // Car dot
      ctx.beginPath();
      ctx.arc(cx, cz, isSelected ? CAR_RADIUS + 1 : CAR_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Position number
      ctx.fillStyle = '#fff';
      ctx.font = `${isSelected ? 'bold ' : ''}9px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lapCar = useTelemetryStore.getState().lapData.find((l) => l.i === car.i);
      if (lapCar) {
        ctx.fillText(String(lapCar.pos), cx, cz);
      }
    }
  }, []);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      draw();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [draw]);

  return (
    <motion.div
      className="card card-red"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-header">
        <span className="card-title">Track Map</span>
      </div>
      <div className="flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full max-w-[500px] aspect-square"
        />
      </div>
    </motion.div>
  );
}
