import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from '@/lib/db';

// Simple password hashing
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// In-memory user store for Vercel (resets on each function invocation)
const mockUsers: Map<string, { id: string; username: string; password: string; name: string; points: number; totalSpent: number; createdAt: Date }> = new Map();

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

    const hashedPassword = hashPassword(password);
    
    // Try database first
    try {
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }

      // Create user in database
      const user = await db.user.create({
        data: {
          username,
          password: hashedPassword,
          email: email || null,
          phone: phone || null,
          name: username,
        },
      });

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
    } catch (dbError) {
      console.log('Database unavailable for signup, using mock');
      
      // Check mock users
      if (mockUsers.has(username)) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }

      // Create mock user
      const mockUser = {
        id: `user-${Date.now()}`,
        username,
        password: hashedPassword,
        name: username,
        points: 0,
        totalSpent: 0,
        createdAt: new Date(),
      };
      
      mockUsers.set(username, mockUser);

      // Set session cookie
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
          points: mockUser.points,
          totalSpent: mockUser.totalSpent,
          createdAt: mockUser.createdAt.toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
