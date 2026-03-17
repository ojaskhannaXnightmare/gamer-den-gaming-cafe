import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function checkAdmin(request: NextRequest) {
  const sessionId = request.cookies.get('admin_session')?.value;
  return !!sessionId;
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const consoles = await db.console.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ consoles });
  } catch (error) {
    console.error('Error fetching consoles:', error);
    return NextResponse.json({ error: 'Failed to fetch consoles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, slug, description, pricePerHour, features, image, isActive } = data;

    const consoleSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    const console = await db.console.create({
      data: {
        name,
        slug: consoleSlug,
        description: description || null,
        pricePerHour: parseFloat(pricePerHour) || 0,
        features: features || null,
        image: image || null,
        isActive: isActive ?? true,
      },
    });

    // Create default slots for this console (9 AM to 11 PM)
    for (let hour = 9; hour < 23; hour++) {
      await db.slot.create({
        data: {
          consoleId: console.id,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          isAvailable: true,
        },
      });
    }

    return NextResponse.json({ success: true, console });
  } catch (error) {
    console.error('Error creating console:', error);
    return NextResponse.json({ error: 'Failed to create console' }, { status: 500 });
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
      return NextResponse.json({ error: 'Console ID required' }, { status: 400 });
    }

    const console = await db.console.update({
      where: { id },
      data: {
        ...updateData,
        pricePerHour: updateData.pricePerHour ? parseFloat(updateData.pricePerHour) : undefined,
      },
    });

    return NextResponse.json({ success: true, console });
  } catch (error) {
    console.error('Error updating console:', error);
    return NextResponse.json({ error: 'Failed to update console' }, { status: 500 });
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
      return NextResponse.json({ error: 'Console ID required' }, { status: 400 });
    }

    // Delete associated slots first
    await db.slot.deleteMany({ where: { consoleId: id } });
    
    // Delete the console
    await db.console.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting console:', error);
    return NextResponse.json({ error: 'Failed to delete console' }, { status: 500 });
  }
}
