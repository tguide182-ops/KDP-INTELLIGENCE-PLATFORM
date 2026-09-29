import { SERPService, SERPBook } from './SERPService';
import { VolumeTrend } from '../lib/types';

export interface SubNicheItem {
  id: string;
  name: string;
  primaryKeyword: string;
  demandScore: number;
  competitionScore: number;
  opportunityScore: number;
  trend: VolumeTrend;
  relevantBooksCount: number;
  avgReviews: number;
  medianBSR: number;
  avgPrice: number;
  newcomerRatio: number; // percentage of books < 1 year old
  recentPublishingActivity: 'High' | 'Moderate' | 'Low';
  tags: string[];
}

export interface DistributionBucket {
  range: string;
  count: number;
  percentage: number;
}

export interface NicheDossier {
  nicheName: string;
  primaryKeyword: string;
  marketplace: string;
  lastUpdated: string;
  
  // 1. Market Overview
  marketOverview: {
    totalEstimatedRevenue: number;
    avgPrice: number;
    medianBSR: number;
    avgReviews: number;
    avgRating: number;
    totalObservedResults: number;
    newcomerPenetrationPct: number;
    marketHealth: 'Expanding' | 'Stable' | 'Saturated';
  };

  // 2 & 3. Demand & Competition
  demandScore: number;
  competitionScore: number;
  opportunityScore: number;
  opportunityLabel: string;

  // 4. Top Books on Page 1
  topBooks: SERPBook[];

  // 5. Review Distribution
  reviewDistribution: DistributionBucket[];

  // 6. Price Distribution
  priceDistribution: DistributionBucket[];

  // 7. BSR Distribution
  bsrDistribution: DistributionBucket[];

  // 8. Publication Age Distribution
  ageDistribution: DistributionBucket[];

  // 9. Recent Competitors
  recentCompetitors: SERPBook[];

  // 10, 11, 12, 13, 14. Patterns
  patterns: {
    topTitleWords: Array<{ word: string; frequency: number }>;
    topSubtitleAngles: string[];
    avgTitleLength: number;
    avgSubtitleLength: number;
    commonCategories: string[];
    contentAngles: string[];
  };

  // 15. Opportunity Gaps
  opportunityGaps: Array<{
    title: string;
    description: string;
    impact: 'High' | 'Medium';
  }>;

  // 16. Risks & Research Notes
  risks: string[];
  researchNotes: string[];
}

export class NicheService {
  /**
   * Discover sub-niches for a seed query
   */
  static findSubNiches(seed: string, marketplace: string = 'amazon.com'): SubNicheItem[] {
    const lower = seed.toLowerCase().trim();

    if (lower.includes('cookbook') || lower.includes('recipe') || lower.includes('food')) {
      return [
        {
          id: 'niche-1',
          name: 'GLP-1 & Semaglutide High Protein Diet',
          primaryKeyword: 'glp-1 high protein cookbook',
          demandScore: 9.2,
          competitionScore: 4.1,
          opportunityScore: 9.4,
          trend: 'rising',
          relevantBooksCount: 340,
          avgReviews: 125,
          medianBSR: 8400,
          avgPrice: 15.99,
          newcomerRatio: 65,
          recentPublishingActivity: 'High',
          tags: ['Breakout Trend', 'High ROI', 'Medical Diet'],
        },
        {
          id: 'niche-2',
          name: 'Menopause & Hormone Reset Cookbooks',
          primaryKeyword: 'menopause cookbook for women',
          demandScore: 8.8,
          competitionScore: 5.4,
          opportunityScore: 8.6,
          trend: 'rising',
          relevantBooksCount: 1420,
          avgReviews: 310,
          medianBSR: 18400,
          avgPrice: 16.49,
          newcomerRatio: 45,
          recentPublishingActivity: 'High',
          tags: ['Women Over 40', 'Hormone Health', 'Evergreen'],
        },
        {
          id: 'niche-3',
          name: 'High Protein Mediterranean Diet',
          primaryKeyword: 'high protein mediterranean cookbook',
          demandScore: 8.5,
          competitionScore: 5.8,
          opportunityScore: 8.1,
          trend: 'rising',
          relevantBooksCount: 1850,
          avgReviews: 480,
          medianBSR: 14200,
          avgPrice: 17.25,
          newcomerRatio: 38,
          recentPublishingActivity: 'Moderate',
          tags: ['Healthy Living', 'Heart Health', 'Popular'],
        },
        {
          id: 'niche-4',
          name: 'Air Fryer Cookbook for Seniors',
          primaryKeyword: 'air fryer cookbook for seniors',
          demandScore: 8.2,
          competitionScore: 4.6,
          opportunityScore: 8.4,
          trend: 'stable',
          relevantBooksCount: 890,
          avgReviews: 240,
          medianBSR: 12100,
          avgPrice: 14.49,
          newcomerRatio: 40,
          recentPublishingActivity: 'Moderate',
          tags: ['Seniors', 'Large Print', 'Easy Prep'],
        },
        {
          id: 'niche-5',
          name: 'Anti-Inflammatory Diabetic Meal Prep',
          primaryKeyword: 'diabetic anti inflammatory cookbook',
          demandScore: 7.9,
          competitionScore: 5.1,
          opportunityScore: 7.8,
          trend: 'stable',
          relevantBooksCount: 1120,
          avgReviews: 380,
          medianBSR: 19800,
          avgPrice: 15.99,
          newcomerRatio: 30,
          recentPublishingActivity: 'Moderate',
          tags: ['Medical', 'Blood Sugar', 'Batch Cooking'],
        },
        {
          id: 'niche-6',
          name: 'Renal Diet Cookbook for Beginners',
          primaryKeyword: 'renal diet cookbook for beginners',
          demandScore: 7.6,
          competitionScore: 4.8,
          opportunityScore: 7.6,
          trend: 'stable',
          relevantBooksCount: 760,
          avgReviews: 290,
          medianBSR: 22400,
          avgPrice: 14.95,
          newcomerRatio: 25,
          recentPublishingActivity: 'Low',
          tags: ['Kidney Health', 'Low Sodium'],
        },
      ];
    }

    // Default procedural sub-niches for any other seed
    return [
      {
        id: 'niche-gen-1',
        name: `${seed.charAt(0).toUpperCase() + seed.slice(1)} for Beginners`,
        primaryKeyword: `${seed} for beginners`,
        demandScore: 8.4,
        competitionScore: 5.2,
        opportunityScore: 8.2,
        trend: 'rising',
        relevantBooksCount: 1240,
        avgReviews: 210,
        medianBSR: 18500,
        avgPrice: 13.99,
        newcomerRatio: 50,
        recentPublishingActivity: 'High',
        tags: ['Beginners', 'Quick Start'],
      },
      {
        id: 'niche-gen-2',
        name: `Interactive ${seed.charAt(0).toUpperCase() + seed.slice(1)} Workbook`,
        primaryKeyword: `${seed} workbook with exercises`,
        demandScore: 7.9,
        competitionScore: 4.4,
        opportunityScore: 8.3,
        trend: 'rising',
        relevantBooksCount: 680,
        avgReviews: 140,
        medianBSR: 21000,
        avgPrice: 12.95,
        newcomerRatio: 55,
        recentPublishingActivity: 'High',
        tags: ['Workbooks', 'High Margin'],
      },
      {
        id: 'niche-gen-3',
        name: `${seed.charAt(0).toUpperCase() + seed.slice(1)} for Seniors Over 60`,
        primaryKeyword: `${seed} for seniors`,
        demandScore: 7.5,
        competitionScore: 3.8,
        opportunityScore: 8.5,
        trend: 'rising',
        relevantBooksCount: 420,
        avgReviews: 95,
        medianBSR: 24500,
        avgPrice: 14.50,
        newcomerRatio: 60,
        recentPublishingActivity: 'Moderate',
        tags: ['Seniors', 'Low Competition'],
      },
    ];
  }

  /**
   * Generate 16-point comprehensive Niche Dossier
   */
  static generateNicheDossier(nicheName: string, marketplace: string = 'amazon.com'): NicheDossier {
    const serp = SERPService.getPageOneResults(nicheName, marketplace);
    const books = serp.books;

    // 1. Review Distribution
    const revRanges = [
      { range: '0–25', min: 0, max: 25 },
      { range: '26–100', min: 26, max: 100 },
      { range: '101–500', min: 101, max: 500 },
      { range: '501–1,000', min: 501, max: 1000 },
      { range: '1,000+', min: 1001, max: Infinity },
    ];
    const reviewDistribution: DistributionBucket[] = revRanges.map(r => {
      const count = books.filter(b => b.reviewCount >= r.min && b.reviewCount <= r.max).length;
      return {
        range: r.range,
        count,
        percentage: Math.round((count / books.length) * 100),
      };
    });

    // 2. Price Distribution
    const priceRanges = [
      { range: 'Under $10', min: 0, max: 9.99 },
      { range: '$10 – $14.99', min: 10, max: 14.99 },
      { range: '$15 – $19.99', min: 15, max: 19.99 },
      { range: '$20+', min: 20, max: Infinity },
    ];
    const priceDistribution: DistributionBucket[] = priceRanges.map(r => {
      const count = books.filter(b => b.price >= r.min && b.price <= r.max).length;
      return {
        range: r.range,
        count,
        percentage: Math.round((count / books.length) * 100),
      };
    });

    // 3. BSR Distribution
    const bsrRanges = [
      { range: 'Top 5k (Fierce)', min: 0, max: 5000 },
      { range: '5k – 25k (Strong)', min: 5001, max: 25000 },
      { range: '25k – 75k (Solid)', min: 25001, max: 75000 },
      { range: '75k – 200k (Moderate)', min: 75001, max: 200000 },
      { range: '200k+ (Slow)', min: 200001, max: Infinity },
    ];
    const bsrDistribution: DistributionBucket[] = bsrRanges.map(r => {
      const count = books.filter(b => b.bsr >= r.min && b.bsr <= r.max).length;
      return {
        range: r.range,
        count,
        percentage: Math.round((count / books.length) * 100),
      };
    });

    // 4. Publication Age Distribution
    const ageRanges = [
      { range: '0–6 Months', min: 0, max: 180 },
      { range: '6–12 Months', min: 181, max: 365 },
      { range: '1–2 Years', min: 366, max: 730 },
      { range: '2–5 Years', min: 731, max: 1825 },
      { range: '5+ Years', min: 1826, max: Infinity },
    ];
    const ageDistribution: DistributionBucket[] = ageRanges.map(r => {
      const count = books.filter(b => b.estimatedAgeDays >= r.min && b.estimatedAgeDays <= r.max).length;
      return {
        range: r.range,
        count,
        percentage: Math.round((count / books.length) * 100),
      };
    });

    // 5. Total Estimated Monthly Revenue
    const totalRev = books.reduce((acc, b) => acc + b.estimatedMonthlyRevenue, 0);

    // 6. Recent Competitors (< 1 year old)
    const recentCompetitors = books.filter(b => b.estimatedAgeDays <= 365);

    return {
      nicheName,
      primaryKeyword: nicheName.toLowerCase(),
      marketplace,
      lastUpdated: new Date().toISOString(),

      marketOverview: {
        totalEstimatedRevenue: totalRev,
        avgPrice: serp.avgPrice,
        medianBSR: serp.medianBSR,
        avgReviews: serp.avgReviews,
        avgRating: serp.avgRating,
        totalObservedResults: serp.totalResults,
        newcomerPenetrationPct: serp.pctNewerThanOneYear,
        marketHealth: serp.pctNewerThanOneYear >= 40 ? 'Expanding' : 'Stable',
      },

      demandScore: 8.8,
      competitionScore: 5.6,
      opportunityScore: 8.6,
      opportunityLabel: 'Strong Opportunity (High Demand / Moderate Competition)',

      topBooks: books,
      reviewDistribution,
      priceDistribution,
      bsrDistribution,
      ageDistribution,
      recentCompetitors,

      patterns: {
        topTitleWords: [
          { word: 'Cookbook', frequency: 6 },
          { word: 'Menopause', frequency: 5 },
          { word: 'Reset', frequency: 3 },
          { word: 'Women', frequency: 4 },
          { word: 'Hormone', frequency: 3 },
          { word: 'High Protein', frequency: 2 },
        ],
        topSubtitleAngles: [
          'Anti-inflammatory 30-minute meals',
          'Targeting visceral belly fat and metabolic slowdown',
          'Preserving lean muscle mass for women over 40 & 50',
          'Managing hot flashes and improving deep sleep naturally',
        ],
        avgTitleLength: 38,
        avgSubtitleLength: 104,
        commonCategories: [
          'Health, Fitness & Dieting > Women\'s Health',
          'Cookbooks, Food & Wine > Special Diets',
          'Health, Fitness & Dieting > Aging',
        ],
        contentAngles: [
          'Full 4-week structured meal plans with printable shopping lists',
          'Macronutrient breakdown per serving with protein targets (30g+)',
          'Recipes ready in 30 minutes or less with everyday grocery ingredients',
        ],
      },

      opportunityGaps: [
        {
          title: 'Positioning Gap: Specific Demographic Focus (Over 50)',
          description: 'Top legacy competitors target generic menopause, while search demand for "women over 50" has risen 35% with fewer than 500 targeted books.',
          impact: 'High',
        },
        {
          title: 'Format Gap: High-Protein & Anti-Inflammatory Pairing',
          description: 'Most books focus either on calorie restriction or general hormones. Combining high protein (for muscle retention) with Mediterranean anti-inflammatory ingredients represents an underserved angle.',
          impact: 'High',
        },
        {
          title: 'Practicality Gap: 30-Minute Meal Prep with Minimal Ingredients',
          description: 'Customer review complaints on competitor books frequently cite overly complicated ingredients and long prep times.',
          impact: 'Medium',
        },
      ],

      risks: [
        'Dr. Mindy Pelz and Dr. Mary Claire Haver have strong established brand dominance at the top of the category.',
        'Medical claims must be avoided in KDP title, subtitle, and description to maintain compliance.',
        'Recipe quality and professional formatting are critical; low-quality AI-generated content receives harsh 1-star reviews.',
      ],

      researchNotes: [
        'Target price sweet spot: $13.99 – $16.99 for paperback; $4.99 – $7.99 for Kindle.',
        'Recommended page count: 160 – 220 pages to support reasonable print-on-demand cost margins.',
        'Strong subtitle keyword priority: "High Protein", "Over 50", "Hormone Balance", "30-Minute Recipes".',
      ],
    };
  }
}
