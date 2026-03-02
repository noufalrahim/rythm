'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ArtistCardProps {
    artist: {
        _id: string;
        name: string;
        imageUrl: string;
        monthlyListeners: number;
        verified?: boolean;
    };
}

function formatListeners(n: number) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M monthly listeners`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K monthly listeners`;
    return `${n} monthly listeners`;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
    return (
        <Link href={`/artist/${artist._id}`} className="artist-card">
            <div className="artist-card-img-wrap">
                <Image
                    src={artist.imageUrl || '/icons/icon-512.png'}
                    alt={artist.name}
                    width={180}
                    height={180}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
            </div>
            <div className="artist-card-info">
                <div className="artist-card-name">{artist.name}</div>
                <div className="artist-card-sub">{formatListeners(artist.monthlyListeners)}</div>
            </div>
        </Link>
    );
}
