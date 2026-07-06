import { NextResponse } from 'next/server';

async function fetchFromPrimaryAPI(videoId) {
  const response = await fetch(`https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`, {
    headers: {
      'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com',
      'x-rapidapi-key': '317871f23fmshc0f05cc41c39675p1b4264jsn6b97536679aa'
    }
  });

  if (!response.ok) {
    throw new Error('Primary API fetch failed: ' + response.statusText);
  }
  const data = await response.json();

  const title = data.title;
  // Get highest quality thumbnail available
  const thumbnail = data.thumbnails && data.thumbnails.length > 0 ? data.thumbnails[data.thumbnails.length - 1].url : '';
  const author = data.channel?.name || 'Unknown Author';
  const lengthSeconds = data.lengthSeconds;

  // We no longer fetch or map video/audio formats to save bandwidth and compute
  return { title, thumbnail, author, lengthSeconds, formats: { videoWithAudio: [], videoOnly: [], audioOnly: [] } };
}

async function fetchFromFallbackAPI(videoId) {
  const headers = {
    'x-rapidapi-host': 'youtube-data16.p.rapidapi.com',
    'x-rapidapi-key': '317871f23fmshc0f05cc41c39675p1b4264jsn6b97536679aa',
    'Content-Type': 'application/json'
  };

  // 1. Get video details (this is the ONLY request we make to save limits)
  const detailsRes = await fetch(`https://youtube-data16.p.rapidapi.com/videos?ids=${videoId}`, { headers });
  if (!detailsRes.ok) throw new Error('Fallback API details fetch failed');
  const detailsData = await detailsRes.json();
  
  if (!detailsData.data || detailsData.data.length === 0) {
    throw new Error('Video not found on Fallback API');
  }
  
  const videoInfo = detailsData.data[0];
  const title = videoInfo.title;
  const author = videoInfo.channelTitle;
  const lengthSeconds = videoInfo.parsedDuration;
  
  // Try to get maxres thumbnail, fallback to lower res if not available
  const thumbnailObj = videoInfo.thumbnails;
  let thumbnail = '';
  if (thumbnailObj) {
    thumbnail = thumbnailObj.maxres?.url || thumbnailObj.high?.url || thumbnailObj.medium?.url || thumbnailObj.default?.url || '';
  }

  // We completely skip making the 2 extra API calls for video and audio files here!
  // This triples the amount of searches you can do per day on the free limit.
  return { title, thumbnail, author, lengthSeconds, formats: { videoWithAudio: [], videoOnly: [], audioOnly: [] } };
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
      console.log('Attempting Primary API...');
      const primaryData = await fetchFromPrimaryAPI(videoId);
      return NextResponse.json(primaryData);
    } catch (primaryErr) {
      console.error('Primary API failed, falling back...', primaryErr.message);
      try {
        console.log('Attempting Fallback API...');
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
