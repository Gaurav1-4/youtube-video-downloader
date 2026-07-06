import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const itagBase64 = searchParams.get('itag');
    const title = searchParams.get('title') || 'video';
    
    if (!itagBase64) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // Decode the URL from base64
    const downloadUrl = Buffer.from(itagBase64, 'base64').toString('utf-8');

    if (!downloadUrl || !downloadUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // Fetch the video stream with headers to avoid 403 Forbidden
    const fetchHeaders = new Headers();
    fetchHeaders.set('User-Agent', req.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    fetchHeaders.set('Referer', 'https://www.youtube.com/');
    fetchHeaders.set('Origin', 'https://www.youtube.com');

    const response = await fetch(downloadUrl, {
      headers: fetchHeaders
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from source: ${response.statusText}`);
    }

    // Forward the headers, but force the Content-Disposition to attachment
    const headers = new Headers(response.headers);
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.mp4"`);
    
    // Return the response body stream directly
    return new NextResponse(response.body, {
      status: response.status,
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
