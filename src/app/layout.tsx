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
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen ambient-bg">
        {children}
      </body>
    </html>
  );
}
