import { NextResponse } from 'next/server';
import { searchMusic, ytVideoToSong } from '@/lib/youtube';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const max = parseInt(searchParams.get('limit') || '15');

    if (!q.trim()) {
        return NextResponse.json({ songs: [] });
    }

    try {
        const videos = await searchMusic(q, max);
        const songs = videos.map(ytVideoToSong);
        return NextResponse.json({ songs });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Search failed';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
