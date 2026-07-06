import { NextResponse } from 'next/server';

async function fetchFromYTStream(videoId) {
  const response = await fetch(`https://ytstream-download-youtube-videos.p.rapidapi.com/dl?id=${videoId}`, {
    headers: {
      'x-rapidapi-host': 'ytstream-download-youtube-videos.p.rapidapi.com',
      'x-rapidapi-key': '317871f23fmshc0f05cc41c39675p1b4264jsn6b97536679aa'
    }
  });

  if (!response.ok) {
    throw new Error('YTStream API fetch failed: ' + response.statusText);
  }
  const data = await response.json();

  if (data.status !== 'OK' || !data.title) {
    throw new Error('Invalid response from YTStream API');
  }

  // Upgrade the thumbnail if possible
  const hqThumbnail = data.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const maxResThumbnail = hqThumbnail.replace('hqdefault.jpg', 'maxresdefault.jpg');

  const videoWithAudio = [];
  const audioOnly = [];
  
  if (data.formats && Array.isArray(data.formats)) {
    data.formats.forEach(f => {
      // Formats array usually contains video+audio combined streams
      if (f.url) {
        videoWithAudio.push({
          qualityLabel: f.qualityLabel || 'Unknown',
          url: f.url,
          mimeType: f.mimeType || 'video/mp4'
        });
      }
    });
  }

  if (data.adaptiveFormats && Array.isArray(data.adaptiveFormats)) {
    data.adaptiveFormats.forEach(f => {
      if (f.url && f.mimeType?.includes('audio/mp4')) {
        audioOnly.push({
          qualityLabel: f.audioQuality === 'AUDIO_QUALITY_MEDIUM' ? 'High' : 'Medium',
          url: f.url,
          mimeType: f.mimeType
        });
      }
    });
  }
  
  // Sort so highest quality is first
  const sortQuality = (a, b) => {
    const qA = parseInt(a.qualityLabel) || 0;
    const qB = parseInt(b.qualityLabel) || 0;
    return qB - qA;
  };

  return { 
    title: data.title, 
    thumbnail: maxResThumbnail, 
    author: data.author || 'Unknown Author', 
    lengthSeconds: parseInt(data.lengthSeconds) || 0, 
    formats: { 
      videoWithAudio: videoWithAudio.sort(sortQuality), 
      audioOnly 
    } 
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    const getVideoId = (u) => {
      try {
        if (!u.startsWith('http')) {
          u = 'https://' + u;
        }
        const parsed = new URL(u);
        if (parsed.hostname.includes('youtube.com')) {
          // Some links might be youtube.com/shorts/ID
          if (parsed.pathname.includes('/shorts/')) return parsed.pathname.split('/shorts/')[1];
          return parsed.searchParams.get('v');
        }
        if (parsed.hostname.includes('youtu.be')) return parsed.pathname.slice(1);
      } catch(e) {}
      return null;
    };
    
    const videoId = getVideoId(url);
    if (!videoId) return NextResponse.json({error: 'Invalid URL'}, {status: 400});

    console.log('Attempting YTStream API...');
    const videoData = await fetchFromYTStream(videoId);
    return NextResponse.json(videoData);

  } catch (error) {
    console.error('Error fetching video info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video information. ' + error.message },
      { status: 500 }
    );
  }
}
