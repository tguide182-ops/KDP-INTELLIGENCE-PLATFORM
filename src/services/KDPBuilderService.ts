export interface TitleIdea {
  title: string;
  subtitle: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  audienceHook?: string;
  benefitHook?: string;
  titleCharCount: number;
  subtitleCharCount: number;
  isCompliant: boolean;
  notes: string;
}

export interface BackendKeywordSlot {
  slotNumber: number;
  phrase: string;
  charCount: number;
  maxChars: number; // 50 chars recommended limit
  words: string[];
  isCompliant: boolean;
  warnings: string[];
}

export interface OverlapReport {
  duplicateWordsInBackend: string[];
  wordsAlreadyInTitleSubtitle: string[];
  trademarkWarnings: string[];
  subjectiveClaimWarnings: string[];
  totalDuplicateCount: number;
  isCompliant: boolean;
}

export class KDPBuilderService {
  /**
   * Generate structured, compliant Title & Subtitle ideas
   */
  static buildTitleIdeas(
    primaryKeyword: string,
    secondaryKeywords: string[] = [],
    audience: string = 'Women Over 50',
    benefit: string = 'Balance Hormones & Lose Belly Fat'
  ): TitleIdea[] {
    const cleanPrimary = primaryKeyword.trim();
    const cleanAudience = audience.trim();
    const cleanBenefit = benefit.trim();

    return [
      {
        title: `${cleanPrimary} for ${cleanAudience}`,
        subtitle: `Simple 30-Minute High-Protein Meals to ${cleanBenefit} with Minimal Prep and Everyday Ingredients`,
        primaryKeyword: cleanPrimary,
        secondaryKeywords: ['30-minute meals', 'high-protein', 'minimal prep'],
        audienceHook: cleanAudience,
        benefitHook: cleanBenefit,
        titleCharCount: `${cleanPrimary} for ${cleanAudience}`.length,
        subtitleCharCount: `Simple 30-Minute High-Protein Meals to ${cleanBenefit} with Minimal Prep and Everyday Ingredients`.length,
        isCompliant: true,
        notes: 'Classic high-converting direct structure. Primary keyword is right at the beginning of the title.',
      },
      {
        title: `The 30-Minute ${cleanPrimary}`,
        subtitle: `A Practical Low-Carb Nutrition Guide for ${cleanAudience} to ${cleanBenefit} and Boost Daily Energy`,
        primaryKeyword: cleanPrimary,
        secondaryKeywords: ['low-carb nutrition', 'boost daily energy'],
        audienceHook: cleanAudience,
        benefitHook: cleanBenefit,
        titleCharCount: `The 30-Minute ${cleanPrimary}`.length,
        subtitleCharCount: `A Practical Low-Carb Nutrition Guide for ${cleanAudience} to ${cleanBenefit} and Boost Daily Energy`.length,
        isCompliant: true,
        notes: 'Practicality-first hook targeting busy readers who want fast weeknight prep.',
      },
      {
        title: `The ${cleanPrimary} Reset`,
        subtitle: `Delicious Mediterranean & High-Protein Recipes Tailored for ${cleanAudience} to ${cleanBenefit}`,
        primaryKeyword: cleanPrimary,
        secondaryKeywords: ['mediterranean', 'high-protein recipes'],
        audienceHook: cleanAudience,
        benefitHook: cleanBenefit,
        titleCharCount: `The ${cleanPrimary} Reset`.length,
        subtitleCharCount: `Delicious Mediterranean & High-Protein Recipes Tailored for ${cleanAudience} to ${cleanBenefit}`.length,
        isCompliant: true,
        notes: 'Benefit-driven reset theme. High perceived value and clean branding.',
      },
      {
        title: `Easy ${cleanPrimary} for Beginners`,
        subtitle: `The Essential 4-Week Meal Plan and Nutritional Blueprint for ${cleanAudience} to ${cleanBenefit}`,
        primaryKeyword: cleanPrimary,
        secondaryKeywords: ['4-week meal plan', 'nutritional blueprint'],
        audienceHook: cleanAudience,
        benefitHook: cleanBenefit,
        titleCharCount: `Easy ${cleanPrimary} for Beginners`.length,
        subtitleCharCount: `The Essential 4-Week Meal Plan and Nutritional Blueprint for ${cleanAudience} to ${cleanBenefit}`.length,
        isCompliant: true,
        notes: 'Approachable beginner hook. Low barrier to entry.',
      },
    ];
  }

  /**
   * Extract words into normalized set
   */
  private static extractWords(text: string): Set<string> {
    const stopWords = new Set(['the', 'and', 'for', 'with', 'to', 'in', 'of', 'a', 'an', 'on', 'at', 'by']);
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stopWords.has(w));
    return new Set(words);
  }

  /**
   * Build 7 optimal Amazon KDP Backend Keywords
   */
  static buildBackendKeywords(
    title: string,
    subtitle: string,
    candidateKeywords: string[]
  ): BackendKeywordSlot[] {
    const usedWords = this.extractWords(`${title} ${subtitle}`);

    // Filter candidate terms that are not already in title/subtitle
    const freshTerms: string[] = [];
    candidateKeywords.forEach((kw) => {
      const words = kw.toLowerCase().split(/\s+/);
      const isRepresented = words.every((w) => usedWords.has(w));
      if (!isRepresented) {
        freshTerms.push(kw.toLowerCase().trim());
      }
    });

    // Preset high-value backend keywords if needed
    const defaultBackends = [
      'anti inflammatory meal prep diet',
      'hormone balance cookbook weight loss',
      'postmenopausal nutrition guide belly fat',
      'quick 15 minute healthy dinners seniors',
      'low carb high fiber recipes fatigue',
      'estrogen reset gut health cookbook',
      'perimenopause natural remedies food plan',
    ];

    const pool = freshTerms.length >= 7 ? freshTerms : [...freshTerms, ...defaultBackends];

    const slots: BackendKeywordSlot[] = [];
    const usedInSlots = new Set<string>();

    for (let i = 0; i < 7; i++) {
      let phrase = pool[i] || defaultBackends[i % defaultBackends.length];
      
      // Ensure phrase is under 50 characters
      if (phrase.length > 50) {
        phrase = phrase.slice(0, 48).trim();
      }

      const words = phrase.split(/\s+/);
      const warnings: string[] = [];

      // Check if words overlap with title
      words.forEach((w) => {
        if (usedWords.has(w)) {
          warnings.push(`"${w}" is already in Title/Subtitle (wasting space)`);
        }
      });

      slots.push({
        slotNumber: i + 1,
        phrase,
        charCount: phrase.length,
        maxChars: 50,
        words,
        isCompliant: warnings.length === 0,
        warnings,
      });
    }

    return slots;
  }

  /**
   * Check keyword overlap and Amazon KDP compliance
   */
  static checkOverlapAndCompliance(
    title: string,
    subtitle: string,
    backendSlots: string[]
  ): OverlapReport {
    const titleWords = this.extractWords(`${title} ${subtitle}`);
    const wordsAlreadyInTitleSubtitle: string[] = [];
    const duplicateWordsInBackend: string[] = [];
    const trademarkWarnings: string[] = [];
    const subjectiveClaimWarnings: string[] = [];

    const seenBackendWords = new Map<string, number>();

    // Restricted Amazon terms
    const prohibitedTrademarks = [
      'kindle', 'ipad', 'iphone', 'apple', 'instant pot', 'thermomix', 'crockpot',
      'mindy pelz', 'mary claire haver', 'peter attia', 'tim ferriss'
    ];

    const prohibitedClaims = [
      'best seller', 'bestseller', '#1 book', 'free', 'bonus', 'guaranteed'
    ];

    // Check title/subtitle for claims & trademarks
    const fullText = `${title} ${subtitle} ${backendSlots.join(' ')}`.toLowerCase();
    prohibitedTrademarks.forEach((tm) => {
      if (fullText.includes(tm)) {
        trademarkWarnings.push(`Contains potential trademark or competitor author name: "${tm}"`);
      }
    });

    prohibitedClaims.forEach((clm) => {
      if (fullText.includes(clm)) {
        subjectiveClaimWarnings.push(`Contains subjective/prohibited claim: "${clm}"`);
      }
    });

    backendSlots.forEach((slot) => {
      const words = slot.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
      words.forEach((w) => {
        if (titleWords.has(w) && !wordsAlreadyInTitleSubtitle.includes(w)) {
          wordsAlreadyInTitleSubtitle.push(w);
        }

        const count = (seenBackendWords.get(w) || 0) + 1;
        seenBackendWords.set(w, count);
        if (count > 1 && !duplicateWordsInBackend.includes(w)) {
          duplicateWordsInBackend.push(w);
        }
      });
    });

    return {
      duplicateWordsInBackend,
      wordsAlreadyInTitleSubtitle,
      trademarkWarnings,
      subjectiveClaimWarnings,
      totalDuplicateCount: duplicateWordsInBackend.length + wordsAlreadyInTitleSubtitle.length,
      isCompliant: trademarkWarnings.length === 0 && subjectiveClaimWarnings.length === 0,
    };
  }
}
