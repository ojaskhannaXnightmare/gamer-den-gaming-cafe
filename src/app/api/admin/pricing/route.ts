import { NextRequest, NextResponse } from 'next/server';

// Static pricing for admin panel
const staticPricing = [
  { id: 'pkg-1', name: 'Quick Session', description: 'Perfect for quick gaming', consoleType: 'PS5', price: 150, duration: 60, discount: null, includes: JSON.stringify(['1 Hour Gaming', 'Any Game']), isActive: true, createdAt: new Date('2024-01-01') },
  { id: 'pkg-2', name: 'Gaming Marathon', description: 'Best value for extended play', consoleType: 'PS5', price: 400, duration: 180, discount: 10, includes: JSON.stringify(['3 Hours', 'Free Snacks', 'Drinks']), isActive: true, createdAt: new Date('2024-01-01') },
  { id: 'pkg-3', name: 'Party Pack', description: 'Perfect for groups', consoleType: 'Projector', price: 800, duration: 180, discount: 15, includes: JSON.stringify(['3 Hours Big Screen', 'Up to 4 Players', 'Snacks & Drinks']), isActive: true, createdAt: new Date('2024-01-01') },
  { id: 'pkg-4', name: 'VR Experience', description: 'Immersive VR session', consoleType: 'VR', price: 200, duration: 60, discount: null, includes: JSON.stringify(['1 Hour VR', 'Multiple Games']), isActive: true, createdAt: new Date('2024-01-01') },
  { id: 'pkg-5', name: 'Student Special', description: 'Weekday discount for students', consoleType: 'PS4', price: 60, duration: 60, discount: 25, includes: JSON.stringify(['1 Hour', 'Valid ID Required', 'Weekdays Only']), isActive: true, createdAt: new Date('2024-01-01') },
];

// Global store for runtime pricing
declare global {
  var adminPricingStore: typeof staticPricing | undefined;
}

function getPricingStore() {
  if (!global.adminPricingStore) {
    global.adminPricingStore = [...staticPricing];
  }
  return global.adminPricingStore;
}

function checkAdmin(request: NextRequest) {
  const sessionId = request.cookies.get('admin_session')?.value;
  return !!sessionId;
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pricing = getPricingStore();
    return NextResponse.json({ pricing });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json({ pricing: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, consoleType, price, duration, discount, includes, isActive } = data;

    if (!name || !consoleType) {
      return NextResponse.json({ error: 'Missing required fields: name and consoleType are required' }, { status: 400 });
    }

    const pricing = getPricingStore();

    const newPricing = {
      id: `pkg-${Date.now()}`,
      name,
      description: description || null,
      consoleType,
      price: parseFloat(price) || 0,
      duration: parseInt(duration) || 60,
      discount: discount ? parseFloat(discount) : null,
      includes: includes || null,
      isActive: isActive ?? true,
      createdAt: new Date(),
    };

    pricing.push(newPricing);

    return NextResponse.json({ success: true, pricing: newPricing });
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

    const pricing = getPricingStore();
    const priceIndex = pricing.findIndex(p => p.id === id);

    if (priceIndex === -1) {
      return NextResponse.json({ error: 'Pricing not found' }, { status: 404 });
    }

    pricing[priceIndex] = {
      ...pricing[priceIndex],
      ...updateData,
      price: updateData.price ? parseFloat(updateData.price) : pricing[priceIndex].price,
      duration: updateData.duration ? parseInt(updateData.duration) : pricing[priceIndex].duration,
      discount: updateData.discount ? parseFloat(updateData.discount) : pricing[priceIndex].discount,
    };

    return NextResponse.json({ success: true, pricing: pricing[priceIndex] });
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

    const pricing = getPricingStore();
    const priceIndex = pricing.findIndex(p => p.id === id);

    if (priceIndex !== -1) {
      pricing.splice(priceIndex, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pricing:', error);
    return NextResponse.json({ error: 'Failed to delete pricing' }, { status: 500 });
  }
}
