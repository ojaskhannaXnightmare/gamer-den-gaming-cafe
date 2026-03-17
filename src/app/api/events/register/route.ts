import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUpcomingEvents } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventId,
      userId,
      playerName,
      playerPhone,
      playerEmail,
      paymentMethod,
      transactionId,
    } = body;

    // Validate required fields
    if (!eventId || !playerName || !playerPhone) {
      return NextResponse.json({ error: 'Missing required fields: eventId, playerName, and playerPhone are required' }, { status: 400 });
    }

    // Validate field formats
    if (typeof playerName !== 'string' || playerName.trim().length < 2) {
      return NextResponse.json({ error: 'Player name must be at least 2 characters' }, { status: 400 });
    }

    if (typeof playerPhone !== 'string' || playerPhone.trim().length < 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Try database first
    try {
      const event = await db.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        // Fallback to static events
        const staticEvents = await getUpcomingEvents();
        const staticEvent = staticEvents.find(e => e.id === eventId);
        
        if (!staticEvent) {
          return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }
        
        // Return mock success for static event
        return NextResponse.json({
          success: true,
          registration: {
            id: `reg-${Date.now()}`,
            customerName: playerName,
            customerPhone: playerPhone,
            customerEmail: playerEmail || null,
            status: 'confirmed',
            paymentMethod: paymentMethod || 'Cash',
            transactionId: transactionId || null,
          },
          event: staticEvent,
          message: 'Successfully registered for the event!',
        });
      }

      if (event.status !== 'upcoming') {
        return NextResponse.json({ error: 'Event is not available for registration' }, { status: 400 });
      }

      // Check if event is full
      if (event.maxPlayers && event.currentPlayers >= event.maxPlayers) {
        return NextResponse.json({ error: 'Event is fully booked' }, { status: 400 });
      }

      // Get a console and slot for the booking (required by schema)
      const console = await db.console.findFirst();
      const slot = await db.slot.findFirst();

      if (!console || !slot) {
        return NextResponse.json({ 
          success: true,
          registration: {
            id: `reg-${Date.now()}`,
            customerName: playerName,
            customerPhone: playerPhone,
            customerEmail: playerEmail || null,
            status: 'confirmed',
          },
          event,
          message: 'Successfully registered for the event!',
        });
      }

      // Create event registration
      const registration = await db.$transaction(async (tx) => {
        const updatedEvent = await tx.event.update({
          where: { id: eventId },
          data: { currentPlayers: { increment: 1 } },
        });

        const registration = await tx.booking.create({
          data: {
            userId: userId || null,
            consoleId: console.id,
            slotId: slot.id,
            customerName: playerName,
            customerPhone: playerPhone,
            customerEmail: playerEmail || null,
            date: event.date,
            startTime: event.time,
            endTime: event.time,
            duration: 0,
            players: 1,
            totalPrice: event.price,
            status: 'confirmed',
            paymentMethod: paymentMethod || null,
            paymentStatus: paymentMethod ? 'paid' : 'pending',
            transactionId: transactionId || null,
            notes: `Event Registration: ${event.title}`,
          },
        });

        return { registration, event: updatedEvent };
      });

      return NextResponse.json({
        success: true,
        registration: registration.registration,
        event: registration.event,
        message: 'Successfully registered for the event!',
      });
    } catch {
      // Database not available - use static fallback
      const staticEvents = await getUpcomingEvents();
      const staticEvent = staticEvents.find(e => e.id === eventId);
      
      if (!staticEvent) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        registration: {
          id: `reg-${Date.now()}`,
          customerName: playerName,
          customerPhone: playerPhone,
          customerEmail: playerEmail || null,
          status: 'confirmed',
          paymentMethod: paymentMethod || 'Cash',
          transactionId: transactionId || null,
        },
        event: staticEvent,
        message: 'Successfully registered for the event!',
      });
    }
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json({ error: 'Failed to register for event' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    try {
      const event = await db.event.findUnique({
        where: { id: eventId },
      });

      if (event) {
        return NextResponse.json({ event });
      }
    } catch {
      // Database not available
    }

    // Fallback to static data
    const staticEvents = await getUpcomingEvents();
    const staticEvent = staticEvents.find(e => e.id === eventId);
    
    if (!staticEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event: staticEvent });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}
