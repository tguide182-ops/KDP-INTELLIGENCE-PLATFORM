import { NextResponse } from 'next/server';
import { YouTubeProviderFactory } from '@/lib/providers/youtube/factory';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('id');

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID parameter is required' }, { status: 400 });
    }

    const provider = YouTubeProviderFactory.getProvider();
    const autopsy = await provider.getVideoAutopsy(videoId);

    if (!autopsy) {
      return NextResponse.json({ error: 'Video autopsy could not be generated' }, { status: 404 });
    }

    return NextResponse.json({ autopsy });
  } catch (error: any) {
    console.error('Video autopsy error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze video' }, { status: 500 });
  }
}
