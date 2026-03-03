'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, MoreVertical } from 'lucide-react';
import { usePlayer, Song } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import SongContextMenu from '@/components/SongContextMenu';
import AuthModal from '@/components/AuthModal';

interface SongCardProps {
    song: Song;
    queue?: Song[];
    index?: number;
    showIndex?: boolean;
}

function formatDuration(sec: number) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatPlays(n?: number) {
    if (!n) return '0';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
}

export default function SongCard({ song, queue, index, showIndex = false }: SongCardProps) {
    const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
    useAuth(); // ensures AuthContext available to child SongContextMenu
    const isCurrentSong = currentSong?._id === song._id;

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [showAuth, setShowAuth] = useState(false);

    const handlePlay = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isCurrentSong) {
            togglePlay();
        } else {
            playSong(song, queue);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleMoreClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
        setContextMenu({ x: rect.left, y: rect.bottom });
    };

    return (
        <>
            <div
                className={`song-row ${isCurrentSong ? 'song-row-active' : ''}`}
                onContextMenu={handleContextMenu}
            >
                <div className="song-row-left">
                    {showIndex && (
                        <div className="song-row-index">
                            {isCurrentSong && isPlaying ? (
                                <span className="song-playing-bars">
                                    <span /><span /><span />
                                </span>
                            ) : (
                                <span className="song-row-num">{(index ?? 0) + 1}</span>
                            )}
                        </div>
                    )}
                    <div className="song-row-cover">
                        <Image
                            src={song.coverUrl || song.album?.coverUrl || '/icons/icon-512.png'}
                            alt={song.title}
                            width={40}
                            height={40}
                            style={{ borderRadius: '4px', objectFit: 'cover' }}
                        />
                        <button className="song-row-play-btn" onClick={handlePlay}>
                            {isCurrentSong && isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
                        </button>
                    </div>
                    <div className="song-row-info">
                        <div className={`song-row-title ${isCurrentSong ? 'green' : ''}`}>{song.title}</div>
                        <div className="song-row-artist">
                            <Link href={`/artist/${song.artist?._id}`} className="song-row-artist-link" onClick={e => e.stopPropagation()}>
                                {song.artist?.name}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="song-row-right">
                    {song.plays !== undefined && (
                        <span className="song-row-plays">{formatPlays(song.plays)}</span>
                    )}
                    <span className="song-row-duration">{formatDuration(song.duration)}</span>
                    <button className="song-row-more" onClick={handleMoreClick} title="More options">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {contextMenu && (
                <SongContextMenu
                    song={song}
                    queue={queue}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onRequireAuth={() => setShowAuth(true)}
                />
            )}

            {showAuth && (
                <AuthModal onClose={() => setShowAuth(false)} />
            )}
        </>
    );
}
