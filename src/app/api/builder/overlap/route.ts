import { NextRequest, NextResponse } from 'next/server';
import { KDPBuilderService } from '@/services/KDPBuilderService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title = '', subtitle = '', backendSlots = [] } = body;

    const report = KDPBuilderService.checkOverlapAndCompliance(title, subtitle, backendSlots);
    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error checking overlap & compliance:', error);
    return NextResponse.json({ error: 'Failed to check overlap' }, { status: 500 });
  }
}
