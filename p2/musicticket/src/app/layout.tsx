import '../index.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WaveStorm Festival - Official Ticket Site',
  description: 'Experience the ultimate electronic music festival. Buy tickets for WaveStorm 2024.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
