import { KeywordItem } from '../lib/types';

export interface SemanticCluster {
  id: string;
  name: string;
  theme: 'Demographic' | 'Dietary' | 'Problem & Solution' | 'Appliance & Prep' | 'Format & Level' | 'General';
  totalSearchVolume: number;
  avgOpportunityScore: number;
  avgCompetitionScore: number;
  keywordCount: number;
  keywords: KeywordItem[];
  suggestedBookConcept: string;
}

export class ClusteringEngine {
  /**
   * Automatically cluster a list of keywords into semantic themes
   */
  static clusterKeywords(keywords: KeywordItem[]): SemanticCluster[] {
    const clusters: Record<string, {
      name: string;
      theme: SemanticCluster['theme'];
      keywords: KeywordItem[];
      concept: string;
    }> = {
      'demographic': {
        name: 'Target Audience & Age Demographics',
        theme: 'Demographic',
        keywords: [],
        concept: 'Position a book strictly targeting Women Over 50 with age-tailored metabolic strategies.',
      },
      'dietary': {
        name: 'Dietary Angles (High Protein & Mediterranean)',
        theme: 'Dietary',
        keywords: [],
        concept: 'Combine High-Protein muscle preservation with anti-inflammatory Mediterranean ingredients.',
      },
      'problem_solution': {
        name: 'Problem / Solution (Weight Loss & Hormones)',
        theme: 'Problem & Solution',
        keywords: [],
        concept: 'Target visceral belly fat reduction and hot flash relief through nutrition.',
      },
      'prep': {
        name: 'Practicality & Prep (30-Min & Easy)',
        theme: 'Appliance & Prep',
        keywords: [],
        concept: 'Focus on minimal prep time, 5-ingredient simplicity, and 30-minute weeknight dinners.',
      },
      'general': {
        name: 'Core Niche Terms & Guides',
        theme: 'General',
        keywords: [],
        concept: 'Comprehensive reference handbook covering all aspects of the core topic.',
      },
    };

    keywords.forEach((kw) => {
      const lower = kw.term.toLowerCase();

      if (
        lower.includes('for women') ||
        lower.includes('over 40') ||
        lower.includes('over 50') ||
        lower.includes('for seniors') ||
        lower.includes('for beginners') ||
        lower.includes('for men')
      ) {
        clusters['demographic'].keywords.push(kw);
      } else if (
        lower.includes('high protein') ||
        lower.includes('mediterranean') ||
        lower.includes('low carb') ||
        lower.includes('keto') ||
        lower.includes('anti inflammatory') ||
        lower.includes('plant based')
      ) {
        clusters['dietary'].keywords.push(kw);
      } else if (
        lower.includes('weight loss') ||
        lower.includes('belly fat') ||
        lower.includes('hormone') ||
        lower.includes('reset') ||
        lower.includes('relief')
      ) {
        clusters['problem_solution'].keywords.push(kw);
      } else if (
        lower.includes('easy') ||
        lower.includes('quick') ||
        lower.includes('30 minute') ||
        lower.includes('meal prep') ||
        lower.includes('air fryer') ||
        lower.includes('simple')
      ) {
        clusters['prep'].keywords.push(kw);
      } else {
        clusters['general'].keywords.push(kw);
      }
    });

    return Object.entries(clusters)
      .filter(([_, group]) => group.keywords.length > 0)
      .map(([key, group]) => {
        const totalVol = group.keywords.reduce((sum, k) => sum + k.estimatedMonthlyVol, 0);
        const avgOpp = Math.round((group.keywords.reduce((sum, k) => sum + k.opportunityScore, 0) / group.keywords.length) * 10) / 10;
        const avgComp = Math.round((group.keywords.reduce((sum, k) => sum + k.competitionScore, 0) / group.keywords.length) * 10) / 10;

        return {
          id: `cluster-${key}`,
          name: group.name,
          theme: group.theme,
          totalSearchVolume: totalVol,
          avgOpportunityScore: avgOpp,
          avgCompetitionScore: avgComp,
          keywordCount: group.keywords.length,
          keywords: group.keywords,
          suggestedBookConcept: group.concept,
        };
      });
  }
}
