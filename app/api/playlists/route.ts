import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Playlist from '@/lib/models/Playlist';
import { getAuthUser } from '@/lib/auth';

// GET /api/playlists – user's playlists (auth) or public playlists
export async function GET() {
    await dbConnect();
    const user = await getAuthUser();

    const filter = user ? { userId: user._id } : { isPublic: true };
    const playlists = await Playlist.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ playlists });
}

// POST /api/playlists – create a playlist (auth required)
export async function POST(request: Request) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { name, description, isPublic } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const playlist = await Playlist.create({
        name: name.trim(),
        description: description || '',
        coverUrl: '',
        userId: user._id,
        songs: [],
        isPublic: isPublic !== false,
    });

    return NextResponse.json({ playlist }, { status: 201 });
}
