'use client';

import { useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

/**
 * MediaSessionManager
 *
 * Integrates the browser's Media Session API so that:
 * - The OS lock screen / notification panel shows song title, artist & artwork.
 * - Hardware/software playback buttons (play, pause, next, prev, seek) work.
 * - Audio continues playing while the screen is off (Android Chrome / PWA).
 *
 * This component renders nothing – it only runs effects.
 */
export default function MediaSessionManager() {
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
    } = usePlayer();

    // ── Update metadata whenever the song changes ──────────────────────────
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;
        if (!currentSong) {
            navigator.mediaSession.metadata = null;
            return;
        }

        const artwork: MediaImage[] = [];
        if (currentSong.coverUrl) {
            artwork.push({ src: currentSong.coverUrl, sizes: '512x512', type: 'image/jpeg' });
        }

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentSong.title,
            artist: currentSong.artist?.name ?? '',
            album: currentSong.album?.title ?? 'Rythm',
            artwork,
        });
    }, [currentSong]);

    // ── Sync playback state ────────────────────────────────────────────────
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }, [isPlaying]);

    // ── Position state (for seekbar in notification) ───────────────────────
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;
        if (!duration || duration <= 0) return;
        try {
            navigator.mediaSession.setPositionState({
                duration,
                playbackRate: 1,
                position: Math.min(currentTime, duration),
            });
        } catch {
            // setPositionState can throw if position > duration due to race
        }
    }, [currentTime, duration]);

    // ── Register action handlers once (stable refs via useEffect) ──────────
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;

        const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
            ['play', () => { if (!isPlaying) togglePlay(); }],
            ['pause', () => { if (isPlaying) togglePlay(); }],
            ['nexttrack', () => nextSong()],
            ['previoustrack', () => prevSong()],
            ['seekbackward', (details) => seekTo(Math.max(0, currentTime - (details.seekOffset ?? 10)))],
            ['seekforward', (details) => seekTo(Math.min(duration, currentTime + (details.seekOffset ?? 10)))],
            ['seekto', (details) => { if (details.seekTime != null) seekTo(details.seekTime); }],
        ];

        for (const [action, handler] of handlers) {
            try {
                navigator.mediaSession.setActionHandler(action, handler);
            } catch {
                // Some actions may not be supported in all browsers
            }
        }

        return () => {
            for (const [action] of handlers) {
                try {
                    navigator.mediaSession.setActionHandler(action, null);
                } catch { /* ignore */ }
            }
        };
        // We want fresh closures every time these values change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying, currentTime, duration]);

    return null;
}
