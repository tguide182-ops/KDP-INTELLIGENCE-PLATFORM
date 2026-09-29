export interface StyleProfile {
  genre: string;
  subgenre?: string;
  targetAudience: string;
  readingLevel: string; // e.g. "8th Grade", "10th Grade", "General Adult", "Professional"
  tone: string;
  voice: string;
  sentenceLengthTarget: 'short' | 'varied' | 'complex';
  preferredTerminology: string[];
  forbiddenTerminology: string[];
  emDashLimitPer1k: number;
  maxBulletRatio: number;
  styleRules: string[];
}

export const PRESET_STYLE_PROFILES: Record<string, StyleProfile> = {
  cookbook: {
    genre: 'Cookbook & Nutrition',
    subgenre: 'Health Reset & Meal Prep',
    targetAudience: 'Health-Conscious Adults & Busy Families',
    readingLevel: 'General Adult (7th-8th Grade)',
    tone: 'Appetizing, encouraging, practical, and clear',
    voice: 'Warm mentor and experienced home-cooking guide',
    sentenceLengthTarget: 'varied',
    preferredTerminology: ['nutrient-dense', 'sauté', 'simmer', 'balance', 'everyday grocery staples', 'meal prep'],
    forbiddenTerminology: ['guilt-free', 'miracle cure', 'skinny', 'dieting dogma', 'starvation'],
    emDashLimitPer1k: 2,
    maxBulletRatio: 0.35, // Recipes naturally have ingredient lists
    styleRules: [
      'Always list ingredients with exact measurements before cooking steps',
      'Describe sensory cues (aroma, color change, texture) rather than just clock time',
      'Include practical cleanup and Sunday batch-cooking tips',
      'Never use shaming or restrictive dietary language',
    ],
  },
  selfHelp: {
    genre: 'Self-Help & Personal Growth',
    subgenre: 'Habit Systems & Focus',
    targetAudience: 'Ambitious Professionals & Knowledge Workers',
    readingLevel: 'General Adult (8th-9th Grade)',
    tone: 'Empathetic, scientifically grounded, actionable, and intellectually rigorous',
    voice: 'Trusted strategist and empathetic fellow practitioner',
    sentenceLengthTarget: 'varied',
    preferredTerminology: ['environmental architecture', 'cognitive friction', 'sustainable', 'micro-win', 'compounding'],
    forbiddenTerminology: ['just hustle harder', 'grind 24/7', 'manifesting without effort', 'crush it'],
    emDashLimitPer1k: 1.5,
    maxBulletRatio: 0.15, // Enforce narrative prose over notes
    styleRules: [
      'Prioritize narrative prose over bullet lists',
      'Ground every recommendation in biological or psychological mechanisms',
      'End sections with a concrete 5-minute implementation exercise',
      'Avoid cliché motivational tropes and empty platitudes',
    ],
  },
  business: {
    genre: 'Business & Leadership',
    subgenre: 'Strategy & Execution',
    targetAudience: 'Executives, Founders & Team Leaders',
    readingLevel: 'Professional / College',
    tone: 'Authoritative, concise, analytical, and high-leverage',
    voice: 'Senior operating partner and strategic advisor',
    sentenceLengthTarget: 'short',
    preferredTerminology: ['leverage', 'asymmetric upside', 'unit economics', 'systemic', 'flywheel', 'bottleneck'],
    forbiddenTerminology: ['synergize', 'paradigm shift', 'disrupt the space', 'game changing'],
    emDashLimitPer1k: 1.5,
    maxBulletRatio: 0.20,
    styleRules: [
      'Lead with the bottom-line insight before expanding on details',
      'Use real tables and structured comparison matrices instead of narrative lists',
      'Focus on repeatable systems rather than one-off heroic efforts',
      'Eliminate corporate jargon and buzzwords',
    ],
  },
  academic: {
    genre: 'Academic & Reference',
    subgenre: 'Historical / Scientific Analysis',
    targetAudience: 'Scholars, Students & Subject Enthusiasts',
    readingLevel: 'Advanced / Academic',
    tone: 'Objective, precise, scholarly, and measured',
    voice: 'Impartial researcher and rigorous historian',
    sentenceLengthTarget: 'complex',
    preferredTerminology: ['empirical evidence', 'historiographical', 'methodology', 'corroborate', 'primary source'],
    forbiddenTerminology: ['obviously', 'without a doubt', 'clearly proven', 'as we all know'],
    emDashLimitPer1k: 2,
    maxBulletRatio: 0.10,
    styleRules: [
      'Never make sweeping claims without citing empirical or historical evidence',
      'Maintain an impartial, measured scholarly tone',
      'Distinguish clearly between established consensus and emerging hypotheses',
    ],
  },
  thriller: {
    genre: 'Fiction',
    subgenre: 'Psychological Thriller & Mystery',
    targetAudience: 'Adult Fiction Readers',
    readingLevel: 'General Adult',
    tone: 'Tension-driven, atmospheric, visceral, and suspenseful',
    voice: 'Intimate, unreliable or hyper-observant narrator',
    sentenceLengthTarget: 'varied',
    preferredTerminology: ['shadow', 'pulse', 'silence', 'calculate', 'fracture'],
    forbiddenTerminology: ['suddenly', 'all of a sudden', 'she felt like', 'little did he know'],
    emDashLimitPer1k: 3, // Fiction allows dialogue interruptions
    maxBulletRatio: 0.0, // No bullets in fiction
    styleRules: [
      'Show internal physiological reactions rather than naming emotions',
      'Use short, punchy sentence cadences during high-tension scenes',
      'End chapters on psychological turning points or cliffhangers',
    ],
  },
};

export class StyleProfileService {
  /**
   * Get style profile for a given niche and audience
   */
  static getProfileForNiche(niche?: string | null, targetAudience?: string | null): StyleProfile {
    const lower = (niche || '').toLowerCase();
    let profile: StyleProfile;

    if (lower.includes('cookbook') || lower.includes('recipe') || lower.includes('diet')) {
      profile = { ...PRESET_STYLE_PROFILES.cookbook };
    } else if (lower.includes('business') || lower.includes('finance') || lower.includes('real estate')) {
      profile = { ...PRESET_STYLE_PROFILES.business };
    } else if (lower.includes('thriller') || lower.includes('romance') || lower.includes('fiction')) {
      profile = { ...PRESET_STYLE_PROFILES.thriller };
    } else if (lower.includes('history') || lower.includes('academic') || lower.includes('science')) {
      profile = { ...PRESET_STYLE_PROFILES.academic };
    } else {
      profile = { ...PRESET_STYLE_PROFILES.selfHelp };
    }

    if (targetAudience) {
      profile.targetAudience = targetAudience;
    }

    return profile;
  }
}
