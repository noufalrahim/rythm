import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Song from '@/lib/models/Song';
import Album from '@/lib/models/Album';
import Artist from '@/lib/models/Artist';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || '';
        if (!q.trim()) return NextResponse.json({ songs: [], albums: [], artists: [] });

        const regex = new RegExp(q, 'i');

        const [songs, albums, artists] = await Promise.all([
            Song.find({ title: regex })
                .populate('artist', 'name imageUrl')
                .populate('album', 'title coverUrl')
                .limit(10)
                .lean(),
            Album.find({ title: regex })
                .populate('artist', 'name imageUrl')
                .limit(6)
                .lean(),
            Artist.find({ name: regex }).limit(6).lean(),
        ]);

        return NextResponse.json({ songs, albums, artists });
    } catch {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
