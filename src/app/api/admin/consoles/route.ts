import { NextRequest, NextResponse } from 'next/server';

// Static consoles for admin panel
const staticConsoles = [
  {
    id: 'ps5',
    name: 'PlayStation 5',
    slug: 'ps5',
    description: 'Experience next-gen gaming with lightning-fast loading, haptic feedback, and stunning 4K graphics.',
    pricePerHour: 150,
    features: JSON.stringify(['4K Gaming', 'Ray Tracing', 'DualSense Controller', '120fps Support']),
    image: null,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ps4',
    name: 'PlayStation 4 Pro',
    slug: 'ps4',
    description: 'Enjoy a vast library of games with enhanced graphics and smooth performance.',
    pricePerHour: 80,
    features: JSON.stringify(['4K Upscaling', 'HDR Support', 'DualShock 4', '500+ Games']),
    image: null,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'vr',
    name: 'VR Gaming',
    slug: 'vr',
    description: 'Immerse yourself in virtual worlds with PlayStation VR and cutting-edge VR experiences.',
    pricePerHour: 200,
    features: JSON.stringify(['360° Vision', 'Motion Controllers', 'Immersive Audio', '50+ VR Games']),
    image: null,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'projector',
    name: 'Projector Gaming',
    slug: 'projector',
    description: 'Game on the big screen! Experience your favorite games on a massive 120-inch projection.',
    pricePerHour: 250,
    features: JSON.stringify(['120" Screen', '4K Projection', 'Surround Sound', 'Multiplayer Setup']),
    image: null,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
];

// Global store for runtime consoles
declare global {
  var adminConsolesStore: typeof staticConsoles | undefined;
}

function getConsolesStore() {
  if (!global.adminConsolesStore) {
    global.adminConsolesStore = [...staticConsoles];
  }
  return global.adminConsolesStore;
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

    const consoles = getConsolesStore();
    return NextResponse.json({ consoles });
  } catch (error) {
    console.error('Error fetching consoles:', error);
    return NextResponse.json({ consoles: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, slug, description, pricePerHour, features, image, isActive } = data;

    const consoles = getConsolesStore();
    const consoleSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    const newConsole = {
      id: `console-${Date.now()}`,
      name,
      slug: consoleSlug,
      description: description || null,
      pricePerHour: parseFloat(pricePerHour) || 0,
      features: features || null,
      image: image || null,
      isActive: isActive ?? true,
      createdAt: new Date(),
    };

    consoles.push(newConsole);

    return NextResponse.json({ success: true, console: newConsole });
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

    const consoles = getConsolesStore();
    const consoleIndex = consoles.findIndex(c => c.id === id);

    if (consoleIndex === -1) {
      return NextResponse.json({ error: 'Console not found' }, { status: 404 });
    }

    consoles[consoleIndex] = {
      ...consoles[consoleIndex],
      ...updateData,
      pricePerHour: updateData.pricePerHour ? parseFloat(updateData.pricePerHour) : consoles[consoleIndex].pricePerHour,
    };

    return NextResponse.json({ success: true, console: consoles[consoleIndex] });
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

    const consoles = getConsolesStore();
    const consoleIndex = consoles.findIndex(c => c.id === id);

    if (consoleIndex !== -1) {
      consoles.splice(consoleIndex, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting console:', error);
    return NextResponse.json({ error: 'Failed to delete console' }, { status: 500 });
  }
}
