'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Play, BadgeCheck, Shuffle } from 'lucide-react';
import AlbumCard from '@/components/AlbumCard';
import SongCard from '@/components/SongCard';
import { usePlayer, Song } from '@/contexts/PlayerContext';

interface Artist {
    _id: string;
    name: string;
    imageUrl: string;
    monthlyListeners: number;
    verified: boolean;
    bio: string;
}

interface Album {
    _id: string;
    title: string;
    coverUrl: string;
    year: number;
    genre: string;
    artist: { _id: string; name: string; imageUrl: string };
}

function formatListeners(n: number) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M monthly listeners`;
    return `${(n / 1000).toFixed(0)}K monthly listeners`;
}

export default function ArtistPage() {
    const params = useParams();
    const id = params.id as string;
    const [artist, setArtist] = useState<Artist | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [topSongs, setTopSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const { playSong } = usePlayer();

    useEffect(() => {
        if (!id) return;
        fetch(`/api/artists/${id}`)
            .then(r => r.json())
            .then(d => {
                setArtist(d.artist);
                setAlbums(d.albums || []);
                setTopSongs(d.topSongs || []);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="loading"><div className="loading-spinner" /></div>;
    if (!artist) return <div className="empty-state"><h3>Artist not found</h3></div>;

    return (
        <div>
            {/* Hero */}
            <div className="artist-hero">
                <Image
                    src={artist.imageUrl || '/icons/icon-512.png'}
                    alt={artist.name}
                    fill
                    className="artist-hero-bg"
                    style={{ objectFit: 'cover' }}
                />
                <div className="artist-hero-overlay" />
                <div className="artist-hero-content">
                    {artist.verified && (
                        <div className="artist-hero-badge">
                            <BadgeCheck size={16} />
                            Verified Artist
                        </div>
                    )}
                    <h1 className="artist-hero-name">{artist.name}</h1>
                    <div className="artist-hero-listeners">{formatListeners(artist.monthlyListeners)}</div>
                </div>
            </div>

            <div className="page-container">
                {/* Actions */}
                <div className="album-actions">
                    {topSongs.length > 0 && (
                        <>
                            <button className="btn-play-large" onClick={() => playSong(topSongs[0], topSongs)}>
                                <Play size={24} fill="black" color="black" />
                            </button>
                            <button className="player-btn-sm" style={{ padding: '8px' }} onClick={() => {
                                const shuffled = [...topSongs].sort(() => Math.random() - 0.5);
                                playSong(shuffled[0], shuffled);
                            }}>
                                <Shuffle size={24} />
                            </button>
                        </>
                    )}
                </div>

                {/* Popular Songs */}
                {topSongs.length > 0 && (
                    <div className="section">
                        <h2 className="section-title" style={{ marginBottom: '12px' }}>Popular</h2>
                        {topSongs.slice(0, 5).map((song, i) => (
                            <SongCard key={song._id} song={song} queue={topSongs} index={i} showIndex />
                        ))}
                    </div>
                )}

                {/* Bio */}
                {artist.bio && (
                    <div className="section">
                        <h2 className="section-title" style={{ marginBottom: '12px' }}>About</h2>
                        <p style={{ color: 'var(--text-subdued)', lineHeight: '1.7', maxWidth: '640px' }}>{artist.bio}</p>
                    </div>
                )}

                {/* Albums */}
                {albums.length > 0 && (
                    <div className="section">
                        <h2 className="section-title" style={{ marginBottom: '16px' }}>Discography</h2>
                        <div className="cards-row">
                            {albums.map(album => <AlbumCard key={album._id} album={album} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
