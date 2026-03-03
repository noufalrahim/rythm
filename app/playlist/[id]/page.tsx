'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Shuffle, Trash2, Edit2, Heart, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer, Song } from '@/contexts/PlayerContext';
import { useSidebar } from '@/contexts/SidebarContext';
import PlaylistModal from '@/components/PlaylistModal';
import SongCard from '@/components/SongCard';

interface PlaylistSong {
    songId: string;
    title: string;
    artistName: string;
    coverUrl: string;
    duration: number;
    youtubeVideoId?: string;
    source: 'youtube' | 'db';
}

interface PlaylistData {
    _id: string;
    name: string;
    description: string;
    coverUrl: string;
    userId: string;
    songs: PlaylistSong[];
}

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function playlistSongToSong(ps: PlaylistSong): Song {
    return {
        _id: ps.youtubeVideoId || ps.songId,
        title: ps.title,
        artist: { _id: '', name: ps.artistName },
        coverUrl: ps.coverUrl,
        audioUrl: '',
        duration: ps.duration,
        youtubeVideoId: ps.youtubeVideoId,
    };
}

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const { playSong } = usePlayer();
    const { refreshPlaylists } = useSidebar();
    const router = useRouter();
    const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchPlaylist = useCallback(async () => {
        const res = await fetch(`/api/playlists/${id}`);
        const data = await res.json();
        setPlaylist(data.playlist);
        setLoading(false);
    }, [id]);

    useEffect(() => { fetchPlaylist(); }, [fetchPlaylist]);

    const handleEdit = async (data: { name: string; description: string }) => {
        const res = await fetch(`/api/playlists/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        await fetchPlaylist();
        refreshPlaylists(); // update sidebar name
    };

    const handleDeletePlaylist = async () => {
        if (!confirm(`Delete "${playlist?.name}"? This cannot be undone.`)) return;
        setDeleting(true);
        const res = await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
        if (res.ok) {
            refreshPlaylists(); // immediately remove from sidebar
            router.push('/library');
        } else {
            setDeleting(false);
        }
    };

    const handleRemoveSong = async (songId: string) => {
        await fetch(`/api/playlists/${id}/songs`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ songId }),
        });
        await fetchPlaylist();
    };

    if (loading) return <div className="loading"><div className="loading-spinner" /></div>;
    if (!playlist) return <div className="empty-state"><h3>Playlist not found</h3></div>;

    const songs: Song[] = playlist.songs.map(playlistSongToSong);
    const isOwner = user?._id === playlist.userId;
    const totalDuration = playlist.songs.reduce((acc, s) => acc + (s.duration || 0), 0);

    return (
        <div className="page-container">
            {/* Back */}
            <Link href="/library" className="back-btn">
                <ArrowLeft size={18} /> Back to Library
            </Link>

            {/* Hero */}
            <div className="album-hero" style={{ marginTop: 16 }}>
                <div className="album-hero-cover">
                    {playlist.coverUrl ? (
                        <Image src={playlist.coverUrl} alt={playlist.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                        <div style={{
                            width: '100%', height: '100%',
                            background: 'linear-gradient(135deg, #1DB954, #0a7a35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '4rem',
                        }}>🎵</div>
                    )}
                </div>
                <div className="album-hero-info">
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>
                        Playlist
                    </div>
                    <h1 className="album-hero-title">{playlist.name}</h1>
                    {playlist.description && (
                        <p style={{ color: 'var(--text-subdued)', margin: '8px 0', fontSize: '0.9rem' }}>{playlist.description}</p>
                    )}
                    <div className="album-hero-meta">
                        {playlist.songs.length} songs
                        {totalDuration > 0 && ` · ${formatDuration(totalDuration)}`}
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="album-actions">
                {songs.length > 0 && (
                    <>
                        <button className="btn-play-large" onClick={() => playSong(songs[0], songs)}>
                            <Play size={24} fill="black" />
                        </button>
                        <button
                            className="player-btn"
                            style={{ color: 'var(--green)' }}
                            onClick={() => {
                                const shuffled = [...songs].sort(() => Math.random() - 0.5);
                                playSong(shuffled[0], shuffled);
                            }}
                        >
                            <Shuffle size={24} />
                        </button>
                    </>
                )}
                {isOwner && (
                    <>
                        <button className="btn-secondary" onClick={() => setEditing(true)}>
                            <Edit2 size={16} /> Edit
                        </button>
                        <button
                            className="btn-secondary"
                            style={{ color: '#e91429', borderColor: '#e91429' }}
                            onClick={handleDeletePlaylist}
                            disabled={deleting}
                        >
                            <Trash2 size={16} /> {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                    </>
                )}
            </div>

            {/* Song List */}
            {playlist.songs.length === 0 ? (
                <div className="empty-state">
                    <Heart size={40} style={{ color: 'var(--text-muted)' }} />
                    <h3>This playlist is empty</h3>
                    <p>Add songs from the home or search page.</p>
                </div>
            ) : (
                <div>
                    {playlist.songs.map((ps, i) => (
                        <div key={ps.songId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                                <SongCard song={playlistSongToSong(ps)} queue={songs} index={i} showIndex />
                            </div>
                            {isOwner && (
                                <button
                                    className="player-btn-sm"
                                    style={{ flexShrink: 0, color: '#e91429', marginRight: 8 }}
                                    onClick={() => handleRemoveSong(ps.songId)}
                                    title="Remove from playlist"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <PlaylistModal
                    mode="edit"
                    initialName={playlist.name}
                    initialDescription={playlist.description}
                    onClose={() => setEditing(false)}
                    onSave={handleEdit}
                />
            )}
        </div>
    );
}
