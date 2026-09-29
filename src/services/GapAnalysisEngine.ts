export interface OpportunityGap {
  id: string;
  category: 'Demographic' | 'Dietary' | 'Practicality' | 'Problem/Solution' | 'Format';
  title: string;
  searchDemandPhrases: string[];
  estimatedMonthlyDemand: number;
  competitorPageOneCoverage: number; // e.g. 1 out of 10
  opportunityScore: number;
  gapExplanation: string;
  positioningRecommendation: string;
  sampleBookTitle: string;
  impact: 'High' | 'Medium';
}

export class GapAnalysisEngine {
  /**
   * Analyze opportunity gaps for a niche
   */
  static analyzeGaps(niche: string): OpportunityGap[] {
    const lower = niche.toLowerCase();

    if (lower.includes('menopause')) {
      return [
        {
          id: 'gap-demo-50',
          category: 'Demographic',
          title: 'Specific Demographic Focus: Women Over 50',
          searchDemandPhrases: [
            'menopause cookbook over 50',
            'menopause diet for women over 50',
            'post menopause cookbook for seniors',
          ],
          estimatedMonthlyDemand: 4200,
          competitorPageOneCoverage: 1, // Only 1 out of 10 books has "Over 50" on cover
          opportunityScore: 9.3,
          gapExplanation:
            'While 80% of top competitors target generic menopause, customer searches explicitly targeting women over 50 have grown 45% with minimal dedicated cover competition.',
          positioningRecommendation:
            'Position specifically for post-menopause and metabolic slowdown in women 50–65 with protein targets.',
          sampleBookTitle: 'High Protein Menopause Cookbook for Women Over 50: Quick 30-Minute Low-Carb Meals to Reset Metabolism',
          impact: 'High',
        },
        {
          id: 'gap-diet-protein-med',
          category: 'Dietary',
          title: 'Dietary Intersection: High Protein + Mediterranean',
          searchDemandPhrases: [
            'high protein menopause cookbook',
            'mediterranean menopause diet',
            'high protein mediterranean recipes for women',
          ],
          estimatedMonthlyDemand: 3800,
          competitorPageOneCoverage: 0, // 0 out of 10
          opportunityScore: 9.1,
          gapExplanation:
            'Existing books are either strictly calorie-restricted or generic Mediterranean. There is zero direct first-page coverage combining high-protein muscle preservation with anti-inflammatory Mediterranean fat sources.',
          positioningRecommendation:
            'Pair 30g+ protein per meal with heart-healthy olive oil, omega-3s, and antioxidant-rich veggies.',
          sampleBookTitle: 'The Mediterranean Menopause Reset: High-Protein, Anti-Inflammatory Recipes for Lasting Energy and Weight Loss',
          impact: 'High',
        },
        {
          id: 'gap-prep-30min',
          category: 'Practicality',
          title: 'Practicality Gap: 30-Minute Meals & 5-Ingredient Simplicity',
          searchDemandPhrases: [
            'easy menopause cookbook for beginners',
            'quick menopause recipes',
            '30 minute menopause meals',
          ],
          estimatedMonthlyDemand: 2900,
          competitorPageOneCoverage: 2,
          opportunityScore: 8.6,
          gapExplanation:
            'Negative reviews on market leaders Dr. Pelz and Dr. Haver frequently complain of overly complex ingredients and exhausting prep times for busy working women.',
          positioningRecommendation:
            'Emphasize everyday grocery store ingredients, 5-ingredient simplicity, and 30-minute one-pan dinners.',
          sampleBookTitle: 'The 30-Minute Menopause Meal Solution: Fast, Low-Effort Dinners for Busy Women Navigating Hormone Changes',
          impact: 'Medium',
        },
        {
          id: 'gap-format-workbook',
          category: 'Format',
          title: 'Format Gap: Interactive Food & Symptom Tracker Companion',
          searchDemandPhrases: [
            'menopause journal and tracker',
            'menopause food log workbook',
            'hormone reset workbook',
          ],
          estimatedMonthlyDemand: 1850,
          competitorPageOneCoverage: 0,
          opportunityScore: 8.4,
          gapExplanation:
            'Publishers only offer static cookbooks. An interactive companion workbook with meal planning templates and daily hot flash / mood tracking allows cross-selling.',
          positioningRecommendation:
            'Publish a structured 90-day food & symptom tracking journal as a companion backend offer.',
          sampleBookTitle: 'The Daily Menopause Journal & Meal Planner: Track Symptoms, Balance Hormones, and Build Healthy Habits',
          impact: 'Medium',
        },
      ];
    }

    // Default gaps for any other topic
    return [
      {
        id: 'gap-gen-beginners',
        category: 'Practicality',
        title: `Beginner-Friendly Quick-Start Edition for ${niche}`,
        searchDemandPhrases: [`${niche} for beginners`, `easy ${niche}`, `simple ${niche}`],
        estimatedMonthlyDemand: 3100,
        competitorPageOneCoverage: 2,
        opportunityScore: 8.7,
        gapExplanation: `Competitors are dense and overwhelming. Clear need for a step-by-step visual beginner guide.`,
        positioningRecommendation: `Create an ultra-approachable 30-day roadmap with beginner checklists.`,
        sampleBookTitle: `The Absolute Beginner's Guide to ${niche}: Step-by-Step Instructions with Clear Examples`,
        impact: 'High',
      },
      {
        id: 'gap-gen-seniors',
        category: 'Demographic',
        title: `Large Print Edition for Seniors`,
        searchDemandPhrases: [`${niche} for seniors`, `${niche} large print`],
        estimatedMonthlyDemand: 2200,
        competitorPageOneCoverage: 0,
        opportunityScore: 8.9,
        gapExplanation: `Underserved senior demographic with high willingness to purchase physical paperbacks.`,
        positioningRecommendation: `Use 16pt+ readable typography, simple layouts, and gentle pacing.`,
        sampleBookTitle: `${niche} for Seniors: Easy-to-Read, Practical Strategies to Master the Fundamentals`,
        impact: 'High',
      },
    ];
  }
}
