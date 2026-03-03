/**
 * keepAlive.ts – Self-contained background audio keep-alive.
 *
 * WHY this is needed:
 * The YouTube IFrame player runs in a sandboxed <iframe>. Mobile browsers
 * suspend tabs when the screen turns off UNLESS they detect an active
 * native audio session in the PARENT page. This file creates that session.
 *
 * HOW it works:
 *  1. AudioContext with an oscillator at inaudible gain.
 *     The oscillator provides a running audio graph → browser registers
 *     an OS-level audio session → tab is kept alive.
 *  2. <audio> element with a 3-second real silent WAV (actual 8-bit samples).
 *     Required on browsers that don't respect AudioContext for session keeping.
 *  3. Internal visibilitychange listener resumes the AudioContext when screen
 *     turns back on (some browsers suspend it on page hide).
 *
 * CRITICAL: startKeepAlive() MUST be called synchronously from a user
 * gesture handler. iOS and Android require this for audio.play() to succeed.
 */

// ── Module-level singleton state ─────────────────────────────────────────────
let _ctx: AudioContext | null = null;
let _oscillator: OscillatorNode | null = null;
let _gain: GainNode | null = null;
let _audio: HTMLAudioElement | null = null;
let _blobUrl: string | null = null;
let _running = false;
let _listenerAttached = false;

// ── Silent WAV generator ──────────────────────────────────────────────────────
/**
 * Generates a proper 3-second WAV with real 8-bit samples (0x80 = silence).
 * An empty WAV (0 samples) does NOT register as an audio session.
 */
function buildSilentWav(): string {
    if (_blobUrl) return _blobUrl;
    const rate = 8000;
    const secs = 3;
    const n = rate * secs;
    const buf = new ArrayBuffer(44 + n);
    const v = new DataView(buf);
    const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };

    str(0, 'RIFF'); v.setUint32(4, 36 + n, true);
    str(8, 'WAVE');
    str(12, 'fmt '); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);          // PCM
    v.setUint16(22, 1, true);          // mono
    v.setUint32(24, rate, true);       // sample rate
    v.setUint32(28, rate, true);       // byte rate
    v.setUint16(32, 1, true);          // block align
    v.setUint16(34, 8, true);          // 8-bit
    str(36, 'data'); v.setUint32(40, n, true);
    new Uint8Array(buf, 44).fill(0x80); // silence = midpoint for u8 PCM

    _blobUrl = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
    return _blobUrl;
}

// ── Internal AudioContext keep-alive ──────────────────────────────────────────
function startAudioCtx(): void {
    if (typeof window === 'undefined') return;
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Ctor: typeof AudioContext = window.AudioContext ?? (window as any).webkitAudioContext;
        if (!Ctor) return;

        if (!_ctx) {
            _ctx = new Ctor();
            _gain = _ctx.createGain();
            // 0.01 gain = −40 dB. Low enough to be inaudible through the phone
            // speaker, but high enough that Chrome doesn't detect it as "silent"
            // and skip registering the audio session.
            _gain.gain.value = 0.01;
            _gain.connect(_ctx.destination);

            _oscillator = _ctx.createOscillator();
            _oscillator.type = 'sine';
            _oscillator.frequency.value = 200; // 200 Hz, stays in audio range
            _oscillator.connect(_gain);
            _oscillator.start();
        }

        if (_ctx.state === 'suspended') {
            _ctx.resume().catch(() => { });
        }
    } catch { /* AudioContext unavailable */ }
}

// ── Internal HTML audio element keep-alive ────────────────────────────────────
function startAudioEl(): void {
    if (typeof window === 'undefined') return;
    try {
        if (!_audio) {
            _audio = new Audio(buildSilentWav());
            _audio.loop = true;
            _audio.volume = 0.001;
            _audio.setAttribute('playsinline', 'true');
            _audio.setAttribute('webkit-playsinline', 'true');
            // muted=false so the browser registers an audio session
        }
        if (_audio.paused) {
            _audio.play().catch(() => { });
        }
    } catch { /* Audio unavailable */ }
}

// ── Internal state recovery on visibility change ──────────────────────────────
function attachVisibilityListener(): void {
    if (_listenerAttached || typeof document === 'undefined') return;
    _listenerAttached = true;

    document.addEventListener('visibilitychange', () => {
        if (!_running) return;

        if (document.visibilityState === 'visible') {
            // Screen came back on — resume whatever was suspended
            if (_ctx?.state === 'suspended') _ctx.resume().catch(() => { });
            if (_audio?.paused) _audio.play().catch(() => { });
        }
        // Note: we intentionally do NOT pause on 'hidden'. We want audio
        // to continue when the screen turns off.
    });

    // Some browsers fire 'freeze' when the page is put into BFCache
    document.addEventListener('freeze', () => { /* let browser handle */ });
    document.addEventListener('resume', () => {
        if (!_running) return;
        if (_ctx?.state === 'suspended') _ctx.resume().catch(() => { });
    });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Start keep-alive. Call synchronously from a user gesture handler.
 */
export function startKeepAlive(): void {
    if (typeof window === 'undefined') return;
    attachVisibilityListener();
    _running = true;
    startAudioCtx();
    startAudioEl();
}

/**
 * Stop keep-alive (when user pauses playback).
 */
export function stopKeepAlive(): void {
    _running = false;
    try { _audio?.pause(); } catch { /* ignore */ }
    // Don't close AudioContext — reopening it requires a user gesture.
    // Just suspend it to save battery.
    try { _ctx?.suspend(); } catch { /* ignore */ }
}

/**
 * Resume after returning from background (called by visibilitychange handlers
 * in React components too, for belt-and-suspenders).
 */
export function resumeKeepAlive(): void {
    if (!_running) return;
    if (_ctx?.state === 'suspended') _ctx.resume().catch(() => { });
    if (_audio?.paused) _audio.play().catch(() => { });
}

/** Debug: returns current internal state as a string. */
export function getKeepAliveStatus(): Record<string, string> {
    return {
        running: String(_running),
        audioCtxState: _ctx?.state ?? 'null',
        audioPaused: _audio ? String(_audio.paused) : 'null',
        audioSrc: _audio?.src ? 'blob (ok)' : 'none',
    };
}
