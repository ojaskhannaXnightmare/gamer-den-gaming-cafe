import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Simple password hashing
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Global mock users store for Vercel serverless
declare global {
  var mockUsersStore: Record<string, { id: string; username: string; password: string; name: string; email?: string; phone?: string; points: number; totalSpent: number; createdAt: Date }> | undefined;
}

// Get or initialize mock users store
function getMockUsersStore() {
  if (!global.mockUsersStore) {
    global.mockUsersStore = {
      'admin': {
        id: 'admin-user',
        username: 'admin',
        password: hashPassword('admin123'),
        name: 'Admin',
        email: 'admin@gamersden.com',
        points: 0,
        totalSpent: 0,
        createdAt: new Date(),
      }
    };
  }
  return global.mockUsersStore;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);
    const mockUsers = getMockUsersStore();

    // Check mock users (no database needed)
    const mockUser = mockUsers[username];
    if (mockUser && mockUser.password === hashedPassword) {
      const cookieStore = await cookies();
      cookieStore.set('session_user_id', mockUser.id, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({
        success: true,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          name: mockUser.name,
          email: mockUser.email,
          phone: mockUser.phone,
          points: mockUser.points,
          totalSpent: mockUser.totalSpent,
          createdAt: mockUser.createdAt.toISOString(),
        },
      });
    }

    // Invalid credentials
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
