import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Artist from '@/lib/models/Artist';
import Album from '@/lib/models/Album';
import Song from '@/lib/models/Song';
import Playlist from '@/lib/models/Playlist';

const COVER_IMAGES = [
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1574169208507-84376144848b?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1462965326201-d02e4f455804?w=300&h=300&fit=crop',
];

const ARTIST_IMAGES = [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1547328415-7b4f8cb17361?w=300&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80',
];

export async function POST() {
    try {
        await dbConnect();

        // Clear existing data
        await Artist.deleteMany({});
        await Album.deleteMany({});
        await Song.deleteMany({});
        await Playlist.deleteMany({});

        // Create Artists
        const artistsData = [
            { name: 'Luna Eclipse', bio: 'Indie pop sensation from Los Angeles, known for dreamy soundscapes.', imageUrl: ARTIST_IMAGES[0], monthlyListeners: 12500000, verified: true },
            { name: 'The Neon Wolves', bio: 'Alternative rock band pushing the boundaries of modern sound.', imageUrl: ARTIST_IMAGES[1], monthlyListeners: 8700000, verified: true },
            { name: 'Marcus Veil', bio: 'Neo-soul artist and multi-instrumentalist with a hypnotic presence.', imageUrl: ARTIST_IMAGES[2], monthlyListeners: 5200000, verified: true },
            { name: 'Aurora Sky', bio: 'Electronic music producer blending ambient and dance genres.', imageUrl: ARTIST_IMAGES[3], monthlyListeners: 9100000, verified: true },
            { name: 'Jordan Sage', bio: 'Hip-hop lyricist redefining storytelling in modern rap.', imageUrl: ARTIST_IMAGES[4], monthlyListeners: 15300000, verified: true },
        ];

        const artists = await Artist.insertMany(artistsData);

        // Create Albums
        const albumsData = [
            { title: 'Midnight Reverie', artist: artists[0]._id, coverUrl: COVER_IMAGES[0], year: 2024, genre: 'Indie Pop' },
            { title: 'Electric Wolves', artist: artists[1]._id, coverUrl: COVER_IMAGES[1], year: 2024, genre: 'Alternative Rock' },
            { title: 'Soul Depths', artist: artists[2]._id, coverUrl: COVER_IMAGES[2], year: 2023, genre: 'Neo-Soul' },
            { title: 'Neon Horizon', artist: artists[3]._id, coverUrl: COVER_IMAGES[3], year: 2024, genre: 'Electronic' },
            { title: 'City Chronicles', artist: artists[4]._id, coverUrl: COVER_IMAGES[4], year: 2024, genre: 'Hip-Hop' },
            { title: 'Glass Dreams', artist: artists[0]._id, coverUrl: COVER_IMAGES[5], year: 2023, genre: 'Indie Pop' },
        ];

        const albums = await Album.insertMany(albumsData);

        // Create Songs
        const songsData = [
            // Midnight Reverie (Luna Eclipse)
            { title: 'Starlight Fade', artist: artists[0]._id, album: albums[0]._id, duration: 213, audioUrl: '', coverUrl: COVER_IMAGES[0], genre: 'Indie Pop', plays: 14200000, trackNumber: 1 },
            { title: 'Velvet Skies', artist: artists[0]._id, album: albums[0]._id, duration: 198, audioUrl: '', coverUrl: COVER_IMAGES[0], genre: 'Indie Pop', plays: 9800000, trackNumber: 2 },
            { title: 'Hollow Moon', artist: artists[0]._id, album: albums[0]._id, duration: 245, audioUrl: '', coverUrl: COVER_IMAGES[0], genre: 'Indie Pop', plays: 7600000, trackNumber: 3 },
            { title: 'Dreaming in Blue', artist: artists[0]._id, album: albums[0]._id, duration: 187, audioUrl: '', coverUrl: COVER_IMAGES[0], genre: 'Indie Pop', plays: 5300000, trackNumber: 4 },
            // Electric Wolves
            { title: 'Voltage', artist: artists[1]._id, album: albums[1]._id, duration: 231, audioUrl: '', coverUrl: COVER_IMAGES[1], genre: 'Alternative Rock', plays: 11500000, trackNumber: 1 },
            { title: 'Neon Teeth', artist: artists[1]._id, album: albums[1]._id, duration: 204, audioUrl: '', coverUrl: COVER_IMAGES[1], genre: 'Alternative Rock', plays: 8200000, trackNumber: 2 },
            { title: 'Thunder Road', artist: artists[1]._id, album: albums[1]._id, duration: 267, audioUrl: '', coverUrl: COVER_IMAGES[1], genre: 'Alternative Rock', plays: 6700000, trackNumber: 3 },
            // Soul Depths
            { title: 'Warm Rivers', artist: artists[2]._id, album: albums[2]._id, duration: 256, audioUrl: '', coverUrl: COVER_IMAGES[2], genre: 'Neo-Soul', plays: 5100000, trackNumber: 1 },
            { title: 'Cognac Nights', artist: artists[2]._id, album: albums[2]._id, duration: 219, audioUrl: '', coverUrl: COVER_IMAGES[2], genre: 'Neo-Soul', plays: 4300000, trackNumber: 2 },
            { title: 'Satin Touch', artist: artists[2]._id, album: albums[2]._id, duration: 234, audioUrl: '', coverUrl: COVER_IMAGES[2], genre: 'Neo-Soul', plays: 3900000, trackNumber: 3 },
            // Neon Horizon
            { title: 'Pulse City', artist: artists[3]._id, album: albums[3]._id, duration: 198, audioUrl: '', coverUrl: COVER_IMAGES[3], genre: 'Electronic', plays: 9800000, trackNumber: 1 },
            { title: 'Binary Sunrise', artist: artists[3]._id, album: albums[3]._id, duration: 312, audioUrl: '', coverUrl: COVER_IMAGES[3], genre: 'Electronic', plays: 7200000, trackNumber: 2 },
            { title: 'Ultraviolet', artist: artists[3]._id, album: albums[3]._id, duration: 267, audioUrl: '', coverUrl: COVER_IMAGES[3], genre: 'Electronic', plays: 6100000, trackNumber: 3 },
            // City Chronicles
            { title: 'Street Mandala', artist: artists[4]._id, album: albums[4]._id, duration: 189, audioUrl: '', coverUrl: COVER_IMAGES[4], genre: 'Hip-Hop', plays: 18300000, trackNumber: 1 },
            { title: 'Downtown Prophecy', artist: artists[4]._id, album: albums[4]._id, duration: 214, audioUrl: '', coverUrl: COVER_IMAGES[4], genre: 'Hip-Hop', plays: 13800000, trackNumber: 2 },
            { title: 'Corner Store', artist: artists[4]._id, album: albums[4]._id, duration: 198, audioUrl: '', coverUrl: COVER_IMAGES[4], genre: 'Hip-Hop', plays: 10200000, trackNumber: 3 },
            // Glass Dreams
            { title: 'Crystal Radio', artist: artists[0]._id, album: albums[5]._id, duration: 225, audioUrl: '', coverUrl: COVER_IMAGES[5], genre: 'Indie Pop', plays: 4200000, trackNumber: 1 },
            { title: 'Paper Wings', artist: artists[0]._id, album: albums[5]._id, duration: 203, audioUrl: '', coverUrl: COVER_IMAGES[5], genre: 'Indie Pop', plays: 3700000, trackNumber: 2 },
        ];

        const songs = await Song.insertMany(songsData);

        // Create Playlist
        await Playlist.create({
            name: 'Top Hits 2024',
            description: 'The biggest songs of 2024',
            coverUrl: COVER_IMAGES[0],
            // @ts-expect-error – Mongoose accepts ObjectId[] at runtime for subdocument arrays
            songs: songs.slice(0, 8).map(s => s._id),
            userId: 'guest',
            isPublic: true,
        });

        return NextResponse.json({
            message: 'Database seeded successfully!',
            counts: { artists: artists.length, albums: albums.length, songs: songs.length },
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
    }
}
