import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { redis } from '../../../../lib/redis';

const ADMIN_EMAIL = 'gauravgoyal2112007@gmail.com';

export async function GET() {
  const user = await currentUser();
  if (user?.primaryEmailAddress?.emailAddress !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const totalDownloads = await redis.get('total_downloads') || 0;
    return NextResponse.json({ totalDownloads: parseInt(totalDownloads, 10) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
