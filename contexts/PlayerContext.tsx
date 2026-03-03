'use client';

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

export interface Song {
    _id: string;
    title: string;
    artist: { _id: string; name: string; imageUrl?: string };
    album?: { _id: string; title: string; coverUrl?: string };
    coverUrl: string;
    audioUrl: string;
    duration: number;
    plays?: number;
    youtubeVideoId?: string;
}

interface YTPlayer {
    playVideo: () => void;
    pauseVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    setVolume: (volume: number) => void;
    getDuration: () => number;
    getCurrentTime: () => number;
    getPlayerState: () => number;
    loadVideoById: (videoId: string) => void;
    destroy: () => void;
}

interface PlayerContextType {
    currentSong: Song | null;
    queue: Song[];
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isShuffle: boolean;
    repeatMode: 'none' | 'all' | 'one';
    playSong: (song: Song, queue?: Song[]) => void;
    togglePlay: () => void;
    nextSong: () => void;
    prevSong: () => void;
    seekTo: (time: number) => void;
    setVolume: (vol: number) => void;
    toggleShuffle: () => void;
    cycleRepeat: () => void;
    // YouTube IFrame bridge
    registerYoutubePlayer: (player: YTPlayer) => void;
    notifyYoutubeTime: (time: number) => void;
    notifyYoutubeDuration: (duration: number) => void;
    notifyYoutubeEnded: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [queue, setQueue] = useState<Song[]>([]);
    const [queueIndex, setQueueIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(0.8);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const ytPlayerRef = useRef<YTPlayer | null>(null);
    const queueRef = useRef<Song[]>([]);
    const queueIndexRef = useRef(0);
    const isShuffleRef = useRef(false);
    const repeatModeRef = useRef<'none' | 'all' | 'one'>('none');
    const isPlayingRef = useRef(false);

    // Keep refs in sync for use inside callbacks
    queueRef.current = queue;
    queueIndexRef.current = queueIndex;
    isShuffleRef.current = isShuffle;
    repeatModeRef.current = repeatMode;
    isPlayingRef.current = isPlaying;

    // ─── YouTube bridge callbacks ────────────────────────────────────────────
    const registerYoutubePlayer = useCallback((player: YTPlayer) => {
        ytPlayerRef.current = player;
    }, []);

    const notifyYoutubeTime = useCallback((time: number) => {
        setCurrentTime(time);
    }, []);

    const notifyYoutubeDuration = useCallback((dur: number) => {
        setDuration(dur);
    }, []);

    const notifyYoutubeEnded = useCallback(() => {
        const q = queueRef.current;
        const idx = queueIndexRef.current;
        if (!q.length) return;

        let nextIdx: number;
        if (isShuffleRef.current) {
            nextIdx = Math.floor(Math.random() * q.length);
        } else if (repeatModeRef.current === 'one') {
            nextIdx = idx;
        } else if (repeatModeRef.current === 'all' || idx + 1 < q.length) {
            nextIdx = (idx + 1) % q.length;
        } else {
            setIsPlaying(false);
            return;
        }
        setQueueIndex(nextIdx);
        setCurrentSong(q[nextIdx]);
        setIsPlaying(true);
        setCurrentTime(0);
    }, []);

    // ─── Audio (non-YouTube) helpers ─────────────────────────────────────────
    const setupAudio = useCallback(
        (song: Song) => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            const audio = new Audio(song.audioUrl || '');
            audio.volume = volume;
            audioRef.current = audio;
            audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
            audio.addEventListener('loadedmetadata', () => setDuration(audio.duration || song.duration));
            audio.addEventListener('ended', () => notifyYoutubeEnded());
            if (!song.audioUrl) setDuration(song.duration);
        },
        [volume, notifyYoutubeEnded]
    );

    // ─── Public API ──────────────────────────────────────────────────────────
    const playSong = useCallback(
        (song: Song, newQueue?: Song[]) => {
            if (newQueue) {
                setQueue(newQueue);
                const idx = newQueue.findIndex(s => s._id === song._id);
                setQueueIndex(idx >= 0 ? idx : 0);
            }
            setCurrentSong(song);
            setIsPlaying(true);
            setCurrentTime(0);

            if (song.youtubeVideoId) {
                // Pause/teardown any active HTML audio
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }
                // YouTubePlayer component watches currentSong and loads the video
            } else {
                setupAudio(song);
                audioRef.current?.play().catch(() => { });
            }
        },
        [setupAudio]
    );

    const togglePlay = useCallback(() => {
        if (!currentSong) return;
        if (currentSong.youtubeVideoId && ytPlayerRef.current) {
            if (isPlayingRef.current) {
                ytPlayerRef.current.pauseVideo();
            } else {
                ytPlayerRef.current.playVideo();
            }
            setIsPlaying(p => !p);
        } else if (audioRef.current) {
            if (isPlayingRef.current) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().catch(() => { });
                setIsPlaying(true);
            }
        }
    }, [currentSong]);

    const nextSong = useCallback(() => {
        const q = queueRef.current;
        const idx = queueIndexRef.current;
        if (!q.length) return;
        const nextIdx = isShuffleRef.current
            ? Math.floor(Math.random() * q.length)
            : (idx + 1) % q.length;
        setQueueIndex(nextIdx);
        setCurrentSong(q[nextIdx]);
        setIsPlaying(true);
        setCurrentTime(0);
        if (!q[nextIdx].youtubeVideoId) {
            setupAudio(q[nextIdx]);
            audioRef.current?.play().catch(() => { });
        } else if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    }, [setupAudio]);

    const prevSong = useCallback(() => {
        const q = queueRef.current;
        const idx = queueIndexRef.current;
        if (currentTime > 3) {
            seekTo(0);
            return;
        }
        const prevIdx = idx > 0 ? idx - 1 : q.length - 1;
        setQueueIndex(prevIdx);
        setCurrentSong(q[prevIdx]);
        setIsPlaying(true);
        setCurrentTime(0);
        if (!q[prevIdx]?.youtubeVideoId) {
            setupAudio(q[prevIdx]);
            audioRef.current?.play().catch(() => { });
        } else if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTime, setupAudio]);

    const seekTo = useCallback((time: number) => {
        setCurrentTime(time);
        if (ytPlayerRef.current) {
            ytPlayerRef.current.seekTo(time, true);
        } else if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    }, []);

    const setVolume = useCallback((vol: number) => {
        setVolumeState(vol);
        if (audioRef.current) audioRef.current.volume = vol;
        if (ytPlayerRef.current) ytPlayerRef.current.setVolume(Math.round(vol * 100));
    }, []);

    const toggleShuffle = () => setIsShuffle(p => !p);
    const cycleRepeat = () =>
        setRepeatMode(p => (p === 'none' ? 'all' : p === 'all' ? 'one' : 'none'));

    return (
        <PlayerContext.Provider
            value={{
                currentSong, queue, isPlaying, currentTime, duration,
                volume, isShuffle, repeatMode,
                playSong, togglePlay, nextSong, prevSong, seekTo, setVolume,
                toggleShuffle, cycleRepeat,
                registerYoutubePlayer, notifyYoutubeTime, notifyYoutubeDuration, notifyYoutubeEnded,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const ctx = useContext(PlayerContext);
    if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
    return ctx;
}
