'use client';

import { useMemo, useState } from 'react';
import { Activity, BatteryCharging, CircleGauge, CloudSun, Flag, Fuel, Radio, Route, ShieldCheck, Timer, Wrench } from 'lucide-react';
import { PageIntro, Stat, StatusPill, Surface } from '@/components/UI';
import { TrackStage } from '@/components/TrackStage';
import { useSocket } from '@/hooks/useSocket';
import { useTelemetryStore } from '@/stores/telemetryStore';
import { cn, formatGap, formatLapTime, sessionName, teamName, trackName, tyreInfo, weatherName } from '@/lib/presentation';

export default function DashboardPage() {
  useSocket();
  const store = useTelemetryStore();
  const [view, setView] = useState<'race' | 'analysis' | 'setup'>('race');

  const runningOrder = useMemo(() => [...store.lapData].sort((a, b) => a.pos - b.pos), [store.lapData]);
  const humanDrivers = useMemo(() => {
    const candidates = store.drivers.filter((driver) => driver.ai === 0);
    const source = candidates.length >= 2 ? candidates : store.drivers.slice(0, 2);
    return source.slice(0, 2);
  }, [store.drivers]);

  const playerCards = humanDrivers.map((driver) => {
    const lap = store.lapData.find((item) => item.i === driver.i);
    const telemetry = store.telemetry.find((item) => item.i === driver.i);
    const status = store.carStatus.find((item) => item.i === driver.i);
    const aero = store.carTelemetry2.find((item) => item.i === driver.i);
    return { driver, lap, telemetry, status, aero };
  });

  const mapCars = store.motion.map((car) => {
    const driver = store.drivers.find((item) => item.i === car.i);
    const lap = store.lapData.find((item) => item.i === car.i);
    return { ...car, name: driver?.name || `Car ${car.i + 1}`, team: driver?.team, position: lap?.pos, player: humanDrivers.some((human) => human.i === car.i) };
  });

  const battleGap = playerCards.length === 2 && playerCards[0].lap && playerCards[1].lap
    ? Math.abs(playerCards[0].lap.dLeader - playerCards[1].lap.dLeader)
    : null;

  return (
    <div className="page-shell page-shell-wide live-page">
      <PageIntro
        title={store.session ? trackName(store.session.trackId) : 'Live Race Theater'}
        description={store.session ? `${sessionName(store.session.sessionType)} · Lap ${runningOrder[0]?.lap || 0} of ${store.session.totalLaps}` : 'Waiting for F1 telemetry. The moment a session connects, the player battle takes over this stage.'}
        meta={<><StatusPill tone={store.connected && store.session ? 'live' : 'warning'}>{store.connected ? (store.session ? 'Race data live' : 'Socket ready · waiting for session') : 'Waiting for game'}</StatusPill>{store.session && <StatusPill tone="blue">{weatherName(store.session.weather)} · {store.session.trackTemperature}° track</StatusPill>}</>}
        actions={<div className="view-switch" role="group" aria-label="Dashboard view">{(['race', 'analysis', 'setup'] as const).map((item) => <button key={item} className={cn('view-button', view === item && 'is-active')} onClick={() => setView(item)}>{item === 'race' ? <Radio /> : item === 'analysis' ? <Activity /> : <Wrench />}{item}</button>)}</div>}
      />

      {view === 'race' && <>
        <section className="duel-board" aria-label="Player battle">
          {playerCards.length ? playerCards.map(({ driver, lap, telemetry, status, aero }, index) => {
            const tyre = tyreInfo(status?.tyre);
            return <article className="competitor-lane" key={driver.i}>
              <div className="competitor-position"><span>P</span><strong>{lap?.pos || '—'}</strong></div>
              <div className="competitor-name"><span>{index === 0 ? 'Player one' : 'Player two'}</span><h2>{driver.name}</h2><small>{teamName(driver.team)} · #{driver.num}</small></div>
              <div className="competitor-primary"><Stat label="Last lap" value={formatLapTime(lap?.lastLap)} /><Stat label="Gap to leader" value={formatGap(lap?.dLeader)} accent={index === 0 ? 'var(--lime)' : 'var(--blue)'} /></div>
              <div className="competitor-strip"><span><i style={{ background: tyre.color }} />{tyre.name} · {status?.tyreAge ?? '—'}L</span><span>{telemetry?.spd ?? '—'} km/h</span>{aero?.is26 === 1 && <span>{aero.otActive ? 'Overtake active' : aero.aeroMode ? 'Straight aero' : 'Corner aero'}</span>}</div>
            </article>;
          }) : <div className="duel-placeholder"><div><span>Player one</span><strong>Waiting for participants</strong></div><div className="duel-versus"><b>VS</b><span>socket connected</span></div><div><span>Player two</span><strong>Start an on-track session</strong></div></div>}
          {playerCards.length === 2 && <div className="battle-call"><span>Live interval</span><strong>{formatGap(battleGap)}</strong><small>{battleGap !== null && battleGap < 1000 ? 'The battle is inside one second' : 'Track position advantage'}</small></div>}
        </section>

        <div className="race-workspace">
          <TrackStage cars={mapCars} />
          <Surface title="Running order" caption="Players stay highlighted in the field" className="order-panel surface-flat">
            <div className="compact-order">
              {runningOrder.length ? runningOrder.slice(0, 12).map((lap) => {
                const driver = store.drivers.find((item) => item.i === lap.i);
                const isHuman = humanDrivers.some((item) => item.i === lap.i);
                return <button key={lap.i} onClick={() => store.setSelectedCarIndex(lap.i)} className={cn('order-row', isHuman && 'is-human')}><b>P{lap.pos}</b><span>{driver?.name || `Car ${lap.i + 1}`}</span><small>{lap.pos === 1 ? 'Leader' : formatGap(lap.dLeader)}</small></button>;
              }) : <div className="order-empty"><Flag /><strong>No running order yet</strong><span>Lap timing will appear when the game starts sending packets.</span></div>}
            </div>
          </Surface>
        </div>

        <div className="live-context-grid">
          <Surface title="Race context" caption="The story around the two drivers" className="surface-flat"><div className="context-ledger"><div><CloudSun /><Stat label="Weather" value={store.session ? weatherName(store.session.weather) : '—'} /></div><div><Timer /><Stat label="Time left" value={store.session ? `${Math.floor(store.session.sessionTimeLeft / 60)}m` : '—'} /></div><div><Route /><Stat label="Circuit" value={store.session ? `${(store.session.trackLength / 1000).toFixed(1)} km` : '—'} /></div><div><ShieldCheck /><Stat label="Race control" value={store.session?.safetyCarStatus ? 'Safety car' : 'Green'} /></div></div></Surface>
          <Surface title="Selected car" caption="Technical detail follows the race stage" className="surface-flat"><SelectedTelemetry /></Surface>
          <Surface title="Latest moments" caption="State changes, not a noisy ticker" className="surface-flat"><div className="event-list">{store.events.length ? store.events.slice(0, 5).map((event, index) => <div key={`${event.code}-${index}`}><i /><span>{event.code}</span><strong>{String(event.details?.name || event.details?.event || 'Race update')}</strong></div>) : <div className="quiet-message">Race events will collect here as the session unfolds.</div>}</div></Surface>
        </div>
      </>}

      {view === 'analysis' && <AnalysisView />}
      {view === 'setup' && <SetupView />}
    </div>
  );
}

function SelectedTelemetry() {
  const store = useTelemetryStore();
  const selected = store.selectedCarIndex ?? store.drivers.find((driver) => driver.ai === 0)?.i ?? 0;
  const driver = store.drivers.find((item) => item.i === selected);
  const telemetry = store.telemetry.find((item) => item.i === selected);
  const status = store.carStatus.find((item) => item.i === selected);
  return <div className="telemetry-ledger"><div className="telemetry-hero"><CircleGauge /><span><strong>{telemetry?.spd ?? 0}</strong> km/h</span><b>G{telemetry?.gear ?? '—'}</b></div><div className="meter-row"><span>Throttle</span><meter min="0" max="1" value={telemetry?.thr ?? 0} /><b>{Math.round((telemetry?.thr ?? 0) * 100)}%</b></div><div className="meter-row brake"><span>Brake</span><meter min="0" max="1" value={telemetry?.brk ?? 0} /><b>{Math.round((telemetry?.brk ?? 0) * 100)}%</b></div><div className="technical-pair"><span><Fuel />{status?.fuelLaps?.toFixed(1) ?? '—'} laps fuel</span><span><BatteryCharging />{status ? Math.round((status.ersStore / 4_000_000) * 100) : 0}% ERS</span></div>{driver && <small className="selected-driver">Showing {driver.name}</small>}</div>;
}

function AnalysisView() {
  const store = useTelemetryStore();
  return <div className="analysis-layout"><Surface title="Lap pace" caption="Completed laps for the active player pair"><div className="chart-placeholder"><Activity /><strong>Lap history</strong><span>{store.lapHistory.length ? `${store.lapHistory.length} recorded lap splits` : 'Lap traces will appear after completed laps.'}</span></div></Surface><Surface title="Position story" caption="Place changes across the race"><div className="position-ledger">{store.positionHistory.slice(-12).map((point) => <div key={`${point.carIndex}-${point.lap}`}><span>L{point.lap}</span><b>P{point.position}</b></div>)}</div></Surface></div>;
}

function SetupView() {
  const store = useTelemetryStore();
  const setups = store.carSetups.slice(0, 2);
  return <Surface title="Setup comparison" caption="Two-car mechanical baseline"><div className="setup-grid">{setups.length ? setups.map((setup) => <article key={setup.i}><h3>Car {setup.i + 1}</h3><Stat label="Wings" value={`${setup.frontWing} / ${setup.rearWing}`} detail="Front / rear" /><Stat label="Differential" value={`${setup.onThrottle}%`} detail="On throttle" /><Stat label="Brake bias" value={`${setup.brakeBias}%`} /><Stat label="Fuel" value={`${setup.fuelLoad.toFixed(1)} kg`} /></article>) : <div className="quiet-message">Setup packets have not arrived. This view stays ready without inventing data.</div>}</div></Surface>;
}
