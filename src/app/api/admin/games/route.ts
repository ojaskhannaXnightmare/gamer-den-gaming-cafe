import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function checkAdmin(request: NextRequest) {
  const sessionId = request.cookies.get('admin_session')?.value;
  return !!sessionId;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const games = await db.game.findMany({
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
    });

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, slug, description, genre, consoleType, rating, isFeatured, isPopular, image } = data;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Missing required field: title is required' }, { status: 400 });
    }

    const gameSlug = slug || generateSlug(title);

    const game = await db.game.create({
      data: {
        title,
        slug: gameSlug,
        description: description || null,
        genre: genre || 'Action',
        consoleType: consoleType || 'Both',
        rating: rating ? parseFloat(rating) : null,
        isFeatured: isFeatured ?? false,
        isPopular: isPopular ?? false,
        image: image || null,
      },
    });

    return NextResponse.json({ success: true, game });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
    }

    const game = await db.game.update({
      where: { id },
      data: {
        ...updateData,
        rating: updateData.rating ? parseFloat(updateData.rating) : undefined,
      },
    });

    return NextResponse.json({ success: true, game });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
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
      return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
    }

    await db.game.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
