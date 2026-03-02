const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE = 'https://www.googleapis.com/youtube/v3';

export interface YTVideoItem {
    id: string;
    title: string;
    channelId: string;
    channelTitle: string;
    thumbnail: string;
    duration: number; // seconds
    viewCount: number;
}

/** Parse ISO 8601 duration (e.g. PT3M45S) → seconds */
export function parseDuration(iso: string): number {
    if (!iso) return 0;
    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!m) return 0;
    return (parseInt(m[1] || '0') * 3600) +
        (parseInt(m[2] || '0') * 60) +
        parseInt(m[3] || '0');
}

/** Map a YouTube video resource (from videos.list) to our internal YTVideoItem */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVideo(item: any): YTVideoItem {
    return {
        id: item.id?.videoId ?? item.id,
        title: item.snippet.title,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        thumbnail:
            item.snippet.thumbnails?.maxres?.url ??
            item.snippet.thumbnails?.high?.url ??
            item.snippet.thumbnails?.medium?.url ?? '',
        duration: parseDuration(item.contentDetails?.duration ?? ''),
        viewCount: parseInt(item.statistics?.viewCount ?? '0'),
    };
}

/** Get trending music videos (YouTube Music category = 10) */
export async function getTrendingMusic(maxResults = 20, regionCode = 'US'): Promise<YTVideoItem[]> {
    if (!API_KEY) throw new Error('YOUTUBE_API_KEY not set');
    const url =
        `${BASE}/videos?part=snippet,contentDetails,statistics` +
        `&chart=mostPopular&videoCategoryId=10` +
        `&maxResults=${maxResults}&regionCode=${regionCode}&key=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.items ?? []).map(mapVideo);
}

/** Search YouTube for music videos */
export async function searchMusic(query: string, maxResults = 15): Promise<YTVideoItem[]> {
    if (!API_KEY) throw new Error('YOUTUBE_API_KEY not set');
    // Step 1: search for video IDs
    const searchUrl =
        `${BASE}/search?part=snippet&type=video&videoCategoryId=10` +
        `&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${API_KEY}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    if (searchData.error) throw new Error(searchData.error.message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ids = (searchData.items ?? []).map((i: any) => i.id?.videoId).filter(Boolean).join(',');
    if (!ids) return [];

    // Step 2: fetch full details (duration etc.)
    const detailUrl =
        `${BASE}/videos?part=snippet,contentDetails,statistics&id=${ids}&key=${API_KEY}`;
    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();
    if (detailData.error) throw new Error(detailData.error.message);
    return (detailData.items ?? []).map(mapVideo);
}

/** Map a YTVideoItem to our Song shape (used in PlayerContext) */
export function ytVideoToSong(v: YTVideoItem) {
    return {
        _id: v.id,
        title: v.title,
        artist: { _id: v.channelId, name: v.channelTitle, imageUrl: '' },
        album: undefined,
        coverUrl: v.thumbnail,
        audioUrl: '',
        youtubeVideoId: v.id,
        duration: v.duration,
        plays: v.viewCount,
    };
}
