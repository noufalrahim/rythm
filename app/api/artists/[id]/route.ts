import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Artist from '@/lib/models/Artist';
import Album from '@/lib/models/Album';
import Song from '@/lib/models/Song';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const artist = await Artist.findById(id).lean();
        if (!artist) return NextResponse.json({ error: 'Artist not found' }, { status: 404 });

        const albums = await Album.find({ artist: id }).lean();
        const topSongs = await Song.find({ artist: id })
            .populate('album', 'title coverUrl')
            .sort({ plays: -1 })
            .limit(10)
            .lean();

        return NextResponse.json({ artist, albums, topSongs });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch artist' }, { status: 500 });
    }
}
