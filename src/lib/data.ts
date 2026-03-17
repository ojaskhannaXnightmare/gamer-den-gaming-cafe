import { db } from '@/lib/db';

// Types
export interface Console {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pricePerHour: number;
  features: string | null;
  image?: string | null;
  isActive: boolean;
  slots?: Slot[];
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  genre: string;
  consoleType: string | null;
  rating: number | null;
  image: string | null;
  isFeatured: boolean;
  isPopular: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  gameName: string | null;
  date: string;
  time: string;
  prize: string | null;
  maxPlayers: number | null;
  currentPlayers: number;
  price: number;
  status: string;
}

export interface PricingPackage {
  id: string;
  name: string;
  description: string | null;
  consoleType: string;
  price: number;
  duration: number;
  discount: number | null;
  includes: string | null;
  isActive: boolean;
}

export interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Helper to generate time slots
function generateSlots(): Slot[] {
  const slots: Slot[] = [];
  for (let hour = 9; hour < 23; hour++) {
    slots.push({
      id: `slot-${hour}`,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      isAvailable: true,
    });
  }
  return slots;
}

// Static fallback data (always works on Vercel)
const staticConsoles: Console[] = [
  {
    id: 'ps5',
    name: 'PlayStation 5',
    slug: 'ps5',
    description: 'Experience next-gen gaming with lightning-fast loading, haptic feedback, and stunning 4K graphics.',
    pricePerHour: 150,
    features: JSON.stringify(['4K Gaming', 'Ray Tracing', 'DualSense Controller', '120fps Support']),
    isActive: true,
  },
  {
    id: 'ps4',
    name: 'PlayStation 4 Pro',
    slug: 'ps4',
    description: 'Enjoy a vast library of games with enhanced graphics and smooth performance.',
    pricePerHour: 80,
    features: JSON.stringify(['4K Upscaling', 'HDR Support', 'DualShock 4', '500+ Games']),
    isActive: true,
  },
  {
    id: 'vr',
    name: 'VR Gaming',
    slug: 'vr',
    description: 'Immerse yourself in virtual worlds with PlayStation VR and cutting-edge VR experiences.',
    pricePerHour: 200,
    features: JSON.stringify(['360° Vision', 'Motion Controllers', 'Immersive Audio', '50+ VR Games']),
    isActive: true,
  },
  {
    id: 'projector',
    name: 'Projector Gaming',
    slug: 'projector',
    description: 'Game on the big screen! Experience your favorite games on a massive 120-inch projection.',
    pricePerHour: 250,
    features: JSON.stringify(['120" Screen', '4K Projection', 'Surround Sound', 'Multiplayer Setup']),
    isActive: true,
  },
];

const staticGames: Game[] = [
  { id: 'game-1', title: 'Spider-Man 2', slug: 'spider-man-2', description: 'Swing through NYC as Peter Parker and Miles Morales.', genre: 'Action', consoleType: 'PS5', rating: 4.9, image: 'https://images.unsplash.com/photo-1608889476561-6242cfdb7f18?w=400', isFeatured: true, isPopular: true },
  { id: 'game-2', title: 'God of War Ragnarök', slug: 'god-of-war', description: 'Kratos and Atreus embark on a mythic journey.', genre: 'Action', consoleType: 'Both', rating: 4.9, image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400', isFeatured: true, isPopular: true },
  { id: 'game-3', title: 'EA Sports FC 25', slug: 'fc25', description: 'The most realistic football simulation.', genre: 'Sports', consoleType: 'Both', rating: 4.6, image: 'https://images.unsplash.com/photo-1493711662062-fa541f7f70a3?w=400', isFeatured: true, isPopular: true },
  { id: 'game-4', title: 'Tekken 8', slug: 'tekken-8', description: 'The legendary fighting game returns!', genre: 'Fighting', consoleType: 'PS5', rating: 4.8, image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400', isFeatured: true, isPopular: true },
  { id: 'game-5', title: 'Call of Duty: MW III', slug: 'cod-mw3', description: 'Intense tactical combat.', genre: 'Shooter', consoleType: 'Both', rating: 4.7, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', isFeatured: true, isPopular: true },
  { id: 'game-6', title: 'Grand Theft Auto VI', slug: 'gta-6', description: 'The next chapter in GTA.', genre: 'Action', consoleType: 'PS5', rating: 5.0, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', isFeatured: true, isPopular: true },
  { id: 'game-7', title: 'Hogwarts Legacy', slug: 'hogwarts', description: 'Experience the wizarding world.', genre: 'Adventure', consoleType: 'Both', rating: 4.7, image: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400', isFeatured: false, isPopular: true },
  { id: 'game-8', title: 'Beat Saber', slug: 'beat-saber', description: 'VR rhythm gaming at its best.', genre: 'Rhythm', consoleType: 'VR', rating: 4.9, image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=400', isFeatured: true, isPopular: true },
];

const staticAnnouncements: Announcement[] = [
  { id: 'ann-1', title: '🎮 Weekend Special: 20% OFF!', content: 'Book your gaming session this weekend!', type: 'offer', isActive: true },
  { id: 'ann-2', title: '🏆 Tekken Tournament Coming!', content: 'Join our monthly tournament. Cash prizes!', type: 'tournament', isActive: true },
  { id: 'ann-3', title: '🆕 New Games Added!', content: 'Spider-Man 2, FC 25, Tekken 8 now available!', type: 'info', isActive: true },
];

const staticEvents: Event[] = [
  { id: 'event-1', title: 'Tekken 8 Championship', slug: 'tekken-championship', description: 'Compete for the title!', gameName: 'Tekken 8', date: '2026-04-15', time: '16:00', prize: '₹10,000', maxPlayers: 32, currentPlayers: 12, price: 200, status: 'upcoming' },
  { id: 'event-2', title: 'FIFA Friday League', slug: 'fifa-league', description: 'Weekly FIFA tournament!', gameName: 'EA Sports FC 25', date: '2026-04-18', time: '19:00', prize: 'Free Gaming Hours', maxPlayers: 16, currentPlayers: 8, price: 100, status: 'upcoming' },
  { id: 'event-3', title: 'VR Gaming Night', slug: 'vr-night', description: 'Experience VR with friends!', gameName: 'Various VR Games', date: '2026-04-20', time: '20:00', prize: 'Special Discounts', maxPlayers: 20, currentPlayers: 5, price: 300, status: 'upcoming' },
];

const staticPricing: PricingPackage[] = [
  { id: 'pkg-1', name: 'Quick Session', description: 'Perfect for quick gaming', consoleType: 'PS5', price: 150, duration: 60, discount: null, includes: JSON.stringify(['1 Hour Gaming', 'Any Game']), isActive: true },
  { id: 'pkg-2', name: 'Gaming Marathon', description: 'Best value for extended play', consoleType: 'PS5', price: 400, duration: 180, discount: 10, includes: JSON.stringify(['3 Hours', 'Free Snacks', 'Drinks']), isActive: true },
  { id: 'pkg-3', name: 'Party Pack', description: 'Perfect for groups', consoleType: 'Projector', price: 800, duration: 180, discount: 15, includes: JSON.stringify(['3 Hours Big Screen', 'Up to 4 Players', 'Snacks & Drinks']), isActive: true },
  { id: 'pkg-4', name: 'VR Experience', description: 'Immersive VR session', consoleType: 'VR', price: 200, duration: 60, discount: null, includes: JSON.stringify(['1 Hour VR', 'Multiple Games']), isActive: true },
];

// Placeholder function - no longer needed
export async function ensureDatabase() {}

// Placeholder function - no longer needed  
export async function seedDatabase() {}

// Get all consoles
export async function getConsoles(): Promise<Console[]> {
  try {
    const consoles = await db.console.findMany({
      where: { isActive: true },
    });
    if (consoles.length > 0) return consoles as Console[];
  } catch {
    console.log('Using static console data');
  }
  return staticConsoles;
}

// Get featured games
export async function getFeaturedGames(): Promise<Game[]> {
  try {
    const games = await db.game.findMany({
      where: { isFeatured: true },
      orderBy: { rating: 'desc' },
    });
    if (games.length > 0) return games as Game[];
  } catch {
    console.log('Using static game data');
  }
  return staticGames.filter(g => g.isFeatured);
}

// Get all games
export async function getGames(): Promise<Game[]> {
  try {
    const games = await db.game.findMany({
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
    });
    if (games.length > 0) return games as Game[];
  } catch {
    console.log('Using static game data');
  }
  return staticGames;
}

// Get active announcements
export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const announcements = await db.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (announcements.length > 0) return announcements as Announcement[];
  } catch {
    console.log('Using static announcement data');
  }
  return staticAnnouncements;
}

// Get upcoming events
export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const events = await db.event.findMany({
      where: { status: 'upcoming' },
      orderBy: { date: 'asc' },
    });
    if (events.length > 0) return events as Event[];
  } catch {
    console.log('Using static event data');
  }
  return staticEvents;
}

// Get pricing packages
export async function getPricingPackages(): Promise<PricingPackage[]> {
  try {
    const packages = await db.pricingPackage.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
    if (packages.length > 0) return packages as PricingPackage[];
  } catch {
    console.log('Using static pricing data');
  }
  return staticPricing;
}

// Get available slots for a console
export async function getAvailableSlots(consoleId: string, _date: string): Promise<Slot[]> {
  try {
    const slots = await db.slot.findMany({
      where: { consoleId, isAvailable: true },
      orderBy: { startTime: 'asc' },
    });
    if (slots.length > 0) return slots as Slot[];
  } catch {
    console.log('Using static slot data');
  }
  return generateSlots();
}

// Create a booking
export async function createBooking(data: {
  consoleId: string;
  slotId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  players: number;
  totalPrice: number;
  userId?: string;
}) {
  try {
    return await db.booking.create({
      data: {
        consoleId: data.consoleId,
        slotId: data.slotId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        players: data.players,
        totalPrice: data.totalPrice,
        status: 'pending',
        paymentStatus: 'pending',
        userId: data.userId || null,
      },
    });
  } catch {
    // Return mock success for Vercel demo
    return {
      id: `booking-${Date.now()}`,
      ...data,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
    };
  }
}
