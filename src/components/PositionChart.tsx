'use client';

import { useMemo } from 'react';
import { useTelemetryStore } from '@/stores/telemetryStore';
import { TEAM_COLORS } from '@/lib/constants';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const F1_FONT = { fontFamily: "'F1', 'Arial Black', sans-serif" };

export default function PositionChart() {
  const positionHistory = useTelemetryStore((s) => s.positionHistory);
  const drivers = useTelemetryStore((s) => s.drivers);

  const chartData = useMemo(() => {
    if (!positionHistory || positionHistory.length === 0) return [];

    const lapMap = new Map<number, Record<string, number>>();

    for (const entry of positionHistory) {
      if (!lapMap.has(entry.lap)) {
        lapMap.set(entry.lap, { lap: entry.lap });
      }
      const row = lapMap.get(entry.lap)!;
      row[`car_${entry.carIndex}`] = entry.position;
    }

    return Array.from(lapMap.values()).sort((a, b) => a.lap - b.lap);
  }, [positionHistory]);

  const activeDrivers = useMemo(() => {
    const seen = new Set<number>();
    for (const entry of positionHistory) {
      seen.add(entry.carIndex);
    }
    return drivers.filter((d) => seen.has(d.i));
  }, [positionHistory, drivers]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    const sorted = [...payload].sort((a: any, b: any) => a.value - b.value);
    return (
      <div className="bg-[#1a1a1a] border border-[var(--card-border)] rounded-lg px-3 py-2 shadow-xl max-h-64 overflow-y-auto">
        <p className="text-xs font-semibold mb-1.5 text-[var(--muted-foreground)]">Lap {label}</p>
        {sorted.map((p: any) => {
          const carIdx = parseInt(p.dataKey.replace('car_', ''), 10);
          const driver = drivers.find((d) => d.i === carIdx);
          return (
            <div key={p.dataKey} className="text-[11px] flex items-center gap-2 py-0.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.stroke }} />
              <span className="font-mono w-5 text-right font-bold">P{p.value}</span>
              <span className="text-[var(--muted-foreground)] truncate">{driver?.name || `Car ${carIdx}`}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <div className="card-header">
        <span className="card-title">Positions</span>
      </div>
      <div className="p-3 h-64">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[10px] text-[var(--muted-foreground)]" style={F1_FONT}>
            WAITING FOR POSITION DATA
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <XAxis
                dataKey="lap"
                tick={{ fill: '#666', fontSize: 10 }}
                axisLine={{ stroke: '#2a2a2a' }}
                tickLine={false}
              />
              <YAxis
                reversed
                domain={[1, 'dataMax']}
                tick={{ fill: '#666', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `P${v}`}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              {activeDrivers.map((d) => (
                <Line
                  key={d.i}
                  type="monotone"
                  dataKey={`car_${d.i}`}
                  stroke={TEAM_COLORS[d.team] || '#666'}
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
