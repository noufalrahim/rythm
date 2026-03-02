import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Song from '@/lib/models/Song';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');

        const songs = await Song.find({})
            .populate('artist', 'name imageUrl verified')
            .populate('album', 'title coverUrl year')
            .sort({ plays: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .lean();

        const total = await Song.countDocuments();

        return NextResponse.json({ songs, total, page, limit });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
    }
}
