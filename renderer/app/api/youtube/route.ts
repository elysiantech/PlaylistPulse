import { NextResponse } from 'next/server';
import Youtube from 'youtube-sr';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  
  if (!query) {
    return NextResponse.json(
      { error: 'Missing "query" parameter' },
      { status: 400 }
    );
  }

  try {
    const videos = await Youtube.search(query);
    const data = videos.map(video => ({
      title: video.title,
      id: video.id,
      url: video.url,
      views: video.views,
    }));
    return NextResponse.json(data);
  } catch (error) {
    console.error('YouTube search failed:', error);
    return NextResponse.json(
      { error: 'Failed to search YouTube videos' },
      { status: 500 }
    );
  }
}