'use client';

import { useTelemetryStore } from '@/stores/telemetryStore';
import { TEAM_COLORS, TEAM_NAMES } from '@/lib/constants';
import { useState } from 'react';
import { motion } from 'framer-motion';

const BMW_FONT = { fontFamily: "var(--font-ui)" };

interface SetupField {
  label: string;
  key: string;
  unit: string;
  min: number;
  max: number;
}

const SETUP_FIELDS: SetupField[] = [
  { label: 'Front Wing', key: 'frontWing', unit: '', min: 0, max: 50 },
  { label: 'Rear Wing', key: 'rearWing', unit: '', min: 0, max: 50 },
  { label: 'Diff On Throttle', key: 'onThrottle', unit: '%', min: 50, max: 100 },
  { label: 'Diff Off Throttle', key: 'offThrottle', unit: '%', min: 50, max: 100 },
  { label: 'Front Camber', key: 'frontCamber', unit: '°', min: -3.5, max: -2.5 },
  { label: 'Rear Camber', key: 'rearCamber', unit: '°', min: -2, max: -1 },
  { label: 'Front Toe', key: 'frontToe', unit: '°', min: 0, max: 0.15 },
  { label: 'Rear Toe', key: 'rearToe', unit: '°', min: 0.1, max: 0.5 },
  { label: 'Front Suspension', key: 'frontSuspension', unit: '', min: 1, max: 11 },
  { label: 'Rear Suspension', key: 'rearSuspension', unit: '', min: 1, max: 11 },
  { label: 'Front Anti-Roll', key: 'frontAntiRollBar', unit: '', min: 1, max: 11 },
  { label: 'Rear Anti-Roll', key: 'rearAntiRollBar', unit: '', min: 1, max: 11 },
  { label: 'Front Ride Height', key: 'frontSuspensionHeight', unit: '', min: 1, max: 11 },
  { label: 'Rear Ride Height', key: 'rearSuspensionHeight', unit: '', min: 1, max: 11 },
  { label: 'Brake Pressure', key: 'brakePressure', unit: '%', min: 50, max: 100 },
  { label: 'Brake Bias', key: 'brakeBias', unit: '%', min: 50, max: 70 },
  { label: 'RL Tyre Pressure', key: 'rearLeftTyrePressure', unit: 'psi', min: 20, max: 26 },
  { label: 'RR Tyre Pressure', key: 'rearRightTyrePressure', unit: 'psi', min: 20, max: 26 },
  { label: 'FL Tyre Pressure', key: 'frontLeftTyrePressure', unit: 'psi', min: 22, max: 26 },
  { label: 'FR Tyre Pressure', key: 'frontRightTyrePressure', unit: 'psi', min: 22, max: 26 },
  { label: 'Fuel Load', key: 'fuelLoad', unit: 'kg', min: 5, max: 110 },
];

function SetupBar({ value, min, max, color }: { value: number; min: number; max: number; color: string }) {
  const pct = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  return (
    <div className="h-[3px] w-full bg-[var(--surface)] overflow-hidden" style={{ borderRadius: 0 }}>
      <motion.div
        className="h-full"
        style={{ backgroundColor: color, borderRadius: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  );
}

export default function CarSetupComparison() {
  const drivers = useTelemetryStore((s) => s.drivers);
  const carSetups = useTelemetryStore((s) => s.carSetups);

  const [car1Idx, setCar1Idx] = useState(0);
  const [car2Idx, setCar2Idx] = useState(1);

  const setup1 = carSetups.find((s) => s.i === car1Idx);
  const setup2 = carSetups.find((s) => s.i === car2Idx);
  const driver1 = drivers.find((d) => d.i === car1Idx);
  const driver2 = drivers.find((d) => d.i === car2Idx);
  const color1 = driver1 ? (TEAM_COLORS[driver1.team] || '#666') : '#666';
  const color2 = driver2 ? (TEAM_COLORS[driver2.team] || '#999') : '#999';

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <div className="card-header">
        <span className="card-title">Setup Comparison</span>
      </div>

      <div className="p-3">
        {/* Driver selectors */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <select
            value={car1Idx}
            onChange={(e) => setCar1Idx(parseInt(e.target.value, 10))}
            className="bg-white/5 border border-[var(--card-border)] rounded-none px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--m-blue-dark)]"
          >
            {drivers.map((d) => (
              <option key={d.i} value={d.i}>{d.name || `Car ${d.i}`}</option>
            ))}
          </select>
          <select
            value={car2Idx}
            onChange={(e) => setCar2Idx(parseInt(e.target.value, 10))}
            className="bg-white/5 border border-[var(--card-border)] rounded-none px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--m-blue-dark)]"
          >
            {drivers.map((d) => (
              <option key={d.i} value={d.i}>{d.name || `Car ${d.i}`}</option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-1.5" style={{ backgroundColor: color1, borderRadius: 0 }} />
            <span>{driver1?.name || `Car ${car1Idx}`}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1.5" style={{ backgroundColor: color2, borderRadius: 0 }} />
            <span>{driver2?.name || `Car ${car2Idx}`}</span>
          </div>
        </div>

        {/* Setup fields */}
        {(!setup1 && !setup2) ? (
          <div className="text-center py-8 text-[10px] text-[var(--muted-foreground)]" style={BMW_FONT}>
            WAITING FOR SETUP DATA
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {SETUP_FIELDS.map((field) => {
              const v1 = setup1 ? (setup1 as any)[field.key] : 0;
              const v2 = setup2 ? (setup2 as any)[field.key] : 0;
              const formatted1 = typeof v1 === 'number' ? (Number.isInteger(v1) ? v1 : v1.toFixed(2)) : v1;
              const formatted2 = typeof v2 === 'number' ? (Number.isInteger(v2) ? v2 : v2.toFixed(2)) : v2;

              return (
                <div key={field.key} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[var(--muted-foreground)]">{field.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono" style={{ color: color1 }}>{formatted1}{field.unit}</span>
                      <span className="font-mono" style={{ color: color2 }}>{formatted2}{field.unit}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <SetupBar value={v1} min={field.min} max={field.max} color={color1} />
                    <SetupBar value={v2} min={field.min} max={field.max} color={color2} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
