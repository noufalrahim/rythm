'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit2, Heart, Play, Music2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer, Song } from '@/contexts/PlayerContext';
import PlaylistModal from '@/components/PlaylistModal';
import AuthModal from '@/components/AuthModal';
import Image from 'next/image';

interface LikedSongItem {
    _id: string;
    songId: string;
    songData: {
        title: string;
        artistName: string;
        coverUrl: string;
        duration: number;
        youtubeVideoId?: string;
        source: 'youtube' | 'db';
    };
}

interface Playlist {
    _id: string;
    name: string;
    description: string;
    coverUrl: string;
    songs: Array<{ songId: string; title: string; artistName: string; coverUrl: string; duration: number; youtubeVideoId?: string; source: 'youtube' | 'db' }>;
}

export default function LibraryPage() {
    const { user, loading: authLoading } = useAuth();
    const { playSong } = usePlayer();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [likedSongs, setLikedSongs] = useState<LikedSongItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [editPlaylist, setEditPlaylist] = useState<Playlist | null>(null);
    const [showAuth, setShowAuth] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!user) { setLoading(false); return; }
        setLoading(true);
        try {
            const [plRes, likedRes] = await Promise.all([
                fetch('/api/playlists'),
                fetch('/api/liked'),
            ]);
            const [plData, likedData] = await Promise.all([plRes.json(), likedRes.json()]);
            setPlaylists(plData.playlists || []);
            setLikedSongs(likedData.songs || []);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreate = async (data: { name: string; description: string }) => {
        const res = await fetch('/api/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        await fetchData();
    };

    const handleEdit = async (data: { name: string; description: string }) => {
        if (!editPlaylist) return;
        const res = await fetch(`/api/playlists/${editPlaylist._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        await fetchData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this playlist?')) return;
        setDeleting(id);
        await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
        await fetchData();
        setDeleting(null);
    };

    const playLikedSongs = () => {
        if (!likedSongs.length) return;
        const songs: Song[] = likedSongs.map(ls => ({
            _id: ls.songData.youtubeVideoId || ls.songId,
            title: ls.songData.title,
            artist: { _id: '', name: ls.songData.artistName },
            coverUrl: ls.songData.coverUrl,
            audioUrl: '',
            duration: ls.songData.duration,
            youtubeVideoId: ls.songData.youtubeVideoId,
        }));
        playSong(songs[0], songs);
    };

    if (authLoading) return <div className="loading"><div className="loading-spinner" /></div>;

    if (!user) {
        return (
            <div className="page-container">
                <div className="empty-state" style={{ minHeight: '60vh' }}>
                    <Music2 size={56} style={{ color: 'var(--text-muted)' }} />
                    <h3>Enjoy your music library</h3>
                    <p>Sign in to create playlists, like songs and access your library from any device.</p>
                    <button className="btn-primary" onClick={() => setShowAuth(true)} style={{ marginTop: 8 }}>
                        Sign in
                    </button>
                </div>
                {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
            </div>
        );
    }

    return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <h1 className="section-title" style={{ fontSize: '1.6rem' }}>Your Library</h1>
                <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }} onClick={() => setShowCreate(true)}>
                    <Plus size={16} />
                    New Playlist
                </button>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /></div>
            ) : (
                <>
                    {/* Liked Songs */}
                    <div className="section">
                        <div
                            className="music-card"
                            style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 480, cursor: 'pointer' }}
                            onClick={playLikedSongs}
                        >
                            <div style={{
                                width: 72, height: 72, borderRadius: 8, flexShrink: 0,
                                background: 'linear-gradient(135deg, #450af5, #c4efd9)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Heart size={32} fill="white" color="white" />
                            </div>
                            <div>
                                <div className="music-card-title" style={{ fontSize: '1rem' }}>Liked Songs</div>
                                <div className="music-card-sub">Playlist · {likedSongs.length} songs</div>
                            </div>
                            {likedSongs.length > 0 && (
                                <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                                    <div className="btn-play-large" style={{ width: 44, height: 44 }}>
                                        <Play size={18} fill="black" color="black" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Playlists */}
                    {playlists.length > 0 && (
                        <div className="section">
                            <h2 className="section-title" style={{ marginBottom: 16 }}>Playlists</h2>
                            <div className="cards-row">
                                {playlists.map(pl => (
                                    <div key={pl._id} className="music-card" style={{ position: 'relative' }}>
                                        {/* Playlist actions */}
                                        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6, zIndex: 1 }}>
                                            <button
                                                className="player-btn-sm"
                                                style={{ background: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 6 }}
                                                onClick={e => { e.preventDefault(); setEditPlaylist(pl); }}
                                                title="Edit playlist"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                className="player-btn-sm"
                                                style={{ background: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 6, color: '#e91429' }}
                                                onClick={e => { e.preventDefault(); handleDelete(pl._id); }}
                                                disabled={deleting === pl._id}
                                                title="Delete playlist"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <Link href={`/playlist/${pl._id}`} style={{ display: 'block' }}>
                                            <div className="music-card-img-wrap">
                                                {pl.coverUrl ? (
                                                    <Image src={pl.coverUrl} alt={pl.name} fill style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{
                                                        width: '100%', height: '100%',
                                                        background: 'linear-gradient(135deg, #1DB954, #0a7a35)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '2.5rem',
                                                    }}>🎵</div>
                                                )}
                                                <div className="music-card-play-overlay">
                                                    <div className="music-card-play-btn"><Play size={22} fill="black" color="black" /></div>
                                                </div>
                                            </div>
                                            <div className="music-card-info">
                                                <div className="music-card-title">{pl.name}</div>
                                                <div className="music-card-sub">{pl.songs.length} songs</div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {playlists.length === 0 && likedSongs.length === 0 && (
                        <div className="empty-state">
                            <Music2 size={48} style={{ color: 'var(--text-muted)' }} />
                            <h3>It&apos;s empty here</h3>
                            <p>Create your first playlist or like some songs to see them here.</p>
                        </div>
                    )}
                </>
            )}

            {showCreate && (
                <PlaylistModal mode="create" onClose={() => setShowCreate(false)} onSave={handleCreate} />
            )}
            {editPlaylist && (
                <PlaylistModal
                    mode="edit"
                    initialName={editPlaylist.name}
                    initialDescription={editPlaylist.description}
                    onClose={() => setEditPlaylist(null)}
                    onSave={handleEdit}
                />
            )}
        </div>
    );
}
