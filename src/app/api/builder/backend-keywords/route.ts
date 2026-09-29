import { NextRequest, NextResponse } from 'next/server';
import { KDPBuilderService } from '@/services/KDPBuilderService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title = 'High Protein Menopause Cookbook for Women Over 50',
      subtitle = 'Simple 30-Minute Low-Carb Meals to Optimize Hormones, Boost Metabolism, and Burn Visceral Fat',
      candidateKeywords = [
        'anti inflammatory meal prep diet',
        'hormone balance cookbook weight loss',
        'postmenopausal nutrition guide belly fat',
        'quick 15 minute healthy dinners seniors',
        'low carb high fiber recipes fatigue',
        'estrogen reset gut health cookbook',
        'perimenopause natural remedies food plan',
      ],
    } = body;

    const slots = KDPBuilderService.buildBackendKeywords(title, subtitle, candidateKeywords);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error generating backend keywords:', error);
    return NextResponse.json({ error: 'Failed to generate backend keywords' }, { status: 500 });
  }
}
