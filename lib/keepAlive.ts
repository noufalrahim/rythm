/**
 * keepAlive.ts
 *
 * Prevents mobile browsers from suspending tab audio when screen locks.
 *
 * ROOT CAUSE of why the previous approach failed:
 * - The base64 WAV had an empty data chunk (0 samples).
 * - Browsers detect this as "not actually playing" and still suspend.
 *
 * DUAL strategy for maximum compatibility:
 *   Primary  → AudioContext + oscillator at gain 0.00001 (Android Chrome / iOS PWA)
 *   Fallback → <audio> element with a generated 3s silent WAV (actual 8-bit samples)
 *
 * CRITICAL: startKeepAlive() must be called synchronously within a user
 * gesture handler (button tap) for iOS to allow audio.play().
 */

// ── Singleton state ──────────────────────────────────────────────────────────
type AudioContextConstructor = typeof AudioContext;

let _ctx: AudioContext | null = null;
let _oscillator: OscillatorNode | null = null;
let _gain: GainNode | null = null;
let _audio: HTMLAudioElement | null = null;
let _blobUrl: string | null = null;
let _running = false;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generates a 3-second silent WAV blob URL with REAL 8-bit samples (0x80).
 * 0x80 = midpoint for unsigned 8-bit PCM = true silence (no DC offset).
 * Having actual sample data is what makes browsers register an audio session.
 */
function getSilentWavUrl(): string {
    if (_blobUrl) return _blobUrl;

    const sampleRate = 8000;
    const numSamples = sampleRate * 3; // 3 seconds
    const buffer = new ArrayBuffer(44 + numSamples);
    const view = new DataView(buffer);

    const writeStr = (offset: number, s: string) => {
        for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples, true); // file size - 8
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);           // PCM chunk size
    view.setUint16(20, 1, true);            // PCM format
    view.setUint16(22, 1, true);            // mono
    view.setUint32(24, sampleRate, true);   // sample rate
    view.setUint32(28, sampleRate, true);   // byte rate (8-bit mono)
    view.setUint16(32, 1, true);            // block align
    view.setUint16(34, 8, true);            // bits per sample
    writeStr(36, 'data');
    view.setUint32(40, numSamples, true);   // data chunk size

    // Fill with 0x80 = silence for unsigned 8-bit PCM
    new Uint8Array(buffer, 44).fill(0x80);

    _blobUrl = URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
    return _blobUrl;
}

/** Primary: AudioContext with a nearly-silent oscillator. */
function startAudioContext(): void {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Ctor: AudioContextConstructor = window.AudioContext ?? (window as any).webkitAudioContext;
        if (!Ctor) return;

        if (!_ctx) {
            _ctx = new Ctor();
            _gain = _ctx.createGain();
            _gain.gain.value = 0.00001; // −100 dB, completely inaudible
            _gain.connect(_ctx.destination);

            _oscillator = _ctx.createOscillator();
            _oscillator.frequency.value = 440;
            _oscillator.connect(_gain);
            _oscillator.start();
        }

        // iOS suspends AudioContext on page hide — resume it
        if (_ctx.state === 'suspended') {
            _ctx.resume().catch(() => { });
        }
    } catch { /* AudioContext not available */ }
}

/** Fallback: looping <audio> element with a real silent WAV. */
function startHtmlAudio(): void {
    try {
        if (!_audio) {
            _audio = new Audio(getSilentWavUrl());
            _audio.loop = true;
            _audio.volume = 0.001;
            // Required for inline playback on iOS
            _audio.setAttribute('playsinline', 'true');
            _audio.setAttribute('webkit-playsinline', 'true');
        }
        if (_audio.paused) {
            _audio.play().catch(() => { });
        }
    } catch { /* Audio element not available */ }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Start background keep-alive.
 * MUST be called synchronously from a user gesture handler (button tap).
 */
export function startKeepAlive(): void {
    if (typeof window === 'undefined') return;
    _running = true;
    startAudioContext();
    startHtmlAudio();
}

/** Pause keep-alive when playback stops. */
export function stopKeepAlive(): void {
    _running = false;
    try { _ctx?.suspend(); } catch { /* ignore */ }
    try { _audio?.pause(); } catch { /* ignore */ }
}

/**
 * Resume keep-alive after returning from background (handle visibilitychange).
 * Call this from a visibilitychange listener in the layout.
 */
export function resumeKeepAlive(): void {
    if (_running) {
        startAudioContext(); // re-resume AudioContext if suspended
        if (_audio?.paused) _audio.play().catch(() => { });
    }
}
