'use client';

/**
 * YouTubePlayer – mounts a hidden YouTube IFrame player synced to PlayerContext.
 * The player is 1×1px positioned fixed off-screen so it's technically "present"
 * per YouTube ToS while not interfering with the UI.
 */

import { useEffect, useRef } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

// Minimal YT global type (we only use what we need)
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        YT: any;
        onYouTubeIframeAPIReady: () => void;
        _ytApiLoading?: boolean;
    }
}

export default function YouTubePlayer() {
    const {
        currentSong,
        isPlaying,
        volume,
        registerYoutubePlayer,
        notifyYoutubeTime,
        notifyYoutubeDuration,
        notifyYoutubeEnded,
        seekTo,
    } = usePlayer();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const currentVideoIdRef = useRef<string | null>(null);
    const seekPendingRef = useRef<number | null>(null);

    // ── Load YT IFrame API script once ──────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const initPlayer = () => {
            if (!containerRef.current) return;
            playerRef.current = new window.YT.Player(containerRef.current, {
                width: '1',
                height: '1',
                playerVars: {
                    playsinline: 1,
                    controls: 0,
                    rel: 0,
                    modestbranding: 1,
                    iv_load_policy: 3,
                },
                events: {
                    onReady: (e: { target: unknown }) => {
                        registerYoutubePlayer(e.target as Parameters<typeof registerYoutubePlayer>[0]);
                        // Apply initial volume
                        playerRef.current?.setVolume(Math.round(volume * 100));
                    },
                    onStateChange: (e: { data: number }) => {
                        // YT.PlayerState: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering
                        if (e.data === 0) {
                            notifyYoutubeEnded();
                        }
                        if (e.data === 1) {
                            // Video started/resumed — start polling time
                            startPolling();
                            // Report duration
                            const dur = playerRef.current?.getDuration?.() || 0;
                            if (dur) notifyYoutubeDuration(dur);
                            // Handle pending seek (e.g. triggered before player was ready)
                            if (seekPendingRef.current !== null) {
                                playerRef.current?.seekTo(seekPendingRef.current, true);
                                seekPendingRef.current = null;
                            }
                        }
                        if (e.data === 2 || e.data === -1) {
                            stopPolling();
                        }
                    },
                },
            });
        };

        if (window.YT?.Player) {
            initPlayer();
        } else {
            // The API may already be loading (e.g. hot-reload)
            if (!window._ytApiLoading) {
                window._ytApiLoading = true;
                const script = document.createElement('script');
                script.src = 'https://www.youtube.com/iframe_api';
                document.head.appendChild(script);
            }
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            stopPolling();
            playerRef.current?.destroy?.();
            playerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Poll current time while playing ─────────────────────────────────────
    const startPolling = () => {
        if (pollRef.current) return;
        pollRef.current = setInterval(() => {
            const t = playerRef.current?.getCurrentTime?.();
            if (typeof t === 'number') notifyYoutubeTime(t);
        }, 500);
    };

    const stopPolling = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    };

    // ── React to currentSong changes ─────────────────────────────────────────
    useEffect(() => {
        if (!currentSong?.youtubeVideoId) return;
        const vid = currentSong.youtubeVideoId;
        if (!playerRef.current) return;

        if (currentVideoIdRef.current !== vid) {
            currentVideoIdRef.current = vid;
            playerRef.current.loadVideoById(vid);
            // loadVideoById auto-plays; if context says not playing we'll pause on next effect
        }
    }, [currentSong]);

    // ── React to isPlaying changes ───────────────────────────────────────────
    useEffect(() => {
        if (!currentSong?.youtubeVideoId) return;
        if (!playerRef.current) return;
        const state = playerRef.current.getPlayerState?.();
        if (isPlaying && state !== 1) {
            playerRef.current.playVideo();
        } else if (!isPlaying && state === 1) {
            playerRef.current.pauseVideo();
        }
    }, [isPlaying, currentSong]);

    // ── React to volume changes ──────────────────────────────────────────────
    useEffect(() => {
        playerRef.current?.setVolume?.(Math.round(volume * 100));
    }, [volume]);

    // ── Expose seekTo to player ──────────────────────────────────────────────
    // We monkey-patch seekTo by watching a custom event or just relying on
    // the context's seekTo which already calls ytPlayerRef.current.seekTo via context.
    // Nothing extra needed here.

    // Suppress unused-variable warning for seekTo import
    void seekTo;

    return (
        <div
            style={{
                position: 'fixed',
                left: '-9999px',
                top: '-9999px',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
                opacity: 0,
                pointerEvents: 'none',
                zIndex: -1,
            }}
            aria-hidden="true"
        >
            <div ref={containerRef} />
        </div>
    );
}
