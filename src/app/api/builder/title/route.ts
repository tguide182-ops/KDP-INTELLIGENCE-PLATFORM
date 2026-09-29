import { NextRequest, NextResponse } from 'next/server';
import { KDPBuilderService } from '@/services/KDPBuilderService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      primaryKeyword = 'GLP-1 Cookbook',
      secondaryKeywords = ['high protein', 'weight loss'],
      audience = 'Women Over 50',
      benefit = 'Balance Hormones and Burn Belly Fat',
    } = body;

    const titleIdeas = KDPBuilderService.buildTitleIdeas(
      primaryKeyword,
      secondaryKeywords,
      audience,
      benefit
    );

    return NextResponse.json({ titleIdeas });
  } catch (error) {
    console.error('Error generating title ideas:', error);
    return NextResponse.json({ error: 'Failed to generate title ideas' }, { status: 500 });
  }
}
