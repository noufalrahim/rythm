'use client';

import { useState } from 'react';
import { X, Music4, Eye, EyeOff, Mail, User, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Mode = 'login' | 'register';

interface AuthModalProps {
    onClose: () => void;
    initialMode?: Mode;
}

export default function AuthModal({ onClose, initialMode = 'login' }: AuthModalProps) {
    const { login, register } = useAuth();
    const [mode, setMode] = useState<Mode>(initialMode);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login({ email, password });
            } else {
                await register({ name, email, password });
            }
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card auth-modal" onClick={e => e.stopPropagation()}>
                {/* Close */}
                <button className="modal-close" onClick={onClose}><X size={20} /></button>

                {/* Logo */}
                <div className="auth-modal-logo">
                    <Music4 size={32} style={{ color: 'var(--green)' }} />
                    <span>Rythm</span>
                </div>

                {/* Title */}
                <h2 className="auth-modal-title">
                    {mode === 'login' ? 'Log in to Rythm' : 'Sign up for free'}
                </h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    {mode === 'register' && (
                        <div className="form-group">
                            <label className="form-label">Your name</label>
                            <div className="form-input-wrap">
                                <User size={16} className="form-input-icon" />
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="e.g. John Smith"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email address</label>
                        <div className="form-input-wrap">
                            <Mail size={16} className="form-input-icon" />
                            <input
                                className="form-input"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="form-input-wrap">
                            <Lock size={16} className="form-input-icon" />
                            <input
                                className="form-input form-input-pr"
                                type={showPassword ? 'text' : 'password'}
                                placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="form-input-suffix"
                                onClick={() => setShowPassword(p => !p)}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && <div className="form-error">{error}</div>}

                    <button className="btn-primary btn-full" type="submit" disabled={loading}>
                        {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
                    </button>
                </form>

                <div className="auth-modal-switch">
                    {mode === 'login' ? (
                        <>Don&apos;t have an account?{' '}
                            <button className="auth-switch-btn" onClick={() => { setMode('register'); setError(''); }}>
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>Already have an account?{' '}
                            <button className="auth-switch-btn" onClick={() => { setMode('login'); setError(''); }}>
                                Log in
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
