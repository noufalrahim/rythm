'use client';

import { Music4, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--bg-base, #121212)',
            color: 'var(--text-primary, #fff)',
            gap: '24px',
            padding: '24px',
            textAlign: 'center',
        }}>
            <div style={{
                width: 80, height: 80,
                borderRadius: '50%',
                background: 'rgba(29,185,84,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <WifiOff size={36} style={{ color: '#1DB954' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Music4 size={28} style={{ color: '#1DB954' }} />
                <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>Rythm</span>
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>You&#39;re offline</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, maxWidth: 300 }}>
                Check your internet connection and try again. Your playlists will be available once you&#39;re back online.
            </p>

            <button
                onClick={() => window.location.reload()}
                style={{
                    background: '#1DB954',
                    color: '#000',
                    border: 'none',
                    borderRadius: '24px',
                    padding: '12px 32px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                }}
            >
                Try Again
            </button>

            <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                Back to Home
            </Link>
        </div>
    );
}
