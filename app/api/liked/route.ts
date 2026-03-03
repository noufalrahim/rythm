import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LikedSong from '@/lib/models/LikedSong';
import { getAuthUser } from '@/lib/auth';

// GET – list liked songs for current user
export async function GET() {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const liked = await LikedSong.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ songs: liked });
}

// POST – like a song
export async function POST(request: Request) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { songId, songData } = await request.json();
    if (!songId || !songData) return NextResponse.json({ error: 'Missing songId or songData' }, { status: 400 });

    try {
        const liked = await LikedSong.findOneAndUpdate(
            { userId: user._id, songId },
            { userId: user._id, songId, songData },
            { upsert: true, new: true }
        );
        return NextResponse.json({ liked }, { status: 201 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to like song';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

// DELETE – unlike a song (?songId=...)
export async function DELETE(request: Request) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('songId');
    if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 });

    await LikedSong.deleteOne({ userId: user._id, songId });
    return NextResponse.json({ message: 'Unliked' });
}
