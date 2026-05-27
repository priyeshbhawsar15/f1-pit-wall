'use client';

import { useMemo } from 'react';
import { useTelemetryStore } from '@/stores/telemetryStore';
import { TEAM_COLORS } from '@/lib/constants';
import { formatLapTime } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const F1_FONT = { fontFamily: "'F1', 'Arial Black', sans-serif" };

export default function LapTimeChart() {
  const lapHistory = useTelemetryStore((s) => s.lapHistory);
  const drivers = useTelemetryStore((s) => s.drivers);
  const selectedCarIndex = useTelemetryStore((s) => s.selectedCarIndex);

  const chartData = useMemo(() => {
    if (!lapHistory || lapHistory.length === 0) return [];

    const lapMap = new Map<number, Record<string, number>>();

    for (const entry of lapHistory) {
      if (!lapMap.has(entry.lap)) {
        lapMap.set(entry.lap, { lap: entry.lap });
      }
      const row = lapMap.get(entry.lap)!;
      row[`car_${entry.carIndex}`] = entry.lapTimeMs;
    }

    return Array.from(lapMap.values()).sort((a, b) => a.lap - b.lap);
  }, [lapHistory]);

  const activeDrivers = useMemo(() => {
    const seen = new Set<number>();
    for (const entry of lapHistory) {
      seen.add(entry.carIndex);
    }
    return drivers.filter((d) => seen.has(d.i)).slice(0, 6);
  }, [lapHistory, drivers]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-[#1a1a1a] border border-[var(--card-border)] rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-semibold mb-1">Lap {label}</p>
        {payload.map((p: any) => {
          const carIdx = parseInt(p.dataKey.replace('car_', ''), 10);
          const driver = drivers.find((d) => d.i === carIdx);
          return (
            <p key={p.dataKey} className="text-[11px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.stroke }} />
              <span className="text-[var(--muted-foreground)]">{driver?.name || `Car ${carIdx}`}</span>
              <span className="font-mono ml-auto">{formatLapTime(p.value)}</span>
            </p>
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
      transition={{ duration: 0.3 }}
    >
      <div className="card-header">
        <span className="card-title">Lap Times</span>
        <span className="text-[9px] font-mono text-[var(--muted-foreground)]">{chartData.length} laps</span>
      </div>
      <div className="p-3 h-64">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[10px] text-[var(--muted-foreground)]" style={F1_FONT}>
            WAITING FOR LAP DATA
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
                tick={{ fill: '#666', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatLapTime(v)}
                domain={['dataMin - 2000', 'dataMax + 2000']}
                width={65}
              />
              <Tooltip content={<CustomTooltip />} />
              {activeDrivers.map((d) => (
                <Line
                  key={d.i}
                  type="monotone"
                  dataKey={`car_${d.i}`}
                  stroke={TEAM_COLORS[d.team] || '#666'}
                  strokeWidth={d.i === selectedCarIndex ? 2.5 : 1.5}
                  dot={false}
                  connectNulls
                  opacity={d.i === selectedCarIndex ? 1 : 0.5}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
