import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PlayerProvider } from '@/contexts/PlayerContext';
import MusicPlayer from '@/components/MusicPlayer';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import YouTubePlayer from '@/components/YouTubePlayer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Rythm – Music for Everyone',
  description: 'Stream your favorite music. Discover new artists, playlists and albums on Rythm.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Rythm',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#121212',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.variable}>
        <PlayerProvider>
          <div className="app-layout">
            <Sidebar />
            <div className="main-content">
              <main className="page-scroll">
                {children}
              </main>
            </div>
          </div>
          <YouTubePlayer />
          <MusicPlayer />
          <BottomNav />
        </PlayerProvider>
      </body>
    </html>
  );
}
