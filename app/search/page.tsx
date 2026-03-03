'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, Youtube } from 'lucide-react';
import SongCard from '@/components/SongCard';
import Image from 'next/image';
import { usePlayer, Song } from '@/contexts/PlayerContext';

const GENRES = [
    { name: 'Pop Hits', color: 'linear-gradient(135deg, #E8115B, #F230B5)', query: 'pop hits 2024' },
    { name: 'Hip-Hop', color: 'linear-gradient(135deg, #E13300, #FFA500)', query: 'hip hop 2024' },
    { name: 'Rock', color: 'linear-gradient(135deg, #8C67AC, #3D5AF1)', query: 'rock music 2024' },
    { name: 'Electronic', color: 'linear-gradient(135deg, #1DA0C3, #00F5A0)', query: 'electronic music 2024' },
    { name: 'R&B', color: 'linear-gradient(135deg, #E91429, #F77640)', query: 'rnb soul 2024' },
    { name: 'Indie', color: 'linear-gradient(135deg, #477D95, #1E3264)', query: 'indie pop 2024' },
    { name: 'K-Pop', color: 'linear-gradient(135deg, #ff6ec7, #a855f7)', query: 'kpop 2024' },
    { name: 'Bollywood', color: 'linear-gradient(135deg, #f97316, #facc15)', query: 'bollywood songs 2024' },
];

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [songs, setSongs] = useState<Song[]>([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { playSong } = usePlayer();

    const doSearch = useCallback(async (q: string) => {
        if (!q.trim()) { setSongs([]); setError(null); return; }
        setSearching(true);
        setError(null);
        try {
            const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}&limit=15`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setSongs(data.songs || []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Search failed');
            setSongs([]);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => doSearch(query), 350);
        return () => clearTimeout(t);
    }, [query, doSearch]);

    return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <Youtube size={24} style={{ color: '#FF0000', flexShrink: 0 }} />
                <h1 className="section-title" style={{ fontSize: '1.6rem' }}>Search YouTube Music</h1>
            </div>

            <div className="search-input-wrap">
                <SearchIcon size={20} className="search-input-icon" />
                <input
                    type="search"
                    className="search-input"
                    placeholder="Search songs, artists, albums..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    autoFocus
                />
            </div>

            {!query && (
                <>
                    <h2 className="section-title" style={{ marginBottom: 16 }}>Browse by Genre</h2>
                    <div className="genre-grid">
                        {GENRES.map(g => (
                            <div
                                key={g.name}
                                className="genre-card"
                                style={{ background: g.color }}
                                onClick={() => setQuery(g.query)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && setQuery(g.query)}
                            >
                                {g.name}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {searching && (
                <div className="loading"><div className="loading-spinner" /></div>
            )}

            {error && (
                <div className="empty-state">
                    <Youtube size={40} style={{ color: '#FF0000' }} />
                    <h3>API Error</h3>
                    <p>{error}</p>
                </div>
            )}

            {!searching && !error && query && (
                <>
                    {songs.length === 0 ? (
                        <div className="empty-state">
                            <h3>No results for &ldquo;{query}&rdquo;</h3>
                            <p>Try different keywords.</p>
                        </div>
                    ) : (
                        <div className="section">
                            <div className="section-header">
                                <h2 className="section-title">Results for &ldquo;{query}&rdquo;</h2>
                                <span className="section-see-all">{songs.length} videos</span>
                            </div>

                            {songs[0] && (
                                <div
                                    className="music-card"
                                    style={{
                                        display: 'flex', gap: 16, alignItems: 'center',
                                        marginBottom: 16, maxWidth: 520,
                                    }}
                                    onClick={() => playSong(songs[0], songs)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => e.key === 'Enter' && playSong(songs[0], songs)}
                                >
                                    <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0, borderRadius: 8, overflow: 'hidden' }}>
                                        <Image src={songs[0].coverUrl} alt={songs[0].title} fill style={{ objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                                            Top Result
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{songs[0].title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-subdued)' }}>{songs[0].artist.name}</div>
                                    </div>
                                </div>
                            )}

                            {/* Song list */}
                            <div style={{ marginTop: 8 }}>
                                {songs.map((song, i) => (
                                    <SongCard key={song._id} song={song} queue={songs} index={i} showIndex />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
