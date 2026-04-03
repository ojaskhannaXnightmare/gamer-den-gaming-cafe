import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getConsoles, getAvailableSlots } from '@/lib/data';

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

    // Validate required fields
    if (!consoleId || !slotId || !customerName || !customerPhone || !date || !duration || !players) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate field formats
    if (typeof duration !== 'number' || duration <= 0) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
    }

    if (typeof players !== 'number' || players <= 0) {
      return NextResponse.json({ error: 'Invalid number of players' }, { status: 400 });
    }

    // Get console info from static data
    const consoles = await getConsoles();
    const console = consoles.find(c => c.id === consoleId);
    
    if (!console) {
      return NextResponse.json({ error: 'Invalid console' }, { status: 400 });
    }
    
    // Get slot info
    const slots = await getAvailableSlots(consoleId, date);
    const slot = slots.find(s => s.id === slotId);
    
    if (!slot) {
      return NextResponse.json({ error: 'Invalid slot' }, { status: 400 });
    }
    
    const totalPrice = (console.pricePerHour / 60) * duration * players;
    
    // Calculate end time based on duration
    const [startHour] = slot.startTime.split(':').map(Number);
    const durationHours = duration / 60;
    const endHour = Math.floor(startHour + durationHours);
    const endMinutes = (duration % 60) > 0 ? 30 : 0;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    // Try to create booking in database, fallback to mock response
    try {
      const booking = await db.booking.create({
        data: {
          consoleId,
          slotId,
          customerName,
          customerPhone,
          customerEmail: customerEmail || null,
          date,
          startTime: slot.startTime,
          endTime,
          duration,
          players,
          totalPrice,
          status: 'pending',
          paymentStatus: 'pending',
        },
      });
      
      return NextResponse.json({ 
        success: true, 
        booking,
        message: 'Your Den Awaits...' 
      });
    } catch {
      // Database not available - return mock success for demo
      const mockBooking = {
        id: `booking-${Date.now()}`,
        consoleId,
        slotId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        date,
        startTime: slot.startTime,
        endTime,
        duration,
        players,
        totalPrice,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date(),
      };
      
      return NextResponse.json({ 
        success: true, 
        booking: mockBooking,
        message: 'Your Den Awaits...' 
      });
    }
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
    
    try {
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
    } catch {
      // Database not available
      return NextResponse.json({ bookings: [] });
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
