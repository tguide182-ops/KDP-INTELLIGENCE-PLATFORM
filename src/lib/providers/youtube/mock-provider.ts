import { IYouTubeProvider, SearchOptions } from './base';
import {
  NormalizedChannel,
  NormalizedVideo,
  NormalizedOutlier,
  NormalizedComment,
  NormalizedTranscript,
  VideoAutopsyResult,
  ChannelDNAResult,
} from './types';
import { wrapMetric } from '@/lib/provenance';

export class MockYouTubeProvider implements IYouTubeProvider {
  async getChannelByHandle(handle: string): Promise<NormalizedChannel | null> {
    const cleanHandle = handle.replace(/^@/, '');
    return {
      id: `mock_chan_${cleanHandle}`,
      youtubeChannelId: `UC_mock_${cleanHandle}`,
      handle: `@${cleanHandle}`,
      title: `${cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1)} Media`,
      description: `In-depth documentaries, visual essays, and investigative analyses exploring high-stakes events and complex systems.`,
      thumbnailUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80`,
      customUrl: `https://youtube.com/@${cleanHandle}`,
      country: 'United States',
      publishedAt: '2021-04-12T00:00:00Z',
      subscriberCount: wrapMetric(482000, 'DEMO_DATA', 'Simulated mock channel snapshot for testing'),
      viewCount: wrapMetric(54900000, 'DEMO_DATA', 'Simulated mock channel snapshot for testing'),
      videoCount: wrapMetric(86, 'DEMO_DATA', 'Simulated mock channel snapshot for testing'),
      avgViews30d: wrapMetric(315000, 'INTERNAL_METRIC', 'Calculated from 30-day upload sample'),
      uploadFrequencyDays: wrapMetric(10.5, 'INTERNAL_METRIC', 'Average days between uploads'),
      isOwned: false,
    };
  }

  async getChannelById(channelId: string): Promise<NormalizedChannel | null> {
    return this.getChannelByHandle(`channel_${channelId.slice(-6)}`);
  }

  async getVideoById(videoId: string): Promise<NormalizedVideo | null> {
    return {
      id: `mock_vid_${videoId}`,
      youtubeVideoId: videoId,
      channelId: 'UC_mock_veritasium_style',
      channelTitle: 'Apex Inquiries',
      channelHandle: '@apexinquiries',
      title: 'The Catastrophic Failure of the 1999 Megastructure',
      description: 'An engineering autopsy of how a single miscalculated rivet collapsed a 400-meter skyscraper.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 1420,
      durationFormatted: '23:40',
      isShort: false,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      views: wrapMetric(1840000, 'DEMO_DATA', 'Mock video performance metric'),
      likes: wrapMetric(94000, 'DEMO_DATA', 'Mock engagement metric'),
      comments: wrapMetric(6200, 'DEMO_DATA', 'Mock comment count metric'),
      multiplierVsBaseline: wrapMetric(5.8, 'INTERNAL_METRIC', 'Performance relative to 315K baseline'),
      viewVelocity: wrapMetric(1240, 'INTERNAL_METRIC', 'Calculated 48h view velocity'),
    };
  }

  async getChannelVideos(channelId: string, limit: number = 10): Promise<NormalizedVideo[]> {
    const titles = [
      'The Catastrophic Failure of the 1999 Megastructure',
      'Why Nobody Can Rebuild Roman Concrete',
      'The Secret Protocol Behind Air Traffic Control',
      'How One Fraudster Fooled 14 Major Central Banks',
      'The Abandoned Arctic City Keeping Secrets',
      'The Mathematics of Silent Submarines',
    ];

    return titles.slice(0, limit).map((t, idx) => ({
      id: `mock_vid_${idx}`,
      youtubeVideoId: `yt_mock_${idx}`,
      channelId,
      channelTitle: 'Apex Inquiries',
      channelHandle: '@apexinquiries',
      title: t,
      description: `Investigative narrative breaking down ${t.toLowerCase()}.`,
      thumbnailUrl: `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80`,
      durationSeconds: 900 + idx * 180,
      durationFormatted: `${15 + idx * 3}:00`,
      isShort: false,
      publishedAt: new Date(Date.now() - (idx * 12 + 2) * 24 * 60 * 60 * 1000).toISOString(),
      views: wrapMetric(
        idx === 0 ? 1840000 : idx === 1 ? 920000 : 280000,
        'DEMO_DATA',
        'Simulated mock video metric'
      ),
      likes: wrapMetric(Math.round(45000 / (idx + 1)), 'DEMO_DATA', 'Mock likes'),
      comments: wrapMetric(Math.round(3200 / (idx + 1)), 'DEMO_DATA', 'Mock comments'),
      multiplierVsBaseline: wrapMetric(
        idx === 0 ? 5.8 : idx === 1 ? 2.9 : 0.9,
        'INTERNAL_METRIC',
        'Calculated vs channel average'
      ),
      viewVelocity: wrapMetric(idx === 0 ? 1240 : 120, 'INTERNAL_METRIC', 'Calculated view velocity'),
    }));
  }

  async searchVideos(query: string, options?: SearchOptions): Promise<{ videos: NormalizedVideo[]; nextPageToken?: string }> {
    const videos = await this.getChannelVideos('UC_mock_search', options?.limit || 6);
    return { videos, nextPageToken: undefined };
  }

  async searchChannels(query: string, limit: number = 5): Promise<NormalizedChannel[]> {
    const handles = ['apexinquiries', 'curiosityfrontier', 'deepdivearchive'];
    const channels = await Promise.all(handles.slice(0, limit).map((h) => this.getChannelByHandle(h)));
    return channels.filter((c): c is NormalizedChannel => c !== null);
  }

  async getOutliers(channelId: string, minMultiplier: number = 2.0): Promise<NormalizedOutlier[]> {
    const videos = await this.getChannelVideos(channelId, 6);
    const outliers: NormalizedOutlier[] = [];

    for (const v of videos) {
      const mult = v.multiplierVsBaseline?.value || 1.0;
      if (mult >= minMultiplier) {
        outliers.push({
          videoId: v.youtubeVideoId,
          video: v,
          channelId,
          channelTitle: v.channelTitle,
          multiplier: wrapMetric(mult, 'INTERNAL_METRIC', 'Calculated outlier multiplier'),
          baselineViews: wrapMetric(315000, 'INTERNAL_METRIC', '30-day baseline average views'),
          actualViews: v.views,
          classificationReason: `Video achieved ${mult}x the channel's 315K baseline driven by an extreme curiosity gap in the thumbnail and immediate contrarian hook.`,
          detectionDate: new Date().toISOString(),
        });
      }
    }

    return outliers;
  }

  async getVideoAutopsy(videoId: string): Promise<VideoAutopsyResult | null> {
    const video = await this.getVideoById(videoId);
    if (!video) return null;

    return {
      videoId,
      video,
      hookAnalysis: {
        hookText: 'At 3:14 AM on October 12th, engineers received an alert they assumed was impossible.',
        hookType: 'CURIOSITY_GAP',
        hookStrength: 94,
        whyItWorks: 'Opens with high stakes, precise timestamp, and immediate subversion of expectations within 6 seconds.',
      },
      contentStructure: [
        { timestamp: '0:00 - 0:45', beatTitle: 'The Anomaly', beatObjective: 'Establish stakes and state the core mystery', pacingScore: 95 },
        { timestamp: '0:45 - 4:10', beatTitle: 'The Flawed Architecture', beatObjective: 'Explain technical baseline in accessible terms', pacingScore: 88 },
        { timestamp: '4:10 - 12:30', beatTitle: 'The Chain Reaction', beatObjective: 'Escalate tension beat by beat using visual diagrams', pacingScore: 92 },
        { timestamp: '12:30 - 20:15', beatTitle: 'The Concealment Attempt', beatObjective: 'Human drama and institutional failure reveal', pacingScore: 90 },
        { timestamp: '20:15 - 23:40', beatTitle: 'The Lingering Danger', beatObjective: 'Resolution, current status, and philosophical takeaway', pacingScore: 86 },
      ],
      whyThisVideoStandsOut:
        'It refuses to use generic voiceover cliches; instead, it treats an engineering disaster like a geopolitical thriller with fast pacing and high visual density.',
      whatCanBeLearned: [
        'Use specific time-stamped hooks rather than generic introductions.',
        'Pair complex structural explanations with dynamic 2D cross-section animations.',
        'Pace narrative peaks every 3.5 minutes to reset viewer attention.',
      ],
      whatIsReplicable: [
        'The structural arc: Anomaly -> Context -> Rapid Escalation -> Crisis -> Aftermath.',
        'Curiosity gap thumbnail: High contrast visual showing the structural flaw with minimal text.',
        'Sound design that drops to near silence immediately before revealing the critical turning point.',
      ],
      whatShouldNotBeCopied: [
        'Do not replicate specific phrases, titles, or voiceover script excerpts.',
        'Do not clone proprietary 3D assets or diagrams.',
      ],
      originalContentOpportunities: [
        'Autopsy of the 2008 Deep Sea Cable Severance that almost disconnected the Middle East.',
        'The Secret Tunnel Network beneath New York that even subway transit workers are forbidden to enter.',
        'The Single Software Bug that drained $440M in 45 minutes on Wall Street.',
      ],
    };
  }

  async getChannelDNA(channelId: string): Promise<ChannelDNAResult | null> {
    return {
      channelId,
      positioning: 'High-production forensic investigations into engineering anomalies, forgotten disasters, and systemic breakdowns.',
      topicPillars: [
        { pillar: 'Structural & Engineering Catastrophes', frequencyPercent: 45, avgMultiplier: 3.8 },
        { pillar: 'Cold War & Scientific Deception', frequencyPercent: 30, avgMultiplier: 2.4 },
        { pillar: 'Modern Infrastructure Mysteries', frequencyPercent: 25, avgMultiplier: 1.9 },
      ],
      titleDNA: {
        formula: 'The [Adjective] [Subject] That [Unexpected Action/Consequence]',
        characterCountAvg: 52,
        highPerformingTriggers: ['Secret', 'Failure', 'Catastrophe', 'Nobody Can Explain', 'Why It Collapsed'],
      },
      thumbnailDNA: {
        colorPalette: ['#0f172a', '#f97316', '#e2e8f0'],
        focalStyle: 'Single monolithic object center-left with extreme contrast lighting',
        textDensity: 'LOW',
        expressionStyle: 'No talking head or face; focus on ominous object/blueprint',
      },
      hookDNA: {
        primaryStyle: 'In medias res cold-open under 8 seconds before any logo or intro',
        curiosityDurationSec: 45,
      },
      visualDNA: {
        pacing: 'Cut frequency every 3.8 seconds with continuous subtle zoom or pan',
        bRollFrequency: 'High density archival footage blended with custom 3D schematics',
      },
      storytellingDNA: {
        arcPattern: 'Three-act thriller structure adapted for documentary pacing',
        openLoopsAverage: 4,
      },
    };
  }

  async getVideoComments(videoId: string, limit: number = 5): Promise<NormalizedComment[]> {
    return [
      {
        id: 'c1',
        authorName: 'EngineeringObserved',
        text: 'The explanation at 8:40 about the shear stress is the cleanest visualization I have ever seen.',
        likeCount: 4210,
        publishedAt: '2026-03-10T12:00:00Z',
      },
      {
        id: 'c2',
        authorName: 'MarcusV',
        text: 'I was an inspector on a similar project in 2004. You nailed the institutional pressure.',
        likeCount: 1890,
        publishedAt: '2026-03-11T14:30:00Z',
      },
    ];
  }

  async getTranscript(videoId: string): Promise<NormalizedTranscript | null> {
    const text = `At 3:14 AM on October 12th, engineers received an alert they assumed was impossible. The sensor at column 42 registered a deflection of seven millimeters. In structural engineering, seven millimeters is the difference between a standing skyscraper and forty thousand tons of collapsing steel. Over the next forty-eight hours, five men tried to hide it. This is what really happened.`;
    return {
      videoId,
      segments: [
        { start: 0, duration: 6, text: 'At 3:14 AM on October 12th, engineers received an alert they assumed was impossible.' },
        { start: 6, duration: 7, text: 'The sensor at column 42 registered a deflection of seven millimeters.' },
        { start: 13, duration: 8, text: 'In structural engineering, seven millimeters is the difference between standing and collapse.' },
      ],
      fullText: text,
      hookText: 'At 3:14 AM on October 12th, engineers received an alert they assumed was impossible.',
      durationSeconds: 1420,
      wordCount: text.split(/\s+/).length,
      provenance: 'DEMO_DATA',
    };
  }
}
