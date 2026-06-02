'use client';

import { useTelemetryStore } from '@/stores/telemetryStore';
import { TEAM_COLORS, TEAM_LOGOS, DRIVER_FLAGS } from '@/lib/constants';
import { motion } from 'framer-motion';

export default function TelemetryPanel() {
  const selectedCarIndex = useTelemetryStore((s) => s.selectedCarIndex);
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const drivers = useTelemetryStore((s) => s.drivers);

  if (selectedCarIndex === null) return null;

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
        <div className="flex items-center gap-2">
          {driver?.name && DRIVER_FLAGS[driver.name] && (
            <img src={DRIVER_FLAGS[driver.name]} alt="" style={{ width: 18, height: 12, objectFit: 'cover', borderRadius: 0 }} />
          )}
          <span className="text-[10px] font-bold" style={{ color: teamColor, fontFamily: "var(--font-ui)" }}>
            {driver?.name || `Car ${selectedCarIndex}`}
          </span>
          {driver && TEAM_LOGOS[driver.team] && (
            <img
              src={TEAM_LOGOS[driver.team]}
              alt=""
              style={{ height: 14, width: 'auto', maxWidth: 36, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.6 }}
            />
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Speed + Gear + DRS — broadcast-style large readouts */}
        <div className="flex items-end gap-5">
          <div>
            <span className="speed-readout">{car?.spd ?? '---'}</span>
            <span className="text-[11px] text-[var(--muted)] ml-1.5 uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-ui)" }}>km/h</span>
          </div>
          <div className="flex flex-col items-center pb-0.5">
            <span className="gear-readout" style={{ color: 'var(--foreground)' }}>{gearLabel}</span>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-[1.5px] mt-1"
                  style={{ fontFamily: "var(--font-ui)" }}>GEAR</span>
          </div>
          <motion.div
            className="pb-1"
            animate={{ opacity: car?.drs ? 1 : 0.25, scale: car?.drs ? 1 : 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <span className={`text-[11px] font-bold px-3 py-1.5 uppercase tracking-[2px] ${
              car?.drs
                ? 'bg-[var(--success)] text-black'
                : 'bg-[var(--surface-elevated)] text-[var(--muted)]'
            }`} style={{ fontFamily: "var(--font-ui)", borderRadius: 0 }}>
              DRS
            </span>
          </motion.div>
          <div className="flex flex-col items-end ml-auto pb-0.5">
            <span className="text-[18px] font-mono font-bold tabular-nums">{car?.rpm ?? '---'}</span>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-[1.5px] mt-1"
                  style={{ fontFamily: "var(--font-ui)" }}>RPM</span>
          </div>
        </div>

        {/* Throttle / Brake */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] w-12 text-right text-[var(--muted)] uppercase tracking-[1.5px]"
                  style={{ fontFamily: "var(--font-ui)" }}>THR</span>
            <div className="throttle-bar flex-1">
              <motion.div
                className="throttle-bar-fill"
                style={{ backgroundColor: '#0fa336' }}
                animate={{ width: `${throttlePct}%` }}
                transition={{ duration: 0.08, ease: 'linear' }}
              />
            </div>
            <span className="text-[11px] font-mono w-9 text-right tabular-nums">{Math.round(throttlePct)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] w-12 text-right text-[var(--muted)] uppercase tracking-[1.5px]"
                  style={{ fontFamily: "var(--font-ui)" }}>BRK</span>
            <div className="throttle-bar flex-1">
              <motion.div
                className="throttle-bar-fill"
                style={{ backgroundColor: '#e22718' }}
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
                style={{ fontFamily: "var(--font-ui)" }}>
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
                style={{ fontFamily: "var(--font-ui)" }}>Engine</span>
          <span className="text-xs font-mono font-bold">{car?.eTemp ?? '---'}°C</span>
        </div>
      </div>
    </motion.div>
  );
}
