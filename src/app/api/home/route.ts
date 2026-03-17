import { NextResponse } from 'next/server';
import { getConsoles, getFeaturedGames, getAnnouncements, getUpcomingEvents, getPricingPackages } from '@/lib/data';

export async function GET() {
  try {
    const [consoles, games, announcements, events, packages] = await Promise.all([
      getConsoles(),
      getFeaturedGames(),
      getAnnouncements(),
      getUpcomingEvents(),
      getPricingPackages(),
    ]);
    
    return NextResponse.json({
      consoles,
      games,
      announcements,
      events,
      packages,
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
