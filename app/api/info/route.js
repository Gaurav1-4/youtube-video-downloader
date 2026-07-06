import play from 'play-dl';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'Invalid or missing YouTube URL' },
        { status: 400 }
      );
    }

    // Attempt to get video info
    const info = await play.video_info(url);
    const details = info.video_details;
    
    // Extract basic info
    const title = details.title;
    const thumbnail = details.thumbnails && details.thumbnails.length > 0 
      ? details.thumbnails[details.thumbnails.length - 1].url 
      : '';
    const author = details.channel?.name || 'Unknown Author';
    const lengthSeconds = details.durationInSec;
    
    // play-dl formats
    const formats = info.format.map(f => {
      const isVideo = f.mimeType && f.mimeType.includes('video');
      const isAudio = f.mimeType && f.mimeType.includes('audio');
      // For play-dl, if it has qualityLabel it's video. If it has audioQuality it has audio.
      const hasVideo = !!f.qualityLabel;
      const hasAudio = !!f.audioQuality || (!hasVideo && isAudio);

      return {
        itag: f.itag,
        qualityLabel: f.qualityLabel || 'Audio',
        mimeType: f.mimeType,
        hasVideo: hasVideo,
        hasAudio: hasAudio,
        container: f.container || (isVideo ? 'mp4' : 'webm'),
        contentLength: f.contentLength,
        url: f.url
      };
    });

    const videoWithAudio = formats.filter(f => f.hasVideo && f.hasAudio);
    const videoOnly = formats.filter(f => f.hasVideo && !f.hasAudio);
    const audioOnly = formats.filter(f => !f.hasVideo && f.hasAudio);

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
    console.error('Error fetching video info with play-dl:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video information. It might be restricted or private.' },
      { status: 500 }
    );
  }
}
