export type DataProvenance = 'REAL' | 'ESTIMATED' | 'USER_PROVIDED' | 'DEMO' | 'AI_DERIVED';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type VolumeTrend = 'rising' | 'stable' | 'declining';

export type KeywordIntent = 
  | 'commercial' 
  | 'informational' 
  | 'transactional' 
  | 'audience' 
  | 'problem_solution' 
  | 'diet_specific' 
  | 'appliance_specific'
  | 'gift_related';

export type KeywordStatus = 'Researching' | 'Validated' | 'Potential' | 'Rejected' | 'Published' | 'Monitor';

export interface ScoreBreakdown {
  searchVolumeWeight: number;
  suggestionWeight: number;
  trendWeight: number;
  intentWeight: number;
  searchVolumeScore: number;
  suggestionScore: number;
  trendScore: number;
  intentScore: number;
  finalScore: number;
}

export interface CompetitionBreakdown {
  resultsWeight: number;
  reviewsWeight: number;
  bsrWeight: number;
  ageWeight: number;
  titleMatchWeight: number;
  resultsScore: number;
  reviewsScore: number;
  bsrScore: number;
  ageScore: number;
  titleMatchScore: number;
  finalScore: number;
}

export interface KeywordItem {
  id: string;
  term: string;
  normalizedTerm: string;
  marketplace: string;
  phraseType: 'seed' | 'suggestion' | 'alphabet' | 'question' | 'modifier' | 'related';
  wordCount: number;
  intent: KeywordIntent;
  parentKeyword?: string;
  
  // Metrics
  estimatedMonthlyVol: number;
  volumeTrend: VolumeTrend;
  amazonResultCount: number;
  confidenceLevel: ConfidenceLevel;
  dataSource: DataProvenance;
  
  // Scores
  demandScore: number;
  competitionScore: number;
  opportunityScore: number;
  
  demandBreakdown: ScoreBreakdown;
  competitionBreakdown: CompetitionBreakdown;
  
  // User state
  isSaved?: boolean;
  isStarred?: boolean;
  status?: KeywordStatus;
  notes?: string;
  tags?: string[];
  projectId?: string;
  lastUpdated: string;
}

export interface MarketplaceConfig {
  id: string;
  name: string;
  domain: string;
  country: string;
  currency: string;
  currencySymbol: string;
  language: string;
  flag: string;
  suggestionHost: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  marketplace: string;
  keywordCount: number;
  opportunityCount: number;
  createdAt: string;
  updatedAt: string;
}
