'use client';

import { useTelemetryStore } from '@/stores/telemetryStore';
import { VISUAL_TYRE_COMPOUNDS } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

const F1_FONT = { fontFamily: "'F1', 'Arial Black', sans-serif" };

export default function TyreStrategy() {
  const selectedCarIndex = useTelemetryStore((s) => s.selectedCarIndex);
  const carStatus = useTelemetryStore((s) => s.carStatus);
  const carDamage = useTelemetryStore((s) => s.carDamage);
  const telemetry = useTelemetryStore((s) => s.telemetry);

  const status = carStatus.find((s) => s.i === selectedCarIndex);
  const damage = carDamage.find((d) => d.i === selectedCarIndex);
  const telem = telemetry.find((t) => t.i === selectedCarIndex);

  const tyreInfo = status ? VISUAL_TYRE_COMPOUNDS[status.tyre] : null;
  const tyreLabels = ['RL', 'RR', 'FL', 'FR'];

  return (
    <motion.div
      className="card card-purple"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="card-header">
        <span className="card-title">Tyres</span>
        <AnimatePresence mode="wait">
          {tyreInfo && (
            <motion.span
              key={tyreInfo.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-[9px] font-bold uppercase" style={{ ...F1_FONT, color: tyreInfo.color }}
            >
              {tyreInfo.name}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="p-3 space-y-3">
        {/* Compound badge + age */}
        <div className="flex items-center gap-3">
          {tyreInfo && (
            <motion.div
              key={tyreInfo.name}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="tyre-badge"
              style={{ borderColor: tyreInfo.color, color: tyreInfo.color }}
            >
              {tyreInfo.name.charAt(0)}
            </motion.div>
          )}
          <div>
            <div className="text-sm font-bold" style={F1_FONT}>{tyreInfo?.name || '---'}</div>
            <div className="text-[9px] text-[var(--muted-foreground)]">
              Age: <span className="font-mono font-bold">{status?.tyreAge ?? '--'}</span> laps
            </div>
          </div>
        </div>

        {/* Tyre wear grid */}
        <div>
          <span className="text-[8px] text-[var(--muted-foreground)] uppercase tracking-wider" style={F1_FONT}>
            Wear & Temperature
          </span>
          <div className="grid grid-cols-2 gap-1.5 mt-1">
            {tyreLabels.map((label, idx) => {
              const wear = damage?.tyreWear?.[idx] ?? 0;
              const surfTemp = telem?.tSurf?.[idx] ?? 0;
              const innerTemp = telem?.tInner?.[idx] ?? 0;
              const pressure = telem?.tPress?.[idx] ?? 0;
              const wearColor = wear < 30 ? 'var(--green)' : wear < 60 ? 'var(--yellow)' : 'var(--f1-red)';

              return (
                <div key={label} className="stat-block">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold" style={F1_FONT}>{label}</span>
                    <span className="text-[10px] font-mono font-bold tabular-nums" style={{ color: wearColor }}>
                      {wear.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-[3px] bg-[var(--surface)] rounded-sm overflow-hidden mb-1">
                    <motion.div
                      className="h-full rounded-sm"
                      style={{ backgroundColor: wearColor }}
                      animate={{ width: `${Math.min(wear, 100)}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-[var(--muted-foreground)] font-mono tabular-nums">
                    <span>{surfTemp}°S</span>
                    <span>{innerTemp}°I</span>
                    <span>{pressure}psi</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fuel */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="stat-block">
            <div className="text-[8px] text-[var(--muted-foreground)] uppercase tracking-wider" style={F1_FONT}>Fuel</div>
            <div className="text-xs font-mono font-bold tabular-nums">{status?.fuel ?? '---'} <span className="text-[8px] text-[var(--muted)]">kg</span></div>
          </div>
          <div className="stat-block">
            <div className="text-[8px] text-[var(--muted-foreground)] uppercase tracking-wider" style={F1_FONT}>Fuel Laps</div>
            <div className={`text-xs font-mono font-bold tabular-nums ${
              status && status.fuelLaps < 1 ? 'text-[var(--f1-red)]' : ''
            }`}>
              {status?.fuelLaps ?? '---'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
