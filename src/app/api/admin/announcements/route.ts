import { NextRequest, NextResponse } from 'next/server';

// Static announcements for admin panel
const staticAnnouncements = [
  { id: 'ann-1', title: '🎮 Weekend Special: 20% OFF!', content: 'Book your gaming session this weekend and get 20% off on all consoles!', type: 'offer', isActive: true, startDate: null, endDate: null, createdAt: new Date('2024-01-01') },
  { id: 'ann-2', title: '🏆 Tekken Tournament Coming!', content: 'Join our monthly Tekken tournament this Saturday. Cash prizes for winners!', type: 'tournament', isActive: true, startDate: null, endDate: null, createdAt: new Date('2024-01-02') },
  { id: 'ann-3', title: '🆕 New Games Added!', content: 'Spider-Man 2, EA Sports FC 25, Tekken 8 now available on PS5!', type: 'info', isActive: true, startDate: null, endDate: null, createdAt: new Date('2024-01-03') },
];

// Global store for runtime announcements
declare global {
  var adminAnnouncementsStore: typeof staticAnnouncements | undefined;
}

function getAnnouncementsStore() {
  if (!global.adminAnnouncementsStore) {
    global.adminAnnouncementsStore = [...staticAnnouncements];
  }
  return global.adminAnnouncementsStore;
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

    const announcements = getAnnouncementsStore();
    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ announcements: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, content, type, isActive, startDate, endDate } = data;

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields: title and content are required' }, { status: 400 });
    }

    const announcements = getAnnouncementsStore();

    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      type: type || 'info',
      isActive: isActive ?? true,
      startDate: startDate || null,
      endDate: endDate || null,
      createdAt: new Date(),
    };

    announcements.push(newAnnouncement);

    return NextResponse.json({ success: true, announcement: newAnnouncement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
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
      return NextResponse.json({ error: 'Announcement ID required' }, { status: 400 });
    }

    const announcements = getAnnouncementsStore();
    const annIndex = announcements.findIndex(a => a.id === id);

    if (annIndex === -1) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    announcements[annIndex] = {
      ...announcements[annIndex],
      ...updateData,
    };

    return NextResponse.json({ success: true, announcement: announcements[annIndex] });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
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
      return NextResponse.json({ error: 'Announcement ID required' }, { status: 400 });
    }

    const announcements = getAnnouncementsStore();
    const annIndex = announcements.findIndex(a => a.id === id);

    if (annIndex !== -1) {
      announcements.splice(annIndex, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
