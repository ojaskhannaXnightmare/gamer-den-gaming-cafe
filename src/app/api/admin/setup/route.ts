import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as crypto from 'crypto';

// This endpoint ensures admin user exists on first run
export async function GET(request: NextRequest) {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'gamerden_432';
    const adminPassword = process.env.ADMIN_PASSWORD || 'gamer432';
    const hashedPassword = crypto.createHash('sha256').update(adminPassword).digest('hex');

    // Check if admin exists
    let admin = await db.user.findUnique({
      where: { username: adminUsername }
    });

    if (!admin) {
      // Create admin user
      admin = await db.user.create({
        data: {
          username: adminUsername,
          password: hashedPassword,
          email: 'admin@gamersden.com',
          name: 'Admin',
          isAdmin: true,
        }
      });
      console.log('✅ Admin user created via setup endpoint');
    } else if (!admin.isAdmin || admin.password !== hashedPassword) {
      // Update admin to ensure correct permissions and password
      admin = await db.user.update({
        where: { id: admin.id },
        data: {
          isAdmin: true,
          password: hashedPassword,
        }
      });
      console.log('✅ Admin user updated via setup endpoint');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user ready',
      username: adminUsername 
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
