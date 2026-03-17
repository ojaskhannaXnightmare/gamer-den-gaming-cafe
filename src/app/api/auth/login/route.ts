import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from '@/lib/db';

// Simple password hashing
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Mock users store for Vercel serverless (in-memory, per function invocation)
const mockUsers: Record<string, { id: string; username: string; password: string; name: string; email?: string; phone?: string; points: number; totalSpent: number; createdAt: Date }> = {
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

    // Try database first
    try {
      const user = await db.user.findUnique({
        where: { username },
      });

      if (user && user.password === hashedPassword) {
        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set('session_user_id', user.id, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            phone: user.phone,
            points: user.points,
            totalSpent: user.totalSpent,
            createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
          },
        });
      }
    } catch {
      console.log('Database unavailable for login, checking mock users');
    }

    // Database unavailable or user not found in DB - check mock users
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
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
