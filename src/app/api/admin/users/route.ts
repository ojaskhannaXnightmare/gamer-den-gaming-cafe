import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function checkAdmin(request: NextRequest) {
  const sessionId = request.cookies.get('admin_session')?.value;
  return !!sessionId;
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use Prisma client instead of raw query for better compatibility
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        name: true,
        createdAt: true,
        totalSpent: true,
        isAdmin: true,
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const usersWithBookings = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      name: user.name,
      createdAt: user.createdAt,
      totalSpent: user.totalSpent,
      isAdmin: user.isAdmin,
      bookingCount: user._count.bookings
    }));

    return NextResponse.json({ users: usersWithBookings });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
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
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Delete user's bookings first
    await db.booking.deleteMany({ where: { userId: id } });
    
    // Delete the user
    await db.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
