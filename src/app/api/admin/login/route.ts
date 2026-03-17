import { NextRequest, NextResponse } from 'next/server';

// Hardcoded admin credentials - simple and reliable for Vercel
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Simple hardcoded check - works on Vercel without database
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Success - set session cookie
    const response = NextResponse.json({ 
      success: true, 
      user: { 
        id: 'admin-session', 
        username: ADMIN_USERNAME 
      } 
    });

    response.cookies.set('admin_session', 'admin-session', {
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
