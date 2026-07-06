import { NextResponse } from 'next/server';
import { redis } from '../../../lib/redis';

export async function POST() {
  try {
    // Increment the total_downloads counter in Redis
    const newTotal = await redis.incr('total_downloads');
    return NextResponse.json({ success: true, total: newTotal });
  } catch (error) {
    console.error('Failed to track usage:', error);
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}
