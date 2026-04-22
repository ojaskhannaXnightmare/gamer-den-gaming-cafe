import { NextRequest, NextResponse } from 'next/server';

// Static events for admin panel
const staticEvents = [
  {
    id: 'event-1',
    title: 'Tekken 8 Championship',
    slug: 'tekken-championship',
    description: 'Compete for the title in our biggest Tekken tournament yet! Cash prizes for top 3 players.',
    gameName: 'Tekken 8',
    date: '2026-04-15',
    time: '16:00',
    endDate: null,
    prize: '₹10,000',
    maxPlayers: 32,
    currentPlayers: 12,
    price: 200,
    status: 'upcoming',
    image: null,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'event-2',
    title: 'FIFA Friday League',
    slug: 'fifa-league',
    description: 'Weekly FIFA tournament with gaming hour prizes!',
    gameName: 'EA Sports FC 25',
    date: '2026-04-18',
    time: '19:00',
    endDate: null,
    prize: 'Free Gaming Hours',
    maxPlayers: 16,
    currentPlayers: 8,
    price: 100,
    status: 'upcoming',
    image: null,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'event-3',
    title: 'VR Gaming Night',
    slug: 'vr-night',
    description: 'Experience VR with friends in our special night event!',
    gameName: 'Various VR Games',
    date: '2026-04-20',
    time: '20:00',
    endDate: null,
    prize: 'Special Discounts',
    maxPlayers: 20,
    currentPlayers: 5,
    price: 300,
    status: 'upcoming',
    image: null,
    createdAt: new Date('2024-01-01'),
  },
];

// Global store for runtime events
declare global {
  var adminEventsStore: typeof staticEvents | undefined;
}

function getEventsStore() {
  if (!global.adminEventsStore) {
    global.adminEventsStore = [...staticEvents];
  }
  return global.adminEventsStore;
}

function checkAdmin(request: NextRequest) {
  const sessionId = request.cookies.get('admin_session')?.value;
  return !!sessionId;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const events = getEventsStore();
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ events: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, slug, description, gameName, date, time, endDate, prize, maxPlayers, price, status, image } = data;

    // Validate required fields
    if (!title || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields: title, date, and time are required' }, { status: 400 });
    }

    const events = getEventsStore();
    const eventSlug = slug || generateSlug(title);

    const newEvent = {
      id: `event-${Date.now()}`,
      title,
      slug: eventSlug,
      description: description || null,
      gameName: gameName || null,
      date,
      time,
      endDate: endDate || null,
      prize: prize || null,
      maxPlayers: maxPlayers ? parseInt(maxPlayers) : null,
      currentPlayers: 0,
      price: parseFloat(price) || 0,
      status: status || 'upcoming',
      image: image || null,
      createdAt: new Date(),
    };

    events.push(newEvent);

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const events = getEventsStore();
    const eventIndex = events.findIndex(e => e.id === id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    events[eventIndex] = {
      ...events[eventIndex],
      ...updateData,
      maxPlayers: updateData.maxPlayers ? parseInt(updateData.maxPlayers) : events[eventIndex].maxPlayers,
      price: updateData.price ? parseFloat(updateData.price) : events[eventIndex].price,
    };

    return NextResponse.json({ success: true, event: events[eventIndex] });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const events = getEventsStore();
    const eventIndex = events.findIndex(e => e.id === id);

    if (eventIndex !== -1) {
      events.splice(eventIndex, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
