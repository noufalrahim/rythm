'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';

interface AlbumCardProps {
    album: {
        _id: string;
        title: string;
        coverUrl: string;
        year: number;
        genre?: string;
        artist: { _id: string; name: string };
    };
}

export default function AlbumCard({ album }: AlbumCardProps) {
    return (
        <Link href={`/album/${album._id}`} className="music-card">
            <div className="music-card-img-wrap">
                <Image
                    src={album.coverUrl || '/icons/icon-512.png'}
                    alt={album.title}
                    width={200}
                    height={200}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="music-card-play-overlay">
                    <div className="music-card-play-btn">
                        <Play size={22} fill="black" color="black" />
                    </div>
                </div>
            </div>
            <div className="music-card-info">
                <div className="music-card-title">{album.title}</div>
                <div className="music-card-sub">
                    {album.year} • {album.artist?.name}
                </div>
            </div>
        </Link>
    );
}
