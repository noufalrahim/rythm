import { NextResponse } from 'next/server';
import { getTrendingMusic, ytVideoToSong } from '@/lib/youtube';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const max = parseInt(searchParams.get('limit') || '20');
    const region = searchParams.get('region') || 'US';

    try {
        const videos = await getTrendingMusic(max, region);
        const songs = videos.map(ytVideoToSong);
        return NextResponse.json({ songs });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to fetch trending music';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
