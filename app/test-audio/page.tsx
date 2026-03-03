'use client';

import { useState, useEffect } from 'react';
import { startKeepAlive, stopKeepAlive, getKeepAliveStatus } from '@/lib/keepAlive';

/**
 * /test-audio – Debug page to verify background audio keep-alive works.
 *
 * Instructions:
 * 1. Open this page and tap "Start Keep-Alive"
 * 2. Lock your screen
 * 3. Unlock and tap "Check Status" — AudioContext should still be "running"
 *    If it went to "suspended", the browser suspended it (expected on iOS Safari)
 */
export default function TestAudioPage() {
    const [status, setStatus] = useState<Record<string, string> | null>(null);
    const [log, setLog] = useState<string[]>([]);
    const [running, setRunning] = useState(false);

    const addLog = (msg: string) => {
        const ts = new Date().toLocaleTimeString();
        setLog(prev => [`[${ts}] ${msg}`, ...prev.slice(0, 19)]);
    };

    useEffect(() => {
        const handler = () => {
            addLog(`Page visibility: ${document.visibilityState}`);
            setStatus(getKeepAliveStatus());
        };
        document.addEventListener('visibilitychange', handler);
        return () => document.removeEventListener('visibilitychange', handler);
    }, []);

    const handleStart = () => {
        startKeepAlive();
        setRunning(true);
        setStatus(getKeepAliveStatus());
        addLog('Keep-alive STARTED');
    };

    const handleStop = () => {
        stopKeepAlive();
        setRunning(false);
        setStatus(getKeepAliveStatus());
        addLog('Keep-alive STOPPED');
    };

    const handleCheck = () => {
        const s = getKeepAliveStatus();
        setStatus(s);
        addLog(`Status check → AudioCtx: ${s.audioCtxState}, Audio paused: ${s.audioPaused}`);
    };

    return (
        <div style={{ padding: 24, maxWidth: 480, margin: '0 auto', fontFamily: 'monospace' }}>
            <h1 style={{ fontSize: '1.2rem', marginBottom: 4 }}>🔊 Background Audio Test</h1>
            <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: 24 }}>
                Tap Start → lock screen → unlock → tap Check Status.<br />
                AudioContext should remain &quot;running&quot; if keep-alive is active.
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                <button
                    onClick={handleStart}
                    disabled={running}
                    style={btnStyle('#1DB954', '#000')}
                >
                    ▶ Start Keep-Alive
                </button>
                <button
                    onClick={handleCheck}
                    style={btnStyle('#333', '#fff')}
                >
                    🔄 Check Status
                </button>
                <button
                    onClick={handleStop}
                    disabled={!running}
                    style={btnStyle('#e91429', '#fff')}
                >
                    ⏹ Stop
                </button>
            </div>

            {status && (
                <div style={{ background: '#1a1a1a', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                    <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: 8 }}>CURRENT STATUS</div>
                    {Object.entries(status).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ color: '#aaa' }}>{k}</span>
                            <span style={{
                                color: v === 'running' || v === 'true' ? '#1DB954'
                                    : v === 'suspended' || v === 'null' ? '#e91429'
                                        : '#fff',
                                fontWeight: 700,
                            }}>{v}</span>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 12 }}>
                <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: 8 }}>EVENT LOG</div>
                {log.length === 0
                    ? <div style={{ color: '#555', fontSize: '0.8rem' }}>Events will appear here…</div>
                    : log.map((l, i) => (
                        <div key={i} style={{ color: '#ccc', fontSize: '0.78rem', marginBottom: 2 }}>{l}</div>
                    ))
                }
            </div>

            <p style={{ color: '#555', fontSize: '0.75rem', marginTop: 16 }}>
                ✅ AudioCtx: &quot;running&quot; + Audio paused: &quot;false&quot; = keep-alive active<br />
                ❌ AudioCtx: &quot;suspended&quot; = browser suspended it (iOS Safari in browser mode)<br />
                💡 Install as PWA for best results on iOS
            </p>
        </div>
    );
}

function btnStyle(bg: string, color: string): React.CSSProperties {
    return {
        background: bg, color,
        border: 'none', borderRadius: 20,
        padding: '10px 18px', fontWeight: 700,
        fontSize: '0.85rem', cursor: 'pointer',
    };
}
