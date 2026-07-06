import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const itagBase64 = searchParams.get('itag');
    
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

    // Redirect the user directly to the Google Video URL
    return NextResponse.redirect(downloadUrl);
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to process download. ' + error.message },
      { status: 500 }
    );
  }
}
