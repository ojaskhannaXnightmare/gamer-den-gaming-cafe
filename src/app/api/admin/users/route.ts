import { NextRequest, NextResponse } from 'next/server';

// Static users for admin panel
const staticUsers = [
  { id: 'user-1', username: 'gamer_pro', email: 'gamer@email.com', phone: '9876543210', name: 'Rahul Sharma', createdAt: new Date('2024-01-15'), totalSpent: 2500, isAdmin: false, bookingCount: 12 },
  { id: 'user-2', username: 'player_one', email: 'player@email.com', phone: '9876543211', name: 'Priya Patel', createdAt: new Date('2024-02-01'), totalSpent: 1800, isAdmin: false, bookingCount: 8 },
  { id: 'user-3', username: 'vr_enthusiast', email: 'vr@email.com', phone: '9876543212', name: 'Amit Kumar', createdAt: new Date('2024-02-15'), totalSpent: 3200, isAdmin: false, bookingCount: 15 },
  { id: 'user-4', username: 'casual_gamer', email: 'casual@email.com', phone: '9876543213', name: 'Sneha Gupta', createdAt: new Date('2024-03-01'), totalSpent: 900, isAdmin: false, bookingCount: 5 },
  { id: 'user-5', username: 'tekken_master', email: 'tekken@email.com', phone: '9876543214', name: 'Vikram Singh', createdAt: new Date('2024-03-10'), totalSpent: 4500, isAdmin: false, bookingCount: 22 },
];

// Global store for runtime users
declare global {
  var adminUsersStore: typeof staticUsers | undefined;
}

function getUsersStore() {
  if (!global.adminUsersStore) {
    global.adminUsersStore = [...staticUsers];
  }
  return global.adminUsersStore;
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

    const users = getUsersStore();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ users: [] });
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

    const users = getUsersStore();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex !== -1) {
      users.splice(userIndex, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
