/**
 * keepAlive.ts – Singleton silent audio for iOS/Android background playback.
 *
 * iOS requires audio.play() to be called SYNCHRONOUSLY within a user gesture
 * handler. Calling it from a React useEffect (after re-render) breaks this.
 * By keeping a module-level singleton we can call play() directly from
 * PlayerContext's playSong / togglePlay which run inside button tap handlers.
 *
 * The silent WAV is a minimal RIFF/WAVE file with zero samples.
 * Volume is set to 0.001 (~−60 dB) so it's completely inaudible.
 */

const SILENT_WAV =
    'data:audio/wav;base64,' +
    'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

let _audio: HTMLAudioElement | null = null;
let _ready = false;

function getAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!_audio) {
        _audio = new Audio(SILENT_WAV);
        _audio.loop = true;
        _audio.volume = 0.001;
        // webkit needs this attribute for inline playback on iOS
        _audio.setAttribute('playsinline', 'true');
        _audio.setAttribute('webkit-playsinline', 'true');
    }
    return _audio;
}

/**
 * Call once on first user interaction (e.g. inside playSong / togglePlay).
 * On iOS this "unlocks" the audio element so future plays work even if the
 * device screen is locked.
 */
export function startKeepAlive(): void {
    const audio = getAudio();
    if (!audio) return;
    if (!_ready || audio.paused) {
        audio.play().then(() => { _ready = true; }).catch(() => { });
    }
}

/** Pause the keep-alive when playback stops. */
export function stopKeepAlive(): void {
    _audio?.pause();
}
