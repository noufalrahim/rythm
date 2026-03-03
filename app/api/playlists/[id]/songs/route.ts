import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Playlist from '@/lib/models/Playlist';
import { getAuthUser } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

// POST /api/playlists/[id]/songs – add a song
export async function POST(request: Request, { params }: Params) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const playlist = await Playlist.findById(id);
    if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (playlist.userId.toString() !== user._id.toString())
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { songId, title, artistName, coverUrl, duration, youtubeVideoId, source } = await request.json();
    if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 });

    // Avoid duplicates
    const exists = playlist.songs.some(s => s.songId === songId);
    if (exists) return NextResponse.json({ message: 'Already in playlist', playlist });

    playlist.songs.push({ songId, title, artistName, coverUrl, duration: duration || 0, youtubeVideoId, source: source || 'youtube' });
    await playlist.save();
    return NextResponse.json({ playlist });
}

// DELETE /api/playlists/[id]/songs – remove a song (songId in body)
export async function DELETE(request: Request, { params }: Params) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const playlist = await Playlist.findById(id);
    if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (playlist.userId.toString() !== user._id.toString())
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { songId } = await request.json();
    playlist.songs = playlist.songs.filter(s => s.songId !== songId) as typeof playlist.songs;
    await playlist.save();
    return NextResponse.json({ playlist });
}
