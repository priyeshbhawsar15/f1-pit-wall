import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'F1 25 Live Telemetry',
  description: 'Real-time F1 25 telemetry dashboard with track map, leaderboard, and race analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen ambient-bg">
        {children}
      </body>
    </html>
  );
}
