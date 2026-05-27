'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, History, UserPlus, Pencil, Trash2, Upload, X, Check, Users } from 'lucide-react';

const F1_FONT = { fontFamily: "'F1', 'Arial Black', sans-serif" };

const PRESET_COLORS = [
  '#E10600', '#FF8000', '#FFC300', '#00ff87', '#27F4D2',
  '#3671C6', '#6692FF', '#9B59B6', '#E74C3C', '#FFFFFF',
];

interface Profile {
  id: string;
  name: string;
  color: string;
  avatarUrl: string | null;
  createdAt: string;
  _count: { participants: number };
}

function ProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: Partial<Profile> | null;
  onClose: () => void;
  onSave: (data: Partial<Profile>) => void;
}) {
  const [name, setName] = useState(profile?.name || '');
  const [color, setColor] = useState(profile?.color || '#E10600');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/players/avatar', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) setAvatarUrl(data.url);
    setUploading(false);
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card w-full max-w-sm mx-4 p-6 relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--muted)] hover:text-white">
          <X size={16} />
        </button>
        <h2 className="text-sm font-bold mb-4" style={F1_FONT}>
          {profile?.id ? 'Edit Profile' : 'New Profile'}
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden cursor-pointer ring-2 ring-offset-2 ring-offset-[var(--card)]"
            style={{ backgroundColor: color, outline: `2px solid ${color}` }}
            onClick={() => fileRef.current?.click()}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xl font-black">{name.charAt(0).toUpperCase() || '?'}</span>
            )}
          </div>
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-white transition-colors"
              disabled={uploading}
            >
              <Upload size={12} />
              {uploading ? 'Uploading...' : 'Upload photo'}
            </button>
            {avatarUrl && (
              <button onClick={() => setAvatarUrl('')} className="text-[10px] text-[var(--f1-red)] mt-1 flex items-center gap-1">
                <X size={10} /> Remove
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>

        {/* Name */}
        <label className="block text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={F1_FONT}>
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Max"
          className="w-full bg-[var(--surface)] border border-[var(--card-border)] rounded-sm px-3 py-2 text-sm mb-4 focus:outline-none focus:border-[var(--accent)]"
        />

        {/* Color */}
        <label className="block text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] mb-2" style={F1_FONT}>
          Accent Color
        </label>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full transition-all"
              style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : '2px solid transparent', outlineOffset: '2px' }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent"
            title="Custom color"
          />
        </div>

        <button
          onClick={() => onSave({ name, color, avatarUrl: avatarUrl || null })}
          disabled={!name.trim()}
          className="w-full bg-[var(--accent)] hover:bg-[var(--accent-dim)] disabled:opacity-40 text-white text-sm font-bold py-2 rounded-sm transition-colors flex items-center justify-center gap-2"
          style={F1_FONT}
        >
          <Check size={14} />
          {profile?.id ? 'Save Changes' : 'Create Profile'}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function PlayersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; profile: Partial<Profile> | null }>({ open: false, profile: null });

  async function loadProfiles() {
    const res = await fetch('/api/players');
    const data = await res.json();
    if (Array.isArray(data)) setProfiles(data);
    setLoading(false);
  }

  useEffect(() => { loadProfiles(); }, []);

  async function handleSave(data: Partial<Profile>) {
    const isEdit = !!modal.profile?.id;
    const url = isEdit ? `/api/players/${modal.profile!.id}` : '/api/players';
    await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setModal({ open: false, profile: null });
    loadProfiles();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this profile? This will unlink them from all sessions.')) return;
    await fetch(`/api/players/${id}`, { method: 'DELETE' });
    loadProfiles();
  }

  return (
    <div className="min-h-screen">
      <div className="red-bar" />
      <header className="f1-header flex items-center gap-3 px-6 py-3">
        <span className="f1-logo-text">F1</span>
        <span className="text-[10px] font-bold text-[var(--muted-foreground)] tracking-[0.15em] uppercase" style={F1_FONT}>
          Players
        </span>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-white transition-colors">
            <Radio size={12} /> Live
          </Link>
          <Link href="/sessions" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-white transition-colors">
            <History size={12} /> History
          </Link>
          <Link href="/players/h2h" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-white transition-colors">
            <UserPlus size={12} /> H2H
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={F1_FONT}>Human Players</h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{profiles.length} profiles</p>
          </div>
          <button
            onClick={() => setModal({ open: true, profile: {} })}
            className="flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-dim)] text-white text-xs font-bold px-4 py-2 rounded-sm transition-colors"
            style={F1_FONT}
          >
            <UserPlus size={13} /> New Profile
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="card p-12 text-center">
            <Users size={32} className="text-[var(--muted)] mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">No players yet</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Create profiles for the human players in your races.
            </p>
            <button
              onClick={() => setModal({ open: true, profile: {} })}
              className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-dim)] text-white text-xs font-bold px-4 py-2 rounded-sm transition-colors"
              style={F1_FONT}
            >
              <UserPlus size={13} /> Add First Player
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <AnimatePresence>
              {profiles.map((p, i) => (
                <motion.div
                  key={p.id}
                  className="card p-4 group relative"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ borderTop: `2px solid ${p.color}` }}
                >
                  <Link href={`/players/${p.id}`} className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-lg font-black text-white"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        p.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate" style={F1_FONT}>{p.name}</div>
                      <div className="text-[10px] text-[var(--muted-foreground)]">
                        {p._count.participants} race{p._count.participants !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setModal({ open: true, profile: p })}
                      className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)] hover:text-white transition-colors px-2 py-1 bg-[var(--surface)] rounded-sm"
                    >
                      <Pencil size={10} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex items-center gap-1 text-[10px] text-[var(--f1-red)] hover:text-red-400 transition-colors px-2 py-1 bg-[var(--surface)] rounded-sm"
                    >
                      <Trash2 size={10} /> Delete
                    </button>
                    <Link
                      href={`/players/${p.id}`}
                      className="ml-auto text-[10px] text-[var(--accent)] hover:text-white transition-colors"
                      style={F1_FONT}
                    >
                      Stats →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal.open && (
          <ProfileModal
            profile={modal.profile}
            onClose={() => setModal({ open: false, profile: null })}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
