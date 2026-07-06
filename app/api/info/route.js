import { NextResponse } from 'next/server';

async function fetchFromPrimaryAPI(videoId) {
  // We use youtube-info-download-api as the primary now because it has a massive 500,000 req/mo (500 units/day) limit!
  const response = await fetch(`https://youtube-info-download-api.p.rapidapi.com/ajax/api.php?function=i&u=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${videoId}`, {
    headers: {
      'x-rapidapi-host': 'youtube-info-download-api.p.rapidapi.com',
      'x-rapidapi-key': '317871f23fmshc0f05cc41c39675p1b4264jsn6b97536679aa'
    }
  });

  if (!response.ok) {
    throw new Error('Primary API fetch failed: ' + response.statusText);
  }
  const data = await response.json();

  if (!data.title || !data.thumbnail) {
    throw new Error('Invalid response from Primary API');
  }

  // We upgrade the thumbnail to maxresdefault if possible
  const hqThumbnail = data.thumbnail;
  const maxResThumbnail = hqThumbnail.replace('hqdefault.jpg', 'maxresdefault.jpg');

  return { 
    title: data.title, 
    thumbnail: maxResThumbnail, 
    author: data.author || 'Unknown Author', 
    lengthSeconds: 0, 
    formats: { videoWithAudio: [], videoOnly: [], audioOnly: [] } 
  };
}

async function fetchFromFallbackAPI(videoId) {
  // youtube-media-downloader (100/month limit) serves as a great fallback
  const response = await fetch(`https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`, {
    headers: {
      'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com',
      'x-rapidapi-key': '317871f23fmshc0f05cc41c39675p1b4264jsn6b97536679aa'
    }
  });

  if (!response.ok) {
    throw new Error('Fallback API fetch failed: ' + response.statusText);
  }
  const data = await response.json();

  const title = data.title;
  const thumbnail = data.thumbnails && data.thumbnails.length > 0 ? data.thumbnails[data.thumbnails.length - 1].url : '';
  const author = data.channel?.name || 'Unknown Author';
  
  return { title, thumbnail, author, lengthSeconds: 0, formats: { videoWithAudio: [], videoOnly: [], audioOnly: [] } };
}

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

    try {
      console.log('Attempting Primary API (youtube-info-download-api)...');
      const primaryData = await fetchFromPrimaryAPI(videoId);
      return NextResponse.json(primaryData);
    } catch (primaryErr) {
      console.error('Primary API failed, falling back...', primaryErr.message);
      try {
        console.log('Attempting Fallback API (youtube-media-downloader)...');
        const fallbackData = await fetchFromFallbackAPI(videoId);
        return NextResponse.json(fallbackData);
      } catch (fallbackErr) {
        console.error('Fallback API also failed', fallbackErr.message);
        throw new Error('All APIs failed to retrieve the video thumbnail.');
      }
    }
  } catch (error) {
    console.error('Error fetching video info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video information. ' + error.message },
      { status: 500 }
    );
  }
}
