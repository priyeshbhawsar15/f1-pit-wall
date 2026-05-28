'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radio, History, Users, Trophy, Calendar, ArrowLeft } from 'lucide-react';

const BMW_FONT = { fontFamily: "var(--font-ui)" };

const navLinks = [
  { href: '/', label: 'Live', icon: Radio },
  { href: '/sessions', label: 'History', icon: History },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/standings', label: 'Standings', icon: Trophy },
  { href: '/seasons', label: 'Seasons', icon: Calendar },
];

interface AppHeaderProps {
  title?: string;
  backHref?: string;
  meta?: React.ReactNode;
}

export default function AppHeader({ title, backHref, meta }: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <div>
      <div className="red-bar" />
      <header className="f1-header flex items-center gap-4 px-6 py-4">
        {/* Optional back button */}
        {backHref && (
          <>
            <Link href={backHref} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex-shrink-0">
              <ArrowLeft size={16} />
            </Link>
            <div className="divider-v" />
          </>
        )}

        {/* Branding */}
        <Link href="/" className="flex items-center gap-2.5 mr-1 flex-shrink-0">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg"
            alt="F1"
            style={{ height: 20, width: 'auto', filter: 'brightness(0) invert(1)' }}
          />
          {title && (
            <span className="text-[11px] font-bold text-[var(--muted)] tracking-[0.2em] uppercase" style={BMW_FONT}>
              {title}
            </span>
          )}
        </Link>

        {/* Optional meta (track name, session type, etc.) */}
        {meta && (
          <>
            <div className="divider-v" />
            <div className="flex items-center gap-2 text-sm">
              {meta}
            </div>
          </>
        )}

        {/* Nav links — pushed to the right */}
        <nav className="flex items-center gap-1 ml-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[1.5px] transition-colors ${
                  isActive
                    ? 'text-[var(--foreground)] border-b-2 border-[var(--foreground)]'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
                style={BMW_FONT}
              >
                <Icon size={12} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </div>
  );
}
