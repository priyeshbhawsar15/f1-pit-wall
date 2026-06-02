'use client';

import { useTelemetryStore } from '@/stores/telemetryStore';
import { TEAM_COLORS, TEAM_NAMES, VISUAL_TYRE_COMPOUNDS, DRIVER_FLAGS, TEAM_LOGOS } from '@/lib/constants';
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
                onClick={() => setSelectedCarIndex(isSelected ? null : car.i)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[var(--hairline-strong)] transition-colors ${
                  battlingHumans.has(car.i)
                    ? 'bg-[var(--m-blue-light)]/[0.06] border-l-2 border-l-[var(--m-blue-light)]'
                    : isSelected
                    ? 'bg-white/[0.05]'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                {/* Team color stripe */}
                <div className="team-stripe h-10" style={{ backgroundColor: teamColor }} />

                {/* Position badge */}
                <div className={posClass(car.pos)}>
                  {car.pos}
                </div>

                {/* Driver name + team */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {driver?.name && DRIVER_FLAGS[driver.name] && (
                      <img
                        src={DRIVER_FLAGS[driver.name]}
                        alt=""
                        className="flex-shrink-0"
                        style={{ width: 20, height: 13, objectFit: 'cover', borderRadius: 0 }}
                      />
                    )}
                    <span className="text-[13px] font-bold truncate"
                          style={{ fontFamily: "var(--font-ui)" }}>
                      {driver?.name || `Car ${car.i}`}
                    </span>
                    <AnimatePresence>
                      {driver?.ai === 0 && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-[1px] bg-[var(--m-blue-dark)]/20 text-[var(--m-blue-dark)] border border-[var(--m-blue-dark)]/30"
                          style={{ fontFamily: "var(--font-ui)", borderRadius: 0 }}
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
                  <div className="flex items-center gap-2 mt-0.5">
                    {driver && TEAM_LOGOS[driver.team] && (
                      <img
                        src={TEAM_LOGOS[driver.team]}
                        alt=""
                        style={{ height: 11, width: 'auto', maxWidth: 40, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.5 }}
                      />
                    )}
                    <span className="text-[10px] text-[var(--muted)]">
                      {driver ? (TEAM_NAMES[driver.team] || '') : ''}
                    </span>
                  </div>
                </div>

                {/* Tyre compound + age */}
                {tyreInfo && (
                  <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <div
                      className="w-[12px] h-[12px]"
                      style={{ backgroundColor: tyreInfo.color, borderRadius: 0 }}
                    />
                    <span className="text-[10px] text-[var(--muted)] tabular-nums font-mono">
                      {status?.tyreAge ?? ''}L
                    </span>
                  </div>
                )}

                {/* Gap + Last lap */}
                <div className="text-right flex-shrink-0 w-[96px]">
                  <div className="text-[11px] font-mono text-[var(--muted)] tabular-nums">
                    {car.pos === 1 ? (
                      <span className="text-[var(--muted)] tracking-wider text-[10px]">INTERVAL</span>
                    ) : (
                      formatGap(car.dFront)
                    )}
                  </div>
                  <motion.div
                    key={car.lastLap}
                    initial={{ color: '#0fa336' }}
                    animate={{ color: 'var(--foreground)' }}
                    transition={{ duration: 1.5 }}
                    className="text-[12px] font-mono tabular-nums font-bold"
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
            <div className="w-6 h-6 border-2 border-[var(--m-red)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] text-[var(--muted-foreground)]"
                  style={{ fontFamily: "var(--font-ui)" }}>
              WAITING FOR DATA
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
