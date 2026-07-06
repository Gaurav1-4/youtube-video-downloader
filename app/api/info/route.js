import ytdl from '@distube/ytdl-core';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url || !ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: 'Invalid or missing YouTube URL' },
        { status: 400 }
      );
    }

    const info = await ytdl.getInfo(url);
    
    // Extract required data
    const title = info.videoDetails.title;
    const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]?.url;
    const author = info.videoDetails.author.name;
    const lengthSeconds = info.videoDetails.lengthSeconds;
    
    // Filter formats for video and audio
    // We try to grab the best formats that have both video and audio (if possible)
    // Or we provide separate video and audio formats. Usually, the highest qualities are video-only or audio-only,
    // requiring muxing. For simplicity in a pure Node.js stream without FFmpeg, we will filter for formats with both,
    // or just allow users to download video-only / audio-only streams directly.
    const formats = info.formats
      .filter((format) => format.hasVideo || format.hasAudio)
      .map((format) => ({
        itag: format.itag,
        qualityLabel: format.qualityLabel,
        mimeType: format.mimeType,
        hasVideo: format.hasVideo,
        hasAudio: format.hasAudio,
        container: format.container,
        contentLength: format.contentLength,
        url: format.url // sometimes direct url can be used
      }))
      .sort((a, b) => {
        if (a.hasVideo && a.hasAudio && (!b.hasVideo || !b.hasAudio)) return -1;
        if (!a.hasVideo && !a.hasAudio && (b.hasVideo || b.hasAudio)) return 1;
        return 0;
      });

    // Grouping for better UI representation
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
    console.error('Error fetching video info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video information. It might be restricted or private.' },
      { status: 500 }
    );
  }
}
