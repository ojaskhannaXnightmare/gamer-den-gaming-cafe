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

    const pricing = await db.pricingPackage.findMany({
      orderBy: { price: 'asc' },
    });

    return NextResponse.json({ pricing });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, consoleType, price, duration, discount, includes, isActive } = data;

    // Validate required fields
    if (!name || !consoleType) {
      return NextResponse.json({ error: 'Missing required fields: name and consoleType are required' }, { status: 400 });
    }

    const pricing = await db.pricingPackage.create({
      data: {
        name,
        description: description || null,
        consoleType,
        price: parseFloat(price) || 0,
        duration: parseInt(duration) || 60,
        discount: discount ? parseFloat(discount) : null,
        includes: includes || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, pricing });
  } catch (error) {
    console.error('Error creating pricing:', error);
    return NextResponse.json({ error: 'Failed to create pricing' }, { status: 500 });
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
      return NextResponse.json({ error: 'Pricing ID required' }, { status: 400 });
    }

    const pricing = await db.pricingPackage.update({
      where: { id },
      data: {
        ...updateData,
        price: updateData.price ? parseFloat(updateData.price) : undefined,
        duration: updateData.duration ? parseInt(updateData.duration) : undefined,
        discount: updateData.discount ? parseFloat(updateData.discount) : undefined,
      },
    });

    return NextResponse.json({ success: true, pricing });
  } catch (error) {
    console.error('Error updating pricing:', error);
    return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 });
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
      return NextResponse.json({ error: 'Pricing ID required' }, { status: 400 });
    }

    await db.pricingPackage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pricing:', error);
    return NextResponse.json({ error: 'Failed to delete pricing' }, { status: 500 });
  }
}
