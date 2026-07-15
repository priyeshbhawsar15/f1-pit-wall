'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DRIVER_FLAGS, TEAM_COLORS, TEAM_LOGOS, TEAM_NAMES, VISUAL_TYRE_COMPOUNDS } from '@/lib/constants';
import { formatGap, formatLapTime } from '@/lib/utils';
import { useTelemetryStore } from '@/stores/telemetryStore';

const BMW_FONT = { fontFamily: 'var(--font-ui)' };
const MAX_ERS_STORE = 4000000;

export default function HumanPlayersOverview() {
  const drivers = useTelemetryStore((s) => s.drivers);
  const lapData = useTelemetryStore((s) => s.lapData);
  const carStatus = useTelemetryStore((s) => s.carStatus);
  const carTelemetry2 = useTelemetryStore((s) => s.carTelemetry2);
  const session = useTelemetryStore((s) => s.session);
  const selectedCarIndex = useTelemetryStore((s) => s.selectedCarIndex);
  const setSelectedCarIndex = useTelemetryStore((s) => s.setSelectedCarIndex);

  const is2026 = session?.is2026 === true;

  const selectedDriver = selectedCarIndex !== null
    ? drivers.find((driver) => driver.i === selectedCarIndex)
    : null;

  const humanPlayers = useMemo(() => {
    return drivers
      .filter((driver) => driver.ai === 0)
      .map((driver) => {
        const lap = lapData.find((entry) => entry.i === driver.i);
        const status = carStatus.find((entry) => entry.i === driver.i);
        const aero = carTelemetry2.find((entry) => entry.i === driver.i);
        const tyreInfo = status ? VISUAL_TYRE_COMPOUNDS[status.tyre] : null;
        const restricted = driver.tel === 0;
        const ersPct = (!restricted && status) ? Math.min((status.ersStore / MAX_ERS_STORE) * 100, 100) : null;
        const raceState = lap?.pit
          ? 'PIT'
          : lap && lap.penalties > 0
            ? `${lap.penalties}s PEN`
            : 'RUN';

        return {
          driver,
          lap,
          status,
          aero,
          tyreInfo,
          ersPct,
          raceState,
          restricted,
        };
      })
      .sort((a, b) => {
        const aPos = a.lap?.pos ?? Number.MAX_SAFE_INTEGER;
        const bPos = b.lap?.pos ?? Number.MAX_SAFE_INTEGER;
        if (aPos !== bPos) return aPos - bPos;
        return a.driver.i - b.driver.i;
      })
      .slice(0, 2);
  }, [carStatus, carTelemetry2, drivers, lapData]);

  return (
    <motion.section
      className="card player-comparison"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-header">
        <div>
          <h2 className="card-title">Head-to-head</h2>
          <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
            The two-player race at a glance
          </p>
        </div>
        <span className="text-[10px] text-[var(--muted-foreground)]" style={BMW_FONT}>
          {humanPlayers.length}/2 live
        </span>
      </div>

      <div className="p-3 sm:p-4">
        {humanPlayers.length === 0 ? (
          <div className="text-center py-10 text-sm text-[var(--muted-foreground)]" style={BMW_FONT}>
            Waiting for the two human players
          </div>
        ) : (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-2">
            {humanPlayers.map(({ driver, lap, status, aero, tyreInfo, ersPct, raceState, restricted }, index) => {
              const isSelected = driver.i === selectedCarIndex;
              const teamColor = TEAM_COLORS[driver.team] || '#666';
              const gapValue = !lap
                ? '---'
                : lap.pos === 1
                  ? 'LEADER'
                  : lap.dFront > 0
                    ? formatGap(lap.dFront)
                    : lap.dLeader > 0
                      ? formatGap(lap.dLeader)
                      : '---';

              return (
                <motion.button
                  key={driver.i}
                  type="button"
                  data-selected={isSelected}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedCarIndex(isSelected ? null : driver.i)}
                  className="player-panel text-left"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="team-dot mt-2" style={{ backgroundColor: teamColor }} />
                    <div className="text-4xl font-bold leading-none tabular-nums tracking-[-0.03em]">
                      {lap?.pos ?? '–'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {driver.name && DRIVER_FLAGS[driver.name] && (
                          <img
                            src={DRIVER_FLAGS[driver.name]}
                            alt=""
                            style={{ width: 20, height: 13, objectFit: 'cover', borderRadius: 2 }}
                          />
                        )}
                        <span className="text-base font-bold truncate" style={BMW_FONT}>
                          {driver.name || `Car ${driver.i}`}
                        </span>
                        {isSelected && (
                          <span className="pill text-[10px] bg-[var(--m-blue-dark)]/20 text-[#67a0ff]" style={BMW_FONT}>
                            Detail open
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {TEAM_LOGOS[driver.team] && (
                          <img
                            src={TEAM_LOGOS[driver.team]}
                            alt=""
                            style={{ height: 11, width: 'auto', maxWidth: 40, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.5 }}
                          />
                        )}
                        <span className="text-[10px] text-[var(--muted-foreground)] truncate">
                          {TEAM_NAMES[driver.team] || 'Unknown Team'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="player-metrics">
                    {[
                      { label: 'Interval', value: gapValue, accent: lap?.pos === 1 ? 'var(--warning)' : undefined },
                      { label: 'Last Lap', value: lap?.lastLap ? formatLapTime(lap.lastLap) : '--:--.---' },
                      { label: 'Tyres', value: tyreInfo ? `${tyreInfo.name} · ${status?.tyreAge ?? '--'}L` : '---' },
                      { label: 'State', value: raceState, accent: raceState === 'PIT' ? 'var(--warning)' : raceState.includes('PEN') ? 'var(--m-red)' : 'var(--success)' },
                    ].map((stat) => (
                      <div key={stat.label} className="player-metric">
                        <div className="text-[10px] text-[var(--muted-foreground)] mb-1" style={BMW_FONT}>
                          {stat.label}
                        </div>
                        <div className="text-[12px] font-mono font-semibold tabular-nums truncate" style={stat.accent ? { color: stat.accent } : undefined}>
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[var(--muted-foreground)]">
                    <span>Lap <strong className="text-[var(--foreground-secondary)]">{lap?.lap ?? '–'}</strong></span>
                    <span>ERS <strong className="text-[var(--foreground-secondary)]">{restricted ? 'Restricted' : ersPct !== null ? `${Math.round(ersPct)}%` : '–'}</strong></span>
                    <span>Fuel <strong className="text-[var(--foreground-secondary)]">{restricted ? 'Restricted' : status ? `${status.fuelLaps.toFixed(1)} laps` : '–'}</strong></span>
                    {lap && lap.penalties > 0 && <span className="text-[var(--warning)]">{lap.penalties}s penalty</span>}
                    {is2026 && aero?.otAvail && <span className="text-[var(--warning)]">Overtake {aero.otActive ? 'active' : 'ready'}</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        <div className="px-2 pt-3 text-[11px] text-[var(--muted-foreground)]" style={BMW_FONT}>
          {selectedDriver
            ? `${selectedDriver.name || `Car ${selectedDriver.i}`} detail is open below.`
            : 'Select either player for telemetry, ERS, and tyre detail.'}
        </div>
      </div>
    </motion.section>
  );
}
