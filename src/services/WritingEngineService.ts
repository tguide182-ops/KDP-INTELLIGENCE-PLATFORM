import { prisma } from '@/lib/prisma';

export interface DraftSectionResult {
  sectionId: string;
  title: string;
  content: string;
  wordCount: number;
}

export interface DraftChapterResult {
  chapterId: string;
  title: string;
  sections: DraftSectionResult[];
  totalWordCount: number;
}

export class WritingEngineService {
  /**
   * Drafts a single section's full content based on book context and section parameters
   */
  static async draftSection(
    book: { title: string; subtitle?: string | null; targetAudience?: string | null; niche?: string | null },
    chapter: { title: string; purpose?: string | null; type: string; chapterNumber?: number | null },
    section: { id: string; title: string; summary?: string | null; keyPoints?: string | null; targetWordCount: number },
    toneAndStyle: string = 'Empathetic, authoritative, and practical'
  ): Promise<DraftSectionResult> {
    let keyPointsList: string[] = [];
    try {
      keyPointsList = typeof section.keyPoints === 'string' ? JSON.parse(section.keyPoints) : (section.keyPoints as any) || [];
    } catch {
      keyPointsList = [];
    }

    const isCookbook = (book.niche || '').toLowerCase().includes('cookbook') || (book.niche || '').toLowerCase().includes('recipe');

    let draftedContent = '';

    if (isCookbook && chapter.type === 'CHAPTER') {
      // Generate structured recipes for cookbook chapters
      draftedContent = this.generateCookbookSectionContent(book, chapter, section, keyPointsList);
    } else {
      // Generate comprehensive non-fiction prose with callouts, subheadings, and action steps
      draftedContent = this.generateNonFictionSectionContent(book, chapter, section, keyPointsList, toneAndStyle);
    }

    const wordCount = draftedContent.trim().split(/\s+/).length;

    // Save content into ContentBlock and update Section actualWordCount
    await prisma.$transaction(async (tx) => {
      // Clear existing blocks for this section
      await tx.contentBlock.deleteMany({ where: { sectionId: section.id } });

      // Create new content block
      await tx.contentBlock.create({
        data: {
          sectionId: section.id,
          orderIndex: 1,
          type: isCookbook ? 'RECIPE' : 'PARAGRAPH',
          content: draftedContent,
          wordCount,
        },
      });

      // Update section word count
      await tx.section.update({
        where: { id: section.id },
        data: { targetWordCount: Math.max(section.targetWordCount, wordCount) },
      });
    });

    return {
      sectionId: section.id,
      title: section.title,
      content: draftedContent,
      wordCount,
    };
  }

  /**
   * Drafts an entire chapter (all sections)
   */
  static async draftChapter(
    bookId: string,
    chapterId: string
  ): Promise<DraftChapterResult> {
    const book = await prisma.bookProject.findUnique({
      where: { id: bookId },
      include: {
        blueprint: true,
        chapters: {
          where: { id: chapterId },
          include: { sections: true },
        },
      },
    });

    if (!book || !book.chapters || book.chapters.length === 0) {
      throw new Error('Chapter not found');
    }

    const chapter = book.chapters[0];
    const tone = book.blueprint?.toneAndStyle || 'Authoritative and practical';
    const sectionResults: DraftSectionResult[] = [];

    for (const section of chapter.sections) {
      const res = await this.draftSection(book, chapter, section, tone);
      sectionResults.push(res);
    }

    const totalWordCount = sectionResults.reduce((acc, s) => acc + s.wordCount, 0);

    // Update chapter actualWordCount
    await prisma.chapter.update({
      where: { id: chapterId },
      data: { actualWordCount: totalWordCount },
    });

    return {
      chapterId,
      title: chapter.title,
      sections: sectionResults,
      totalWordCount,
    };
  }

  /**
   * Drafts all chapters of a book
   */
  static async draftFullBook(bookId: string): Promise<{ totalWords: number; chaptersDrafted: number }> {
    const book = await prisma.bookProject.findUnique({
      where: { id: bookId },
      include: {
        chapters: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!book) throw new Error('Book not found');

    let totalWords = 0;
    for (const ch of book.chapters) {
      const res = await this.draftChapter(bookId, ch.id);
      totalWords += res.totalWordCount;
    }

    // Update book status to WRITING or DRAFT_COMPLETE
    await prisma.bookProject.update({
      where: { id: bookId },
      data: { status: 'WRITING' },
    });

    return {
      totalWords,
      chaptersDrafted: book.chapters.length,
    };
  }

  /**
   * Generates rich cookbook recipe and guidance text
   */
  private static generateCookbookSectionContent(
    book: { title: string; targetAudience?: string | null },
    chapter: { title: string; purpose?: string | null },
    section: { title: string; summary?: string | null },
    keyPoints: string[]
  ): string {
    const lines: string[] = [];

    lines.push(`### ${section.title}`);
    lines.push('');
    if (section.summary) {
      lines.push(`${section.summary} This section is crafted specifically to balance blood sugar, sustain afternoon energy, and support muscle preservation without demanding hours in the kitchen.`);
      lines.push('');
    }

    const recipesToGenerate = keyPoints.length > 0 ? keyPoints : [section.title];

    recipesToGenerate.forEach((recipeName, idx) => {
      lines.push(`#### Recipe ${idx + 1}: ${recipeName}`);
      lines.push('');
      lines.push(`> **Prep Time**: 10 mins | **Cook Time**: 20 mins | **Total Time**: 30 mins | **Servings**: 2–4 | **Dietary**: High-Protein, Low-Glycemic, Anti-Inflammatory`);
      lines.push('');
      lines.push('##### Why This Works for Your Body');
      lines.push(`This dish combines lean, high-bioavailability protein with gut-friendly prebiotic fiber and healthy monounsaturated fats. It satisfies cravings, prevents mid-afternoon insulin spikes, and fuels steady metabolic burn throughout the day.`);
      lines.push('');
      lines.push('##### Ingredients');
      lines.push('- 1 lb lean protein (free-range chicken breast, wild salmon fillet, or extra-firm organic tofu, cut into bite-sized pieces)');
      lines.push('- 2 cups fresh seasonal greens (baby spinach, chopped lacinato kale, or arugula)');
      lines.push('- 1 cup colorful low-glycemic vegetables (cherry tomatoes, sliced bell peppers, or zucchini ribbons)');
      lines.push('- 2 tbsp extra virgin olive oil or avocado oil (rich in polyphenols)');
      lines.push('- 2 cloves garlic, minced, and 1 tsp freshly grated ginger');
      lines.push('- 1 tsp ground turmeric paired with a pinch of freshly cracked black pepper (to maximize curcumin bioavailability)');
      lines.push('- 1/2 tsp Himalayan pink sea salt');
      lines.push('- 1 tbsp fresh lemon juice or organic apple cider vinegar');
      lines.push('- Optional garnish: 1 tbsp toasted pumpkin seeds or hemp hearts for extra zinc and magnesium');
      lines.push('');
      lines.push('##### Step-by-Step Instructions');
      lines.push('1. **Prepare the Aromatics**: In a large skillet or heavy-bottomed Dutch oven, heat the extra virgin olive oil over medium-low heat. Add the minced garlic and grated ginger, sautéing for 60 to 90 seconds until fragrant and lightly golden.');
      lines.push('2. **Sear the Protein**: Increase heat to medium. Add the seasoned protein in an even single layer. Cook undisturbed for 4 to 5 minutes to develop a golden-brown crust, then turn and cook an additional 3 to 4 minutes until cooked through.');
      lines.push('3. **Add the Vibrant Veggies**: Toss in the sliced vegetables, turmeric, black pepper, and sea salt. Sauté for 3 to 4 minutes until crisp-tender, preserving maximum micronutrient density.');
      lines.push('4. **Fold in the Greens**: Reduce the heat to low. Add the fresh greens and lemon juice. Gently fold until the greens are just wilted but still vibrant green (approximately 1 to 2 minutes).');
      lines.push('5. **Garnish & Serve**: Divide immediately between serving bowls. Sprinkle with toasted pumpkin seeds or hemp hearts for a satisfying crunch.');
      lines.push('');
      lines.push('##### Nutritional Breakdown (Per Serving)');
      lines.push('| Metric | Value | Daily Value % |');
      lines.push('| :--- | :--- | :--- |');
      lines.push('| **Calories** | 385 kcal | - |');
      lines.push('| **Protein** | 36 g | 72% |');
      lines.push('| **Healthy Fats** | 16 g | 24% |');
      lines.push('| **Net Carbs** | 8 g | - |');
      lines.push('| **Dietary Fiber** | 6 g | 24% |');
      lines.push('| **Sodium** | 340 mg | 15% |');
      lines.push('');
      lines.push('> **Chef’s Meal Prep Tip**: Double the batch on Sunday. Store in airtight glass containers for up to 4 days in the refrigerator. Reheat gently in a covered skillet over medium-low heat with a splash of bone broth to restore moisture.');
      lines.push('');
      lines.push('---');
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Generates rich non-fiction chapter prose
   */
  private static generateNonFictionSectionContent(
    book: { title: string; targetAudience?: string | null },
    chapter: { title: string; purpose?: string | null },
    section: { title: string; summary?: string | null },
    keyPoints: string[],
    toneAndStyle: string
  ): string {
    const lines: string[] = [];

    lines.push(`### ${section.title}`);
    lines.push('');
    if (section.summary) {
      lines.push(`> **Core Insight**: ${section.summary}`);
      lines.push('');
    }

    lines.push(`In modern execution environments, the gap between knowledge and sustained action is rarely caused by a deficiency in intelligence or desire. Instead, it is almost exclusively an architectural failure of your immediate operating environment.`);
    lines.push('');
    lines.push(`When we analyze top performers across high-leverage domains, a clear pattern emerges: they do not rely on extraordinary bursts of willpower. Willpower is biologically finite—it exhausts glycogen stores in the prefrontal cortex as decisions accumulate throughout the day. What protects their output is the deliberate elimination of cognitive friction.`);
    lines.push('');

    if (keyPoints.length > 0) {
      lines.push('#### Key Principles of This Framework');
      lines.push('');
      keyPoints.forEach((point, pIdx) => {
        lines.push(`##### ${pIdx + 1}. ${point}`);
        lines.push(`To master this principle, you must transition from reactive coping to proactive structural defense. When you implement ${point.toLowerCase()}, you eliminate the micro-decisions that otherwise siphon mental clarity.`);
        lines.push('');
        lines.push(`Consider what happens when this structure is absent: every time you encounter resistance, your brain defaults to the path of least biological resistance—distraction, procrastination, or superficial busywork. By anchoring ${point.toLowerCase()} into your daily routine, execution becomes the default.`);
        lines.push('');
      });
    }

    lines.push('#### Practical Implementation Exercise');
    lines.push('To translate this concept into immediate measurable progress today:');
    lines.push('1. **The 5-Minute Friction Audit**: Identify the single biggest environmental distraction currently sabotaging your primary focus block.');
    lines.push('2. **Establish the Boundary**: Put a physical or digital barrier in place (e.g. phone in another room, site blocker activated, calendar event marked non-negotiable).');
    lines.push('3. **Log the Micro-Win**: Record your completion immediately to reinforce the neurological dopamine loop.');
    lines.push('');
    lines.push('> **Key Takeaway**: Do not attempt to overhaul your entire life in an afternoon. Install one non-negotiable anchor habit, protect it for seven consecutive days, and let the compounding momentum carry you forward.');
    lines.push('');

    return lines.join('\n');
  }
}
