import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Song from '@/lib/models/Song';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const song = await Song.findById(id)
            .populate('artist', 'name imageUrl verified')
            .populate('album', 'title coverUrl year')
            .lean();

        if (!song) return NextResponse.json({ error: 'Song not found' }, { status: 404 });
        return NextResponse.json({ song });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch song' }, { status: 500 });
    }
}
