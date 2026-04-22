import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Static user bookings for demo
const staticUserBookings = [
  {
    id: 'ub-1',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:00',
    duration: 120,
    players: 2,
    totalPrice: 300,
    status: 'confirmed',
    paymentStatus: 'paid',
    console: { name: 'PlayStation 5' },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ub-2',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '19:00',
    duration: 60,
    players: 1,
    totalPrice: 200,
    status: 'pending',
    paymentStatus: 'pending',
    console: { name: 'VR Gaming' },
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ bookings: [] });
    }

    // Return static bookings for demo (Vercel-compatible)
    return NextResponse.json({ bookings: staticUserBookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json({ bookings: [] });
  }
}
