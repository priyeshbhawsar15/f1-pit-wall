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

  const is2026 = session?.formula === 13;

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
        const ersPct = status ? Math.min((status.ersStore / MAX_ERS_STORE) * 100, 100) : null;
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
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-header">
        <span className="card-title">Players</span>
        <span className="text-[9px] text-[var(--muted-foreground)]" style={BMW_FONT}>
          {humanPlayers.length} tracked
        </span>
      </div>

      <div className="p-4 space-y-3">
        {humanPlayers.length === 0 ? (
          <div className="text-center py-8 text-[10px] text-[var(--muted-foreground)]" style={BMW_FONT}>
            WAITING FOR HUMAN PLAYERS
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {humanPlayers.map(({ driver, lap, status, aero, tyreInfo, ersPct, raceState }, index) => {
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
                <motion.div
                  key={driver.i}
                  className={`border border-[var(--card-border)] bg-[var(--surface)] p-3 ${isSelected ? 'ring-1 ring-[var(--m-blue-dark)]' : ''}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ borderRadius: 0 }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="team-stripe h-12" style={{ backgroundColor: teamColor }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="pos-badge">{lap?.pos ?? '--'}</div>
                        {driver.name && DRIVER_FLAGS[driver.name] && (
                          <img
                            src={DRIVER_FLAGS[driver.name]}
                            alt=""
                            style={{ width: 20, height: 13, objectFit: 'cover', borderRadius: 0 }}
                          />
                        )}
                        <span className="text-[13px] font-bold truncate" style={BMW_FONT}>
                          {driver.name || `Car ${driver.i}`}
                        </span>
                        {isSelected && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-[1px] bg-[var(--m-blue-dark)]/20 text-[var(--m-blue-dark)] border border-[var(--m-blue-dark)]/30" style={{ ...BMW_FONT, borderRadius: 0 }}>
                            SELECTED
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

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Gap', value: gapValue, accent: lap?.pos === 1 ? '#FFD700' : undefined },
                      { label: 'Lap', value: lap ? `${lap.lap}` : '--' },
                      { label: 'Last Lap', value: lap?.lastLap ? formatLapTime(lap.lastLap) : '--:--.---' },
                      { label: 'Tyres', value: tyreInfo ? `${tyreInfo.name} · ${status?.tyreAge ?? '--'}L` : '---' },
                      ...(is2026 ? [
                        {
                          label: 'Overtake',
                          value: aero?.otActive ? 'ACTIVE' : aero?.otAvail ? 'READY' : aero ? `${aero.otDist}m` : '---',
                          accent: aero?.otActive ? 'var(--warning)' : aero?.otAvail ? 'var(--success)' : undefined,
                        },
                        {
                          label: 'Aero',
                          value: aero?.aeroAvail ? (aero.aeroMode === 1 ? 'STRAIGHT' : 'CORNER') : '---',
                          accent: aero?.aeroAvail && aero.aeroMode === 1 ? 'var(--success)' : undefined,
                        },
                      ] : [
                        { label: 'ERS', value: ersPct !== null ? `${Math.round(ersPct)}%` : '---' },
                        { label: 'Fuel', value: status ? `${status.fuelLaps.toFixed(1)} LAPS` : '---' },
                      ]),
                      ...(!is2026 ? [] : [
                        { label: 'ERS', value: ersPct !== null ? `${Math.round(ersPct)}%` : '---' },
                        { label: 'Fuel', value: status ? `${status.fuelLaps.toFixed(1)} LAPS` : '---' },
                      ]),
                      { label: 'Penalties', value: lap ? `${lap.penalties}s` : '0s', accent: lap && lap.penalties > 0 ? 'var(--warning)' : undefined },
                      { label: 'State', value: raceState, accent: raceState === 'PIT' ? 'var(--warning)' : raceState.includes('PEN') ? 'var(--m-red)' : 'var(--success)' },
                    ].map((stat) => (
                      <div key={stat.label} className="stat-block">
                        <div className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider mb-1" style={BMW_FONT}>
                          {stat.label}
                        </div>
                        <div className="text-[12px] font-mono font-bold tabular-nums" style={stat.accent ? { color: stat.accent } : undefined}>
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="text-[10px] text-[var(--muted-foreground)]" style={BMW_FONT}>
          {selectedDriver
            ? `Selected: ${selectedDriver.name || `Car ${selectedDriver.i}`}. Detailed telemetry is shown below.`
            : 'Select a row in the leaderboard to open detailed telemetry, ERS, and tyre panels.'}
        </div>
      </div>
    </motion.div>
  );
}
