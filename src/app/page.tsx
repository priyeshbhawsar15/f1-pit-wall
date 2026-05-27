'use client';

import { useSocket } from '@/hooks/useSocket';
import { useTelemetryStore } from '@/stores/telemetryStore';
import SessionInfo from '@/components/SessionInfo';
import TrackMap from '@/components/TrackMap';
import Leaderboard from '@/components/Leaderboard';
import TelemetryPanel from '@/components/TelemetryPanel';
import ERSMonitor from '@/components/ERSMonitor';
import TyreStrategy from '@/components/TyreStrategy';
import EventFeed from '@/components/EventFeed';
import LapTimeChart from '@/components/LapTimeChart';
import PositionChart from '@/components/PositionChart';
import CarSetupComparison from '@/components/CarSetupComparison';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Radio, Settings2 } from 'lucide-react';

const tabVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

const tabs = [
  { key: 'live', label: 'Live', icon: Radio },
  { key: 'charts', label: 'Charts', icon: BarChart3 },
  { key: 'setup', label: 'Setup', icon: Settings2 },
] as const;

export default function Dashboard() {
  useSocket();
  const activeTab = useTelemetryStore((s) => s.activeTab);
  const setActiveTab = useTelemetryStore((s) => s.setActiveTab);

  return (
    <div className="flex flex-col h-screen">
      <SessionInfo />

      {/* Tab bar */}
      <div className="px-3 pt-2">
        <div className="tab-bar max-w-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className={`tab-item flex items-center justify-center gap-1.5 ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon size={11} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content with animated tab transitions */}
      <AnimatePresence mode="wait">
        {activeTab === 'live' && (
          <motion.div
            key="live"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="flex-1 grid grid-cols-12 gap-2 p-2 overflow-hidden min-h-0"
          >
            <div className="col-span-3 overflow-y-auto min-h-0">
              <Leaderboard />
            </div>
            <div className="col-span-5 flex flex-col gap-2 overflow-y-auto min-h-0">
              <TrackMap />
              <EventFeed />
            </div>
            <div className="col-span-4 flex flex-col gap-2 overflow-y-auto min-h-0">
              <TelemetryPanel />
              <ERSMonitor />
              <TyreStrategy />
            </div>
          </motion.div>
        )}

        {activeTab === 'charts' && (
          <motion.div
            key="charts"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="flex-1 grid grid-cols-12 gap-2 p-2 overflow-hidden min-h-0"
          >
            <div className="col-span-3 overflow-y-auto min-h-0">
              <Leaderboard />
            </div>
            <div className="col-span-9 flex flex-col gap-2 overflow-y-auto min-h-0">
              <div className="grid grid-cols-2 gap-2">
                <LapTimeChart />
                <PositionChart />
              </div>
              <EventFeed />
            </div>
          </motion.div>
        )}

        {activeTab === 'setup' && (
          <motion.div
            key="setup"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="flex-1 grid grid-cols-12 gap-2 p-2 overflow-hidden min-h-0"
          >
            <div className="col-span-3 overflow-y-auto min-h-0">
              <Leaderboard />
            </div>
            <div className="col-span-5 overflow-y-auto min-h-0">
              <CarSetupComparison />
            </div>
            <div className="col-span-4 flex flex-col gap-2 overflow-y-auto min-h-0">
              <TelemetryPanel />
              <TyreStrategy />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
