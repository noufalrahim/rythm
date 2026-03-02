import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Album from '@/lib/models/Album';
import Song from '@/lib/models/Song';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const album = await Album.findById(id)
            .populate('artist', 'name imageUrl verified')
            .lean();

        if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 });

        const songs = await Song.find({ album: id })
            .populate('artist', 'name imageUrl verified')
            .sort({ trackNumber: 1 })
            .lean();

        return NextResponse.json({ album, songs });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch album' }, { status: 500 });
    }
}
