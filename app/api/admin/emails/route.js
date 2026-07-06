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
    const emails = await redis.smembers('allowed_emails');
    return NextResponse.json({ emails });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await currentUser();
  if (user?.primaryEmailAddress?.emailAddress !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    await redis.sadd('allowed_emails', email);
    return NextResponse.json({ success: true, email });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const user = await currentUser();
  if (user?.primaryEmailAddress?.emailAddress !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email } = await request.json();
    if (email === ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Cannot remove admin' }, { status: 400 });
    }

    await redis.srem('allowed_emails', email);
    return NextResponse.json({ success: true, email });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
