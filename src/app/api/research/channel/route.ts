import { NextResponse } from 'next/server';
import { YouTubeProviderFactory } from '@/lib/providers/youtube/factory';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { cleanYouTubeInput } from '@/lib/youtube-utils';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get('q');

    if (!rawQuery) {
      return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
    }

    const parsed = cleanYouTubeInput(rawQuery);
    const provider = YouTubeProviderFactory.getProvider();
    let channel = null;

    if (parsed.type === 'handle') {
      channel = await provider.getChannelByHandle(parsed.value);
    } else if (parsed.type === 'channelId') {
      channel = await provider.getChannelById(parsed.value);
    } else {
      channel = await provider.getChannelByHandle(parsed.value);
      if (!channel) {
        const searchResults = await provider.searchChannels(parsed.value, 1);
        if (searchResults.length > 0) {
          channel = searchResults[0];
        }
      }
    }

    // Fallback if still not found, try search
    if (!channel) {
      const searchResults = await provider.searchChannels(parsed.value.replace(/^@/, ''), 1);
      if (searchResults.length > 0) {
        channel = searchResults[0];
      }
    }

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Persist or update in database
    await prisma.channel.upsert({
      where: { youtubeChannelId: channel.youtubeChannelId },
      update: {
        title: channel.title,
        handle: channel.handle,
        description: channel.description,
        thumbnailUrl: channel.thumbnailUrl,
        country: channel.country,
      },
      create: {
        youtubeChannelId: channel.youtubeChannelId,
        title: channel.title,
        handle: channel.handle,
        description: channel.description,
        thumbnailUrl: channel.thumbnailUrl,
        country: channel.country,
        publishedAt: new Date(channel.publishedAt),
      },
    });

    return NextResponse.json({ channel });
  } catch (error: any) {
    console.error('Channel research error:', error);
    return NextResponse.json({ error: error.message || 'Failed to research channel' }, { status: 500 });
  }
}
