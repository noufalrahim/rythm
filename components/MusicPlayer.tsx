'use client';

import { usePlayer } from '@/contexts/PlayerContext';
import {
    Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
    Volume2, VolumeX, ChevronUp, Music2,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import Image from 'next/image';

function formatTime(sec: number) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MusicPlayer() {
    const {
        currentSong, isPlaying, currentTime, duration,
        volume, isShuffle, repeatMode,
        togglePlay, nextSong, prevSong, seekTo, setVolume,
        toggleShuffle, cycleRepeat,
    } = usePlayer();

    const [expanded, setExpanded] = useState(false);
    const [muted, setMuted] = useState(false);
    const prevVolume = useState(0.8);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        seekTo(ratio * duration);
    }, [duration, seekTo]);

    const handleVolume = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        setVolume(Math.max(0, Math.min(1, ratio)));
    }, [setVolume]);

    const toggleMute = () => {
        if (muted) {
            setVolume(prevVolume[0]);
            setMuted(false);
        } else {
            setVolume(0);
            setMuted(true);
        }
    };

    if (!currentSong && !expanded) {
        return (
            <div className="player-bar player-empty">
                <div className="player-empty-content">
                    <Music2 size={20} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No song playing</span>
                </div>
            </div>
        );
    }

    const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

    return (
        <>
            {/* Mobile expanded view */}
            {expanded && currentSong && (
                <div className="player-expanded">
                    <button className="player-expand-close" onClick={() => setExpanded(false)}>
                        <ChevronUp size={24} />
                    </button>
                    <div className="player-expanded-cover">
                        <Image
                            src={currentSong.coverUrl || currentSong.album?.coverUrl || '/icons/icon-512.png'}
                            alt={currentSong.title}
                            width={280}
                            height={280}
                            style={{ borderRadius: '12px', objectFit: 'cover' }}
                        />
                    </div>
                    <div className="player-expanded-info">
                        <div className="player-expanded-title">{currentSong.title}</div>
                        <div className="player-expanded-artist">{currentSong.artist?.name}</div>
                    </div>
                    <div className="player-progress-wrap" style={{ padding: '0 24px' }}>
                        <div className="player-progress-bar" onClick={handleSeek}>
                            <div className="player-progress-fill" style={{ width: `${progress}%` }} />
                            <div className="player-progress-thumb" style={{ left: `${progress}%` }} />
                        </div>
                        <div className="player-progress-times">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                    <div className="player-controls player-controls-expanded">
                        <button className={`player-btn-sm ${isShuffle ? 'active' : ''}`} onClick={toggleShuffle}>
                            <Shuffle size={20} />
                        </button>
                        <button className="player-btn" onClick={prevSong}><SkipBack size={28} fill="currentColor" /></button>
                        <button className="player-btn-play" onClick={togglePlay}>
                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                        </button>
                        <button className="player-btn" onClick={nextSong}><SkipForward size={28} fill="currentColor" /></button>
                        <button className={`player-btn-sm ${repeatMode !== 'none' ? 'active' : ''}`} onClick={cycleRepeat}>
                            <RepeatIcon size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom persist bar */}
            <div className="player-bar" onClick={() => !expanded && setExpanded(true)}>
                <div className="player-progress-bar player-progress-mini" onClick={(e) => { e.stopPropagation(); handleSeek(e); }}>
                    <div className="player-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="player-bar-inner">
                    {/* Song info */}
                    <div className="player-song-info">
                        {currentSong && (
                            <Image
                                src={currentSong.coverUrl || currentSong.album?.coverUrl || '/icons/icon-512.png'}
                                alt={currentSong.title || ''}
                                width={44}
                                height={44}
                                style={{ borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                            />
                        )}
                        <div className="player-song-text">
                            <div className="player-song-title">{currentSong?.title || 'No song'}</div>
                            <div className="player-song-artist">{currentSong?.artist?.name || '—'}</div>
                        </div>
                    </div>

                    {/* Controls – center on desktop, compact on mobile */}
                    <div className="player-controls player-controls-bar" onClick={e => e.stopPropagation()}>
                        <button className={`player-btn-sm desktop-only ${isShuffle ? 'active' : ''}`} onClick={toggleShuffle}>
                            <Shuffle size={16} />
                        </button>
                        <button className="player-btn" onClick={prevSong}><SkipBack size={20} fill="currentColor" /></button>
                        <button className="player-btn-play player-btn-play-sm" onClick={togglePlay}>
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                        </button>
                        <button className="player-btn" onClick={nextSong}><SkipForward size={20} fill="currentColor" /></button>
                        <button className={`player-btn-sm desktop-only ${repeatMode !== 'none' ? 'active' : ''}`} onClick={cycleRepeat}>
                            <RepeatIcon size={16} />
                        </button>
                    </div>

                    {/* Volume – desktop only */}
                    <div className="player-volume desktop-only" onClick={e => e.stopPropagation()}>
                        <button className="player-btn-sm" onClick={toggleMute}>
                            {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        <div className="player-progress-bar" style={{ width: '80px' }} onClick={handleVolume}>
                            <div className="player-progress-fill" style={{ width: `${volume * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
