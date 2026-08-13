'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Flag, Gauge, History, Radio, Swords, Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/presentation';

const navigation = [
  { href: '/', label: 'Live', icon: Radio },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/players/h2h', label: 'Head-to-head', icon: Swords },
  { href: '/standings', label: 'Standings', icon: Trophy },
  { href: '/seasons', label: 'Seasons', icon: Flag },
  { href: '/sessions', label: 'Sessions', icon: History },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-frame">
      <header className="site-header">
        <Link href="/" className="brand" aria-label="F1 Pit Wall home">
          <span className="brand-mark"><Gauge aria-hidden="true" /></span>
          <span><strong>PIT WALL</strong><small>Race intelligence</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return <Link key={href} href={href} className={cn('nav-link', active && 'is-active')}><Icon aria-hidden="true" />{label}</Link>;
          })}
        </nav>
        <div className="header-signal" title="F1 2025 and 2026 telemetry"><BarChart3 aria-hidden="true" /><span>25 / 26</span></div>
      </header>
      <main id="main-content">{children}</main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return <Link key={href} href={href} className={cn('mobile-nav-link', active && 'is-active')} aria-label={label}><Icon aria-hidden="true" /><span>{label === 'Head-to-head' ? 'H2H' : label}</span></Link>;
        })}
      </nav>
    </div>
  );
}
