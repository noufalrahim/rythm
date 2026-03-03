import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Playlist from '@/lib/models/Playlist';
import { getAuthUser } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

// GET /api/playlists/[id]
export async function GET(_req: Request, { params }: Params) {
    await dbConnect();
    const { id } = await params;
    const playlist = await Playlist.findById(id).lean();
    if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ playlist });
}

// PUT /api/playlists/[id] – edit name/description/coverUrl
export async function PUT(request: Request, { params }: Params) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const playlist = await Playlist.findById(id);
    if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (playlist.userId.toString() !== user._id.toString())
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { name, description, coverUrl, isPublic } = await request.json();
    if (name) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description;
    if (coverUrl !== undefined) playlist.coverUrl = coverUrl;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save();
    return NextResponse.json({ playlist });
}

// DELETE /api/playlists/[id]
export async function DELETE(_req: Request, { params }: Params) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const playlist = await Playlist.findById(id);
    if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (playlist.userId.toString() !== user._id.toString())
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await playlist.deleteOne();
    return NextResponse.json({ message: 'Deleted' });
}
