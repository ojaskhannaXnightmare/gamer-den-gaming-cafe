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
    const { username, password, email, phone } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
        { status: 400 }
      );
    }

    const mockUsers = getMockUsersStore();

    // Check if username already taken
    if (mockUsers[username]) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Create mock user
    const hashedPassword = hashPassword(password);
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      password: hashedPassword,
      name: username,
      email: email || undefined,
      phone: phone || undefined,
      points: 0,
      totalSpent: 0,
      createdAt: new Date(),
    };

    mockUsers[username] = newUser;

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session_user_id', newUser.id, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        points: newUser.points,
        totalSpent: newUser.totalSpent,
        createdAt: newUser.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
