import { NextRequest, NextResponse } from 'next/server';

// Static games for admin panel
const staticGames = [
  { id: 'game-1', title: 'Spider-Man 2', slug: 'spider-man-2', description: 'Swing through NYC as Peter Parker and Miles Morales.', genre: 'Action', consoleType: 'PS5', rating: 4.9, image: null, isFeatured: true, isPopular: true, createdAt: new Date('2024-01-01') },
  { id: 'game-2', title: 'God of War Ragnarök', slug: 'god-of-war', description: 'Kratos and Atreus embark on a mythic journey.', genre: 'Action', consoleType: 'Both', rating: 4.9, image: null, isFeatured: true, isPopular: true, createdAt: new Date('2024-01-01') },
  { id: 'game-3', title: 'EA Sports FC 25', slug: 'fc25', description: 'The most realistic football simulation.', genre: 'Sports', consoleType: 'Both', rating: 4.6, image: null, isFeatured: true, isPopular: true, createdAt: new Date('2024-01-01') },
  { id: 'game-4', title: 'Tekken 8', slug: 'tekken-8', description: 'The legendary fighting game returns!', genre: 'Fighting', consoleType: 'PS5', rating: 4.8, image: null, isFeatured: true, isPopular: true, createdAt: new Date('2024-01-01') },
  { id: 'game-5', title: 'Call of Duty: MW III', slug: 'cod-mw3', description: 'Intense tactical combat.', genre: 'Shooter', consoleType: 'Both', rating: 4.7, image: null, isFeatured: true, isPopular: true, createdAt: new Date('2024-01-01') },
  { id: 'game-6', title: 'Grand Theft Auto VI', slug: 'gta-6', description: 'The next chapter in GTA.', genre: 'Action', consoleType: 'PS5', rating: 5.0, image: null, isFeatured: true, isPopular: true, createdAt: new Date('2024-01-01') },
  { id: 'game-7', title: 'Hogwarts Legacy', slug: 'hogwarts', description: 'Experience the wizarding world.', genre: 'Adventure', consoleType: 'Both', rating: 4.7, image: null, isFeatured: false, isPopular: true, createdAt: new Date('2024-01-01') },
  { id: 'game-8', title: 'Beat Saber', slug: 'beat-saber', description: 'VR rhythm gaming at its best.', genre: 'Rhythm', consoleType: 'VR', rating: 4.9, image: null, isFeatured: true, isPopular: true, createdAt: new Date('2024-01-01') },
];

// Global store for runtime games
declare global {
  var adminGamesStore: typeof staticGames | undefined;
}

function getGamesStore() {
  if (!global.adminGamesStore) {
    global.adminGamesStore = [...staticGames];
  }
  return global.adminGamesStore;
}

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

    const games = getGamesStore();
    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ games: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, slug, description, genre, consoleType, rating, isFeatured, isPopular, image } = data;

    if (!title) {
      return NextResponse.json({ error: 'Missing required field: title is required' }, { status: 400 });
    }

    const games = getGamesStore();
    const gameSlug = slug || generateSlug(title);

    const newGame = {
      id: `game-${Date.now()}`,
      title,
      slug: gameSlug,
      description: description || null,
      genre: genre || 'Action',
      consoleType: consoleType || 'Both',
      rating: rating ? parseFloat(rating) : null,
      isFeatured: isFeatured ?? false,
      isPopular: isPopular ?? false,
      image: image || null,
      createdAt: new Date(),
    };

    games.push(newGame);

    return NextResponse.json({ success: true, game: newGame });
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

    const games = getGamesStore();
    const gameIndex = games.findIndex(g => g.id === id);

    if (gameIndex === -1) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    games[gameIndex] = {
      ...games[gameIndex],
      ...updateData,
      rating: updateData.rating ? parseFloat(updateData.rating) : games[gameIndex].rating,
    };

    return NextResponse.json({ success: true, game: games[gameIndex] });
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

    const games = getGamesStore();
    const gameIndex = games.findIndex(g => g.id === id);

    if (gameIndex !== -1) {
      games.splice(gameIndex, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
