import { NextRequest, NextResponse } from 'next/server';

// Static mock bookings for admin panel demo
const staticBookings = [
  {
    id: 'booking-1',
    consoleId: 'ps5',
    slotId: 'slot-10',
    customerName: 'Rahul Sharma',
    customerPhone: '9876543210',
    customerEmail: 'rahul@email.com',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    duration: 120,
    players: 2,
    totalPrice: 600,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 86400000),
    console: { id: 'ps5', name: 'PlayStation 5' },
    slot: { id: 'slot-10', startTime: '10:00', endTime: '11:00' },
    user: null,
  },
  {
    id: 'booking-2',
    consoleId: 'vr',
    slotId: 'slot-14',
    customerName: 'Priya Patel',
    customerPhone: '9876543211',
    customerEmail: 'priya@email.com',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:00',
    duration: 60,
    players: 1,
    totalPrice: 200,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date(Date.now() - 43200000),
    console: { id: 'vr', name: 'VR Gaming' },
    slot: { id: 'slot-14', startTime: '14:00', endTime: '15:00' },
    user: null,
  },
  {
    id: 'booking-3',
    consoleId: 'projector',
    slotId: 'slot-18',
    customerName: 'Amit Kumar',
    customerPhone: '9876543212',
    customerEmail: 'amit@email.com',
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '21:00',
    duration: 180,
    players: 4,
    totalPrice: 2400,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 172800000),
    console: { id: 'projector', name: 'Projector Gaming' },
    slot: { id: 'slot-18', startTime: '18:00', endTime: '19:00' },
    user: null,
  },
  {
    id: 'booking-4',
    consoleId: 'ps4',
    slotId: 'slot-16',
    customerName: 'Sneha Gupta',
    customerPhone: '9876543213',
    customerEmail: 'sneha@email.com',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '18:00',
    duration: 120,
    players: 2,
    totalPrice: 320,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date(),
    console: { id: 'ps4', name: 'PlayStation 4 Pro' },
    slot: { id: 'slot-16', startTime: '16:00', endTime: '17:00' },
    user: null,
  },
];

// Global store for runtime bookings (for demo on Vercel)
declare global {
  var adminBookingsStore: typeof staticBookings | undefined;
}

function getBookingsStore() {
  if (!global.adminBookingsStore) {
    global.adminBookingsStore = [...staticBookings];
  }
  return global.adminBookingsStore;
}

function checkAdmin(request: NextRequest) {
  const sessionId = request.cookies.get('admin_session')?.value;
  return !!sessionId;
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let bookings = getBookingsStore();

    // Filter by date if provided
    if (date) {
      bookings = bookings.filter(b => b.date === date);
    }

    // Filter by status if provided
    if (status) {
      bookings = bookings.filter(b => b.status === status);
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ bookings: [] });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, status, paymentStatus } = data;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const bookings = getBookingsStore();
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex === -1) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update the booking
    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      status: status || bookings[bookingIndex].status,
      paymentStatus: paymentStatus || bookings[bookingIndex].paymentStatus,
    };

    return NextResponse.json({ success: true, booking: bookings[bookingIndex] });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
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
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const bookings = getBookingsStore();
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex !== -1) {
      bookings.splice(bookingIndex, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
