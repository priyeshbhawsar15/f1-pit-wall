'use client';

import { useTelemetryStore } from '@/stores/telemetryStore';
import { ERS_DEPLOY_MODES } from '@/lib/constants';
import { Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_ERS_STORE = 4000000;
const BMW_FONT = { fontFamily: "var(--font-ui)" };

export default function ERSMonitor() {
  const selectedCarIndex = useTelemetryStore((s) => s.selectedCarIndex);
  const carStatus = useTelemetryStore((s) => s.carStatus);

  const status = carStatus.find((s) => s.i === selectedCarIndex);

  const storePct = status ? Math.min((status.ersStore / MAX_ERS_STORE) * 100, 100) : 0;
  const deployMode = status ? (ERS_DEPLOY_MODES[status.ersMode] || 'Unknown') : '---';

  const modeColor: Record<string, string> = {
    None: 'var(--muted)',
    Medium: 'var(--m-blue-dark)',
    Hotlap: 'var(--warning)',
    Overtake: 'var(--success)',
  };

  const barColor = storePct > 50 ? 'var(--success)' : storePct > 20 ? 'var(--warning)' : 'var(--m-red)';

  return (
    <motion.div
      className="card card-green"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <div className="card-header">
        <span className="card-title">ERS</span>
        <Zap size={11} className="text-[var(--warning)]" />
      </div>

      <div className="p-5 space-y-4">
        {/* Energy store bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider" style={BMW_FONT}>
              Energy Store
            </span>
            <span className="text-sm font-mono font-bold tabular-nums">
              {status ? (status.ersStore / 1000000).toFixed(2) : '-.--'} <span className="text-[10px] text-[var(--muted)]">MJ</span>
            </span>
          </div>
          <div className="h-2 bg-[var(--surface)] overflow-hidden" style={{ borderRadius: 0 }}>
            <motion.div
              className="h-full"
              style={{ backgroundColor: barColor, borderRadius: 0 }}
              animate={{ width: `${storePct}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Deploy mode badge */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider" style={BMW_FONT}>
            Deploy Mode
          </span>
          <AnimatePresence mode="wait">
            <motion.div
              key={deployMode}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <Zap size={12} style={{ color: modeColor[deployMode] || 'var(--muted)' }} />
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ ...BMW_FONT, color: modeColor[deployMode] || 'var(--muted)' }}>
                {deployMode}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Power grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'ICE', value: status ? `${(status.iceW / 1000).toFixed(0)}` : '---', unit: 'kW' },
            { label: 'MGU-K', value: status ? `${(status.mgukW / 1000).toFixed(0)}` : '---', unit: 'kW' },
            { label: 'K Harvest', value: status ? (status.ersK / 1000000).toFixed(3) : '-.---', unit: 'MJ', color: 'var(--success)' },
            { label: 'H Harvest', value: status ? (status.ersH / 1000000).toFixed(3) : '-.---', unit: 'MJ', color: 'var(--success)' },
          ].map((item) => (
            <div key={item.label} className="stat-block">
              <div className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider mb-1" style={BMW_FONT}>{item.label}</div>
              <div className="text-[13px] font-mono font-bold tabular-nums" style={item.color ? { color: item.color } : undefined}>
                {item.value} <span className="text-[10px] text-[var(--muted)]">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Deployed this lap */}
        <div className="stat-block flex items-center justify-between">
          <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider" style={BMW_FONT}>
            Deployed
          </span>
          <span className="text-[13px] font-mono font-bold text-[var(--m-red)] tabular-nums">
            {status ? (status.ersDeployed / 1000000).toFixed(3) : '-.---'} <span className="text-[10px] text-[var(--muted)]">MJ</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
