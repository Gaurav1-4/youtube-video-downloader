import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    const getVideoId = (u) => {
      try {
        const parsed = new URL(u);
        if (parsed.hostname.includes('youtube.com')) return parsed.searchParams.get('v');
        if (parsed.hostname.includes('youtu.be')) return parsed.pathname.slice(1);
      } catch(e) {}
      return null;
    };
    
    const videoId = getVideoId(url);
    if (!videoId) return NextResponse.json({error: 'Invalid URL'}, {status: 400});

    const response = await fetch(`https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`, {
      headers: {
        'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com',
        'x-rapidapi-key': '317871f23fmshc0f05cc41c39675p1b4264jsn6b97536679aa'
      }
    });

    if (!response.ok) {
      throw new Error('RapidAPI fetch failed: ' + response.statusText);
    }
    const data = await response.json();

    const title = data.title;
    const thumbnail = data.thumbnails && data.thumbnails.length > 0 ? data.thumbnails[data.thumbnails.length - 1].url : '';
    const author = data.channel?.name || 'Unknown Author';
    const lengthSeconds = data.lengthSeconds;

    // Map RapidAPI formats
    // RapidAPI returns audios.items and videos.items
    const videoWithAudio = [];
    const videoOnly = [];
    const audioOnly = [];

    if (data.videos && data.videos.items) {
      data.videos.items.forEach(v => {
        const formatObj = {
          itag: Buffer.from(v.url).toString('base64'), // Pass URL safely as base64
          qualityLabel: v.quality,
          container: v.extension,
          contentLength: v.size || 0,
          hasVideo: true,
          hasAudio: v.hasAudio,
          url: v.url
        };
        if (v.hasAudio) {
          videoWithAudio.push(formatObj);
        } else {
          videoOnly.push(formatObj);
        }
      });
    }

    if (data.audios && data.audios.items) {
      data.audios.items.forEach(a => {
        audioOnly.push({
          itag: Buffer.from(a.url).toString('base64'),
          qualityLabel: 'Audio',
          container: a.extension,
          contentLength: a.size || 0,
          hasVideo: false,
          hasAudio: true,
          url: a.url
        });
      });
    }

    return NextResponse.json({
      title,
      thumbnail,
      author,
      lengthSeconds,
      formats: {
        videoWithAudio,
        videoOnly,
        audioOnly,
      }
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video information. ' + error.message },
      { status: 500 }
    );
  }
}
