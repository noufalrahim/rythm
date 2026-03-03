'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface PlaylistModalProps {
    mode: 'create' | 'edit';
    initialName?: string;
    initialDescription?: string;
    onClose: () => void;
    onSave: (data: { name: string; description: string }) => Promise<void>;
}

const COVER_GRADIENTS = [
    'linear-gradient(135deg, #1DB954, #0a7a35)',
    'linear-gradient(135deg, #450af5, #c4efd9)',
    'linear-gradient(135deg, #E8115B, #F230B5)',
    'linear-gradient(135deg, #E13300, #FFA500)',
    'linear-gradient(135deg, #1DA0C3, #00F5A0)',
    'linear-gradient(135deg, #8C67AC, #3D5AF1)',
];

export default function PlaylistModal({
    mode, initialName = '', initialDescription = '', onClose, onSave,
}: PlaylistModalProps) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [selectedGradient, setSelectedGradient] = useState(COVER_GRADIENTS[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Name is required'); return; }
        setLoading(true);
        setError('');
        try {
            await onSave({ name: name.trim(), description });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}><X size={20} /></button>

                <h2 className="modal-title">
                    {mode === 'create' ? 'Create playlist' : 'Edit playlist'}
                </h2>

                {/* Cover preview */}
                <div className="playlist-modal-preview" style={{ background: selectedGradient }}>
                    <span style={{ fontSize: '2rem' }}>🎵</span>
                </div>

                {/* Gradient picker */}
                <div className="playlist-gradient-row">
                    {COVER_GRADIENTS.map(g => (
                        <button
                            key={g}
                            className={`playlist-gradient-swatch ${selectedGradient === g ? 'active' : ''}`}
                            style={{ background: g }}
                            onClick={() => setSelectedGradient(g)}
                            type="button"
                        />
                    ))}
                </div>

                <form onSubmit={handleSave} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Playlist name</label>
                        <input
                            className="form-input"
                            style={{ paddingLeft: 16 }}
                            type="text"
                            placeholder="My Playlist #1"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            maxLength={60}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                        <textarea
                            className="form-input"
                            style={{ paddingLeft: 16, resize: 'vertical', minHeight: 80 }}
                            placeholder="Give your playlist a description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            maxLength={200}
                        />
                    </div>

                    {error && <div className="form-error">{error}</div>}

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn-secondary" type="button" onClick={onClose} style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button className="btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
