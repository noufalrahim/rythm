'use client';

import { useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

/**
 * MediaSessionManager
 *
 * Wires up the browser's Media Session API:
 * - Lock screen / notification shows title, artist & artwork.
 * - Hardware/software buttons (play, pause, next, prev, seek) work.
 *
 * Background audio keep-alive (silent looping audio) is handled in
 * PlayerContext via lib/keepAlive.ts — called synchronously from user
 * gesture handlers so it works on both Android and iOS.
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

    // ── Position state (notification seekbar) ──────────────────────────────
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
