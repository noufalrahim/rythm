'use client';

import { useEffect, useState } from 'react';
import AlbumCard from '@/components/AlbumCard';
import { Music2, Heart } from 'lucide-react';

interface Album {
    _id: string;
    title: string;
    coverUrl: string;
    year: number;
    genre: string;
    artist: { _id: string; name: string; imageUrl: string };
}

export default function LibraryPage() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/albums')
            .then(r => r.json())
            .then(d => setAlbums(d.albums || []))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="page-container">
            <h1 className="section-title" style={{ fontSize: '1.6rem', marginBottom: '28px' }}>Your Library</h1>

            {/* Liked Songs */}
            <div className="section">
                <div className="music-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', maxWidth: '400px' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 8, flexShrink: 0,
                        background: 'linear-gradient(135deg, #450af5, #c4efd9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Heart size={28} fill="white" color="white" />
                    </div>
                    <div>
                        <div className="music-card-title">Liked Songs</div>
                        <div className="music-card-sub">Playlist • 0 songs</div>
                    </div>
                </div>
            </div>

            {/* Albums */}
            {albums.length > 0 ? (
                <div className="section">
                    <h2 className="section-title" style={{ marginBottom: '16px' }}>Recently Added</h2>
                    <div className="cards-row">
                        {albums.map(album => <AlbumCard key={album._id} album={album} />)}
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <Music2 size={56} style={{ color: 'var(--text-muted)' }} />
                    <h3>Your library is empty</h3>
                    <p>Go to the home page and load some sample music to get started.</p>
                </div>
            )}
        </div>
    );
}
