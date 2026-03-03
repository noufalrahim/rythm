'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart, HeartOff, PlusCircle, SkipForward, Check, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Song } from '@/contexts/PlayerContext';
import { usePlayer } from '@/contexts/PlayerContext';

interface Playlist {
    _id: string;
    name: string;
}

interface SongContextMenuProps {
    song: Song;
    queue?: Song[];
    x: number;
    y: number;
    onClose: () => void;
    onRequireAuth: () => void;
}

function songToData(song: Song) {
    return {
        songId: song._id,
        songData: {
            title: song.title,
            artistName: song.artist?.name || '',
            coverUrl: song.coverUrl,
            duration: song.duration,
            youtubeVideoId: song.youtubeVideoId,
            source: song.youtubeVideoId ? 'youtube' : 'db',
        },
    };
}

export default function SongContextMenu({
    song, queue, x, y, onClose, onRequireAuth,
}: SongContextMenuProps) {
    const { user } = useAuth();
    const { playSong, queue: playerQueue, currentSong } = usePlayer();
    const [liked, setLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
    const [addedTo, setAddedTo] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Check if song is liked and fetch playlists
    useEffect(() => {
        if (!user) return;
        fetch('/api/liked')
            .then(r => r.json())
            .then(d => {
                const isLiked = (d.songs || []).some((s: { songId: string }) => s.songId === song._id);
                setLiked(isLiked);
            });
        fetch('/api/playlists')
            .then(r => r.json())
            .then(d => setPlaylists(d.playlists || []));
    }, [user, song._id]);

    // Dismiss on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    const handleLike = async () => {
        if (!user) { onClose(); onRequireAuth(); return; }
        setLikeLoading(true);
        try {
            if (liked) {
                await fetch(`/api/liked?songId=${song._id}`, { method: 'DELETE' });
                setLiked(false);
            } else {
                const { songId, songData } = songToData(song);
                await fetch('/api/liked', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ songId, songData }),
                });
                setLiked(true);
            }
        } finally {
            setLikeLoading(false);
        }
    };

    const handleAddToPlaylist = async (playlistId: string) => {
        const { songId, songData } = songToData(song);
        await fetch(`/api/playlists/${playlistId}/songs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ songId, ...songData }),
        });
        setAddedTo(playlistId);
        setTimeout(onClose, 800);
    };

    const handlePlayNext = () => {
        // Play this song next by inserting it after the current song in the queue
        const q = queue || playerQueue;
        const currentIdx = q.findIndex(s => s._id === currentSong?._id);
        const newQueue = [...q];
        const existing = newQueue.findIndex(s => s._id === song._id);
        if (existing > -1) newQueue.splice(existing, 1);
        newQueue.splice(Math.max(0, currentIdx + 1), 0, song);
        playSong(newQueue[currentIdx] || song, newQueue);
        onClose();
    };

    // Adjust position to stay within viewport
    const adjustedX = Math.min(x, window.innerWidth - 220);
    const adjustedY = Math.min(y, window.innerHeight - 220);

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{ top: adjustedY, left: adjustedX }}
            onClick={e => e.stopPropagation()}
        >
            <button className="context-menu-item" onClick={handleLike} disabled={likeLoading}>
                {liked ? <HeartOff size={16} style={{ color: 'var(--green)' }} /> : <Heart size={16} />}
                {liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
            </button>

            <div className="context-menu-item" onClick={() => setShowPlaylistMenu(p => !p)}>
                <PlusCircle size={16} />
                Add to playlist
                <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
            </div>

            {showPlaylistMenu && (
                <div className="context-submenu">
                    {playlists.length === 0 && (
                        <div className="context-menu-item" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            No playlists yet
                        </div>
                    )}
                    {playlists.map(pl => (
                        <button key={pl._id} className="context-menu-item" onClick={() => handleAddToPlaylist(pl._id)}>
                            {addedTo === pl._id ? <Check size={16} style={{ color: 'var(--green)' }} /> : <PlusCircle size={16} />}
                            {pl.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="context-menu-divider" />

            <button className="context-menu-item" onClick={handlePlayNext}>
                <SkipForward size={16} />
                Play next
            </button>
        </div>
    );
}
