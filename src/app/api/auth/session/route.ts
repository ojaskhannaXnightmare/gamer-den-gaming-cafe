import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Global mock users store reference
declare global {
  var mockUsersStore: Record<string, { id: string; username: string; password: string; name: string; email?: string; phone?: string; points: number; totalSpent: number; createdAt: Date }> | undefined;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    // Check mock users store
    if (global.mockUsersStore) {
      const mockUser = Object.values(global.mockUsersStore).find(u => u.id === userId);
      if (mockUser) {
        return NextResponse.json({
          user: {
            id: mockUser.id,
            username: mockUser.username,
            name: mockUser.name,
            email: mockUser.email,
            phone: mockUser.phone,
            points: mockUser.points,
            totalSpent: mockUser.totalSpent,
            createdAt: mockUser.createdAt.toISOString(),
          }
        });
      }
    }

    // User not found
    return NextResponse.json({ user: null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
