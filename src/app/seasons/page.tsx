'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Flag, Plus, Save, Trash2, X } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageIntro, StatusPill, Surface } from '@/components/UI';
import { requestJson, useResource } from '@/hooks/useResource';
import type { SeasonSummary } from '@/lib/frontend-types';
import { formatDate, trackName } from '@/lib/presentation';

export default function SeasonsPage() {
  const seasons = useResource<SeasonSummary[]>('/api/seasons', []);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function createSeason(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await requestJson('/api/seasons', { method: 'POST', body: JSON.stringify({ name: form.get('name'), startDate: form.get('startDate') || null, endDate: form.get('endDate') || null, isActive: form.get('isActive') === 'on' }) });
      setCreating(false); await seasons.reload();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Season could not be created'); }
    finally { setSaving(false); }
  }

  async function removeSeason(season: SeasonSummary) {
    if (!window.confirm(`Delete ${season.name}? Sessions and telemetry remain in the archive.`)) return;
    try { await requestJson(`/api/seasons/${season.id}`, { method: 'DELETE' }); await seasons.reload(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Season could not be deleted'); }
  }

  async function toggleActive(season: SeasonSummary) {
    setError(null);
    try {
      await requestJson(`/api/seasons/${season.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !season.isActive }) });
      await seasons.reload();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Season status could not be changed'); }
  }

  return <div className="page-shell">
    <PageIntro title="Season Library" description="Group race weekends into a championship story. Each season connects its calendar, standings, and direct paths back into replay." meta={<><StatusPill tone="blue">{seasons.data?.length || 0} seasons</StatusPill>{seasons.data?.some((season) => season.isActive) && <StatusPill tone="live">Active championship</StatusPill>}</>} actions={<button className="button" onClick={() => setCreating(true)}><Plus />New season</button>} />
    <Surface title="Championships" caption="Active and archived race collections">
      {creating && <form className="inline-form" onSubmit={createSeason}><div className="form-grid"><div className="field field-full"><label htmlFor="name">Season name</label><input className="input" name="name" id="name" required autoFocus placeholder="2026 Championship" /></div><div className="field"><label htmlFor="startDate">Start date</label><input className="input" name="startDate" id="startDate" type="date" /></div><div className="field"><label htmlFor="endDate">End date</label><input className="input" name="endDate" id="endDate" type="date" /></div><label className="check-field field-full"><input name="isActive" type="checkbox" />Make this the active season</label></div>{error && <p className="form-error">{error}</p>}<div className="form-actions"><button className="button button-quiet" type="button" onClick={() => setCreating(false)}><X />Cancel</button><button className="button" disabled={saving}><Save />{saving ? 'Creating…' : 'Create season'}</button></div></form>}
      {!creating && error && <div className="inline-error">{error}</div>}
      {seasons.loading ? <LoadingState label="Loading seasons" /> : seasons.error ? <ErrorState message={seasons.error} onRetry={seasons.reload} /> : seasons.data?.length ? <div className="season-grid">{seasons.data.map((season) => <article className="season-card" key={season.id}><div className="season-card-top"><Flag /><StatusPill tone={season.isActive ? 'live' : 'neutral'}>{season.isActive ? 'Active' : 'Archived'}</StatusPill></div><h2>{season.name}</h2><p>{season.startDate || season.endDate ? `${formatDate(season.startDate)} — ${formatDate(season.endDate)}` : 'Open date range'}</p><div className="season-progress"><strong>{season._count.races}</strong><span>races linked</span><i style={{ width: `${Math.min(100, season._count.races / 24 * 100)}%` }} /></div>{season.races[0] && <small><CalendarDays />Started at {trackName(season.races[0].session.trackId)}</small>}<div className="season-actions"><button className="button button-quiet" onClick={() => toggleActive(season)}>{season.isActive ? 'Archive' : 'Make active'}</button><button className="button button-danger button-icon" aria-label={`Delete ${season.name}`} onClick={() => removeSeason(season)}><Trash2 /></button><Link className="button" href={`/seasons/${season.id}`}>Open season<ArrowRight /></Link></div></article>)}</div> : <EmptyState title="Build the first championship" message="A season turns standalone sessions into a calendar and points race." action={<button className="button" onClick={() => setCreating(true)}><Plus />Create season</button>} />}
    </Surface>
  </div>;
}
