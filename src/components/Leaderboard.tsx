'use client';

import { useTelemetryStore } from '@/stores/telemetryStore';
import { TEAM_COLORS, TEAM_NAMES, VISUAL_TYRE_COMPOUNDS } from '@/lib/constants';
import { formatLapTime, formatGap } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Leaderboard() {
  const lapData = useTelemetryStore((s) => s.lapData);
  const drivers = useTelemetryStore((s) => s.drivers);
  const carStatus = useTelemetryStore((s) => s.carStatus);
  const selectedCarIndex = useTelemetryStore((s) => s.selectedCarIndex);
  const setSelectedCarIndex = useTelemetryStore((s) => s.setSelectedCarIndex);

  const sorted = [...lapData]
    .filter((l) => l.result >= 2)
    .sort((a, b) => a.pos - b.pos);

  const getDriver = (carIdx: number) => drivers.find((d) => d.i === carIdx);
  const getStatus = (carIdx: number) => carStatus.find((s) => s.i === carIdx);

  // Battle detector: human within 1s of another human
  const humanCarIndices = new Set(drivers.filter((d) => d.ai === 0).map((d) => d.i));
  const battlingHumans = new Set<number>();
  for (const car of sorted) {
    if (!humanCarIndices.has(car.i)) continue;
    // car is human — check if car in front is also human and gap < 1000ms
    if (car.dFront > 0 && car.dFront < 1000) {
      const carInFront = sorted.find((c) => c.pos === car.pos - 1);
      if (carInFront && humanCarIndices.has(carInFront.i)) {
        battlingHumans.add(car.i);
        battlingHumans.add(carInFront.i);
      }
    }
  }

  const posClass = (pos: number) => {
    if (pos === 1) return 'pos-badge p1';
    if (pos === 2) return 'pos-badge p2';
    if (pos === 3) return 'pos-badge p3';
    return 'pos-badge';
  };

  return (
    <div className="card card-red h-full flex flex-col">
      <div className="card-header">
        <span className="card-title">Leaderboard</span>
        <span className="text-[9px] font-mono text-[var(--muted-foreground)]">{sorted.length} cars</span>
      </div>
      <div className="overflow-y-auto flex-1">
        <AnimatePresence initial={false}>
          {sorted.map((car, idx) => {
            const driver = getDriver(car.i);
            const status = getStatus(car.i);
            const teamColor = driver ? (TEAM_COLORS[driver.team] || '#555') : '#555';
            const tyreInfo = status ? VISUAL_TYRE_COMPOUNDS[status.tyre] : null;
            const isSelected = car.i === selectedCarIndex;
            const isPit = car.pit > 0;

            return (
              <motion.div
                key={car.i}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{
                  layout: { type: 'spring', stiffness: 500, damping: 35 },
                  opacity: { duration: 0.2 },
                  x: { duration: 0.2 },
                }}
                onClick={() => setSelectedCarIndex(car.i)}
                className={`flex items-center gap-2 px-2.5 py-[6px] cursor-pointer border-b border-[var(--card-border)] transition-colors ${
                  battlingHumans.has(car.i)
                    ? 'bg-[var(--yellow)]/[0.06] border-l-2 border-l-[var(--yellow)]'
                    : isSelected
                    ? 'bg-white/[0.06]'
                    : 'hover:bg-white/[0.03]'
                }`}
              >
                {/* Team color stripe */}
                <div className="team-stripe h-9" style={{ backgroundColor: teamColor }} />

                {/* Position badge — F1 angular style */}
                <div className={posClass(car.pos)}>
                  {car.pos}
                </div>

                {/* Driver name + team */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold truncate"
                          style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>
                      {driver?.name || `Car ${car.i}`}
                    </span>
                    <AnimatePresence>
                      {driver?.ai === 0 && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="text-[7px] font-bold px-1 py-0.5 rounded-sm uppercase tracking-wider bg-[var(--yellow)]/20 text-[var(--yellow)] border border-[var(--yellow)]/30"
                          style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}
                        >
                          HUMAN
                        </motion.span>
                      )}
                      {isPit && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="pill-pit"
                        >
                          PIT
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-[9px] text-[var(--muted-foreground)]">
                    {driver ? (TEAM_NAMES[driver.team] || '') : ''}
                  </span>
                </div>

                {/* Tyre compound + age */}
                {tyreInfo && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div
                      className="w-[10px] h-[10px] rounded-full ring-1 ring-white/10"
                      style={{ backgroundColor: tyreInfo.color }}
                    />
                    <span className="text-[8px] text-[var(--muted)] w-3 text-center tabular-nums font-mono">
                      {status?.tyreAge ?? ''}
                    </span>
                  </div>
                )}

                {/* Gap + Last lap */}
                <div className="text-right flex-shrink-0 w-[92px]">
                  <div className="text-[10px] font-mono text-[var(--muted-foreground)] tabular-nums">
                    {car.pos === 1 ? (
                      <span className="text-[var(--foreground-secondary)]">INTERVAL</span>
                    ) : (
                      formatGap(car.dFront)
                    )}
                  </div>
                  <motion.div
                    key={car.lastLap}
                    initial={{ color: '#00ff87' }}
                    animate={{ color: 'var(--foreground)' }}
                    transition={{ duration: 1.5 }}
                    className="text-[10px] font-mono tabular-nums font-medium"
                  >
                    {formatLapTime(car.lastLap)}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sorted.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 gap-2"
          >
            <div className="w-6 h-6 border-2 border-[var(--f1-red)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] text-[var(--muted-foreground)]"
                  style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>
              WAITING FOR DATA
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
