'use client';

import { useState, useEffect } from 'react';
import {
  Monitor, Gamepad2, Calendar, Bell, DollarSign, Plus, Edit, Trash2,
  X, LogIn, LogOut, Save, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// Types
interface ConsoleType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pricePerHour: number;
  features: string | null;
  image?: string | null;
  isActive: boolean;
}

interface Game {
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

interface EventType {
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

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
}

interface PricingPackage {
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

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  players: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  console: { name: string };
  createdAt: string;
}

// Form Dialog Component
interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  title: string;
  fields: FormField[];
  initialData?: Record<string, unknown> | null;
  isLoading?: boolean;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  step?: string;
}

function FormDialog({ open, onClose, onSave, title, fields, initialData, isLoading }: FormDialogProps) {
  // Create a stable key based on initialData
  const formKey = initialData ? JSON.stringify(initialData) : 'new';
  
  // Safety check for fields
  const safeFields = fields && Array.isArray(fields) ? fields : [];
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="cyber-card border-neon-purple/50 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl neon-text-cyan">{title}</DialogTitle>
        </DialogHeader>
        <FormContent 
          key={formKey}
          fields={safeFields} 
          initialData={initialData} 
          isLoading={isLoading} 
          onSave={onSave} 
          onClose={onClose} 
        />
      </DialogContent>
    </Dialog>
  );
}

function FormContent({ fields, initialData, isLoading, onSave, onClose }: {
  fields: FormField[];
  initialData?: Record<string, unknown> | null;
  isLoading?: boolean;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}) {
  const getInitialFormData = () => {
    const initial: Record<string, unknown> = {};
    if (!fields || !Array.isArray(fields)) return initial;
    
    // If we have initialData, use it
    if (initialData && typeof initialData === 'object') {
      return { ...initialData };
    }
    
    // Otherwise, create default values
    fields.forEach(field => {
      if (field.type === 'checkbox') {
        initial[field.name] = false;
      } else if (field.type === 'number') {
        initial[field.name] = field.min || 0;
      } else {
        initial[field.name] = '';
      }
    });
    return initial;
  };

  const [formData, setFormData] = useState<Record<string, unknown>>(getInitialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fields || !Array.isArray(fields)) return true;
    
    fields.forEach(field => {
      if (field.required) {
        const value = formData[field.name];
        if (value === '' || value === null || value === undefined) {
          newErrors[field.name] = `${field.label} is required`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(formData);
  };

  // Safety check for fields
  if (!fields || !Array.isArray(fields)) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name} className={cn(field.type === 'textarea' && 'md:col-span-2')}>
            {field.type !== 'checkbox' && (
              <Label className="text-gray-400 mb-2 block">
                {field.label} {field.required && <span className="text-red-400">*</span>}
              </Label>
            )}
            
            {field.type === 'text' && (
              <Input
                value={(formData[field.name] as string) || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="bg-white/5 border-neon-purple/30 text-white"
              />
            )}
            
            {field.type === 'number' && (
              <Input
                type="number"
                value={(formData[field.name] as number) ?? ''}
                onChange={(e) => handleChange(field.name, parseFloat(e.target.value) || 0)}
                placeholder={field.placeholder}
                min={field.min}
                    step={field.step}
                    className="bg-white/5 border-neon-purple/30 text-white"
                  />
                )}
                
                {field.type === 'textarea' && (
                  <Textarea
                    value={(formData[field.name] as string) || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="bg-white/5 border-neon-purple/30 text-white min-h-[100px]"
                  />
                )}
                
                {field.type === 'select' && field.options && (
                  <Select
                    value={(formData[field.name] as string) || ''}
                    onValueChange={(value) => handleChange(field.name, value)}
                  >
                    <SelectTrigger className="bg-white/5 border-neon-purple/30 text-white">
                      <SelectValue placeholder={field.placeholder || 'Select...'} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-neon-purple/30">
                      {field.options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-neon-cyan/20">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {field.type === 'checkbox' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData[field.name] as boolean) || false}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      className="w-5 h-5 rounded border-neon-purple/30 bg-white/5 text-neon-cyan focus:ring-neon-cyan"
                    />
                    <span className="text-gray-300">{field.label}</span>
                  </label>
                )}
                
                {errors[field.name] && (
                  <p className="text-red-400 text-xs mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-gray-300"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-neon bg-neon-cyan text-black font-display"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
  );
}

// Admin Login Modal
function AdminLoginModal() {
  const { setAdminUser } = useAdminStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      setAdminUser(data.user);
    } catch {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="cyber-card border-neon-purple/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">
            <span className="neon-text-cyan">Admin Login</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <Label className="text-gray-400 mb-2 block">Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              className="bg-white/5 border-neon-purple/30 text-white"
              required
            />
          </div>
          
          <div>
            <Label className="text-gray-400 mb-2 block">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="bg-white/5 border-neon-purple/30 text-white"
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full btn-neon bg-neon-cyan text-black font-display"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </>
            )}
          </Button>
          
          <p className="text-center text-gray-500 text-xs">
            Default: admin / admin123
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Main Admin Panel
export default function AdminPanel() {
  const { isAdminPanelOpen, closeAdminPanel, isAdminLoggedIn, adminUser, adminLogout, adminTab, setAdminTab } = useAdminStore();
  
  // Data states
  const [consoles, setConsoles] = useState<ConsoleType[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pricing, setPricing] = useState<PricingPackage[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [formType, setFormType] = useState<'console' | 'game' | 'event' | 'announcement' | 'pricing'>('console');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data when tab changes
  useEffect(() => {
    if (isAdminLoggedIn && isAdminPanelOpen) {
      fetchData();
    }
  }, [isAdminLoggedIn, isAdminPanelOpen, adminTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const endpoints: Record<string, string> = {
        bookings: '/api/admin/bookings',
        consoles: '/api/admin/consoles',
        games: '/api/admin/games',
        events: '/api/admin/events',
        announcements: '/api/admin/announcements',
        pricing: '/api/admin/pricing',
      };

      const response = await fetch(endpoints[adminTab] || endpoints.bookings);
      const data = await response.json();

      if (response.ok) {
        switch (adminTab) {
          case 'bookings': setBookings(data.bookings || []); break;
          case 'consoles': setConsoles(data.consoles || []); break;
          case 'games': setGames(data.games || []); break;
          case 'events': setEvents(data.events || []); break;
          case 'announcements': setAnnouncements(data.announcements || []); break;
          case 'pricing': setPricing(data.pricing || []); break;
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openForm = (type: typeof formType, item?: Record<string, unknown>) => {
    setFormType(type);
    setEditingItem(item || null);
    setFormOpen(true);
  };

  const handleSave = async (data: Record<string, unknown>) => {
    setIsSaving(true);
    try {
      const endpoints: Record<string, string> = {
        console: '/api/admin/consoles',
        game: '/api/admin/games',
        event: '/api/admin/events',
        announcement: '/api/admin/announcements',
        pricing: '/api/admin/pricing',
      };

      const isEdit = !!editingItem?.id;
      const url = endpoints[formType];
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: editingItem.id, ...data } : data),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || 'Failed to save');
        return;
      }

      setFormOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const endpoints: Record<string, string> = {
        console: '/api/admin/consoles',
        game: '/api/admin/games',
        event: '/api/admin/events',
        announcement: '/api/admin/announcements',
        pricing: '/api/admin/pricing',
        booking: '/api/admin/bookings',
      };

      const response = await fetch(`${endpoints[type]}?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to delete');
        return;
      }

      fetchData();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete');
    }
  };

  const formFields: Record<typeof formType, FormField[]> = {
    console: [
      { name: 'name', label: 'Console Name', type: 'text', required: true, placeholder: 'e.g., PlayStation 5' },
      { name: 'slug', label: 'Slug', type: 'text', placeholder: 'e.g., ps5 (auto-generated if empty)' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Console description...' },
      { name: 'pricePerHour', label: 'Price per Hour (₹)', type: 'number', required: true, min: 0 },
      { name: 'features', label: 'Features (comma-separated)', type: 'text', placeholder: '4K Gaming, Ray Tracing' },
      { name: 'image', label: 'Image URL', type: 'text', placeholder: 'https://...' },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
    game: [
      { name: 'title', label: 'Game Title', type: 'text', required: true, placeholder: 'e.g., FIFA 24' },
      { name: 'slug', label: 'Slug', type: 'text', placeholder: 'Auto-generated if empty' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Game description...' },
      { name: 'genre', label: 'Genre', type: 'select', required: true, options: [
        { value: 'Action', label: 'Action' },
        { value: 'Racing', label: 'Racing' },
        { value: 'Sports', label: 'Sports' },
        { value: 'Fighting', label: 'Fighting' },
        { value: 'Adventure', label: 'Adventure' },
        { value: 'Horror', label: 'Horror' },
        { value: 'RPG', label: 'RPG' },
        { value: 'Shooter', label: 'Shooter' },
      ]},
      { name: 'consoleType', label: 'Console Type', type: 'select', options: [
        { value: 'PS5', label: 'PS5 Only' },
        { value: 'PS4', label: 'PS4 Only' },
        { value: 'Both', label: 'Both PS4 & PS5' },
        { value: 'VR', label: 'VR' },
      ]},
      { name: 'rating', label: 'Rating (0-5)', type: 'number', min: 0, step: '0.1' },
      { name: 'image', label: 'Image URL', type: 'text', placeholder: 'https://...' },
      { name: 'isFeatured', label: 'Featured Game', type: 'checkbox' },
      { name: 'isPopular', label: 'Popular Game', type: 'checkbox' },
    ],
    event: [
      { name: 'title', label: 'Event Title', type: 'text', required: true, placeholder: 'e.g., FIFA Tournament' },
      { name: 'slug', label: 'Slug', type: 'text', placeholder: 'Auto-generated if empty' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Event details...' },
      { name: 'gameName', label: 'Game Name', type: 'text', placeholder: 'e.g., FIFA 24' },
      { name: 'date', label: 'Event Date', type: 'text', required: true, placeholder: 'YYYY-MM-DD' },
      { name: 'time', label: 'Event Time', type: 'text', required: true, placeholder: 'HH:mm' },
      { name: 'prize', label: 'Prize', type: 'text', placeholder: 'e.g., ₹5000' },
      { name: 'maxPlayers', label: 'Max Players', type: 'number', min: 1 },
      { name: 'price', label: 'Entry Fee (₹)', type: 'number', min: 0 },
      { name: 'status', label: 'Status', type: 'select', options: [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'ongoing', label: 'Ongoing' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ]},
    ],
    announcement: [
      { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Announcement title' },
      { name: 'content', label: 'Content', type: 'textarea', required: true, placeholder: 'Announcement details...' },
      { name: 'type', label: 'Type', type: 'select', required: true, options: [
        { value: 'info', label: 'Information' },
        { value: 'offer', label: 'Special Offer' },
        { value: 'tournament', label: 'Tournament' },
        { value: 'event', label: 'Event' },
      ]},
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
    pricing: [
      { name: 'name', label: 'Package Name', type: 'text', required: true, placeholder: 'e.g., Quick Play' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Package description...' },
      { name: 'consoleType', label: 'Console Type', type: 'select', required: true, options: [
        { value: 'PS5', label: 'PS5' },
        { value: 'PS4', label: 'PS4' },
        { value: 'VR', label: 'VR' },
        { value: 'Projector', label: 'Projector' },
        { value: 'Any', label: 'Any Console' },
      ]},
      { name: 'price', label: 'Price (₹)', type: 'number', required: true, min: 0 },
      { name: 'duration', label: 'Duration (minutes)', type: 'number', required: true, min: 15 },
      { name: 'discount', label: 'Discount (%)', type: 'number', min: 0 },
      { name: 'includes', label: 'Includes (comma-separated)', type: 'text', placeholder: 'Snacks, Drinks' },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    adminLogout();
  };

  if (!isAdminPanelOpen) return null;

  if (!isAdminLoggedIn) {
    return <AdminLoginModal />;
  }

  return (
    <Dialog open={isAdminPanelOpen} onOpenChange={closeAdminPanel}>
      <DialogContent className="cyber-card border-neon-purple/50 max-w-6xl max-h-[90vh] p-0">
        <DialogTitle className="sr-only">Admin Panel</DialogTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Monitor className="w-6 h-6 text-neon-cyan" />
              <h2 className="font-display text-xl neon-text-cyan">Admin Panel</h2>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan">
                {adminUser?.username}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </Button>
              <Button variant="ghost" size="sm" onClick={closeAdminPanel} className="text-gray-400">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={adminTab} onValueChange={(v) => setAdminTab(v as typeof adminTab)} className="h-full">
              <div className="px-4 pt-4 border-b border-white/10">
                <TabsList className="bg-white/5 flex flex-wrap gap-1 h-auto p-1">
                  <TabsTrigger value="bookings" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                    <Calendar className="w-4 h-4 mr-1" /> Bookings
                  </TabsTrigger>
                  <TabsTrigger value="consoles" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                    <Monitor className="w-4 h-4 mr-1" /> Consoles
                  </TabsTrigger>
                  <TabsTrigger value="games" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                    <Gamepad2 className="w-4 h-4 mr-1" /> Games
                  </TabsTrigger>
                  <TabsTrigger value="events" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                    <Calendar className="w-4 h-4 mr-1" /> Events
                  </TabsTrigger>
                  <TabsTrigger value="announcements" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                    <Bell className="w-4 h-4 mr-1" /> Announcements
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                    <DollarSign className="w-4 h-4 mr-1" /> Pricing
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="h-[calc(90vh-180px)]">
                <div className="p-4">
                  {/* Bookings Tab */}
                  <TabsContent value="bookings" className="mt-0">
                    <Card className="cyber-card">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-white font-display">Recent Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
                          </div>
                        ) : bookings.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No bookings found</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-white/10 text-left">
                                  <th className="p-2 text-gray-400">Customer</th>
                                  <th className="p-2 text-gray-400">Console</th>
                                  <th className="p-2 text-gray-400">Date</th>
                                  <th className="p-2 text-gray-400">Time</th>
                                  <th className="p-2 text-gray-400">Amount</th>
                                  <th className="p-2 text-gray-400">Status</th>
                                  <th className="p-2 text-gray-400">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bookings.map((booking) => (
                                  <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-2">
                                      <div className="text-white">{booking.customerName}</div>
                                      <div className="text-gray-500 text-xs">{booking.customerPhone}</div>
                                    </td>
                                    <td className="p-2 text-white">{booking.console.name}</td>
                                    <td className="p-2 text-gray-300">{booking.date}</td>
                                    <td className="p-2 text-gray-300">{booking.startTime} - {booking.endTime}</td>
                                    <td className="p-2 text-neon-cyan font-bold">₹{booking.totalPrice}</td>
                                    <td className="p-2">
                                      <Badge className={cn(
                                        booking.status === 'pending' && 'bg-yellow-500/20 text-yellow-400',
                                        booking.status === 'confirmed' && 'bg-neon-cyan/20 text-neon-cyan',
                                        booking.status === 'completed' && 'bg-green-500/20 text-green-400',
                                        booking.status === 'cancelled' && 'bg-red-500/20 text-red-400',
                                      )}>
                                        {booking.status}
                                      </Badge>
                                    </td>
                                    <td className="p-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDelete('booking', booking.id)}
                                        className="text-red-400 hover:bg-red-500/10"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Consoles Tab */}
                  <TabsContent value="consoles" className="mt-0">
                    <Card className="cyber-card">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-white font-display">Manage Consoles</CardTitle>
                        <Button
                          onClick={() => openForm('console')}
                          className="btn-neon bg-neon-cyan text-black font-display"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add Console
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-neon-cyan" /></div>
                        ) : consoles.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No consoles found</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {consoles.map((console) => (
                              <div key={console.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-neon-cyan/30 transition-all">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-display font-bold text-white">{console.name}</h4>
                                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{console.description}</p>
                                    <div className="text-neon-cyan font-bold mt-2">₹{console.pricePerHour}/hr</div>
                                  </div>
                                  <Badge className={console.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                    {console.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                <div className="flex gap-2 mt-4">
                                  <Button size="sm" variant="outline" onClick={() => openForm('console', console as unknown as Record<string, unknown>)} className="border-white/20 text-gray-300">Edit</Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleDelete('console', console.id)} className="text-red-400">Delete</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Games Tab */}
                  <TabsContent value="games" className="mt-0">
                    <Card className="cyber-card">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-white font-display">Manage Games</CardTitle>
                        <Button onClick={() => openForm('game')} className="btn-neon bg-neon-cyan text-black font-display">
                          <Plus className="w-4 h-4 mr-2" /> Add Game
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-neon-cyan" /></div>
                        ) : games.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No games found</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {games.map((game) => (
                              <div key={game.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-neon-purple/30 transition-all">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-display font-bold text-white">{game.title}</h4>
                                    <div className="flex gap-2 mt-1">
                                      <Badge className="bg-neon-purple/20 text-neon-purple">{game.genre}</Badge>
                                      {game.rating && <span className="text-yellow-400 text-sm">★ {game.rating}</span>}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    {game.isFeatured && <Badge className="bg-neon-cyan/20 text-neon-cyan text-xs">Featured</Badge>}
                                    {game.isPopular && <Badge className="bg-pink-500/20 text-pink-400 text-xs">Popular</Badge>}
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                  <Button size="sm" variant="outline" onClick={() => openForm('game', game as unknown as Record<string, unknown>)} className="border-white/20 text-gray-300">Edit</Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleDelete('game', game.id)} className="text-red-400">Delete</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Events Tab */}
                  <TabsContent value="events" className="mt-0">
                    <Card className="cyber-card">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-white font-display">Manage Events</CardTitle>
                        <Button onClick={() => openForm('event')} className="btn-neon bg-neon-cyan text-black font-display">
                          <Plus className="w-4 h-4 mr-2" /> Add Event
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-neon-cyan" /></div>
                        ) : events.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No events found</p>
                        ) : (
                          <div className="space-y-4">
                            {events.map((event) => (
                              <div key={event.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-pink-500/30 transition-all">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-display font-bold text-white">{event.title}</h4>
                                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                                      <span>📅 {event.date} at {event.time}</span>
                                      {event.prize && <span>🏆 {event.prize}</span>}
                                      <span>👥 {event.currentPlayers}/{event.maxPlayers || '∞'}</span>
                                      <span className="text-neon-cyan font-bold">₹{event.price}</span>
                                    </div>
                                  </div>
                                  <Badge className={cn(
                                    event.status === 'upcoming' && 'bg-neon-cyan/20 text-neon-cyan',
                                    event.status === 'ongoing' && 'bg-green-500/20 text-green-400',
                                    event.status === 'completed' && 'bg-gray-500/20 text-gray-400',
                                    event.status === 'cancelled' && 'bg-red-500/20 text-red-400',
                                  )}>
                                    {event.status}
                                  </Badge>
                                </div>
                                <div className="flex gap-2 mt-4">
                                  <Button size="sm" variant="outline" onClick={() => openForm('event', event as unknown as Record<string, unknown>)} className="border-white/20 text-gray-300">Edit</Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleDelete('event', event.id)} className="text-red-400">Delete</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Announcements Tab */}
                  <TabsContent value="announcements" className="mt-0">
                    <Card className="cyber-card">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-white font-display">Manage Announcements</CardTitle>
                        <Button onClick={() => openForm('announcement')} className="btn-neon bg-neon-cyan text-black font-display">
                          <Plus className="w-4 h-4 mr-2" /> Add
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-neon-cyan" /></div>
                        ) : announcements.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No announcements found</p>
                        ) : (
                          <div className="space-y-4">
                            {announcements.map((announcement) => (
                              <div key={announcement.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-neon-cyan/30 transition-all">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-display font-bold text-white">{announcement.title}</h4>
                                    <p className="text-gray-400 text-sm mt-1">{announcement.content}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge className={cn(
                                      announcement.type === 'offer' && 'bg-green-500/20 text-green-400',
                                      announcement.type === 'tournament' && 'bg-neon-cyan/20 text-neon-cyan',
                                      announcement.type === 'info' && 'bg-neon-purple/20 text-neon-purple',
                                    )}>
                                      {announcement.type}
                                    </Badge>
                                    <Badge className={announcement.isActive ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-gray-500/20 text-gray-400'}>
                                      {announcement.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                  <Button size="sm" variant="outline" onClick={() => openForm('announcement', announcement as unknown as Record<string, unknown>)} className="border-white/20 text-gray-300">Edit</Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleDelete('announcement', announcement.id)} className="text-red-400">Delete</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Pricing Tab */}
                  <TabsContent value="pricing" className="mt-0">
                    <Card className="cyber-card">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-white font-display">Manage Pricing Packages</CardTitle>
                        <Button onClick={() => openForm('pricing')} className="btn-neon bg-neon-cyan text-black font-display">
                          <Plus className="w-4 h-4 mr-2" /> Add Package
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-neon-cyan" /></div>
                        ) : pricing.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No pricing packages found</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pricing.map((pkg) => (
                              <div key={pkg.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-neon-cyan/30 transition-all">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-display font-bold text-white">{pkg.name}</h4>
                                    <Badge className="bg-neon-purple/20 text-neon-purple mt-1">{pkg.consoleType}</Badge>
                                    <div className="text-neon-cyan font-bold mt-2">₹{pkg.price} <span className="text-gray-400 text-sm font-normal">/ {pkg.duration} min</span></div>
                                    {pkg.discount && <div className="text-green-400 text-sm mt-1">{pkg.discount}% OFF</div>}
                                  </div>
                                  <Badge className={pkg.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                    {pkg.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                <div className="flex gap-2 mt-4">
                                  <Button size="sm" variant="outline" onClick={() => openForm('pricing', pkg as unknown as Record<string, unknown>)} className="border-white/20 text-gray-300">Edit</Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleDelete('pricing', pkg.id)} className="text-red-400">Delete</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </div>
        </div>

        <FormDialog
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditingItem(null); }}
          onSave={handleSave}
          title={editingItem ? `Edit ${formType}` : `Add ${formType}`}
          fields={formFields[formType]}
          initialData={editingItem}
          isLoading={isSaving}
        />
      </DialogContent>
    </Dialog>
  );
}
