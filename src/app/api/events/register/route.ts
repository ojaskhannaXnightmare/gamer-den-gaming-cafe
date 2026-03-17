import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    if (!eventId || !playerName || !playerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get event details
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
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
      return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
    }

    // Create event registration
    const registration = await db.$transaction(async (tx) => {
      // Increment player count
      const updatedEvent = await tx.event.update({
        where: { id: eventId },
        data: { currentPlayers: { increment: 1 } },
      });

      // Create registration record
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

    // Get event with registration count
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}
