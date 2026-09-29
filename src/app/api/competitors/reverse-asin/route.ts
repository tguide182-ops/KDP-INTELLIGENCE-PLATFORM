import { NextRequest, NextResponse } from 'next/server';
import { ReverseASINService } from '@/services/ReverseASINService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const asin = searchParams.get('asin') || 'B0E9L82ZZ1';
  const marketplace = searchParams.get('marketplace') || 'amazon.com';

  try {
    const data = ReverseASINService.lookupASIN(asin, marketplace);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error looking up ASIN:', error);
    return NextResponse.json({ error: 'Failed to reverse engineer ASIN' }, { status: 500 });
  }
}
