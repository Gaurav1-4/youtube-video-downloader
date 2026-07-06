import ytdl from '@distube/ytdl-core';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    const itag = searchParams.get('itag');
    const title = searchParams.get('title') || 'video';

    if (!url || !ytdl.validateURL(url) || !itag) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: itag });

    if (!format) {
      return NextResponse.json(
        { error: 'Format not found' },
        { status: 404 }
      );
    }

    // Determine content type and file extension
    const contentType = format.mimeType?.split(';')[0] || 'application/octet-stream';
    const extension = format.container || 'mp4';
    // Remove non-ascii and special chars from filename
    const safeTitle = title.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
    const filename = `${safeTitle}.${extension}`;

    // Create a web stream from the node stream
    const ytdlStream = ytdl(url, { format });
    
    const stream = new ReadableStream({
      start(controller) {
        ytdlStream.on('data', (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        ytdlStream.on('end', () => {
          controller.close();
        });
        ytdlStream.on('error', (err) => {
          console.error('Download stream error:', err);
          controller.error(err);
        });
      },
      cancel() {
        ytdlStream.destroy();
      }
    });

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    if (format.contentLength) {
      headers.set('Content-Length', format.contentLength);
    }

    return new NextResponse(stream, {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to process download.' },
      { status: 500 }
    );
  }
}
