import { NextRequest, NextResponse } from 'next/server';
import { ReverseASINService } from '@/services/ReverseASINService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { asins = [], marketplace = 'amazon.com' } = body;

    if (!Array.isArray(asins) || asins.length === 0) {
      return NextResponse.json({ error: 'ASINs array is required' }, { status: 400 });
    }

    const books = ReverseASINService.compareBooks(asins, marketplace);
    return NextResponse.json({ books });
  } catch (error) {
    console.error('Error comparing ASINs:', error);
    return NextResponse.json({ error: 'Failed to compare ASINs' }, { status: 500 });
  }
}
