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
import HumanPlayersOverview from '@/components/HumanPlayersOverview';
import { motion, AnimatePresence } from 'framer-motion';

const tabVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export default function Dashboard() {
  useSocket();
  const activeTab = useTelemetryStore((s) => s.activeTab);
  const selectedCarIndex = useTelemetryStore((s) => s.selectedCarIndex);

  return (
    <div className="flex flex-col h-screen">
      <SessionInfo />

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
            className="dashboard-shell flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden"
          >
            <aside className="xl:col-span-4 min-h-[32rem] xl:min-h-0 xl:h-full">
              <Leaderboard />
            </aside>
            <main className="xl:col-span-8 flex flex-col gap-4 overflow-y-auto min-h-0">
              <HumanPlayersOverview />
              {selectedCarIndex !== null && (
                <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4">
                  <TelemetryPanel />
                  <ERSMonitor />
                  <TyreStrategy />
                </div>
              )}
              <EventFeed />
              <TrackMap />
            </main>
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
            className="dashboard-shell flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden"
          >
            <div className="xl:col-span-4 overflow-y-auto min-h-[28rem] xl:min-h-0">
              <Leaderboard />
            </div>
            <div className="xl:col-span-8 flex flex-col gap-4 overflow-y-auto min-h-0">
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
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
            className="dashboard-shell flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden"
          >
            <div className="xl:col-span-4 overflow-y-auto min-h-[28rem] xl:min-h-0">
              <Leaderboard />
            </div>
            <div className="xl:col-span-5 overflow-y-auto min-h-0">
              <CarSetupComparison />
            </div>
            <div className="xl:col-span-3 flex flex-col gap-4 overflow-y-auto min-h-0">
              {selectedCarIndex !== null ? (
                <>
                  <TelemetryPanel />
                  <TyreStrategy />
                </>
              ) : (
                <div className="card p-8 text-center">
                  <span className="text-[10px] text-[var(--muted-foreground)]" style={{ fontFamily: 'var(--font-ui)' }}>
                    SELECT A DRIVER FROM THE LEADERBOARD
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
