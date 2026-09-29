import { NextRequest, NextResponse } from 'next/server';
import { NicheService } from '@/services/NicheService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const niche = searchParams.get('niche') || 'Menopause Cookbook';
  const marketplace = searchParams.get('marketplace') || 'amazon.com';

  try {
    const dossier = NicheService.generateNicheDossier(niche, marketplace);
    return NextResponse.json({
      dossier,
    });
  } catch (error) {
    console.error('Error analyzing niche:', error);
    return NextResponse.json({ error: 'Failed to generate niche dossier' }, { status: 500 });
  }
}
