import { db } from '@/lib/db';
import { Console, Game, Announcement, Event, PricingPackage, GalleryItem } from '@prisma/client';

// Simple ensureDatabase - just a placeholder
export async function ensureDatabase() {
  // Database schema is created during build
}

// Seed the database with initial data
export async function seedDatabase() {
  // Check if already seeded
  const existingConsoles = await db.console.findFirst();
  if (existingConsoles) return;

  // Create Consoles
  const consoles = await Promise.all([
    db.console.create({
      data: {
        name: 'PlayStation 5',
        slug: 'ps5',
        description: 'Experience next-gen gaming with lightning-fast loading, haptic feedback, and stunning 4K graphics.',
        pricePerHour: 150,
        features: JSON.stringify(['4K Gaming', 'Ray Tracing', 'DualSense Controller', '120fps Support']),
        isActive: true,
      },
    }),
    db.console.create({
      data: {
        name: 'PlayStation 4 Pro',
        slug: 'ps4',
        description: 'Enjoy a vast library of games with enhanced graphics and smooth performance.',
        pricePerHour: 80,
        features: JSON.stringify(['4K Upscaling', 'HDR Support', 'DualShock 4', '500+ Games']),
        isActive: true,
      },
    }),
    db.console.create({
      data: {
        name: 'VR Gaming',
        slug: 'vr',
        description: 'Immerse yourself in virtual worlds with PlayStation VR and cutting-edge VR experiences.',
        pricePerHour: 200,
        features: JSON.stringify(['360° Vision', 'Motion Controllers', 'Immersive Audio', '50+ VR Games']),
        isActive: true,
      },
    }),
    db.console.create({
      data: {
        name: 'Projector Gaming',
        slug: 'projector',
        description: 'Game on the big screen! Experience your favorite games on a massive 120-inch projection.',
        pricePerHour: 250,
        features: JSON.stringify(['120" Screen', '4K Projection', 'Surround Sound', 'Multiplayer Setup']),
        isActive: true,
      },
    }),
  ]);

  // Create Games
  const games = await Promise.all([
    db.game.create({
      data: {
        title: 'Tekken 8',
        slug: 'tekken-8',
        description: 'The legendary fighting game returns with next-gen graphics and enhanced gameplay.',
        genre: 'Fighting',
        consoleType: 'PS5',
        rating: 4.8,
        isFeatured: true,
        isPopular: true,
        image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600',
      },
    }),
    db.game.create({
      data: {
        title: 'Grand Theft Auto V',
        slug: 'gta-v',
        description: 'Explore the vast open world of Los Santos in this action-packed adventure.',
        genre: 'Action',
        consoleType: 'Both',
        rating: 4.9,
        isFeatured: true,
        isPopular: true,
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600',
      },
    }),
    db.game.create({
      data: {
        title: 'Moto GP 24',
        slug: 'moto-gp-24',
        description: 'Feel the adrenaline of professional motorcycle racing.',
        genre: 'Racing',
        consoleType: 'PS5',
        rating: 4.5,
        isFeatured: true,
        isPopular: true,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      },
    }),
    db.game.create({
      data: {
        title: 'EA Sports FC 25',
        slug: 'fc-25',
        description: 'The next chapter in football gaming with enhanced realism.',
        genre: 'Sports',
        consoleType: 'Both',
        rating: 4.6,
        isFeatured: true,
        isPopular: true,
        image: 'https://images.unsplash.com/photo-1493711662062-fa541f7f70a3?w=600',
      },
    }),
    db.game.create({
      data: {
        title: 'Call of Duty: Modern Warfare III',
        slug: 'cod-mw3',
        description: 'Intense tactical combat in the latest Call of Duty installment.',
        genre: 'Action',
        consoleType: 'PS5',
        rating: 4.7,
        isFeatured: true,
        isPopular: true,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600',
      },
    }),
    db.game.create({
      data: {
        title: 'Spider-Man 2',
        slug: 'spider-man-2',
        description: 'Swing through New York as Peter Parker and Miles Morales.',
        genre: 'Action',
        consoleType: 'PS5',
        rating: 4.9,
        isFeatured: true,
        isPopular: true,
        image: 'https://images.unsplash.com/photo-1608889476561-6242cfdb7f18?w=600',
      },
    }),
    db.game.create({
      data: {
        title: 'God of War Ragnarök',
        slug: 'god-of-war-ragnarok',
        description: 'Kratos and Atreus embark on a mythic journey.',
        genre: 'Action',
        consoleType: 'Both',
        rating: 4.9,
        isFeatured: true,
        isPopular: true,
        image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600',
      },
    }),
    db.game.create({
      data: {
        title: 'FIFA 24',
        slug: 'fifa-24',
        description: 'The most realistic football simulation ever.',
        genre: 'Sports',
        consoleType: 'Both',
        rating: 4.5,
        isPopular: true,
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600',
      },
    }),
    db.game.create({
      data: {
        title: 'Astro Bot Rescue Mission',
        slug: 'astro-bot',
        description: 'A magical VR platforming adventure.',
        genre: 'Adventure',
        consoleType: 'VR',
        rating: 4.8,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600',
      },
    }),
    db.game.create({
      data: {
        title: 'Beat Saber',
        slug: 'beat-saber',
        description: 'Slash the beats of your favorite songs in VR.',
        genre: 'Rhythm',
        consoleType: 'VR',
        rating: 4.9,
        isPopular: true,
        image: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=600',
      },
    }),
  ]);

  // Create Announcements
  const announcements = await Promise.all([
    db.announcement.create({
      data: {
        title: '🎮 Weekend Special: 20% OFF on all bookings!',
        content: 'Book your gaming session this weekend and get 20% discount. Limited slots available!',
        type: 'offer',
        isActive: true,
      },
    }),
    db.announcement.create({
      data: {
        title: '🏆 Tekken Tournament - Register Now!',
        content: 'Join our monthly Tekken tournament. Cash prizes for winners!',
        type: 'tournament',
        isActive: true,
      },
    }),
    db.announcement.create({
      data: {
        title: '🆕 New Games Added: Spider-Man 2, FC 25, Tekken 8',
        content: 'Experience the latest gaming titles now available at Gamer\'s Den!',
        type: 'info',
        isActive: true,
      },
    }),
    db.announcement.create({
      data: {
        title: '🎁 Refer a Friend & Get 1 Hour Free!',
        content: 'Bring a friend and you both get 1 hour of free gaming on your next visit.',
        type: 'offer',
        isActive: true,
      },
    }),
  ]);

  // Create Events
  const events = await Promise.all([
    db.event.create({
      data: {
        title: 'Tekken 8 Championship',
        slug: 'tekken-8-championship',
        description: 'Compete against the best players in Lucknow for the Tekken 8 title!',
        gameName: 'Tekken 8',
        date: '2025-02-15',
        time: '16:00',
        prize: '₹10,000 Cash Prize',
        maxPlayers: 32,
        currentPlayers: 12,
        price: 200,
        status: 'upcoming',
      },
    }),
    db.event.create({
      data: {
        title: 'FIFA Friday Night League',
        slug: 'fifa-friday-league',
        description: 'Weekly FIFA tournament every Friday. Join the league and climb the ranks!',
        gameName: 'EA Sports FC 25',
        date: '2025-01-24',
        time: '19:00',
        prize: 'Free Gaming Hours',
        maxPlayers: 16,
        currentPlayers: 8,
        price: 100,
        status: 'upcoming',
      },
    }),
    db.event.create({
      data: {
        title: 'VR Gaming Night',
        slug: 'vr-gaming-night',
        description: 'Experience the best of VR gaming with friends. Multiplayer VR sessions all night!',
        gameName: 'Various VR Titles',
        date: '2025-01-25',
        time: '20:00',
        prize: 'Special Discounts',
        maxPlayers: 20,
        currentPlayers: 5,
        price: 300,
        status: 'upcoming',
      },
    }),
  ]);

  // Create Pricing Packages
  const packages = await Promise.all([
    db.pricingPackage.create({
      data: {
        name: 'Quick Session',
        description: 'Perfect for a quick gaming fix',
        consoleType: 'PS5',
        price: 150,
        duration: 60,
        includes: JSON.stringify(['1 Hour Gaming', 'Single Player', 'Snacks Available']),
        isActive: true,
      },
    }),
    db.pricingPackage.create({
      data: {
        name: 'Gaming Marathon',
        description: 'Best value for extended gaming',
        consoleType: 'PS5',
        price: 400,
        duration: 180,
        discount: 10,
        includes: JSON.stringify(['3 Hours Gaming', 'Multiplayer', 'Free Snacks', 'Soft Drinks']),
        isActive: true,
      },
    }),
    db.pricingPackage.create({
      data: {
        name: 'Party Pack',
        description: 'Perfect for group gaming sessions',
        consoleType: 'Projector',
        price: 800,
        duration: 180,
        discount: 15,
        includes: JSON.stringify(['3 Hours Big Screen', 'Up to 4 Players', 'Free Snacks', 'Drinks', 'Party Setup']),
        isActive: true,
      },
    }),
    db.pricingPackage.create({
      data: {
        name: 'VR Experience',
        description: 'Immersive virtual reality session',
        consoleType: 'VR',
        price: 200,
        duration: 60,
        includes: JSON.stringify(['1 Hour VR Gaming', 'Multiple Games', 'Guided Setup', 'Safety Equipment']),
        isActive: true,
      },
    }),
    db.pricingPackage.create({
      data: {
        name: 'Weekend Special',
        description: 'Extended weekend gaming',
        consoleType: 'PS5',
        price: 600,
        duration: 300,
        discount: 20,
        includes: JSON.stringify(['5 Hours Gaming', 'Multiplayer', 'Unlimited Snacks', 'Energy Drinks', 'Dedicated Console']),
        isActive: true,
      },
    }),
  ]);

  // Create Gallery Items
  const galleryItems = await Promise.all([
    db.galleryItem.create({
      data: {
        title: 'PS5 Gaming Zone',
        description: 'Our premium PS5 gaming stations',
        type: 'image',
        url: '/gallery/ps5-zone.jpg',
        category: 'interior',
        isFeatured: true,
      },
    }),
    db.galleryItem.create({
      data: {
        title: 'VR Experience Area',
        description: 'Dedicated VR gaming space',
        type: 'image',
        url: '/gallery/vr-area.jpg',
        category: 'interior',
        isFeatured: true,
      },
    }),
    db.galleryItem.create({
      data: {
        title: 'Tournament Night',
        description: 'Monthly tournament highlights',
        type: 'image',
        url: '/gallery/tournament.jpg',
        category: 'events',
        isFeatured: true,
      },
    }),
  ]);

  // Create Slots for each console (9 AM to 11 PM, 1-hour slots)
  for (const console of consoles) {
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
  }

  console.log('Database seeded successfully!');
  return { consoles, games, announcements, events, packages, galleryItems };
}

// Get all consoles
export async function getConsoles() {
  return db.console.findMany({
    where: { isActive: true },
    include: { slots: true },
  });
}

// Get all games
export async function getGames() {
  return db.game.findMany({
    orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
  });
}

// Get featured games
export async function getFeaturedGames() {
  return db.game.findMany({
    where: { isFeatured: true },
    orderBy: { rating: 'desc' },
  });
}

// Get active announcements
export async function getAnnouncements() {
  return db.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

// Get upcoming events
export async function getUpcomingEvents() {
  return db.event.findMany({
    where: { status: 'upcoming' },
    orderBy: { date: 'asc' },
  });
}

// Get pricing packages
export async function getPricingPackages() {
  return db.pricingPackage.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  });
}

// Get available slots for a console on a specific date
export async function getAvailableSlots(consoleId: string, date: string) {
  const bookings = await db.booking.findMany({
    where: {
      consoleId,
      date,
      status: { notIn: ['cancelled'] },
    },
    select: { slotId: true },
  });
  
  const bookedSlotIds = bookings.map(b => b.slotId);
  
  return db.slot.findMany({
    where: {
      consoleId,
      isAvailable: true,
      id: { notIn: bookedSlotIds },
    },
    orderBy: { startTime: 'asc' },
  });
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
}) {
  return db.booking.create({
    data: {
      ...data,
      status: 'pending',
      paymentStatus: 'pending',
    },
  });
}
