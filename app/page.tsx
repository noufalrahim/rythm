'use client';

import { useEffect, useState, useCallback } from 'react';
import { Play, Youtube, Music2, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import SongCard from '@/components/SongCard';
import { usePlayer, Song } from '@/contexts/PlayerContext';

const REGIONS = [
  { code: 'US', label: '🇺🇸 US' },
  { code: 'GB', label: '🇬🇧 UK' },
  { code: 'IN', label: '🇮🇳 India' },
  { code: 'KR', label: '🇰🇷 Korea' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState('US');
  const { playSong } = usePlayer();

  const fetchTrending = useCallback(async (r: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/youtube/trending?limit=20&region=${r}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSongs(data.songs || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trending music');
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrending(region); }, [region, fetchTrending]);

  const hero = songs[0];

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="hero-banner">
        <div
          className="hero-banner-bg"
          style={hero ? {
            background: `linear-gradient(180deg, rgba(20,10,50,0.95) 0%, #121212 100%)`,
          } : {}}
        />
        {/* Background thumbnail blur */}
        {hero && (
          <div style={{
            position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0,
          }}>
            <Image
              src={hero.coverUrl}
              alt=""
              fill
              style={{ objectFit: 'cover', opacity: 0.12, filter: 'blur(40px)' }}
            />
          </div>
        )}
        <div className="hero-banner-content" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-greeting">
            <Youtube size={14} style={{ display: 'inline', marginRight: 6 }} />
            {getGreeting()} · YouTube Music Charts
          </div>
          <h1 className="hero-title">
            Trending<br />
            <span style={{ color: 'var(--green)' }}>Right Now</span>
          </h1>
          <p className="hero-subtitle">
            Top music videos from YouTube — play instantly, no sign‑in required.
          </p>
          <div className="hero-btns">
            {songs.length > 0 && (
              <button className="btn-primary" onClick={() => playSong(songs[0], songs)}>
                <Play size={18} fill="black" color="black" />
                Play Trending
              </button>
            )}
            {/* Region selector */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {REGIONS.map(r => (
                <button
                  key={r.code}
                  onClick={() => setRegion(r.code)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '50px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: region === r.code ? 'var(--green)' : 'rgba(255,255,255,0.1)',
                    color: region === r.code ? '#000' : 'var(--text-base)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="loading-spinner" />
          <span>Loading YouTube trending...</span>
        </div>
      )}

      {error && (
        <div className="empty-state">
          <Youtube size={48} style={{ color: '#FF0000', opacity: 0.7 }} />
          <h3>YouTube API not configured</h3>
          <p style={{ maxWidth: 440, textAlign: 'center' }}>
            Add your <code style={{ background: 'var(--bg-highlight)', padding: '2px 6px', borderRadius: 4 }}>YOUTUBE_API_KEY</code> to <code style={{ background: 'var(--bg-highlight)', padding: '2px 6px', borderRadius: 4 }}>.env.local</code> and restart the server.
            <br /><br />
            Get a free key at <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--green)' }}>
              console.cloud.google.com
            </a> → APIs &amp; Services → YouTube Data API v3.
          </p>
        </div>
      )}

      {!loading && !error && songs.length > 0 && (
        <>
          {/* Featured grid */}
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">
                <TrendingUp size={18} style={{ display: 'inline', marginRight: 8 }} />
                Top Picks
              </h2>
            </div>
            <div className="quick-play-grid">
              {songs.slice(0, 8).map(song => (
                <div
                  key={song._id}
                  className="quick-play-item"
                  onClick={() => playSong(song, songs)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && playSong(song, songs)}
                >
                  <div className="quick-play-cover">
                    <Image
                      src={song.coverUrl}
                      alt={song.title}
                      width={60}
                      height={60}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </div>
                  <span className="quick-play-title">{song.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full trending list */}
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">🔥 Trending Music</h2>
            </div>
            <div>
              {songs.map((song, i) => (
                <SongCard key={song._id} song={song} queue={songs} index={i} showIndex />
              ))}
            </div>
          </div>
        </>
      )}

      {!loading && !error && songs.length === 0 && (
        <div className="empty-state">
          <Music2 size={56} style={{ color: 'var(--text-muted)' }} />
          <h3>No results</h3>
          <p>Try changing the region.</p>
        </div>
      )}
    </div>
  );
}
