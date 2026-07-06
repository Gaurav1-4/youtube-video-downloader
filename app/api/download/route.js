import play from 'play-dl';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    const itag = searchParams.get('itag');
    const title = searchParams.get('title') || 'video';

    if (!url || !itag) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const info = await play.video_info(url);
    const format = info.format.find(f => f.itag === parseInt(itag));

    if (!format || !format.url) {
      return NextResponse.json(
        { error: 'Format not found or URL missing' },
        { status: 404 }
      );
    }

    // Determine content type and file extension
    const contentType = format.mimeType?.split(';')[0] || 'application/octet-stream';
    const extension = format.container || (contentType.includes('video') ? 'mp4' : 'webm');
    
    // Remove non-ascii and special chars from filename
    const safeTitle = title.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
    const filename = `${safeTitle}.${extension}`;

    // Fetch the stream from Google's servers
    const response = await fetch(format.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch from YouTube: ${response.statusText}`);
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    if (format.contentLength) {
      headers.set('Content-Length', format.contentLength);
    } else if (response.headers.get('content-length')) {
      headers.set('Content-Length', response.headers.get('content-length'));
    }

    return new NextResponse(response.body, {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to process download. ' + error.message },
      { status: 500 }
    );
  }
}
