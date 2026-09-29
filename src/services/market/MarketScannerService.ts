/**
 * MarketScannerService
 * Professional Deep Market Search, Multi-Query Expansion, Multi-Page Harvester,
 * ASIN Deduplication, Rich Filtering, and Market Overview Analytics.
 */

import { RawBookResult, ResilientMarketProvider } from './MarketProvider';

export type SearchMode = 'QUICK_SEARCH' | 'DEEP_SEARCH' | 'MARKET_SCAN';

export interface MarketFilterOptions {
  keyword?: string;
  seeds?: string[];
  exactPhrase?: string;
  excludeKeywords?: string[];
  titleContains?: string;
  subtitleContains?: string;
  authorContains?: string;
  asin?: string;
  minReviews?: number;
  maxReviews?: number;
  minBSR?: number;
  maxBSR?: number;
  minPrice?: number;
  maxPrice?: number;
  minPages?: number;
  maxPages?: number;
  formats?: string[];
  languages?: string[];
  minRating?: number;
  maxRating?: number;
  publisherType?: 'ALL' | 'KDP' | 'TRADITIONAL';
  publishedWithin?: '30d' | '90d' | '6m' | '12m' | '2y' | '5y' | 'custom' | 'ALL';
  publishedAfter?: string;
  publishedBefore?: string;
  marketplace?: string;
  minUnder100ReviewsPct?: number;
  targetResults?: number;
  useAZExpansion?: boolean;
}

export interface EnrichedMarketBook extends RawBookResult {
  bookAge: string; // e.g. "42 days", "7 months", "1.4 years"
  bookAgeDays: number;
  foundVia: string[]; // Queries that discovered this book
  estimatedMonthlySales: number;
  estimatedMonthlyRevenue: number;
}

export interface MarketDistributionStats {
  reviews: { '0-25': number; '25-50': number; '50-100': number; '100-250': number; '250-500': number; '500+': number };
  publicationAge: { '0-3m': number; '3-6m': number; '6-12m': number; '1-2y': number; '2y+': number };
  bsr: { '<10k': number; '10k-50k': number; '50k-100k': number; '100k-250k': number; '250k+': number };
  price: { '<$10': number; '$10-$15': number; '$15-$20': number; '$20+': number };
  rating: { '4.5-5.0': number; '4.0-4.4': number; '3.5-3.9': number; '<3.5': number };
  formats: Record<string, number>;
}

export interface MarketOverview {
  totalBooksAnalyzed: number;
  medianReviews: number;
  avgReviews: number;
  medianBSR: number;
  avgPrice: number;
  booksUnder100Reviews: number;
  booksUnder50Reviews: number;
  booksPublishedLast12m: number;
  pctUnder100Reviews: number;
  pctNewerThanOneYear: number;
  searchCoverage: {
    queriesScanned: number;
    pagesScanned: number;
    uniqueASINs: number;
    matchingBooksCount: number;
  };
  distributions: MarketDistributionStats;
  opportunitySignals: Array<{
    type: 'POSITIVE' | 'NEUTRAL' | 'WARNING';
    title: string;
    message: string;
    dataPoint: string;
  }>;
}

export interface MarketScanResult {
  mode: SearchMode;
  seeds: string[];
  marketplace: string;
  books: EnrichedMarketBook[];
  overview: MarketOverview;
  timestamp: string;
}

export class MarketScannerService {
  private static provider = new ResilientMarketProvider();

  /**
   * Calculate human-readable Book Age and days
   */
  static calculateBookAge(pubDateStr: string): { formatted: string; days: number } {
    if (!pubDateStr) return { formatted: 'Unknown', days: 999 };
    const pubDate = new Date(pubDateStr);
    const now = new Date();
    const diffMs = now.getTime() - pubDate.getTime();
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    if (days < 60) return { formatted: `${days} days`, days };
    if (days < 365) {
      const months = Math.round(days / 30);
      return { formatted: `${months} month${months > 1 ? 's' : ''}`, days };
    }
    const years = (days / 365).toFixed(1);
    return { formatted: `${years} years`, days };
  }

  /**
   * BSR to monthly sales estimator
   */
  static bsrToSales(bsr: number): number {
    if (bsr <= 500) return 3500;
    if (bsr <= 1500) return 2200;
    if (bsr <= 5000) return 1400;
    if (bsr <= 15000) return 750;
    if (bsr <= 30000) return 420;
    if (bsr <= 60000) return 210;
    if (bsr <= 120000) return 95;
    if (bsr <= 250000) return 35;
    return 12;
  }

  /**
   * Run full market scan with multi-query expansion and multi-page harvesting
   */
  static async executeScan(
    seeds: string[],
    mode: SearchMode = 'QUICK_SEARCH',
    filters: MarketFilterOptions = {},
    onProgress?: (stage: string, percent: number, details?: any) => void
  ): Promise<MarketScanResult> {
    const marketplace = filters.marketplace || 'amazon.com';
    const targetResults = filters.targetResults || (mode === 'QUICK_SEARCH' ? 25 : mode === 'DEEP_SEARCH' ? 100 : 500);

    onProgress?.('Preparing queries', 10, { seeds });

    // 1. Multi-Query Expansion
    const queriesToScan: string[] = [];
    for (const seed of seeds) {
      if (!seed.trim()) continue;
      queriesToScan.push(seed.trim());

      if (mode !== 'QUICK_SEARCH') {
        const suggestions = await this.provider.getSuggestions(seed, marketplace);
        for (const s of suggestions.slice(0, mode === 'MARKET_SCAN' ? 6 : 3)) {
          if (!queriesToScan.includes(s)) queriesToScan.push(s);
        }

        if (mode === 'MARKET_SCAN' && filters.useAZExpansion) {
          const azLetters = ['a', 'b', 'c', 'd', 'e', 'f'];
          for (const char of azLetters) {
            const azTerm = `${seed.trim()} ${char}`;
            const azSuggestions = await this.provider.getSuggestions(azTerm, marketplace);
            if (azSuggestions[0] && !queriesToScan.includes(azSuggestions[0])) {
              queriesToScan.push(azSuggestions[0]);
            }
          }
        }
      }
    }

    onProgress?.('Searching Amazon', 25, { queriesCount: queriesToScan.length });

    // 2. Multi-Page Harvesting & Deduplication
    const booksByAsin = new Map<string, EnrichedMarketBook>();
    let totalPagesScanned = 0;
    const maxPagesPerQuery = mode === 'QUICK_SEARCH' ? 1 : mode === 'DEEP_SEARCH' ? 3 : 5;

    for (let qIdx = 0; qIdx < queriesToScan.length; qIdx++) {
      const query = queriesToScan[qIdx];
      const queryProgress = 25 + Math.round((qIdx / queriesToScan.length) * 35);
      onProgress?.(`Scanning: "${query}"`, queryProgress);

      for (let page = 1; page <= maxPagesPerQuery; page++) {
        totalPagesScanned++;
        const res = await this.provider.searchBooks(query, page, marketplace);

        for (const raw of res.books) {
          if (booksByAsin.has(raw.asin)) {
            const existing = booksByAsin.get(raw.asin)!;
            if (!existing.foundVia.includes(query)) {
              existing.foundVia.push(query);
            }
          } else {
            const ageInfo = this.calculateBookAge(raw.publicationDate);
            const monthlySales = this.bsrToSales(raw.bsr);
            const monthlyRevenue = Math.round(monthlySales * raw.price);

            booksByAsin.set(raw.asin, {
              ...raw,
              bookAge: ageInfo.formatted,
              bookAgeDays: ageInfo.days,
              foundVia: [query],
              estimatedMonthlySales: monthlySales,
              estimatedMonthlyRevenue: monthlyRevenue,
            });
          }
        }

        if (booksByAsin.size >= targetResults * 1.5) break;
      }

      if (booksByAsin.size >= targetResults * 1.5) break;
    }

    onProgress?.('Applying filters & deduplication', 70, { uniqueBooks: booksByAsin.size });

    // 3. Filter Application
    let allBooks = Array.from(booksByAsin.values());
    const filteredBooks = this.filterBooks(allBooks, filters);

    onProgress?.('Calculating market metrics', 85);

    // 4. Calculate Market Overview
    const overview = this.calculateMarketOverview(filteredBooks, {
      queriesScanned: queriesToScan.length,
      pagesScanned: totalPagesScanned,
      uniqueASINs: booksByAsin.size,
      matchingBooksCount: filteredBooks.length,
    });

    onProgress?.('Complete', 100);

    return {
      mode,
      seeds,
      marketplace,
      books: filteredBooks.slice(0, targetResults),
      overview,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Filter books by user criteria
   */
  static filterBooks(books: EnrichedMarketBook[], filters: MarketFilterOptions): EnrichedMarketBook[] {
    return books.filter((book) => {
      // Keyword in Title / Subtitle
      if (filters.titleContains && !book.title.toLowerCase().includes(filters.titleContains.toLowerCase())) {
        return false;
      }
      if (filters.subtitleContains && (!book.subtitle || !book.subtitle.toLowerCase().includes(filters.subtitleContains.toLowerCase()))) {
        return false;
      }
      if (filters.authorContains && (!book.author || !book.author.toLowerCase().includes(filters.authorContains.toLowerCase()))) {
        return false;
      }
      if (filters.asin && book.asin.toLowerCase() !== filters.asin.toLowerCase().trim()) {
        return false;
      }

      // Exact Phrase
      if (filters.exactPhrase) {
        const fullText = `${book.title} ${book.subtitle || ''}`.toLowerCase();
        if (!fullText.includes(filters.exactPhrase.toLowerCase())) return false;
      }

      // Exclude Keywords
      if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
        const fullText = `${book.title} ${book.subtitle || ''}`.toLowerCase();
        for (const ex of filters.excludeKeywords) {
          if (ex.trim() && fullText.includes(ex.trim().toLowerCase())) return false;
        }
      }

      // Reviews
      if (filters.minReviews !== undefined && book.reviewCount < filters.minReviews) return false;
      if (filters.maxReviews !== undefined && book.reviewCount > filters.maxReviews) return false;

      // BSR
      if (filters.minBSR !== undefined && book.bsr < filters.minBSR) return false;
      if (filters.maxBSR !== undefined && book.bsr > filters.maxBSR) return false;

      // Price
      if (filters.minPrice !== undefined && book.price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && book.price > filters.maxPrice) return false;

      // Pages
      if (filters.minPages !== undefined && book.pages < filters.minPages) return false;
      if (filters.maxPages !== undefined && book.pages > filters.maxPages) return false;

      // Rating
      if (filters.minRating !== undefined && book.rating < filters.minRating) return false;
      if (filters.maxRating !== undefined && book.rating > filters.maxRating) return false;

      // Format (multi-select)
      if (filters.formats && filters.formats.length > 0) {
        if (!filters.formats.includes(book.format)) return false;
      }

      // Language
      if (filters.languages && filters.languages.length > 0) {
        if (!filters.languages.includes(book.language)) return false;
      }

      // Publisher Type
      if (filters.publisherType === 'KDP' && !book.isIndependentKDP) return false;
      if (filters.publisherType === 'TRADITIONAL' && book.isIndependentKDP) return false;

      // Publication Date / Age
      if (filters.publishedWithin && filters.publishedWithin !== 'ALL') {
        const maxDays: Record<string, number> = {
          '30d': 30,
          '90d': 90,
          '6m': 180,
          '12m': 365,
          '2y': 730,
          '5y': 1825,
        };
        const limit = maxDays[filters.publishedWithin];
        if (limit && book.bookAgeDays > limit) return false;
      }

      if (filters.publishedAfter && book.publicationDate < filters.publishedAfter) return false;
      if (filters.publishedBefore && book.publicationDate > filters.publishedBefore) return false;

      return true;
    });
  }

  /**
   * Compute comprehensive market overview statistics & distribution brackets
   */
  static calculateMarketOverview(
    books: EnrichedMarketBook[],
    coverage: { queriesScanned: number; pagesScanned: number; uniqueASINs: number; matchingBooksCount: number }
  ): MarketOverview {
    if (books.length === 0) {
      return {
        totalBooksAnalyzed: 0,
        medianReviews: 0,
        avgReviews: 0,
        medianBSR: 0,
        avgPrice: 0,
        booksUnder100Reviews: 0,
        booksUnder50Reviews: 0,
        booksPublishedLast12m: 0,
        pctUnder100Reviews: 0,
        pctNewerThanOneYear: 0,
        searchCoverage: coverage,
        distributions: {
          reviews: { '0-25': 0, '25-50': 0, '50-100': 0, '100-250': 0, '250-500': 0, '500+': 0 },
          publicationAge: { '0-3m': 0, '3-6m': 0, '6-12m': 0, '1-2y': 0, '2y+': 0 },
          bsr: { '<10k': 0, '10k-50k': 0, '50k-100k': 0, '100k-250k': 0, '250k+': 0 },
          price: { '<$10': 0, '$10-$15': 0, '$15-$20': 0, '$20+': 0 },
          rating: { '4.5-5.0': 0, '4.0-4.4': 0, '3.5-3.9': 0, '<3.5': 0 },
          formats: {},
        },
        opportunitySignals: [],
      };
    }

    const reviews = books.map((b) => b.reviewCount).sort((a, b) => a - b);
    const bsrs = books.map((b) => b.bsr).sort((a, b) => a - b);
    const prices = books.map((b) => b.price);

    const medianReviews = reviews[Math.floor(reviews.length / 2)];
    const avgReviews = Math.round(reviews.reduce((a, b) => a + b, 0) / reviews.length);
    const medianBSR = bsrs[Math.floor(bsrs.length / 2)];
    const avgPrice = parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2));

    const under100 = books.filter((b) => b.reviewCount < 100).length;
    const under50 = books.filter((b) => b.reviewCount < 50).length;
    const underOneYear = books.filter((b) => b.bookAgeDays <= 365).length;

    const pctUnder100Reviews = Math.round((under100 / books.length) * 100);
    const pctNewerThanOneYear = Math.round((underOneYear / books.length) * 100);

    // Distribution Brackets
    const distReviews = { '0-25': 0, '25-50': 0, '50-100': 0, '100-250': 0, '250-500': 0, '500+': 0 };
    const distAge = { '0-3m': 0, '3-6m': 0, '6-12m': 0, '1-2y': 0, '2y+': 0 };
    const distBSR = { '<10k': 0, '10k-50k': 0, '50k-100k': 0, '100k-250k': 0, '250k+': 0 };
    const distPrice = { '<$10': 0, '$10-$15': 0, '$15-$20': 0, '$20+': 0 };
    const distRating = { '4.5-5.0': 0, '4.0-4.4': 0, '3.5-3.9': 0, '<3.5': 0 };
    const distFormats: Record<string, number> = {};

    for (const b of books) {
      // Reviews
      if (b.reviewCount <= 25) distReviews['0-25']++;
      else if (b.reviewCount <= 50) distReviews['25-50']++;
      else if (b.reviewCount <= 100) distReviews['50-100']++;
      else if (b.reviewCount <= 250) distReviews['100-250']++;
      else if (b.reviewCount <= 500) distReviews['250-500']++;
      else distReviews['500+']++;

      // Age
      if (b.bookAgeDays <= 90) distAge['0-3m']++;
      else if (b.bookAgeDays <= 180) distAge['3-6m']++;
      else if (b.bookAgeDays <= 365) distAge['6-12m']++;
      else if (b.bookAgeDays <= 730) distAge['1-2y']++;
      else distAge['2y+']++;

      // BSR
      if (b.bsr < 10000) distBSR['<10k']++;
      else if (b.bsr <= 50000) distBSR['10k-50k']++;
      else if (b.bsr <= 100000) distBSR['50k-100k']++;
      else if (b.bsr <= 250000) distBSR['100k-250k']++;
      else distBSR['250k+']++;

      // Price
      if (b.price < 10) distPrice['<$10']++;
      else if (b.price <= 15) distPrice['$10-$15']++;
      else if (b.price <= 20) distPrice['$15-$20']++;
      else distPrice['$20+']++;

      // Rating
      if (b.rating >= 4.5) distRating['4.5-5.0']++;
      else if (b.rating >= 4.0) distRating['4.0-4.4']++;
      else if (b.rating >= 3.5) distRating['3.5-3.9']++;
      else distRating['<3.5']++;

      // Formats
      distFormats[b.format] = (distFormats[b.format] || 0) + 1;
    }

    // Opportunity Signals (descriptive, non-guaranteed)
    const signals: MarketOverview['opportunitySignals'] = [];

    if (pctUnder100Reviews >= 30) {
      signals.push({
        type: 'POSITIVE',
        title: 'Low Review Barrier',
        message: `${pctUnder100Reviews}% of matching books have fewer than 100 reviews, indicating viable market entry for new titles.`,
        dataPoint: `${under100} of ${books.length} books`,
      });
    }

    const lowReviewHighBSR = books.filter((b) => b.reviewCount < 100 && b.bsr < 80000).length;
    if (lowReviewHighBSR >= 3) {
      signals.push({
        type: 'POSITIVE',
        title: 'New Entrant Traction',
        message: `${lowReviewHighBSR} books with under 100 reviews are actively maintaining strong BSR (< 80,000).`,
        dataPoint: `${lowReviewHighBSR} active winners`,
      });
    }

    if (pctNewerThanOneYear >= 25) {
      signals.push({
        type: 'POSITIVE',
        title: 'Fresh Release Activity',
        message: `${pctNewerThanOneYear}% of competing books were published within the last 12 months, reflecting active buyer demand.`,
        dataPoint: `${underOneYear} newer titles`,
      });
    }

    if (medianBSR > 150000) {
      signals.push({
        type: 'WARNING',
        title: 'Slower Sales Velocity',
        message: `Median BSR of #${medianBSR.toLocaleString()} suggests modest aggregate sales volume across the broader market.`,
        dataPoint: `Median BSR #${medianBSR.toLocaleString()}`,
      });
    }

    return {
      totalBooksAnalyzed: books.length,
      medianReviews,
      avgReviews,
      medianBSR,
      avgPrice,
      booksUnder100Reviews: under100,
      booksUnder50Reviews: under50,
      booksPublishedLast12m: underOneYear,
      pctUnder100Reviews,
      pctNewerThanOneYear,
      searchCoverage: coverage,
      distributions: {
        reviews: distReviews,
        publicationAge: distAge,
        bsr: distBSR,
        price: distPrice,
        rating: distRating,
        formats: distFormats,
      },
      opportunitySignals: signals,
    };
  }
}
