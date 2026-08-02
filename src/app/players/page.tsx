'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Save, Swords, Trash2, X } from 'lucide-react';
import { Avatar, EmptyState, ErrorState, LoadingState, PageIntro, StatusPill, Surface } from '@/components/UI';
import { requestJson, useResource } from '@/hooks/useResource';
import type { HumanProfile } from '@/lib/frontend-types';

const colors = [
  { name: 'Paddock lime', value: '#c8ff3d' },
  { name: 'Signal coral', value: '#ff4f45' },
  { name: 'Electric blue', value: '#32b6ff' },
  { name: 'Caution amber', value: '#ffca4b' },
  { name: 'Race green', value: '#4ee28a' },
  { name: 'Magenta', value: '#ff7ac8' },
  { name: 'Grid white', value: '#f7fbfd' },
];
const defaultColor = colors[0].value;

export default function PlayersPage() {
  const profiles = useResource<HumanProfile[]>('/api/players', []);
  const [editing, setEditing] = useState<Partial<HumanProfile> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const avatarFile = form.get('avatarFile');
    let avatarUrl = String(form.get('avatarUrl') || '') || null;
    try {
      if (avatarFile instanceof File && avatarFile.size > 0) {
        const upload = new FormData();
        upload.append('file', avatarFile);
        const uploaded = await requestJson<{ url: string }>('/api/players/avatar', { method: 'POST', body: upload });
        avatarUrl = uploaded.url;
      }
      const payload = { name: String(form.get('name') || ''), color: String(form.get('color') || defaultColor), avatarUrl };
      await requestJson(editing?.id ? `/api/players/${editing.id}` : '/api/players', { method: editing?.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
      setEditing(null);
      await profiles.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Profile could not be saved');
    } finally { setSaving(false); }
  }

  async function removeProfile(profile: HumanProfile) {
    if (!window.confirm(`Delete ${profile.name}? Their participant assignments will be removed.`)) return;
    setError(null);
    try {
      await requestJson(`/api/players/${profile.id}`, { method: 'DELETE' });
      await profiles.reload();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Profile could not be deleted'); }
  }

  return <div className="page-shell">
    <PageIntro title="The Drivers" description="Keep the two human racers distinct from the field. Profiles connect live car identities to career records, standings, and shared race history." meta={<StatusPill tone="blue">{profiles.data?.length || 0} profiles</StatusPill>} actions={<><Link className="button button-quiet" href="/players/h2h"><Swords />Compare drivers</Link><button className="button" onClick={() => setEditing({ color: defaultColor })}><Plus />New profile</button></>} />
    <Surface title="Driver roster" caption="Identity and race history stay connected">
      {editing && <form className="inline-form" onSubmit={saveProfile}><div className="form-grid"><div className="field"><label htmlFor="name">Driver name</label><input className="input" id="name" name="name" defaultValue={editing.name || ''} required autoFocus /></div><div className="field"><label htmlFor="avatarUrl">Avatar URL</label><input className="input" id="avatarUrl" name="avatarUrl" type="url" defaultValue={editing.avatarUrl || ''} placeholder="Optional" /></div><div className="field field-full"><label htmlFor="avatarFile">Or upload avatar</label><input className="input file-input" id="avatarFile" name="avatarFile" type="file" accept="image/png,image/jpeg,image/webp" /></div><div className="field field-full"><label>Driver color</label><div className="color-options">{colors.map((color) => <label key={color.value} className="color-choice" style={{ background: color.value }} title={color.name}><input type="radio" name="color" value={color.value} aria-label={color.name} defaultChecked={(editing.color || defaultColor) === color.value} /><span>{color.name}</span></label>)}</div></div></div>{error && <p className="form-error">{error}</p>}<div className="form-actions"><button className="button button-quiet" type="button" onClick={() => setEditing(null)}><X />Cancel</button><button className="button" disabled={saving}><Save />{saving ? 'Saving…' : 'Save driver'}</button></div></form>}
      {!editing && error && <div className="inline-error">{error}</div>}
      {profiles.loading ? <LoadingState label="Loading drivers" /> : profiles.error ? <ErrorState message={profiles.error} onRetry={profiles.reload} /> : profiles.data?.length ? <div className="card-list">{profiles.data.map((profile) => <article className="list-row" key={profile.id}><Link className="identity" href={`/players/${profile.id}`}><Avatar name={profile.name} color={profile.color} src={profile.avatarUrl} /><span><strong>{profile.name}</strong><small>Human driver profile</small></span></Link><div className="row-metric"><span>Sessions</span><strong>{profile._count?.participants || 0}</strong></div><div className="row-metric"><span>Identity</span><strong style={{ color: profile.color }}>Assigned</strong></div><div className="row-metric"><span>Created</span><strong>{profile.createdAt ? new Date(profile.createdAt).getFullYear() : '—'}</strong></div><div className="row-actions"><button className="button button-quiet button-icon" aria-label={`Edit ${profile.name}`} onClick={() => setEditing(profile)}><Pencil /></button><button className="button button-danger button-icon" aria-label={`Delete ${profile.name}`} onClick={() => removeProfile(profile)}><Trash2 /></button></div></article>)}</div> : <EmptyState title="Create the first driver" message="Profiles turn anonymous car indexes into a rivalry with history." action={<button className="button" onClick={() => setEditing({ color: defaultColor })}><Plus />Create profile</button>} />}
    </Surface>
  </div>;
}
