import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// Hardcoded admin credentials - simple and reliable
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Simple hardcoded check
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Ensure admin user exists in database
    const hashedPassword = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest('hex');
    
    let adminUser = await db.user.findUnique({
      where: { username: ADMIN_USERNAME }
    });

    if (!adminUser) {
      try {
        adminUser = await db.user.create({
          data: {
            username: ADMIN_USERNAME,
            password: hashedPassword,
            email: 'admin@gamersden.com',
            name: 'Admin',
            isAdmin: true,
          }
        });

      } catch {
        // Admin user creation failed, continue with session-only auth
      }
    }

    const response = NextResponse.json({ 
      success: true, 
      user: { 
        id: adminUser?.id || 'admin-session', 
        username: ADMIN_USERNAME 
      } 
    });

    response.cookies.set('admin_session', adminUser?.id || 'admin-session', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
