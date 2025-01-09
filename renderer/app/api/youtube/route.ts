import { NextResponse } from 'next/server';
// import yts from 'yt-search';
import Youtube  from 'youtube-sr';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const maxResults = 1;
  if (!query) {
    return NextResponse.json(
      { error: 'Missing "query" parameter' },
      { status: 400 }
    );
  }
  const videos = await Youtube.search(query)
  // const results = await yts(query);
  // if (!results || !results.videos.length) {
  //   throw new Error('No videos found');
  // }
  const data = videos.map(video => ({
    title: video.title,
    id:video.id,
    url: video.url,
    views: video.views,
  }));
  return NextResponse.json(data);
  
  // // const apiKey = process.env.YOUTUBE_API_KEY;
  // // if (!apiKey) {
  // //   return NextResponse.json(
  // //     { error: 'Missing YouTube API key in environment variables' },
  // //     { status: 500 }
  // //   );
  // // }

  // // try {
  // //   const response = await fetch(
  // //     `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
  // //       query
  // //     )}&type=video&key=${apiKey}&maxResults=${maxResults}`
  // //   );
  // //   if (!response.ok) {
  // //     throw new Error(`YouTube API error: ${response.statusText}`);
  // //   }

  // //   const data = await response.json();
  // //   return NextResponse.json(data);
  // } catch (error) {
  //   console.error('YouTube API request failed:', error);
  //   return NextResponse.json(
  //     { error: 'Failed to fetch YouTube data' },
  //     { status: 500 }
  //   );
  // }
}