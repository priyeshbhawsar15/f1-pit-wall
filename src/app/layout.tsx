import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'F1 Pit Wall',
  description: 'Live head-to-head race intelligence and session replay.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="%23ff1801"/><path d="M17 39a15 15 0 0 1 30 0M32 37l9-10" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="39" r="3" fill="white"/></svg>',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#080808',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {/*
        THESIS: Race Theater makes the two-player battle spatial and legible; it refuses both the generic admin grid and the neon cyber console.
        OWN-WORLD: Broadcast black, graphite, clean white, race red, condensed italic display type, tabular timing, rounded panels, and three-line race dividers.
        STORY: Racers and spectators see who leads, why the race is changing, and can move from live context into history and replay.
        FIRST VIEWPORT: Compact race navigation and a bold session brief frame the dominant duel or map; controls stay at the point of use and evidence follows below.
        FORM: Race Broadcast Control, the sixth grounded direction; seed 0bab908f.
        FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
        */}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
