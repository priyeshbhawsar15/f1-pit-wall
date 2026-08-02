import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Inbox, LoaderCircle, RefreshCw } from 'lucide-react';
import { cn, initials } from '@/lib/presentation';

export function PageIntro({
  title,
  description,
  meta,
  actions,
  backHref,
}: {
  title: string;
  description: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  backHref?: string;
}) {
  return (
    <header className="page-intro">
      <div className="page-intro-copy">
        {backHref && <Link className="back-link" href={backHref}><ArrowLeft aria-hidden="true" />Back</Link>}
        <h1>{title}</h1>
        <p>{description}</p>
        {meta && <div className="page-meta">{meta}</div>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
      <SectorRibbon />
    </header>
  );
}

export function SectorRibbon({ active = 0 }: { active?: number }) {
  return <div className="sector-ribbon" aria-hidden="true"><i className={active === 0 ? 'active' : ''} /><i className={active === 1 ? 'active' : ''} /><i className={active === 2 ? 'active' : ''} /></div>;
}

export function Surface({
  title,
  caption,
  action,
  children,
  className,
}: {
  title?: string;
  caption?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn('surface', className)}>{(title || action) && <header className="surface-head"><div>{title && <h2>{title}</h2>}{caption && <p>{caption}</p>}</div>{action}</header>}{children}</section>;
}

export function LoadingState({ label = 'Loading race data' }: { label?: string }) {
  return <div className="state-block" role="status"><LoaderCircle className="spin" aria-hidden="true" /><strong>{label}</strong><span>Building the timing picture…</span></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="state-block state-error" role="alert"><AlertTriangle aria-hidden="true" /><strong>Data unavailable</strong><span>{message}</span>{onRetry && <button className="button button-quiet" onClick={onRetry}><RefreshCw aria-hidden="true" />Try again</button>}</div>;
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return <div className="state-block"><Inbox aria-hidden="true" /><strong>{title}</strong><span>{message}</span>{action}</div>;
}

export function Avatar({ name, color, src, size = 'md' }: { name: string; color?: string; src?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={cn('avatar', `avatar-${size}`)} style={{ backgroundColor: color || 'var(--surface-raised)' }}>{src ? <img src={src} alt="" /> : initials(name)}</span>;
}

export function Stat({ label, value, detail, accent }: { label: string; value: React.ReactNode; detail?: React.ReactNode; accent?: string }) {
  return <div className="stat"><span>{label}</span><strong className="tabular" style={accent ? { color: accent } : undefined}>{value}</strong>{detail && <small>{detail}</small>}</div>;
}

export function StatusPill({ tone = 'neutral', children }: { tone?: 'neutral' | 'live' | 'warning' | 'danger' | 'blue'; children: React.ReactNode }) {
  return <span className={cn('status-pill', `tone-${tone}`)}>{children}</span>;
}
