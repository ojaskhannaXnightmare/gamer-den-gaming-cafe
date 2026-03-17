import { NextRequest, NextResponse } from 'next/server';
import { createBooking } from '@/lib/data';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      consoleId,
      slotId,
      customerName,
      customerPhone,
      customerEmail,
      date,
      duration,
      players,
    } = body;
    
    // Get console and slot info
    const console = await db.console.findUnique({ where: { id: consoleId } });
    const slot = await db.slot.findUnique({ where: { id: slotId } });
    
    if (!console || !slot) {
      return NextResponse.json({ error: 'Invalid console or slot' }, { status: 400 });
    }
    
    const totalPrice = (console.pricePerHour / 60) * duration * players;
    
    // Calculate end time based on duration
    const [startHour] = slot.startTime.split(':').map(Number);
    const durationHours = duration / 60;
    const endHour = Math.floor(startHour + durationHours);
    const endMinutes = (duration % 60) > 0 ? 30 : 0;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    const booking = await createBooking({
      consoleId,
      slotId,
      customerName,
      customerPhone,
      customerEmail,
      date,
      startTime: slot.startTime,
      endTime,
      duration,
      players,
      totalPrice,
    });
    
    return NextResponse.json({ 
      success: true, 
      booking,
      message: 'Your Den Awaits...' 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    const whereClause = date ? { date } : {};
    
    const bookings = await db.booking.findMany({
      where: whereClause,
      include: {
        console: true,
        slot: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
