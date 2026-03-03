'use client';

import { useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { resumeKeepAlive } from '@/lib/keepAlive';

/**
 * MediaSessionManager
 *
 * 1. Handles Media Session API (lock screen / notification controls).
 * 2. Calls resumeKeepAlive() on visibilitychange so the AudioContext
 *    gets un-suspended when the user returns from the lock screen.
 *
 * The actual silent audio is started in PlayerContext (synchronously
 * from user gesture handlers) via lib/keepAlive.ts.
 *
 * Renders nothing.
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

    // ── Resume keep-alive when returning from lock screen / background ──────
    useEffect(() => {
        const onVisibility = () => {
            if (document.visibilityState === 'visible') {
                resumeKeepAlive();
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, []);

    // ── Metadata ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;
        if (!currentSong) {
            navigator.mediaSession.metadata = null;
            return;
        }

        const artwork: MediaImage[] = currentSong.coverUrl
            ? [
                { src: currentSong.coverUrl, sizes: '96x96', type: 'image/jpeg' },
                { src: currentSong.coverUrl, sizes: '256x256', type: 'image/jpeg' },
                { src: currentSong.coverUrl, sizes: '512x512', type: 'image/jpeg' },
            ]
            : [];

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentSong.title,
            artist: currentSong.artist?.name ?? '',
            album: currentSong.album?.title ?? 'Rythm',
            artwork,
        });
    }, [currentSong]);

    // ── Playback state ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }, [isPlaying]);

    // ── Position state ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;
        if (!duration || duration <= 0) return;
        try {
            navigator.mediaSession.setPositionState({
                duration,
                playbackRate: 1,
                position: Math.min(currentTime, duration),
            });
        } catch { /* position > duration race */ }
    }, [currentTime, duration]);

    // ── Action handlers ────────────────────────────────────────────────────
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;

        const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
            ['play', () => { if (!isPlaying) togglePlay(); }],
            ['pause', () => { if (isPlaying) togglePlay(); }],
            ['nexttrack', () => nextSong()],
            ['previoustrack', () => prevSong()],
            ['seekbackward', (d) => seekTo(Math.max(0, currentTime - (d.seekOffset ?? 10)))],
            ['seekforward', (d) => seekTo(Math.min(duration, currentTime + (d.seekOffset ?? 10)))],
            ['seekto', (d) => { if (d.seekTime != null) seekTo(d.seekTime); }],
        ];

        for (const [action, handler] of handlers) {
            try { navigator.mediaSession.setActionHandler(action, handler); }
            catch { /* unsupported */ }
        }
        return () => {
            for (const [action] of handlers) {
                try { navigator.mediaSession.setActionHandler(action, null); }
                catch { /* ignore */ }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying, currentTime, duration]);

    return null;
}
