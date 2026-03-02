import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Playlist from '@/lib/models/Playlist';

export async function GET() {
    try {
        await dbConnect();
        const playlists = await Playlist.find({ isPublic: true })
            .populate({ path: 'songs', populate: [{ path: 'artist', select: 'name' }, { path: 'album', select: 'coverUrl' }] })
            .lean();
        return NextResponse.json({ playlists });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const playlist = await Playlist.create(body);
        return NextResponse.json({ playlist }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
    }
}
