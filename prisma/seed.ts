import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Simple hash function matching the app
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'gamer432';
  const adminUsername = process.env.ADMIN_USERNAME || 'gamerden_432';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername }
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        username: adminUsername,
        password: hashPassword(adminPassword),
        email: 'admin@gamersden.com',
        name: 'Admin',
        isAdmin: true,
      }
    });
    console.log(`✅ Admin user created: ${adminUsername}`);
  } else {
    // Update existing admin to ensure isAdmin is true and password is correct
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        isAdmin: true,
        password: hashPassword(adminPassword),
      }
    });
    console.log(`✅ Admin user updated: ${adminUsername}`);
  }

  // Create Consoles
  const consoles = [
    {
      name: 'PlayStation 5',
      slug: 'ps5',
      description: 'Experience next-gen gaming with lightning-fast loading, haptic feedback, and stunning 4K graphics.',
      pricePerHour: 150,
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
      features: JSON.stringify(['4K Gaming', '120fps Support', 'Ray Tracing', 'DualSense Controller', 'SSD Storage']),
      isActive: true,
    },
    {
      name: 'PlayStation 4 Pro',
      slug: 'ps4',
      description: 'Enjoy a vast library of amazing games with enhanced graphics and performance on PS4 Pro.',
      pricePerHour: 100,
      image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800',
      features: JSON.stringify(['4K Upscaling', 'HDR Gaming', 'Boost Mode', 'DualShock 4', 'Large Game Library']),
      isActive: true,
    },
    {
      name: 'VR Gaming',
      slug: 'vr',
      description: 'Step into virtual worlds with our premium VR setup. Experience games like never before.',
      pricePerHour: 200,
      image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800',
      features: JSON.stringify(['PSVR2 Ready', 'Room-Scale VR', '360° Experience', 'Motion Controllers', 'Immersive Audio']),
      isActive: true,
    },
    {
      name: 'Projector Gaming',
      slug: 'projector',
      description: 'Play on the big screen! Our 150" projector setup delivers an epic gaming experience.',
      pricePerHour: 250,
      image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
      features: JSON.stringify(['150" Screen', '4K Projection', 'Surround Sound', 'Multiple Seats', 'Party Setup']),
      isActive: true,
    },
  ];

  for (const consoleData of consoles) {
    const existing = await prisma.console.findUnique({
      where: { slug: consoleData.slug }
    });
    
    if (!existing) {
      await prisma.console.create({ data: consoleData });
      console.log(`✅ Console created: ${consoleData.name}`);
    } else {
      console.log(`ℹ️ Console exists: ${consoleData.name}`);
    }
  }

  // Create Time Slots
  const allConsoles = await prisma.console.findMany();
  const timeSlots = [
    { startTime: '10:00', endTime: '11:00' },
    { startTime: '11:00', endTime: '12:00' },
    { startTime: '12:00', endTime: '13:00' },
    { startTime: '13:00', endTime: '14:00' },
    { startTime: '14:00', endTime: '15:00' },
    { startTime: '15:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '17:00' },
    { startTime: '17:00', endTime: '18:00' },
    { startTime: '18:00', endTime: '19:00' },
    { startTime: '19:00', endTime: '20:00' },
    { startTime: '20:00', endTime: '21:00' },
    { startTime: '21:00', endTime: '22:00' },
  ];

  for (const console of allConsoles) {
    for (const slot of timeSlots) {
      const existingSlot = await prisma.slot.findFirst({
        where: {
          consoleId: console.id,
          startTime: slot.startTime,
          dayOfWeek: null,
        }
      });

      if (!existingSlot) {
        await prisma.slot.create({
          data: {
            consoleId: console.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: true,
            dayOfWeek: null, // Available all days
          }
        });
      }
    }
  }
  console.log('✅ Time slots created');

  // Create Games
  const games = [
    { title: 'FIFA 24', slug: 'fifa-24', genre: 'Sports', consoleType: 'Both', rating: 4.5, isFeatured: true, isPopular: true },
    { title: 'God of War Ragnarök', slug: 'god-of-war-ragnarok', genre: 'Action', consoleType: 'PS5', rating: 4.9, isFeatured: true, isPopular: true },
    { title: 'Spider-Man 2', slug: 'spider-man-2', genre: 'Action', consoleType: 'PS5', rating: 4.8, isFeatured: true, isPopular: true },
    { title: 'Call of Duty: MW III', slug: 'cod-mw3', genre: 'Shooter', consoleType: 'Both', rating: 4.3, isFeatured: true, isPopular: true },
    { title: 'Grand Theft Auto V', slug: 'gta-v', genre: 'Action', consoleType: 'Both', rating: 4.7, isFeatured: false, isPopular: true },
    { title: 'Gran Turismo 7', slug: 'gran-turismo-7', genre: 'Racing', consoleType: 'PS5', rating: 4.6, isFeatured: true, isPopular: false },
    { title: 'Horizon Forbidden West', slug: 'horizon-forbidden-west', genre: 'RPG', consoleType: 'PS5', rating: 4.7, isFeatured: false, isPopular: true },
    { title: 'Beat Saber', slug: 'beat-saber', genre: 'Rhythm', consoleType: 'VR', rating: 4.8, isFeatured: true, isPopular: true },
  ];

  for (const game of games) {
    const existing = await prisma.game.findUnique({
      where: { slug: game.slug }
    });
    
    if (!existing) {
      await prisma.game.create({
        data: {
          ...game,
          description: `Experience the amazing ${game.title}!`,
          image: `https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800`,
        }
      });
      console.log(`✅ Game created: ${game.title}`);
    }
  }

  // Create Pricing Packages
  const packages = [
    { name: 'Quick Play', description: '1 hour of gaming', consoleType: 'PS4', price: 100, duration: 60, discount: 0 },
    { name: 'Half Day', description: '3 hours of gaming', consoleType: 'PS4', price: 250, duration: 180, discount: 17 },
    { name: 'Full Day', description: '6 hours of gaming', consoleType: 'PS4', price: 450, duration: 360, discount: 25 },
    { name: 'Quick Play', description: '1 hour of gaming', consoleType: 'PS5', price: 150, duration: 60, discount: 0 },
    { name: 'Half Day', description: '3 hours of gaming', consoleType: 'PS5', price: 400, duration: 180, discount: 11 },
    { name: 'Full Day', description: '6 hours of gaming', consoleType: 'PS5', price: 750, duration: 360, discount: 17 },
    { name: 'VR Experience', description: '1 hour VR gaming', consoleType: 'VR', price: 200, duration: 60, discount: 0 },
    { name: 'VR Marathon', description: '3 hours VR gaming', consoleType: 'VR', price: 500, duration: 180, discount: 17 },
    { name: 'Cinema Hour', description: '1 hour big screen gaming', consoleType: 'Projector', price: 250, duration: 60, discount: 0 },
    { name: 'Cinema Party', description: '3 hours big screen gaming', consoleType: 'Projector', price: 650, duration: 180, discount: 13 },
  ];

  for (const pkg of packages) {
    const existing = await prisma.pricingPackage.findFirst({
      where: { name: pkg.name, consoleType: pkg.consoleType }
    });
    
    if (!existing) {
      await prisma.pricingPackage.create({
        data: {
          ...pkg,
          includes: JSON.stringify(['Gaming Session', 'Controller', 'Headset']),
          isActive: true,
        }
      });
    }
  }
  console.log('✅ Pricing packages created');

  // Create Events
  const events = [
    {
      title: 'FIFA Tournament 2024',
      slug: 'fifa-tournament-2024',
      description: 'Join our biggest FIFA tournament! Compete against the best players in Lucknow.',
      gameName: 'FIFA 24',
      date: '2024-04-15',
      time: '14:00',
      prize: '₹10,000',
      maxPlayers: 32,
      currentPlayers: 18,
      price: 200,
      status: 'upcoming',
    },
    {
      title: 'COD Night Battle',
      slug: 'cod-night-battle',
      description: 'All-night Call of Duty competition. Team up or go solo!',
      gameName: 'Call of Duty: MW III',
      date: '2024-04-20',
      time: '20:00',
      prize: '₹5,000',
      maxPlayers: 20,
      currentPlayers: 12,
      price: 150,
      status: 'upcoming',
    },
  ];

  for (const event of events) {
    const existing = await prisma.event.findUnique({
      where: { slug: event.slug }
    });
    
    if (!existing) {
      await prisma.event.create({
        data: {
          ...event,
          image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
        }
      });
      console.log(`✅ Event created: ${event.title}`);
    }
  }

  // Create Announcements
  const announcements = [
    {
      title: '🎉 Grand Opening Special!',
      content: 'Get 20% off on all gaming sessions during our grand opening week! Use code GAMERSDEN20',
      type: 'offer',
      isActive: true,
    },
    {
      title: '🎮 New Games Added',
      content: 'We\'ve added FIFA 24, Spider-Man 2, and more to our game library!',
      type: 'info',
      isActive: true,
    },
  ];

  for (const announcement of announcements) {
    const existing = await prisma.announcement.findFirst({
      where: { title: announcement.title }
    });
    
    if (!existing) {
      await prisma.announcement.create({ data: announcement });
      console.log(`✅ Announcement created: ${announcement.title}`);
    }
  }

  console.log('🌱 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
