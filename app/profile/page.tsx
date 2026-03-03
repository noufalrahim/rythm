'use client';

import { useState } from 'react';
import { User, Mail, Phone, Edit2, LogOut, Save, X, Music2, Heart } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';

export default function ProfilePage() {
    const { user, loading, logout, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showAuth, setShowAuth] = useState(false);

    const startEdit = () => {
        setName(user?.name || '');
        setBio(user?.bio || '');
        setAvatar(user?.avatar || '');
        setEditing(true);
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await updateUser({ name, bio, avatar });
            setEditing(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading"><div className="loading-spinner" /></div>;

    if (!user) {
        return (
            <div className="page-container">
                <div className="empty-state" style={{ minHeight: '60vh' }}>
                    <User size={56} style={{ color: 'var(--text-muted)' }} />
                    <h3>Sign in to view your profile</h3>
                    <button className="btn-primary" onClick={() => setShowAuth(true)} style={{ marginTop: 8 }}>Sign in</button>
                </div>
                {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Profile hero */}
            <div className="profile-hero">
                <div className="profile-avatar-wrap">
                    {user.avatar ? (
                        <Image src={user.avatar} alt={user.name} width={120} height={120} className="profile-avatar-img" />
                    ) : (
                        <div className="profile-avatar-placeholder">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="profile-hero-info">
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>Profile</div>
                    <h1 className="album-hero-title" style={{ fontSize: 'clamp(1.4rem, 5vw, 2.5rem)' }}>{user.name}</h1>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 6 }}>
                        {user.email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-subdued)', fontSize: '0.85rem' }}>
                                <Mail size={14} />{user.email}
                            </span>
                        )}
                        {user.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-subdued)', fontSize: '0.85rem' }}>
                                <Phone size={14} />{user.phone}
                            </span>
                        )}
                    </div>
                    {user.bio && <p style={{ color: 'var(--text-subdued)', marginTop: 8, fontSize: '0.9rem' }}>{user.bio}</p>}
                </div>
            </div>

            {/* Actions */}
            <div className="album-actions" style={{ marginBottom: 32 }}>
                <button className="btn-primary" onClick={startEdit}>
                    <Edit2 size={16} /> Edit Profile
                </button>
                <button className="btn-secondary" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LogOut size={16} /> Log out
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
                {[
                    { icon: <Music2 size={24} style={{ color: 'var(--green)' }} />, label: 'Playlists', value: '—' },
                    { icon: <Heart size={24} style={{ color: '#E8115B' }} />, label: 'Liked Songs', value: '—' },
                ].map(stat => (
                    <div key={stat.label} style={{
                        background: 'var(--bg-highlight)',
                        borderRadius: 12, padding: '20px 16px',
                        display: 'flex', flexDirection: 'column', gap: 10,
                    }}>
                        {stat.icon}
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-subdued)' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Edit modal */}
            {editing && (
                <div className="modal-backdrop" onClick={() => setEditing(false)}>
                    <div className="modal-card" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setEditing(false)}><X size={20} /></button>
                        <h2 className="modal-title">Edit Profile</h2>

                        <div className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Display name</label>
                                <input className="form-input" style={{ paddingLeft: 16 }} type="text" value={name}
                                    onChange={e => setName(e.target.value)} placeholder="Your name" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bio</label>
                                <textarea className="form-input" style={{ paddingLeft: 16, resize: 'vertical', minHeight: 80 }}
                                    value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Avatar URL</label>
                                <input className="form-input" style={{ paddingLeft: 16 }} type="url" value={avatar}
                                    onChange={e => setAvatar(e.target.value)} placeholder="https://..." />
                            </div>

                            {error && <div className="form-error">{error}</div>}

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(false)}>
                                    <X size={16} /> Cancel
                                </button>
                                <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                                    <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
