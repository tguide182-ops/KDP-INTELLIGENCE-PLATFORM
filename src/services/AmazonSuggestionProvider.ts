import { MARKETPLACES } from '../lib/marketplaces';

export interface RawSuggestion {
  term: string;
  rank: number;
  phraseType: 'seed' | 'suggestion' | 'alphabet' | 'question' | 'modifier';
  parentKeyword: string;
}

export class AmazonSuggestionProvider {
  /**
   * Fetch live autocomplete suggestions directly from Amazon Completion API
   */
  static async fetchSuggestions(
    query: string,
    marketplaceId: string = 'amazon.com'
  ): Promise<RawSuggestion[]> {
    const marketplace = MARKETPLACES[marketplaceId] || MARKETPLACES['amazon.com'];
    const host = marketplace.suggestionHost;
    
    // Amazon Market IDs:
    // US: ATVPDKIKX0DER, UK: A1F83G8C2ARO7P, DE: A1PA6795UKMFR9, etc.
    const marketIds: Record<string, string> = {
      'amazon.com': 'ATVPDKIKX0DER',
      'amazon.co.uk': 'A1F83G8C2ARO7P',
      'amazon.de': 'A1PA6795UKMFR9',
      'amazon.ca': 'A2EUQ1WTGCTBG2',
      'amazon.com.au': 'A39IBJ37TRP1C6',
      'amazon.es': 'A1RKKUPIHCS9HS',
      'amazon.fr': 'A13V1IB3VIYZZH',
      'amazon.it': 'APJ6JRA9NG5V4',
      'amazon.co.jp': 'A1VC38T7YXB528',
    };

    const mid = marketIds[marketplaceId] || 'ATVPDKIKX0DER';
    const url = `https://${host}/api/2017/suggestions?mid=${mid}&alias=stripbooks&prefix=${encodeURIComponent(
      query.trim()
    )}&suggestion-type=KEYWORD&suggestion-type=WIDGET`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Amazon API returned status: ${response.status}`);
      }

      const data = await response.json();
      const suggestions: RawSuggestion[] = [];

      if (data && Array.isArray(data.suggestions)) {
        data.suggestions.forEach((item: { value: string }, index: number) => {
          if (item && item.value) {
            suggestions.push({
              term: item.value.toLowerCase().trim(),
              rank: index + 1,
              phraseType: index === 0 && item.value.toLowerCase() === query.toLowerCase() ? 'seed' : 'suggestion',
              parentKeyword: query.trim().toLowerCase(),
            });
          }
        });
      }

      return suggestions;
    } catch (error) {
      console.warn(`[AmazonSuggestionProvider] Live fetch failed for "${query}":`, error);
      return [];
    }
  }

  /**
   * Run expansion (alphabet, questions, modifiers)
   */
  static async expandKeywords(
    seed: string,
    marketplaceId: string = 'amazon.com',
    types: ('alphabet' | 'questions' | 'modifiers')[] = ['alphabet', 'modifiers']
  ): Promise<RawSuggestion[]> {
    const results: RawSuggestion[] = [];
    const seen = new Set<string>();

    // 1. Direct seed search
    const seedResults = await this.fetchSuggestions(seed, marketplaceId);
    for (const item of seedResults) {
      if (!seen.has(item.term)) {
        seen.add(item.term);
        results.push(item);
      }
    }

    // 2. Modifiers expansion
    if (types.includes('modifiers')) {
      const modifiers = [
        'for beginners',
        'for women',
        'for seniors',
        'recipes',
        'easy',
        'high protein',
        'weight loss',
        'quick and easy',
      ];

      for (const mod of modifiers) {
        const expandedQuery = `${seed} ${mod}`;
        const modResults = await this.fetchSuggestions(expandedQuery, marketplaceId);
        for (const item of modResults) {
          if (!seen.has(item.term)) {
            seen.add(item.term);
            results.push({
              ...item,
              phraseType: 'modifier',
              parentKeyword: seed,
            });
          }
        }
      }
    }

    // 3. Alphabet expansion (A through M for performance)
    if (types.includes('alphabet')) {
      const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'p', 's', 'w'];
      for (const letter of letters) {
        const alphaQuery = `${seed} ${letter}`;
        const alphaResults = await this.fetchSuggestions(alphaQuery, marketplaceId);
        for (const item of alphaResults) {
          if (!seen.has(item.term)) {
            seen.add(item.term);
            results.push({
              ...item,
              phraseType: 'alphabet',
              parentKeyword: seed,
            });
          }
        }
      }
    }

    return results;
  }
}
