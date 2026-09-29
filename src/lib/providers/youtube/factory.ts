import { IYouTubeProvider } from './base';
import { MockYouTubeProvider } from './mock-provider';
import { YouTubeDataAPIAdapter } from './api-provider';
import { PublicYouTubeScraperProvider } from './public-scraper-provider';

export class YouTubeProviderFactory {
  private static instance: IYouTubeProvider | null = null;

  static getProvider(): IYouTubeProvider {
    if (this.instance) {
      return this.instance;
    }

    const forceMock = process.env.USE_MOCK_YOUTUBE === 'true';
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!forceMock && apiKey && apiKey.trim().length > 0) {
      this.instance = new YouTubeDataAPIAdapter(apiKey.trim());
    } else if (!forceMock) {
      this.instance = new PublicYouTubeScraperProvider();
    } else {
      this.instance = new MockYouTubeProvider();
    }

    return this.instance;
  }

  static resetInstance(): void {
    this.instance = null;
  }
}
