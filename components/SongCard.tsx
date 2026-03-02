'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause } from 'lucide-react';
import { usePlayer, Song } from '@/contexts/PlayerContext';

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
    const isCurrentSong = currentSong?._id === song._id;

    const handlePlay = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isCurrentSong) {
            togglePlay();
        } else {
            playSong(song, queue);
        }
    };

    return (
        <div className={`song-row ${isCurrentSong ? 'song-row-active' : ''}`}>
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
            </div>
        </div>
    );
}
