import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'F1 Pit Wall',
  description: 'Live head-to-head race intelligence and session replay.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="%23c8ff3d"/><path d="M17 39a15 15 0 0 1 30 0M32 37l9-10" fill="none" stroke="%23070b0f" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="39" r="3" fill="%23070b0f"/></svg>',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#070b0f',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {/*
        THESIS: Race Theater makes the two-player battle spatial and legible; it refuses the interchangeable dashboard-card grid.
        OWN-WORLD: Night Race charcoal, Paddock Lime, Signal Coral, Electric Blue, precision sans type, flat telemetry ledgers, and a three-sector ribbon.
        STORY: Racers and spectators see who leads, why the race is changing, and can move from live context into history and replay.
        FIRST VIEWPORT: Compact navigation and race brief frame a dominant duel or track stage; controls sit at the point of use and details follow below.
        FORM: Race Theater, the seventh grounded direction; seed d3bbe847.
        FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
        */}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
