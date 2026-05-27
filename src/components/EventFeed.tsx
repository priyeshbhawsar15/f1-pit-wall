'use client';

import { useTelemetryStore } from '@/stores/telemetryStore';
import { EVENT_CODES } from '@/lib/constants';
import { AlertTriangle, Flag, Zap, Car, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const F1_FONT = { fontFamily: "'F1', 'Arial Black', sans-serif" };

const eventIcons: Record<string, React.ReactNode> = {
  FTLP: <Zap size={10} className="text-[var(--purple)]" />,
  RTMT: <AlertTriangle size={10} className="text-[var(--f1-red)]" />,
  DRSE: <Zap size={10} className="text-[var(--green)]" />,
  DRSD: <Zap size={10} className="text-[var(--muted)]" />,
  CHQF: <Flag size={10} className="text-white" />,
  RCWN: <Flag size={10} className="text-[var(--yellow)]" />,
  PENA: <ShieldAlert size={10} className="text-[var(--yellow)]" />,
  OVTK: <Car size={10} className="text-[var(--blue)]" />,
  SCAR: <AlertTriangle size={10} className="text-[var(--orange)]" />,
  COLL: <AlertTriangle size={10} className="text-[var(--orange)]" />,
  RDFL: <Flag size={10} className="text-[var(--f1-red)]" />,
  SPTP: <Zap size={10} className="text-[var(--blue)]" />,
  STLG: <Zap size={10} className="text-[var(--yellow)]" />,
  LGOT: <Zap size={10} className="text-[var(--green)]" />,
};

export default function EventFeed() {
  const events = useTelemetryStore((s) => s.events);
  const drivers = useTelemetryStore((s) => s.drivers);

  const getDriverName = (idx: number) => {
    const d = drivers.find((dr) => dr.i === idx);
    return d?.name || `Car ${idx}`;
  };

  const formatEventDetails = (code: string, details: any): string => {
    if (!details) return '';
    switch (code) {
      case 'FTLP':
        return details.fastestLap
          ? `${getDriverName(details.fastestLap.vehicleIdx)} - ${details.fastestLap.lapTime?.toFixed(3)}s`
          : '';
      case 'RTMT':
        return details.retirement ? getDriverName(details.retirement.vehicleIdx) : '';
      case 'OVTK':
        return details.overtake
          ? `${getDriverName(details.overtake.overtakingVehicleIdx)} overtook ${getDriverName(details.overtake.beingOvertakenVehicleIdx)}`
          : '';
      case 'PENA':
        return details.penalty ? `${getDriverName(details.penalty.vehicleIdx)} - ${details.penalty.time}s` : '';
      case 'SPTP':
        return details.speedTrap
          ? `${getDriverName(details.speedTrap.vehicleIdx)} - ${details.speedTrap.speed?.toFixed(1)} km/h`
          : '';
      case 'COLL':
        return details.collision
          ? `${getDriverName(details.collision.vehicle1Idx)} & ${getDriverName(details.collision.vehicle2Idx)}`
          : '';
      case 'SCAR':
        return details.safetyCar
          ? ['Deployed', 'Returning', 'Returned', 'Resume'][details.safetyCar.eventType] || ''
          : '';
      default:
        return '';
    }
  };

  return (
    <motion.div
      className="card card-accent"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
    >
      <div className="card-header">
        <span className="card-title">Events</span>
        <AnimatePresence mode="wait">
          {events.length > 0 && (
            <motion.span
              key={events.length}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="pill text-[8px]"
              style={{ background: 'var(--f1-red-subtle)', color: 'var(--f1-red)', ...F1_FONT }}
            >
              {events.length}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="overflow-y-auto max-h-52">
        {events.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <span className="text-[10px] text-[var(--muted-foreground)]" style={F1_FONT}>
              WAITING FOR EVENTS
            </span>
          </div>
        ) : (
          <div>
            <AnimatePresence initial={false}>
              {events.map((evt, idx) => (
                <motion.div
                  key={`${evt.code}-${idx}`}
                  initial={{ opacity: 0, x: -16, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  transition={{
                    opacity: { duration: 0.2 },
                    x: { type: 'spring', stiffness: 400, damping: 30 },
                    height: { duration: 0.15 },
                  }}
                  className="px-3 py-[6px] flex items-center gap-2 border-b border-[var(--card-border)] hover:bg-white/[0.02]"
                >
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                       style={{ background: 'var(--surface)' }}>
                    {eventIcons[evt.code] || <Zap size={10} className="text-[var(--muted)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold" style={F1_FONT}>
                      {EVENT_CODES[evt.code] || evt.code}
                    </span>
                    <span className="text-[9px] text-[var(--muted-foreground)] ml-1.5">
                      {formatEventDetails(evt.code, evt.details)}
                    </span>
                  </div>
                  {evt.timestamp && (
                    <span className="text-[8px] text-[var(--muted)] whitespace-nowrap font-mono tabular-nums flex-shrink-0">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
