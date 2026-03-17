import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const consoleId = searchParams.get('consoleId');
    const date = searchParams.get('date');
    
    if (!consoleId || !date) {
      return NextResponse.json({ error: 'Missing consoleId or date' }, { status: 400 });
    }
    
    const slots = await getAvailableSlots(consoleId, date);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}
