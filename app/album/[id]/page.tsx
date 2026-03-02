'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Play, Shuffle } from 'lucide-react';
import SongCard from '@/components/SongCard';
import { usePlayer, Song } from '@/contexts/PlayerContext';

interface Album {
    _id: string;
    title: string;
    coverUrl: string;
    year: number;
    genre: string;
    artist: { _id: string; name: string; imageUrl: string };
}

export default function AlbumPage() {
    const params = useParams();
    const id = params.id as string;
    const [album, setAlbum] = useState<Album | null>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const { playSong } = usePlayer();

    useEffect(() => {
        if (!id) return;
        fetch(`/api/albums/${id}`)
            .then(r => r.json())
            .then(d => {
                setAlbum(d.album);
                setSongs(d.songs || []);
            })
            .finally(() => setLoading(false));
    }, [id]);

    const totalDuration = songs.reduce((acc, s) => acc + s.duration, 0);
    const formatTotal = (sec: number) => `${Math.floor(sec / 60)} min ${sec % 60} sec`;

    if (loading) return <div className="loading"><div className="loading-spinner" /></div>;
    if (!album) return <div className="empty-state"><h3>Album not found</h3></div>;

    return (
        <div>
            {/* Hero */}
            <div className="album-hero page-container">
                <div className="album-hero-cover">
                    <Image src={album.coverUrl || '/icons/icon-512.png'} alt={album.title} width={240} height={240} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                </div>
                <div className="album-hero-info">
                    <div className="album-hero-label">Album</div>
                    <h1 className="album-hero-title">{album.title}</h1>
                    <div className="album-hero-meta">
                        <span>{album.artist?.name}</span>
                        {' • '}
                        {album.year}
                        {' • '}
                        {songs.length} songs
                        {', '}
                        {formatTotal(totalDuration)}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="page-container">
                <div className="album-actions">
                    {songs.length > 0 && (
                        <>
                            <button className="btn-play-large" onClick={() => playSong(songs[0], songs)}>
                                <Play size={24} fill="black" color="black" />
                            </button>
                            <button
                                className="player-btn-sm"
                                style={{ padding: '8px' }}
                                onClick={() => {
                                    const shuffled = [...songs].sort(() => Math.random() - 0.5);
                                    playSong(shuffled[0], shuffled);
                                }}
                            >
                                <Shuffle size={24} />
                            </button>
                        </>
                    )}
                </div>

                {/* Songs Table */}
                <div>
                    {songs.map((song, i) => (
                        <SongCard key={song._id} song={song} queue={songs} index={i} showIndex />
                    ))}
                </div>
            </div>
        </div>
    );
}
