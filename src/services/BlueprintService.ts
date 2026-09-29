export interface BlueprintParams {
  niche: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  targetAudience?: string;
  coreBenefit?: string;
  title?: string;
  subtitle?: string;
  structureType?: 'Cookbook / 4-Week Reset' | 'Non-Fiction Framework' | 'Workbook / Guide';
  targetWordCount?: number;
  trimSize?: string;
  paperType?: 'white' | 'cream' | 'color';
}

export interface GeneratedBlock {
  orderIndex: number;
  type: 'PARAGRAPH' | 'HEADING' | 'CALLOUT' | 'RECIPE' | 'TABLE' | 'IMAGE_SLOT' | 'CHECKLIST' | 'QUOTE';
  content: string;
  metadata?: string;
  wordCount: number;
}

export interface GeneratedSection {
  orderIndex: number;
  title: string;
  targetWordCount: number;
  summary: string;
  keyPoints: string[];
  blocks?: GeneratedBlock[];
}

export interface GeneratedChapter {
  orderIndex: number;
  chapterNumber: number | null;
  type: 'FRONT_MATTER' | 'CHAPTER' | 'BACK_MATTER';
  title: string;
  subtitle?: string;
  targetWordCount: number;
  purpose: string;
  assignedKeywords: string[];
  sections: GeneratedSection[];
}

export interface GeneratedBlueprint {
  thesis: string;
  targetReaderProfile: string;
  toneAndStyle: string;
  structureType: string;
  totalChapters: number;
  estimatedPages: number;
  estimatedReadingTimeMin: number;
  keywordCoverage: Record<string, string[]>;
  chapters: GeneratedChapter[];
}

export interface KDPSpecs {
  trimSize: string;
  paperType: string;
  totalWords: number;
  estimatedPages: number;
  wordsPerPage: number;
  spineThicknessInches: number;
  minGutterInches: number;
  outsideMarginInches: number;
  bleedInches: number;
  coverWidthInches: number;
  coverHeightInches: number;
}

export class BlueprintService {
  /**
   * Calculate KDP print interior and cover specifications
   */
  static calculateKDPSpecs(
    totalWords: number,
    trimSize: string = '6x9',
    paperType: string = 'white'
  ): KDPSpecs {
    const wordsPerPageMap: Record<string, number> = {
      '6x9': 250,
      '8.5x11': 450,
      '5.5x8.5': 220,
      '5x8': 200,
      '7x10': 320,
    };

    const wordsPerPage = wordsPerPageMap[trimSize] || 250;
    // Minimum 24 pages for KDP saddle stitch / perfect bound requirements
    const estimatedPages = Math.max(24, Math.ceil(totalWords / wordsPerPage));

    // Page multiplier based on paper type
    // White paper: 0.002252" per page | Cream paper: 0.0025" per page | Color: 0.002347"
    const pageThickness =
      paperType === 'cream' ? 0.0025 : paperType === 'color' ? 0.002347 : 0.002252;
    const spineThicknessInches = Number((estimatedPages * pageThickness).toFixed(4));

    // KDP minimum gutter based on page count
    let minGutterInches = 0.375;
    if (estimatedPages > 500) minGutterInches = 0.75;
    else if (estimatedPages > 300) minGutterInches = 0.625;
    else if (estimatedPages > 150) minGutterInches = 0.5;

    // Cover dimensions: Bleed (0.125" * 2) + Trim width * 2 + Spine
    const [trimWStr, trimHStr] = trimSize.split('x');
    const trimW = parseFloat(trimWStr) || 6;
    const trimH = parseFloat(trimHStr) || 9;

    const bleedInches = 0.125;
    const coverWidthInches = Number((trimW * 2 + spineThicknessInches + bleedInches * 2).toFixed(3));
    const coverHeightInches = Number((trimH + bleedInches * 2).toFixed(3));

    return {
      trimSize,
      paperType,
      totalWords,
      estimatedPages,
      wordsPerPage,
      spineThicknessInches,
      minGutterInches,
      outsideMarginInches: 0.25,
      bleedInches,
      coverWidthInches,
      coverHeightInches,
    };
  }

  /**
   * Generate an automated structured blueprint from market research parameters
   */
  static generateBlueprintFromResearch(params: BlueprintParams): GeneratedBlueprint {
    const nicheLower = (params.niche || '').toLowerCase();
    const primaryKw = params.primaryKeyword || params.niche || 'Comprehensive Guide';
    const audience = params.targetAudience || 'Beginners & Action-Oriented Readers';
    const benefit = params.coreBenefit || 'Achieve lasting transformation with clear, step-by-step guidance';
    const targetWords = params.targetWordCount || 25000;
    const trimSize = params.trimSize || '6x9';

    const isCookbook =
      nicheLower.includes('cookbook') ||
      nicheLower.includes('recipes') ||
      nicheLower.includes('diet') ||
      nicheLower.includes('keto') ||
      nicheLower.includes('menopause') ||
      nicheLower.includes('glp');

    const structureType =
      params.structureType || (isCookbook ? 'Cookbook / 4-Week Reset' : 'Non-Fiction Framework');

    if (isCookbook) {
      return this.buildCookbookBlueprint({
        ...params,
        primaryKeyword: primaryKw,
        targetAudience: audience,
        coreBenefit: benefit,
        targetWordCount: targetWords,
        trimSize,
        structureType,
      });
    }

    return this.buildNonFictionBlueprint({
      ...params,
      primaryKeyword: primaryKw,
      targetAudience: audience,
      coreBenefit: benefit,
      targetWordCount: targetWords,
      trimSize,
      structureType,
    });
  }

  /**
   * Builds structured blueprint for Cookbook / Health Reset niches
   */
  private static buildCookbookBlueprint(params: BlueprintParams): GeneratedBlueprint {
    const kw = params.primaryKeyword;
    const audience = params.targetAudience || 'Women Over 50';
    const benefit = params.coreBenefit || 'Hormonal balance, sustained energy, and visceral fat reduction';

    const chapters: GeneratedChapter[] = [
      {
        orderIndex: 1,
        chapterNumber: null,
        type: 'FRONT_MATTER',
        title: 'Introduction & The Science of Nutritional Reset',
        subtitle: `Why traditional diets fail ${audience}`,
        targetWordCount: 1800,
        purpose: 'Establish empathy, explain hormonal metabolic shifts, and provide an inspiring promise of transformation.',
        assignedKeywords: [kw, `${kw} for ${audience.toLowerCase()}`],
        sections: [
          {
            orderIndex: 1,
            title: 'The Hidden Shift: Metabolism, Hormones, and Muscle Loss',
            targetWordCount: 600,
            summary: 'Demystify physiological changes without medical jargon, focusing on practical day-to-day impacts.',
            keyPoints: [
              'Estrogen/progesterone fluctuations and insulin sensitivity',
              'Sarcopenia and the critical importance of 30g+ protein per meal',
              'Why starvation diets trigger cortisol and store visceral belly fat',
            ],
          },
          {
            orderIndex: 2,
            title: 'Your 3 Pillars: Protein, Fiber, and Anti-Inflammatory Fats',
            targetWordCount: 600,
            summary: 'The actionable dietary framework that drives every recipe in this book.',
            keyPoints: [
              'Targeting 1.2g–1.6g protein per kg of body weight',
              '30g daily fiber goal for gut microbiome balance',
              'Omega-3 fatty acids for joint lubrication and hot flash reduction',
            ],
          },
          {
            orderIndex: 3,
            title: 'How to Navigate This Book & Essential Kitchen Tools',
            targetWordCount: 600,
            summary: 'Practical setup guide for efficient 30-minute cooking.',
            keyPoints: [
              'Pantry staples checklist (everyday grocery store ingredients)',
              'Meal prep shortcuts that save 4+ hours every Sunday',
              'Recipe key symbols (Quick Prep, High Protein, Freezer Friendly)',
            ],
          },
        ],
      },
      {
        orderIndex: 2,
        chapterNumber: 1,
        type: 'CHAPTER',
        title: 'Energizing High-Protein Breakfasts & Smoothies',
        subtitle: 'Kickstart metabolic burn and crush morning cravings',
        targetWordCount: 3200,
        purpose: 'Provide quick, satisfying breakfast recipes that prevent mid-morning brain fog and sugar crashes.',
        assignedKeywords: [`${kw} breakfasts`, 'high protein breakfast recipes', 'quick morning meal prep'],
        sections: [
          {
            orderIndex: 1,
            title: 'Savory Skillets & Egg Bakes',
            targetWordCount: 1000,
            summary: 'Sheet pan and skillet recipes yielding 30g+ protein with minimal cleanup.',
            keyPoints: ['Spinach & Feta Crustless Quiche', 'Mediterranean Turkey Sausage Skillet', 'Smoked Salmon Protein Scramble'],
          },
          {
            orderIndex: 2,
            title: 'Metabolism-Boosting Smoothies & Parfaits',
            targetWordCount: 1100,
            summary: 'Zero-sugar-spike blended breakfasts packed with greens, collagen, and healthy fats.',
            keyPoints: ['Anti-Inflammatory Berry Chia Whip', 'Creamy Vanilla Collagen Power Smoothie', 'Overnight High-Protein Golden Oats'],
          },
          {
            orderIndex: 3,
            title: 'Prep-Ahead Breakfast Muffins & Bites',
            targetWordCount: 1100,
            summary: 'Grab-and-go freezer-friendly portions for busy weekdays.',
            keyPoints: ['Egg White & Roasted Pepper Muffins', 'Almond Flour High-Protein Scones', 'Greek Yogurt Breakfast Parfait Jars'],
          },
        ],
      },
      {
        orderIndex: 3,
        chapterNumber: 2,
        type: 'CHAPTER',
        title: '30-Minute Lunches & Smart Salads',
        subtitle: 'Sustained afternoon focus without the 3 PM slump',
        targetWordCount: 3400,
        purpose: 'Address the practicality gap with quick, flavorful lunches that can be assembled in under 20 minutes.',
        assignedKeywords: ['30 minute lunch recipes', 'meal prep salads for work', 'easy healthy lunches'],
        sections: [
          {
            orderIndex: 1,
            title: 'Power Protein Bowls',
            targetWordCount: 1100,
            summary: 'Customizable balanced bowls with lean proteins, ancient grains, and gut-healthy dressings.',
            keyPoints: ['Mediterranean Salmon & Quinoa Bowl', 'Warm Chicken & Roasted Chickpea Bowl', 'Zesty Tofu & Edamame Green Bowl'],
          },
          {
            orderIndex: 2,
            title: 'Mason Jar & Portable Salads That Never Get Soggy',
            targetWordCount: 1150,
            summary: 'Layering strategies that keep greens crisp for 5 full days in the fridge.',
            keyPoints: ['Layering order formula: dressing on bottom, greens on top', 'Greek Grilled Chicken & Kalamata Jar', 'Superfood Kale, Pecan & Cranberry Salad'],
          },
          {
            orderIndex: 3,
            title: 'Warm Wraps & Nutrient-Dense Soups',
            targetWordCount: 1150,
            summary: 'Comforting midday meals that warm the gut and promote healthy digestion.',
            keyPoints: ['Turkey & Avocado Collard Green Wraps', 'Lemon Herb Chicken Bone Broth Soup', 'Spiced Lentil & Spinach Stew'],
          },
        ],
      },
      {
        orderIndex: 4,
        chapterNumber: 3,
        type: 'CHAPTER',
        title: 'One-Pot, Sheet Pan & Slow Cooker Dinners',
        subtitle: 'Effortless evening nourishment with single-pan cleanup',
        targetWordCount: 3800,
        purpose: 'Deliver comfort-food flavors engineered with high protein, low glycemic impact, and fast weeknight cleanup.',
        assignedKeywords: ['one pot healthy dinners', 'sheet pan meals', 'slow cooker healthy recipes'],
        sections: [
          {
            orderIndex: 1,
            title: '20-Minute Sheet Pan Classics',
            targetWordCount: 1250,
            summary: 'Full dinners cooked on a single baking sheet with foolproof seasoning blends.',
            keyPoints: ['Lemon Herb Cod with Roasted Asparagus & Baby Tomatoes', 'Balsamic Glazed Chicken Breast with Sweet Potatoes', 'Garlic Parmesan Pork Tenderloin & Broccoli'],
          },
          {
            orderIndex: 2,
            title: 'Hearty One-Pot Skillets & Dutch Oven Meals',
            targetWordCount: 1300,
            summary: 'Deeply satisfying dishes simmered in a single pot.',
            keyPoints: ['Anti-Inflammatory Turmeric Chicken Curry', 'Grass-Fed Beef & Zucchini Skillet Bolognese', 'Rustic Mediterranean Seafood Stew'],
          },
          {
            orderIndex: 3,
            title: 'Set-and-Forget Slow Cooker & Instant Pot Gems',
            targetWordCount: 1250,
            summary: 'Hands-off cooking ready when you get home from a long day.',
            keyPoints: ['Tender Shredded Salsa Chicken', 'Slow Cooker Beef Shank Bone Broth Soup', 'Herbed Turkey Meatballs in Marinara'],
          },
        ],
      },
      {
        orderIndex: 5,
        chapterNumber: 4,
        type: 'CHAPTER',
        title: 'Hormone-Balancing Snacks & Sweet Treats',
        subtitle: 'Satisfy sweet cravings without spiking insulin',
        targetWordCount: 2800,
        purpose: 'Eliminate guilt and provide healthy craving alternatives that support sleep and steady blood glucose.',
        assignedKeywords: ['healthy snacks for cravings', 'low sugar desserts', 'anti-inflammatory treats'],
        sections: [
          {
            orderIndex: 1,
            title: 'Crunchy & Savory Bites',
            targetWordCount: 900,
            summary: 'Nutrient-rich snacks that replace chips and crackers.',
            keyPoints: ['Crispy Roasted Spiced Chickpeas', 'Rosemary Sea Salt Nut Mix', 'Avocado Cucumber Bites with Smoked Paprika'],
          },
          {
            orderIndex: 2,
            title: 'High-Protein Energy Bites & Bars',
            targetWordCount: 950,
            summary: 'No-bake snacks that keep blood sugar level during late afternoons.',
            keyPoints: ['Dark Chocolate Almond Butter Protein Fudge', 'Lemon Coconut Chia Energy Balls', 'Seed-Packed Protein Trail Bars'],
          },
          {
            orderIndex: 3,
            title: 'Sleep-Promoting Bedtime Elixirs & Desserts',
            targetWordCount: 950,
            summary: 'Magnesium-rich bedtime treats that promote deep REM sleep.',
            keyPoints: ['Golden Milk Chamomile Turmeric Latte', 'Tart Cherry & Chia Nighttime Pudding', 'Warm Cinnamon Cacao Sleep Tonic'],
          },
        ],
      },
      {
        orderIndex: 6,
        chapterNumber: 5,
        type: 'CHAPTER',
        title: 'The 4-Week Reset Meal Plan & Prep Blueprint',
        subtitle: 'Your complete roadmap to automated healthy eating',
        targetWordCount: 4000,
        purpose: 'Give the reader a foolproof day-by-day plan removing all decision fatigue.',
        assignedKeywords: ['4 week meal plan', 'menopause meal plan', 'weekly grocery lists'],
        sections: [
          {
            orderIndex: 1,
            title: 'Week 1: The Anti-Inflammatory Jumpstart',
            targetWordCount: 1000,
            summary: 'Eliminating common irritants, stabilizing blood sugar, and restoring morning energy.',
            keyPoints: ['Day 1–7 complete breakfast, lunch, dinner, snack schedule', 'Week 1 printable shopping list', 'Sunday 90-minute batch cooking roadmap'],
          },
          {
            orderIndex: 2,
            title: 'Week 2: Optimizing Protein & Muscle Preservation',
            targetWordCount: 1000,
            summary: 'Dialing in the 30g protein threshold per meal for metabolic burn.',
            keyPoints: ['Day 8–14 meal schedule', 'Week 2 shopping list', 'Simple swap guides for picky family members'],
          },
          {
            orderIndex: 3,
            title: 'Week 3: Gut Health & Micronutrient Mastery',
            targetWordCount: 1000,
            summary: 'Focusing on fermented foods, prebiotic fiber, and liver support.',
            keyPoints: ['Day 15–21 meal schedule', 'Week 3 shopping list', 'How to dining out without derailing progress'],
          },
          {
            orderIndex: 4,
            title: 'Week 4: Long-Term Sustainability & Maintenance',
            targetWordCount: 1000,
            summary: 'Transitioning from structured reset to intuitive, enjoyable lifetime habits.',
            keyPoints: ['Day 22–28 meal schedule', 'The 80/20 lifestyle integration guideline', 'Post-reset self-assessment and milestone tracker'],
          },
        ],
      },
      {
        orderIndex: 7,
        chapterNumber: null,
        type: 'BACK_MATTER',
        title: 'Appendix: Measurement Tables, Substitution Guide & Recipe Index',
        subtitle: 'Everyday reference tools at your fingertips',
        targetWordCount: 1500,
        purpose: 'Provide quick utility for readers in the kitchen, increasing physical book retention and review ratings.',
        assignedKeywords: ['cooking conversion charts', 'ingredient substitutions guide'],
        sections: [
          {
            orderIndex: 1,
            title: 'Metric & Imperial Conversion Tables',
            targetWordCount: 500,
            summary: 'Accurate volume, weight, and oven temperature charts for US and International readers.',
            keyPoints: ['Oven temp Fahrenheit to Celsius conversions', 'Cups to grams chart for common flours and liquids', 'Pan size volume conversion guide'],
          },
          {
            orderIndex: 2,
            title: 'Allergen & Dietary Swap Directory',
            targetWordCount: 500,
            summary: 'Quick substitutions for dairy-free, gluten-free, nut-free, and vegetarian needs.',
            keyPoints: ['Dairy-free milk and cheese substitutes in baking', 'Nut-free seed alternatives', 'Vegetarian protein swaps with matching macro profiles'],
          },
          {
            orderIndex: 3,
            title: 'Alphabetical & Category Recipe Index',
            targetWordCount: 500,
            summary: 'Comprehensive index organized by primary ingredient and prep time.',
            keyPoints: ['Index by main protein (Chicken, Seafood, Beef, Vegetarian)', 'Index by cook time (Under 20 mins, Under 30 mins)', 'Dietary tag index (Dairy-Free, Gluten-Free, Low Carb)'],
          },
        ],
      },
    ];

    const totalWords = chapters.reduce((acc, c) => acc + c.targetWordCount, 0);
    const kdpSpecs = this.calculateKDPSpecs(totalWords, params.trimSize || '6x9', params.paperType || 'white');

    const keywordCoverage: Record<string, string[]> = {};
    chapters.forEach((c) => {
      c.assignedKeywords.forEach((k) => {
        if (!keywordCoverage[k]) keywordCoverage[k] = [];
        keywordCoverage[k].push(c.title);
      });
    });

    return {
      thesis: `A science-backed, high-protein culinary blueprint designed specifically for ${audience} to reset metabolic rate, balance hormones, and eliminate visceral fat without restrictive calorie deprivation.`,
      targetReaderProfile: `Women aged 45–65 experiencing peri-menopause or post-menopause who feel betrayed by sudden midsection weight gain, brain fog, and disrupted sleep. They have tried traditional low-calorie diets that only worsened fatigue. They need practical, 30-minute meals using everyday grocery ingredients that their entire family will happily eat.`,
      toneAndStyle: 'Empathetic, scientifically grounded, encouraging, and intensely practical. Free of medical jargon, shame, or extreme dietary dogmatism.',
      structureType: params.structureType || 'Cookbook / 4-Week Reset',
      totalChapters: chapters.length,
      estimatedPages: kdpSpecs.estimatedPages,
      estimatedReadingTimeMin: Math.round(totalWords / 200), // ~200 WPM
      keywordCoverage,
      chapters,
    };
  }

  /**
   * Builds structured blueprint for Non-Fiction Framework / Self-Help niches
   */
  private static buildNonFictionBlueprint(params: BlueprintParams): GeneratedBlueprint {
    const kw = params.primaryKeyword;
    const audience = params.targetAudience || 'Ambitious Professionals & Self-Directed Learners';
    const benefit = params.coreBenefit || 'Master foundational habits, reclaim focus, and achieve consistent execution';

    const chapters: GeneratedChapter[] = [
      {
        orderIndex: 1,
        chapterNumber: null,
        type: 'FRONT_MATTER',
        title: 'Introduction: The Architecture of Sustainable Focus',
        subtitle: 'Why willpower is a flawed strategy',
        targetWordCount: 2000,
        purpose: 'Establish the core paradox: why conventional productivity advice fails modern professionals and outline the 4-phase transformation framework.',
        assignedKeywords: [kw, `${kw} guide`],
        sections: [
          {
            orderIndex: 1,
            title: 'The Modern Attention Crisis',
            targetWordCount: 650,
            summary: 'Examine cognitive fragmentation in digital environments.',
            keyPoints: ['The myth of multitasking', 'Dopamine depletion loops', 'The hidden cost of context switching'],
          },
          {
            orderIndex: 2,
            title: 'The 4-Stage Operating System',
            targetWordCount: 700,
            summary: 'High-level roadmap of the journey through this book.',
            keyPoints: ['Phase 1: Clarify', 'Phase 2: Eliminate', 'Phase 3: Systematize', 'Phase 4: Accelerate'],
          },
          {
            orderIndex: 3,
            title: 'How to Use This Handbook',
            targetWordCount: 650,
            summary: 'Reading instructions, reflection exercises, and downloadable companion worksheets.',
            keyPoints: ['Chapter diagnostic assessments', 'Action checklists at the end of each section', 'The 30-day implementation challenge'],
          },
        ],
      },
      {
        orderIndex: 2,
        chapterNumber: 1,
        type: 'CHAPTER',
        title: 'Deconstructing the Willpower Myth',
        subtitle: 'The neuroscience of environmental design',
        targetWordCount: 3000,
        purpose: 'Shift reader perspective from self-blame to intentional environmental architecture.',
        assignedKeywords: ['habits psychology', 'environmental design productivity'],
        sections: [
          {
            orderIndex: 1,
            title: 'Why Self-Control Always Depletes',
            targetWordCount: 1000,
            summary: 'Ego depletion and glucose metabolism in the prefrontal cortex.',
            keyPoints: ['Decision fatigue throughout the day', 'The friction principle', 'Designing default choices'],
          },
          {
            orderIndex: 2,
            title: 'The Stimulus-Response Loop',
            targetWordCount: 1000,
            summary: 'How subtle environmental cues trigger automatic behavior patterns.',
            keyPoints: ['Micro-triggers in workspace layout', 'Digital notifications as cognitive parasites', 'Building visual cues for success'],
          },
          {
            orderIndex: 3,
            title: 'Case Study: The 10-Minute Friction Audit',
            targetWordCount: 1000,
            summary: 'A step-by-step diagnostic to identify the 3 biggest friction points sabotaging your daily workflow.',
            keyPoints: ['Physical workspace audit', 'Digital clutter audit', 'The 20-second rule for desired behaviors'],
          },
        ],
      },
      {
        orderIndex: 3,
        chapterNumber: 2,
        type: 'CHAPTER',
        title: 'The Elimination Protocol',
        subtitle: 'Ruthlessly removing the non-essential',
        targetWordCount: 3200,
        purpose: 'Provide concrete criteria to identify and eliminate 80% of trivial obligations.',
        assignedKeywords: ['time management framework', 'eliminating distractions'],
        sections: [
          {
            orderIndex: 1,
            title: 'The 80/20 Leverage Analysis',
            targetWordCount: 1050,
            summary: 'Pinpoint the vital few activities driving 80% of professional and personal results.',
            keyPoints: ['The Pareto Principle in practice', 'High-leverage vs low-leverage tasks', 'Saying "no" without guilt or burning bridges'],
          },
          {
            orderIndex: 2,
            title: 'The Digital Detox Architecture',
            targetWordCount: 1100,
            summary: 'Systematic containment of email, messaging apps, and social feeds.',
            keyPoints: ['Batch-processing communication windows', 'The zero-inbox protocol', 'Smartphone decluttering rules'],
          },
          {
            orderIndex: 3,
            title: 'The Energy Drain Audit',
            targetWordCount: 1050,
            summary: 'Identify chronic commitments that produce resentment rather than value.',
            keyPoints: ['The Eisenhower Matrix upgraded for modern knowledge workers', 'Automating recurring low-value decisions', 'The 2-week commitment freeze'],
          },
        ],
      },
      {
        orderIndex: 4,
        chapterNumber: 3,
        type: 'CHAPTER',
        title: 'Deep Work Sprint Architecture',
        subtitle: 'Engineering 90-minute blocks of peak output',
        targetWordCount: 3500,
        purpose: 'Teach the reader how to enter flow state on command and produce high-quality work in half the time.',
        assignedKeywords: ['deep work strategies', 'focus sprints', 'flow state productivity'],
        sections: [
          {
            orderIndex: 1,
            title: 'The Ultradian Rhythm Blueprint',
            targetWordCount: 1150,
            summary: 'Aligning difficult cognitive tasks with 90-minute biological energy cycles.',
            keyPoints: ['The 90/20 focus cycle', 'Pre-sprint ritual checklist', 'Managing transition periods between sprints'],
          },
          {
            orderIndex: 2,
            title: 'Protecting the Sacred Hours',
            targetWordCount: 1200,
            summary: 'Setting boundaries with colleagues, clients, and family members.',
            keyPoints: ['Calendar blocking strategies that actually stick', 'The "Do Not Disturb" contract', 'Handling urgent interruptions gracefully'],
          },
          {
            orderIndex: 3,
            title: 'Recovery as a Competitive Advantage',
            targetWordCount: 1150,
            summary: 'Why cognitive recovery is not laziness, but the biological prerequisite for deep focus.',
            keyPoints: ['Active recovery vs passive numbing', 'The daily shutdown ritual', 'Sleep hygiene optimization for mental clarity'],
          },
        ],
      },
      {
        orderIndex: 5,
        chapterNumber: 4,
        type: 'CHAPTER',
        title: 'The 30-Day Habit Installation System',
        subtitle: 'Locking in behavior until it runs on autopilot',
        targetWordCount: 3200,
        purpose: 'Provide a structured daily protocol to ensure new habits endure past the initial motivation phase.',
        assignedKeywords: ['habit tracking system', 'building lasting habits'],
        sections: [
          {
            orderIndex: 1,
            title: 'Micro-Habits & Habit Stacking',
            targetWordCount: 1050,
            summary: 'The science of anchoring new tiny behaviors to existing established routines.',
            keyPoints: ['The 2-minute entry rule', 'Habit stacking formula: After [current habit], I will [new habit]', 'Celebrating micro-wins to trigger dopamine reinforcement'],
          },
          {
            orderIndex: 2,
            title: 'Designing Fail-Safes & The "Never Miss Twice" Rule',
            targetWordCount: 1100,
            summary: 'Anticipate disruptions, travel, and bad days with pre-planned minimum viable habits.',
            keyPoints: ['Defining your Minimum Viable Habit (MVH)', 'The psychological danger of breaking streaks', 'How to reset instantly after an off day'],
          },
          {
            orderIndex: 3,
            title: 'Accountability & Tracking Systems',
            targetWordCount: 1050,
            summary: 'Analog vs digital habit trackers and how to build external accountability.',
            keyPoints: ['The visual satisfaction of the X-effect grid', 'Accountability partners and anti-charity stakes', 'Monthly review prompts for continuous refinement'],
          },
        ],
      },
      {
        orderIndex: 6,
        chapterNumber: null,
        type: 'BACK_MATTER',
        title: 'Appendix: Tools, Diagnostic Checklists & 30-Day Tracker',
        subtitle: 'Your physical implementation workbook',
        targetWordCount: 1600,
        purpose: 'Transform the reading experience into physical action, boosting positive reader reviews and word-of-mouth.',
        assignedKeywords: ['habit tracker template', 'productivity checklist'],
        sections: [
          {
            orderIndex: 1,
            title: 'The Weekly Review Protocol Worksheet',
            targetWordCount: 500,
            summary: 'A 15-minute weekly checkpoint to realign priorities.',
            keyPoints: ['3 Wins of the week', 'Biggest time leak identified', 'Top 3 non-negotiables for the upcoming week'],
          },
          {
            orderIndex: 2,
            title: 'Recommended Toolkit & Reading Directory',
            targetWordCount: 550,
            summary: 'Curated software, hardware, and foundational literature recommendations.',
            keyPoints: ['Focus and noise-canceling tools', 'Analog notebook methodologies', 'Further reading bibliography'],
          },
          {
            orderIndex: 3,
            title: 'The 30-Day Daily Habit Tracker Grid',
            targetWordCount: 550,
            summary: 'A printable 30-day tracking grid for readers to mark daily completion.',
            keyPoints: ['Primary habit slot', 'Secondary habit slot', 'Daily energy score (1-5)', 'Evening reflection box'],
          },
        ],
      },
    ];

    const totalWords = chapters.reduce((acc, c) => acc + c.targetWordCount, 0);
    const kdpSpecs = this.calculateKDPSpecs(totalWords, params.trimSize || '6x9', params.paperType || 'white');

    const keywordCoverage: Record<string, string[]> = {};
    chapters.forEach((c) => {
      c.assignedKeywords.forEach((k) => {
        if (!keywordCoverage[k]) keywordCoverage[k] = [];
        keywordCoverage[k].push(c.title);
      });
    });

    return {
      thesis: `Sustainable productivity is not achieved through heroic willpower or grueling discipline, but through intentional environmental architecture, ruthless elimination, and biological energy alignment.`,
      targetReaderProfile: `Ambitious knowledge workers, creators, and entrepreneurs aged 25–50 who feel chronically overwhelmed by endless task lists, notifications, and surface-level busywork. They want concrete frameworks rather than vague inspirational fluff to reclaim deep focus and build enduring habits.`,
      toneAndStyle: 'Clear, authoritative, action-oriented, and intellectually rigorous. Focuses on practical systems, psychological mechanisms, and measurable outcomes.',
      structureType: params.structureType || 'Non-Fiction Framework',
      totalChapters: chapters.length,
      estimatedPages: kdpSpecs.estimatedPages,
      estimatedReadingTimeMin: Math.round(totalWords / 200),
      keywordCoverage,
      chapters,
    };
  }

  /**
   * Generates a clean Markdown export of the entire blueprint
   */
  static exportBlueprintToMarkdown(
    bookProject: { title: string; subtitle?: string | null; targetAudience?: string | null; trimSize: string; targetWordCount: number },
    blueprint: GeneratedBlueprint
  ): string {
    const lines: string[] = [];

    lines.push(`# ${bookProject.title}`);
    if (bookProject.subtitle) {
      lines.push(`### *${bookProject.subtitle}*`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## Executive Publishing Blueprint');
    lines.push(`- **Structure Type**: ${blueprint.structureType}`);
    lines.push(`- **Target Reader**: ${bookProject.targetAudience || blueprint.targetReaderProfile}`);
    lines.push(`- **Target Word Count**: ${bookProject.targetWordCount.toLocaleString()} words`);
    lines.push(`- **Estimated Pages**: ${blueprint.estimatedPages} pages (${bookProject.trimSize} trim size)`);
    lines.push(`- **Estimated Reading Time**: ${blueprint.estimatedReadingTimeMin} minutes`);
    lines.push(`- **Tone & Style**: ${blueprint.toneAndStyle}`);
    lines.push('');
    lines.push(`### Core Thesis`);
    lines.push(`> ${blueprint.thesis}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## Table of Contents & Chapter Breakdown');
    lines.push('');

    blueprint.chapters.forEach((ch, chIdx) => {
      const prefix = ch.type === 'CHAPTER' ? `Chapter ${ch.chapterNumber}: ` : '';
      lines.push(`### ${ch.orderIndex}. ${prefix}${ch.title}`);
      if (ch.subtitle) lines.push(`*${ch.subtitle}*`);
      lines.push('');
      lines.push(`- **Target Words**: ${ch.targetWordCount.toLocaleString()} words`);
      lines.push(`- **Purpose**: ${ch.purpose}`);
      lines.push(`- **Assigned Keywords**: ${ch.assignedKeywords.join(', ') || 'N/A'}`);
      lines.push('');
      lines.push(`#### Sections:`);

      ch.sections.forEach((sec) => {
        lines.push(`- **${sec.title}** (${sec.targetWordCount} words)`);
        lines.push(`  - *Summary*: ${sec.summary}`);
        if (sec.keyPoints && sec.keyPoints.length > 0) {
          lines.push(`  - *Key Topics*:`);
          sec.keyPoints.forEach((kp) => lines.push(`    - ${kp}`));
        }
      });
      lines.push('');
    });

    lines.push('---');
    lines.push('');
    lines.push('## Keyword Coverage Map');
    Object.entries(blueprint.keywordCoverage).forEach(([kw, chs]) => {
      lines.push(`- **${kw}**: Covered in ${chs.join('; ')}`);
    });

    return lines.join('\n');
  }
}
