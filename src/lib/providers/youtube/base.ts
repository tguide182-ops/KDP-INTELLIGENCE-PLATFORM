import {
  NormalizedChannel,
  NormalizedVideo,
  NormalizedOutlier,
  NormalizedComment,
  NormalizedTranscript,
  VideoAutopsyResult,
  ChannelDNAResult,
} from './types';

export interface SearchOptions {
  limit?: number;
  pageToken?: string;
  order?: 'relevance' | 'date' | 'viewCount' | 'rating';
  videoDuration?: 'any' | 'short' | 'medium' | 'long';
  type?: 'video' | 'channel';
  publishedAfter?: string;
}

export interface IYouTubeProvider {
  getChannelByHandle(handle: string): Promise<NormalizedChannel | null>;
  getChannelById(channelId: string): Promise<NormalizedChannel | null>;
  getVideoById(videoId: string): Promise<NormalizedVideo | null>;
  getChannelVideos(channelId: string, limit?: number): Promise<NormalizedVideo[]>;
  searchVideos(query: string, options?: SearchOptions): Promise<{ videos: NormalizedVideo[]; nextPageToken?: string }>;
  searchChannels(query: string, limit?: number): Promise<NormalizedChannel[]>;
  getOutliers(channelId: string, minMultiplier?: number): Promise<NormalizedOutlier[]>;
  getVideoAutopsy(videoId: string): Promise<VideoAutopsyResult | null>;
  getChannelDNA(channelId: string): Promise<ChannelDNAResult | null>;
  getVideoComments(videoId: string, limit?: number): Promise<NormalizedComment[]>;
  getTranscript(videoId: string): Promise<NormalizedTranscript | null>;
}
