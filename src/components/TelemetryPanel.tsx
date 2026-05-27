'use client';

import { useTelemetryStore } from '@/stores/telemetryStore';
import { TEAM_COLORS } from '@/lib/constants';
import { motion } from 'framer-motion';

export default function TelemetryPanel() {
  const selectedCarIndex = useTelemetryStore((s) => s.selectedCarIndex);
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const drivers = useTelemetryStore((s) => s.drivers);

  const car = telemetry.find((t) => t.i === selectedCarIndex);
  const driver = drivers.find((d) => d.i === selectedCarIndex);
  const teamColor = driver ? (TEAM_COLORS[driver.team] || '#555') : '#555';

  const gearLabel = car
    ? car.gear === -1 ? 'R' : car.gear === 0 ? 'N' : String(car.gear)
    : '-';

  const throttlePct = Math.min((car?.thr ?? 0) * 100, 100);
  const brakePct = Math.min((car?.brk ?? 0) * 100, 100);

  return (
    <motion.div
      className="card card-blue"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-header">
        <span className="card-title">Telemetry</span>
        <span className="text-[10px] font-bold" style={{ color: teamColor, fontFamily: "'F1', 'Arial Black', sans-serif" }}>
          {driver?.name || `Car ${selectedCarIndex}`}
        </span>
      </div>

      <div className="p-3 space-y-3">
        {/* Speed + Gear + DRS — broadcast-style large readouts */}
        <div className="flex items-end gap-4">
          <div>
            <span className="speed-readout">{car?.spd ?? '---'}</span>
            <span className="text-[9px] text-[var(--muted-foreground)] ml-1 uppercase"
                  style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>km/h</span>
          </div>
          <div className="flex flex-col items-center pb-0.5">
            <span className="gear-readout" style={{ color: teamColor }}>{gearLabel}</span>
            <span className="text-[8px] text-[var(--muted-foreground)] uppercase tracking-wider"
                  style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>Gear</span>
          </div>
          <motion.div
            className="pb-1"
            animate={{ opacity: car?.drs ? 1 : 0.3, scale: car?.drs ? 1 : 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <span className={`text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider ${
              car?.drs
                ? 'bg-[var(--green)] text-[var(--f1-black)]'
                : 'bg-[var(--surface)] text-[var(--muted)]'
            }`} style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>
              DRS
            </span>
          </motion.div>
          <div className="flex flex-col items-end ml-auto pb-0.5">
            <span className="text-sm font-mono font-bold tabular-nums">{car?.rpm ?? '---'}</span>
            <span className="text-[8px] text-[var(--muted-foreground)] uppercase"
                  style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>RPM</span>
          </div>
        </div>

        {/* Throttle / Brake — F1 TV style bars */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] w-10 text-right text-[var(--muted-foreground)] uppercase tracking-wider"
                  style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>Thr</span>
            <div className="throttle-bar flex-1">
              <motion.div
                className="throttle-bar-fill"
                style={{ backgroundColor: '#00ff87' }}
                animate={{ width: `${throttlePct}%` }}
                transition={{ duration: 0.08, ease: 'linear' }}
              />
            </div>
            <span className="text-[9px] font-mono w-8 text-right tabular-nums">{Math.round(throttlePct)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] w-10 text-right text-[var(--muted-foreground)] uppercase tracking-wider"
                  style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>Brk</span>
            <div className="throttle-bar flex-1">
              <motion.div
                className="throttle-bar-fill"
                style={{ backgroundColor: '#e10600' }}
                animate={{ width: `${brakePct}%` }}
                transition={{ duration: 0.08, ease: 'linear' }}
              />
            </div>
            <span className="text-[9px] font-mono w-8 text-right tabular-nums">{Math.round(brakePct)}%</span>
          </div>
        </div>

        {/* Tyre surface temps */}
        <div>
          <span className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider"
                style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>
            Tyre Temps
          </span>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {['FL', 'FR', 'RL', 'RR'].map((pos, idx) => {
              const surfIdx = [2, 3, 0, 1][idx];
              const temp = car?.tSurf?.[surfIdx] ?? 0;
              const hue = Math.max(0, 120 - temp);
              return (
                <div key={pos} className="stat-block flex items-center justify-between">
                  <span className="text-[9px] text-[var(--muted-foreground)] font-bold">{pos}</span>
                  <span className="text-xs font-mono font-bold" style={{ color: `hsl(${hue}, 80%, 60%)` }}>
                    {temp}°
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Engine temp */}
        <div className="stat-block flex items-center justify-between">
          <span className="text-[9px] text-[var(--muted-foreground)] uppercase"
                style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>Engine</span>
          <span className="text-xs font-mono font-bold">{car?.eTemp ?? '---'}°C</span>
        </div>
      </div>
    </motion.div>
  );
}
