import { NextRequest, NextResponse } from 'next/server';
import { BlueprintService } from '@/services/BlueprintService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      niche = 'Cookbook',
      primaryKeyword = 'Menopause Cookbook',
      secondaryKeywords = [],
      targetAudience = 'Women Over 50',
      coreBenefit = 'Hormone balance and visceral fat reduction',
      title,
      subtitle,
      targetWordCount = 25000,
      trimSize = '6x9',
      paperType = 'white',
      structureType,
    } = body;

    const blueprint = BlueprintService.generateBlueprintFromResearch({
      niche,
      primaryKeyword,
      secondaryKeywords,
      targetAudience,
      coreBenefit,
      title,
      subtitle,
      targetWordCount,
      trimSize,
      paperType,
      structureType,
    });

    const totalWords = blueprint.chapters.reduce((acc, ch) => acc + ch.targetWordCount, 0);
    const kdpSpecs = BlueprintService.calculateKDPSpecs(totalWords, trimSize, paperType);

    return NextResponse.json({
      blueprint,
      kdpSpecs,
    });
  } catch (error) {
    console.error('Error generating blueprint:', error);
    return NextResponse.json({ error: 'Failed to generate blueprint' }, { status: 500 });
  }
}
