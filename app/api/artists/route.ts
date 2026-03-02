import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Artist from '@/lib/models/Artist';

export async function GET() {
    try {
        await dbConnect();
        const artists = await Artist.find({}).sort({ monthlyListeners: -1 }).lean();
        return NextResponse.json({ artists });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 });
    }
}
