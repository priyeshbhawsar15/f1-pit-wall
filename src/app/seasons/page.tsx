'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronRight, Flag, Calendar, CheckCircle2, X, Check } from 'lucide-react';
import { TRACK_NAMES, SESSION_TYPES } from '@/lib/constants';
import AppHeader from '@/components/AppHeader';

const BMW_FONT = { fontFamily: "var(--font-ui)" };

interface Season {
  id: string; name: string; startDate: string | null; endDate: string | null;
  isActive: boolean; createdAt: string;
  races: { session: { id: string; trackId: number; sessionType: number; createdAt: string } }[];
  _count: { races: number };
}

interface MatchingSession { id: string; trackId: number; sessionType: number; createdAt: string; }

function CreateSeasonModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ season: any; matchingSessions: MatchingSession[] } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  async function handleCreate() {
    setSaving(true);
    const res = await fetch('/api/seasons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, startDate: startDate || null, endDate: endDate || null, isActive }),
    });
    const data = await res.json();
    if (data.matchingSessions?.length > 0) {
      setPreview(data);
      setSelectedIds(new Set(data.matchingSessions.map((s: MatchingSession) => s.id)));
    } else {
      onCreated();
      onClose();
    }
    setSaving(false);
  }

  async function handleConfirmAdd() {
    if (!preview) return;
    setSaving(true);
    await fetch(`/api/seasons/${preview.season.id}/races`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionIds: Array.from(selectedIds) }),
    });
    onCreated();
    onClose();
    setSaving(false);
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="card w-full max-w-md mx-4 p-6 relative max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--muted)] hover:text-white"><X size={16} /></button>
        <h2 className="text-sm font-bold mb-4" style={BMW_FONT}>{preview ? 'Add Existing Races?' : 'New Season'}</h2>

        {!preview ? (
          <>
            <label className="block text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={BMW_FONT}>Season Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 2025 Championship"
              className="w-full bg-[var(--surface)] border border-[var(--card-border)] rounded-sm px-3 py-2 text-sm mb-4 focus:outline-none focus:border-[var(--m-blue-dark)]" />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={BMW_FONT}>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--card-border)] rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--m-blue-dark)]" />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={BMW_FONT}>End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--card-border)] rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--m-blue-dark)]" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer mb-5">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[var(--m-red)]" />
              <span className="text-xs text-[var(--foreground)]">Active season (auto-add new races)</span>
            </label>

            <button onClick={handleCreate} disabled={!name.trim() || saving}
              className="w-full bg-[var(--m-red)] hover:bg-[var(--m-red)]/80 disabled:opacity-40 text-white text-sm font-bold py-2 rounded-sm transition-colors flex items-center justify-center gap-2"
              style={BMW_FONT}>
              <Check size={14} /> Create Season
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-[var(--muted-foreground)] mb-3">
              {preview.matchingSessions.length} session{preview.matchingSessions.length !== 1 ? 's' : ''} found in this date range. Select which to add:
            </p>
            <div className="space-y-1.5 mb-4 max-h-64 overflow-y-auto">
              {preview.matchingSessions.map((s) => (
                <label key={s.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-sm hover:bg-white/5">
                  <input type="checkbox" checked={selectedIds.has(s.id)}
                    onChange={(e) => {
                      const next = new Set(selectedIds);
                      e.target.checked ? next.add(s.id) : next.delete(s.id);
                      setSelectedIds(next);
                    }} className="w-4 h-4 accent-[var(--m-red)]" />
                  <div>
                    <div className="text-xs font-semibold">{TRACK_NAMES[s.trackId] || `Track ${s.trackId}`}</div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">
                      {SESSION_TYPES[s.sessionType]} · {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { onCreated(); onClose(); }}
                className="flex-1 bg-[var(--surface)] text-xs py-2 rounded-sm hover:bg-[var(--surface-hover)] transition-colors" style={BMW_FONT}>
                Skip
              </button>
              <button onClick={handleConfirmAdd} disabled={selectedIds.size === 0 || saving}
                className="flex-1 bg-[var(--m-red)] hover:bg-[var(--m-red)]/80 disabled:opacity-40 text-white text-xs font-bold py-2 rounded-sm transition-colors" style={BMW_FONT}>
                Add {selectedIds.size} Race{selectedIds.size !== 1 ? 's' : ''}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function loadSeasons() {
    const res = await fetch('/api/seasons');
    const data = await res.json();
    if (Array.isArray(data)) setSeasons(data);
    setLoading(false);
  }

  useEffect(() => { loadSeasons(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this season? Race data is kept.')) return;
    await fetch(`/api/seasons/${id}`, { method: 'DELETE' });
    loadSeasons();
  }

  async function toggleActive(s: Season) {
    await fetch(`/api/seasons/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    loadSeasons();
  }

  return (
    <div className="min-h-screen">
      <AppHeader title="SEASONS" />

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={BMW_FONT}>Seasons</h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{seasons.length} seasons</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[var(--m-red)] hover:bg-[var(--m-red)]/80 text-white text-xs font-bold px-4 py-2 rounded-sm transition-colors" style={BMW_FONT}>
            <Plus size={13} /> New Season
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--m-red)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : seasons.length === 0 ? (
          <div className="card p-12 text-center">
            <Calendar size={32} className="text-[var(--muted)] mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">No seasons yet</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">Create a season to group races and track standings over time.</p>
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-[var(--m-red)] hover:bg-[var(--m-red)]/80 text-white text-xs font-bold px-4 py-2 rounded-sm transition-colors" style={BMW_FONT}>
              <Plus size={13} /> Create First Season
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {seasons.map((s, i) => (
              <motion.div key={s.id} className="card p-4 group relative"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={BMW_FONT}>{s.name}</span>
                      {s.isActive && (
                        <span className="pill pill-live text-[8px] px-1.5 py-0.5">
                          <span className="live-dot" /> ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1"><Flag size={9} /> {s._count.races} races</span>
                      {s.startDate && <span className="flex items-center gap-1"><Calendar size={9} /> {new Date(s.startDate).toLocaleDateString()}{s.endDate ? ` – ${new Date(s.endDate).toLocaleDateString()}` : ''}</span>}
                      <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleActive(s)}
                      className="text-[9px] px-2 py-1 rounded-sm bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-1"
                      style={BMW_FONT}>
                      <CheckCircle2 size={10} className={s.isActive ? 'text-[var(--green)]' : 'text-[var(--muted)]'} />
                      {s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(s.id)}
                      className="text-[9px] px-2 py-1 rounded-sm bg-[var(--surface)] text-[var(--f1-red)] hover:bg-[var(--surface-hover)] transition-colors">
                      <Trash2 size={10} />
                    </button>
                  </div>

                  <Link href={`/seasons/${s.id}`} className="flex items-center gap-1 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex-shrink-0">
                    <span className="text-[10px]" style={BMW_FONT}>View</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateSeasonModal onClose={() => setShowCreate(false)} onCreated={loadSeasons} />}
      </AnimatePresence>
    </div>
  );
}
