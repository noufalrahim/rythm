import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Album from '@/lib/models/Album';

export async function GET() {
    try {
        await dbConnect();
        const albums = await Album.find({})
            .populate('artist', 'name imageUrl verified')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ albums });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
    }
}
