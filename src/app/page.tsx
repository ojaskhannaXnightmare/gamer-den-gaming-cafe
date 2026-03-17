'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  Gamepad2, Monitor, Vibrate, Projector, ChevronLeft, ChevronRight, 
  Clock, Users, Zap, Trophy, Calendar, MapPin, Phone, Mail, 
  MessageCircle, Play, Star, ArrowRight, Menu, X, ExternalLink,
  Gamepad, Sparkles, Target, Gift, Bell, ChevronDown, User, LogIn,
  LogOut, UserCircle, Award, TrendingUp, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBookingStore, useAuthStore, useAdminStore, User as UserType } from '@/lib/store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Dynamic import for AdminPanel to avoid SSR issues
const AdminPanel = dynamic(() => import('@/components/AdminPanel'), { ssr: false });

// Types
interface Console {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pricePerHour: number;
  features: string | null;
  image?: string | null;
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

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
}

interface Event {
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

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface UserBooking {
  id: string;
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

// Auth Modal Component
function AuthModal() {
  const { isAuthModalOpen, authMode, closeAuthModal, toggleAuthMode, setUser } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      setUser(data.user);
      closeAuthModal();
      setUsername('');
      setPassword('');
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={closeAuthModal}>
      <DialogContent className="cyber-card border-neon-purple/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">
            <span className="neon-text-cyan">{authMode === 'login' ? 'Login' : 'Sign Up'}</span>
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
              placeholder="Enter username"
              className="bg-white/5 border-neon-purple/30 text-white placeholder:text-gray-500"
              required
              minLength={3}
            />
          </div>
          
          <div>
            <Label className="text-gray-400 mb-2 block">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="bg-white/5 border-neon-purple/30 text-white placeholder:text-gray-500"
              required
              minLength={4}
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full btn-neon bg-neon-cyan text-black font-display uppercase"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              authMode === 'login' ? 'Login' : 'Create Account'
            )}
          </Button>
          
          <div className="text-center text-gray-400 text-sm">
            {authMode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-neon-cyan hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-neon-cyan hover:underline"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Navbar with Auth
function Navbar() {
  const { user, openAuthModal, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const sections = ['home', 'consoles', 'games', 'booking', 'events', 'pricing', 'profile', 'about', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    setShowUserMenu(false);
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'consoles', label: 'Consoles' },
    { id: 'games', label: 'Games' },
    { id: 'booking', label: 'Book Now' },
    { id: 'events', label: 'Events' },
    { id: 'pricing', label: 'Pricing' },
    ...(user ? [{ id: 'profile', label: 'Profile' }] : []),
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-background/95 backdrop-blur-lg border-b border-neon-purple/30 shadow-lg shadow-neon-purple/10' 
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => scrollToSection('home')}
          >
            <Gamepad2 className="w-8 h-8 text-neon-cyan" />
            <span className="font-display font-bold text-xl md:text-2xl neon-text-cyan">
              Gamer's Den
            </span>
          </motion.div>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  'px-4 py-2 rounded-lg font-display text-sm uppercase tracking-wider transition-all duration-300',
                  activeSection === item.id
                    ? 'text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-purple/20 border border-neon-purple/50 text-white hover:bg-neon-purple/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <UserCircle className="w-5 h-5 text-neon-cyan" />
                  <span className="font-display">{user.username}</span>
                </motion.button>
                
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 cyber-card rounded-lg border border-neon-purple/30 overflow-hidden"
                    >
                      <button
                        onClick={() => { scrollToSection('profile'); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-neon-cyan/10 hover:text-neon-cyan transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors border-t border-white/10"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => openAuthModal('login')}
                  className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 font-display"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button
                  onClick={() => openAuthModal('signup')}
                  className="btn-neon bg-neon-cyan text-black font-display"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/95 backdrop-blur-lg border-b border-neon-purple/30"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    'block w-full text-left px-4 py-3 rounded-lg font-display text-sm uppercase tracking-wider transition-all',
                    activeSection === item.id
                      ? 'text-neon-cyan bg-neon-cyan/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  )}
                >
                  {item.label}
                </button>
              ))}
              {user ? (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => { openAuthModal('login'); setIsMobileMenuOpen(false); }}
                    variant="outline"
                    className="flex-1 border-neon-cyan/50 text-neon-cyan"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => { openAuthModal('signup'); setIsMobileMenuOpen(false); }}
                    className="flex-1 bg-neon-cyan text-black"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// Hero Section
function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    { image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1920' },
    { image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=1920' },
    { image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section id="home" className="relative h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: currentSlide === index ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        </motion.div>
      ))}

      <div className="absolute inset-0 hero-overlay" />
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <div className="relative h-full flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-purple/20 border border-neon-purple/50 mb-4"
          >
            <Sparkles className="w-4 h-4 text-neon-purple" />
            <span className="text-sm font-medium text-neon-purple">Crafted by Nightmare Studios</span>
          </motion.div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-wider">
            <span className="neon-text-cyan">Gamer's</span>
            <span className="text-white mx-2">Den</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto font-light"
          >
            Exceptional Gaming Experience on{' '}
            <span className="text-neon-cyan font-semibold">PS5</span>,{' '}
            <span className="text-neon-purple font-semibold">PS4</span>,{' '}
            <span className="text-neon-pink font-semibold">VR</span> & More
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <Button
              size="lg"
              className="btn-neon bg-neon-cyan text-black font-display font-bold uppercase text-lg px-8 py-6 rounded-lg"
              onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              Book Your Slot Now
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-wrap justify-center gap-8 mt-12"
          >
            {[
              { value: '50+', label: 'Games' },
              { value: '4', label: 'Console Types' },
              { value: '1000+', label: 'Happy Gamers' },
              { value: '24/7', label: 'Support' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-bold neon-text-cyan">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown className="w-8 h-8 text-neon-cyan/50" />
      </motion.div>
    </section>
  );
}

// Profile Section
function ProfileSection() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch('/api/user/bookings')
        .then(res => res.json())
        .then(data => {
          setBookings(data.bookings || []);
          setIsLoading(false);
        })
        .catch(console.error);
    }
  }, [user]);

  if (!user) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'confirmed': 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30',
      'completed': 'bg-neon-green/20 text-neon-green border-neon-green/30',
      'cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <section id="profile" className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50">
            Your Profile
          </Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className="text-white">Welcome back, </span>
            <span className="neon-text-cyan">{user.username}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* User Stats Card */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                <UserCircle className="w-10 h-10 text-neon-cyan" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">{user.username}</h3>
                <p className="text-gray-400 text-sm">Member since {user.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-neon-purple" />
                  <span className="text-gray-300">Points</span>
                </div>
                <span className="font-display font-bold text-neon-purple">{user.points}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon-green" />
                  <span className="text-gray-300">Total Spent</span>
                </div>
                <span className="font-display font-bold text-neon-green">₹{user.totalSpent}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-neon-cyan" />
                  <span className="text-gray-300">Total Bookings</span>
                </div>
                <span className="font-display font-bold text-neon-cyan">{bookings.length}</span>
              </div>
            </div>
          </Card>

          {/* Booking History */}
          <div className="lg:col-span-2">
            <Card className="cyber-card p-6">
              <h3 className="font-display text-xl font-bold text-white mb-4">Booking History</h3>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse h-20 bg-white/5 rounded-lg" />
                  ))}
                </div>
              ) : bookings.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-3 pr-2">
                    {bookings.map((booking) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-neon-cyan/30 transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-neon-cyan" />
                            <span className="font-display font-bold text-white">{booking.console.name}</span>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {booking.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.startTime} - {booking.endTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {booking.players} Players
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-neon-cyan">₹{booking.totalPrice}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No bookings yet</p>
                  <Button
                    onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                    className="mt-4 btn-neon bg-neon-cyan text-black font-display"
                  >
                    Book Your First Session
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// Announcements Ticker
function AnnouncementsTicker({ announcements }: { announcements: Announcement[] }) {
  return (
    <div className="bg-gradient-to-r from-neon-purple/20 via-neon-cyan/20 to-neon-purple/20 border-y border-neon-purple/30 py-3 overflow-hidden">
      <div className="ticker-scroll flex gap-8 whitespace-nowrap">
        {[...announcements, ...announcements].map((announcement, index) => (
          <div key={index} className="flex items-center gap-2 px-4">
            {announcement.type === 'offer' && <Gift className="w-4 h-4 text-neon-green" />}
            {announcement.type === 'tournament' && <Trophy className="w-4 h-4 text-neon-cyan" />}
            {announcement.type === 'info' && <Bell className="w-4 h-4 text-neon-purple" />}
            <span className="text-white font-medium">{announcement.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Page Component
export default function GamersDenPage() {
  const { user, setUser, setLoading } = useAuthStore();
  const [data, setData] = useState<{
    consoles: Console[];
    games: Game[];
    announcements: Announcement[];
    events: Event[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const [sessionRes, homeRes] = await Promise.all([
          fetch('/api/auth/session'),
          fetch('/api/home')
        ]);
        
        const sessionData = await sessionRes.json();
        const homeData = await homeRes.json();
        
        if (sessionData.user) {
          setUser(sessionData.user);
        }
        
        setData(homeData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };
    
    checkSession();
  }, [setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Gamepad2 className="w-16 h-16 text-neon-cyan" />
          </motion.div>
          <h2 className="font-display text-2xl neon-text-cyan">Loading...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <AuthModal />
      <main className="flex-1">
        <HeroSection />
        {data?.announcements && <AnnouncementsTicker announcements={data.announcements} />}
        <ProfileSection />
        {data?.consoles && <ConsolesSection consoles={data.consoles} />}
        {data?.games && <GamesSection games={data.games} />}
        {data?.consoles && <BookingSection consoles={data.consoles} />}
        {data?.events && <EventsSection events={data.events} />}
        <PricingSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      <AdminPanel />
    </div>
  );
}

// Additional components (keeping the same implementation from original)
function ConsolesSection({ consoles }: { consoles: Console[] }) {
  const consoleIcons: Record<string, React.ReactNode> = {
    'ps5': <Monitor className="w-8 h-8" />,
    'ps4': <Gamepad className="w-8 h-8" />,
    'vr': <Vibrate className="w-8 h-8" />,
    'projector': <Projector className="w-8 h-8" />,
  };

  return (
    <section id="consoles" className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-neon-purple/20 text-neon-purple border-neon-purple/50">Our Equipment</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className="text-white">Choose Your </span>
            <span className="neon-text-cyan">Console</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {consoles.map((console, index) => {
            const features = console.features ? JSON.parse(console.features) : [];
            return (
              <motion.div
                key={console.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className="cyber-card h-full overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,240,255,0.2)]">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 bg-neon-cyan/20 text-neon-cyan">
                      {consoleIcons[console.slug] || <Monitor className="w-8 h-8" />}
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2 text-white">{console.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{console.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {features.map((feature: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-neon-cyan/10 text-neon-cyan">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-end justify-between pt-4 border-t border-white/10">
                      <div>
                        <span className="text-gray-400 text-xs">Starting from</span>
                        <div className="font-display text-2xl font-bold text-neon-cyan">
                          ₹{console.pricePerHour}<span className="text-sm text-gray-400">/hr</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="btn-neon bg-neon-cyan text-black font-display uppercase"
                        onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GamesSection({ games }: { games: Game[] }) {
  const [selectedGenre, setSelectedGenre] = useState('all');
  const carouselRef = useRef<HTMLDivElement>(null);
  const genres = ['all', 'Action', 'Racing', 'Sports', 'Fighting', 'Adventure'];
  
  const filteredGames = selectedGenre === 'all' ? games : games.filter(g => g.genre.toLowerCase() === selectedGenre.toLowerCase());

  return (
    <section id="games" className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-b from-background via-cyber-dark to-background">
      <div className="container mx-auto px-4 relative">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <Badge className="mb-4 bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50">Game Library</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className="text-white">Featured </span>
            <span className="neon-text-purple">Games</span>
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {genres.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGenre(genre)}
              className={cn(
                'font-display uppercase text-xs tracking-wider',
                selectedGenre === genre ? 'bg-neon-cyan text-black' : 'border-white/20 text-gray-300'
              )}
            >
              {genre}
            </Button>
          ))}
        </div>

        <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 w-72"
            >
              <Card className="cyber-card overflow-hidden cursor-pointer h-full">
                <div className="relative h-40 bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20">
                  {game.image ? (
                    <img 
                      src={game.image} 
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Gamepad2 className="w-16 h-16 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  {game.rating && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold text-white">{game.rating}</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-display font-bold text-white truncate">{game.title}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{game.description || 'Amazing gaming experience!'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge className="bg-neon-cyan/20 text-neon-cyan">{game.genre}</Badge>
                    {game.consoleType && (
                      <span className="text-xs text-gray-500">{game.consoleType}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BookingSection({ consoles }: { consoles: Console[] }) {
  const { user } = useAuthStore();
  const {
    selectedConsole, selectedDate, selectedSlot, duration, players, step,
    customerName, customerPhone, customerEmail,
    setConsole, setDate, setSlot, setDuration, setPlayers,
    setStep, setCustomerInfo, reset, nextStep, prevStep
  } = useBookingStore();

  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    if (selectedConsole && selectedDate) {
      fetch(`/api/slots?consoleId=${selectedConsole}&date=${format(selectedDate, 'yyyy-MM-dd')}`)
        .then(res => res.json())
        .then(data => setAvailableSlots(data.slots || []))
        .catch(console.error);
    }
  }, [selectedConsole, selectedDate]);

  const selectedConsoleData = consoles.find(c => c.id === selectedConsole);
  const totalPrice = selectedConsoleData ? (selectedConsoleData.pricePerHour / 60) * duration * players : 0;

  const handleSubmit = async () => {
    if (!selectedConsole || !selectedDate || !selectedSlot || !customerName || !customerPhone) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consoleId: selectedConsole,
          slotId: selectedSlot,
          customerName,
          customerPhone,
          customerEmail,
          date: format(selectedDate, 'yyyy-MM-dd'),
          duration,
          players,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setBookingId(data.booking.id);
        setBookingComplete(true);
      }
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 'console', label: 'Console', icon: <Monitor className="w-4 h-4" /> },
    { id: 'datetime', label: 'Date & Time', icon: <Calendar className="w-4 h-4" /> },
    { id: 'details', label: 'Details', icon: <Users className="w-4 h-4" /> },
    { id: 'payment', label: 'Payment', icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <section id="booking" className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="container mx-auto px-4 relative">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <Badge className="mb-4 bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50">Book Your Session</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className="text-white">Reserve Your </span>
            <span className="neon-text-cyan">Gaming Spot</span>
          </h2>
          {!user && (
            <p className="text-neon-purple mt-2">
              <button onClick={() => useAuthStore.getState().openAuthModal('login')} className="underline hover:text-neon-cyan">
                Login
              </button>
              {' '}to track your bookings!
            </p>
          )}
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card className="cyber-card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              {steps.map((s, index) => (
                <div key={s.id} className="flex items-center">
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                    step === s.id ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50' :
                    steps.findIndex(st => st.id === step) > index ? 'bg-neon-green/10 text-neon-green' : 'text-gray-500'
                  )}>
                    {s.icon}
                    <span className="font-display text-sm uppercase hidden sm:block">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <CardContent className="p-6">
              {step === 'console' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h3 className="font-display text-xl font-bold text-white mb-4">Select Your Console</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {consoles.map((console) => (
                      <motion.button
                        key={console.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setConsole(console.id)}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all text-left',
                          selectedConsole === console.id
                            ? 'border-neon-cyan bg-neon-cyan/10 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                            : 'border-white/10 hover:border-neon-cyan/50 bg-white/5'
                        )}
                      >
                        <Monitor className="w-8 h-8 text-neon-cyan mb-2" />
                        <div className="font-display font-bold text-white">{console.name}</div>
                        <div className="text-neon-cyan font-bold">₹{console.pricePerHour}/hr</div>
                      </motion.button>
                    ))}
                  </div>

                  {selectedConsole && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div>
                        <Label className="text-gray-400 mb-2 block">Duration</Label>
                        <div className="flex gap-2">
                          {[60, 120, 180, 240].map((d) => (
                            <Button key={d} variant={duration === d ? 'default' : 'outline'} onClick={() => setDuration(d)}
                              className={cn('flex-1 font-display', duration === d ? 'bg-neon-cyan text-black' : 'border-white/20 text-gray-300')}>
                              {d >= 60 ? `${d / 60}h` : `${d}m`}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-400 mb-2 block">Players</Label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map((p) => (
                            <Button key={p} variant={players === p ? 'default' : 'outline'} onClick={() => setPlayers(p)}
                              className={cn('flex-1 font-display', players === p ? 'bg-neon-purple text-white' : 'border-white/20 text-gray-300')}>
                              {p}P
                            </Button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button onClick={nextStep} disabled={!selectedConsole} className="btn-neon bg-neon-cyan text-black font-display uppercase">
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 'datetime' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h3 className="font-display text-xl font-bold text-white mb-4">Select Date & Time</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="cyber-card rounded-xl p-4 border border-neon-purple/30">
                      <CalendarComponent mode="single" selected={selectedDate ?? undefined} onSelect={(date) => date && setDate(date)}
                        disabled={(date) => date < new Date()} className="bg-transparent text-white" />
                    </div>
                    <div>
                      <Label className="text-gray-400 mb-2 block">Available Time Slots</Label>
                      <ScrollArea className="h-64">
                        <div className="grid grid-cols-3 gap-2 pr-2">
                          {availableSlots.length > 0 ? availableSlots.map((slot) => (
                            <Button key={slot.id} variant={selectedSlot === slot.id ? 'default' : 'outline'}
                              onClick={() => setSlot(slot.id)}
                              className={cn('font-mono text-sm', selectedSlot === slot.id ? 'bg-neon-cyan text-black' : 'border-neon-purple/30 text-gray-300')}>
                              {slot.startTime}
                            </Button>
                          )) : <div className="col-span-3 text-center text-gray-500 py-8">{selectedDate ? 'No slots available' : 'Select a date first'}</div>}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep} className="border-white/20 text-gray-300">
                      <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button onClick={nextStep} disabled={!selectedDate || !selectedSlot} className="btn-neon bg-neon-cyan text-black font-display uppercase">
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 'details' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h3 className="font-display text-xl font-bold text-white mb-4">Your Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 mb-2 block">Full Name *</Label>
                      <Input value={customerName} onChange={(e) => setCustomerInfo(e.target.value, customerPhone, customerEmail)}
                        placeholder="Enter your name" className="bg-white/5 border-neon-purple/30 text-white" />
                    </div>
                    <div>
                      <Label className="text-gray-400 mb-2 block">Phone Number *</Label>
                      <Input value={customerPhone} onChange={(e) => setCustomerInfo(customerName, e.target.value, customerEmail)}
                        placeholder="Enter your phone" className="bg-white/5 border-neon-purple/30 text-white" />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-gray-400 mb-2 block">Email (Optional)</Label>
                      <Input type="email" value={customerEmail} onChange={(e) => setCustomerInfo(customerName, customerPhone, e.target.value)}
                        placeholder="Enter your email" className="bg-white/5 border-neon-purple/30 text-white" />
                    </div>
                  </div>
                  
                  <div className="cyber-card rounded-xl p-4 border border-neon-cyan/30 mt-6">
                    <h4 className="font-display font-bold text-white mb-3">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-400">Console:</span><span className="text-white">{selectedConsoleData?.name}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Date:</span><span className="text-white">{selectedDate ? format(selectedDate, 'PPP') : '-'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Duration:</span><span className="text-white">{duration / 60} hours</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Players:</span><span className="text-white">{players}</span></div>
                      <div className="flex justify-between pt-2 border-t border-white/10"><span className="text-gray-400">Total:</span><span className="text-neon-cyan font-bold text-lg">₹{totalPrice.toFixed(0)}</span></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep} className="border-white/20 text-gray-300"><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
                    <Button onClick={nextStep} disabled={!customerName || !customerPhone} className="btn-neon bg-neon-cyan text-black font-display uppercase">
                      Continue to Payment <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h3 className="font-display text-xl font-bold text-white mb-4">Payment Method</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['UPI', 'Paytm', 'Cash', 'Card'].map((method) => (
                      <Button key={method} variant="outline" className="h-20 border-neon-purple/30 text-gray-300 hover:border-neon-cyan flex flex-col gap-1"
                        onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <div className="w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" /> : <><Zap className="w-5 h-5" /><span className="text-xs">{method}</span></>}
                      </Button>
                    ))}
                  </div>
                  <div className="text-center text-gray-400 text-sm">Pay at the venue or use online payment</div>
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep} className="border-white/20 text-gray-300"><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
                  </div>
                </motion.div>
              )}

              {bookingComplete && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-10 h-10 text-neon-green fill-neon-green" />
                  </motion.div>
                  <h3 className="font-display text-2xl font-bold neon-text-cyan mb-2">Your Den Awaits...</h3>
                  <p className="text-gray-400 mb-4">Booking confirmed! Your gaming session has been reserved.</p>
                  <Badge className="bg-neon-purple/20 text-neon-purple text-lg px-4 py-2">Booking ID: {bookingId.slice(0, 8).toUpperCase()}</Badge>
                  <Button onClick={() => { reset(); setBookingComplete(false); }} className="mt-6 btn-neon bg-neon-cyan text-black font-display">Book Another Session</Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// Event Registration Modal Component
function EventRegistrationModal({ 
  event, 
  isOpen, 
  onClose 
}: { 
  event: Event | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const { user } = useAuthStore();
  const [playerName, setPlayerName] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [upiConfig, setUpiConfig] = useState<{ upiId: string; businessName: string }>({ upiId: '', businessName: '' });

  // Fetch UPI config
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setUpiConfig(data))
      .catch(console.error);
  }, []);

  // Pre-fill user details
  useEffect(() => {
    if (user && isOpen) {
      setPlayerName(user.username);
      setPlayerPhone(user.phone || '');
      setPlayerEmail(user.email || '');
    }
  }, [user, isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRegistrationComplete(false);
      setSelectedPaymentMethod(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!event || !isOpen) return null;

  const handlePayment = (method: string, upiLink?: string) => {
    setSelectedPaymentMethod(method);
    setIsSubmitting(true);

    if (upiLink) {
      // Open UPI app in new window/tab - this triggers the deep link
      const link = document.createElement('a');
      link.href = upiLink;
      link.click();
    }

    // Submit registration after a short delay
    setTimeout(() => {
      fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          userId: user?.id,
          playerName,
          playerPhone,
          playerEmail,
          paymentMethod: method,
          transactionId: `EVT${Date.now().toString(36).toUpperCase()}`,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setRegistrationComplete(true);
          } else {
            alert(data.error || 'Registration failed');
          }
        })
        .catch(console.error)
        .finally(() => setIsSubmitting(false));
    }, upiLink ? 1500 : 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="cyber-card border-neon-pink/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">
            <span className="neon-text-pink">Event Registration</span>
          </DialogTitle>
        </DialogHeader>

        {registrationComplete ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="text-center py-6"
          >
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Trophy className="w-10 h-10 text-neon-green" />
            </motion.div>
            <h3 className="font-display text-xl font-bold neon-text-cyan mb-2">Registered!</h3>
            <p className="text-gray-400 mb-4">You've successfully registered for {event.title}</p>
            <Badge className="bg-neon-pink/20 text-neon-pink text-lg px-4 py-2">
              {event.title}
            </Badge>
            <Button onClick={onClose} className="mt-6 btn-neon bg-neon-cyan text-black font-display">
              Done
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Event Summary */}
            <div className="p-4 bg-white/5 rounded-lg border border-neon-pink/30">
              <h4 className="font-display font-bold text-white">{event.title}</h4>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{event.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{event.time}</span>
              </div>
              {event.prize && <Badge className="mt-2 bg-neon-green/20 text-neon-green">{event.prize}</Badge>}
              <div className="mt-3 text-xl font-bold text-neon-cyan">₹{event.price}</div>
            </div>

            {/* Player Details */}
            <div className="space-y-3">
              <div>
                <Label className="text-gray-400 mb-1 block">Player Name *</Label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name"
                  className="bg-white/5 border-neon-purple/30 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-400 mb-1 block">Phone Number *</Label>
                <Input
                  value={playerPhone}
                  onChange={(e) => setPlayerPhone(e.target.value)}
                  placeholder="Your phone"
                  className="bg-white/5 border-neon-purple/30 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-400 mb-1 block">Email (Optional)</Label>
                <Input
                  type="email"
                  value={playerEmail}
                  onChange={(e) => setPlayerEmail(e.target.value)}
                  placeholder="Your email"
                  className="bg-white/5 border-neon-purple/30 text-white"
                />
              </div>
            </div>

            {/* UPI Payment Options */}
            {event.price > 0 && (
              <>
                <div className="text-gray-400 text-sm uppercase tracking-wider">Pay with UPI App</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'gpay', name: 'Google Pay', deepLink: (upiId: string, amount: number, txn: string, name: string) => 
                      `gpay://upi/pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tr=${txn}&tn=${encodeURIComponent('Event Registration')}&cu=INR` },
                    { id: 'phonepe', name: 'PhonePe', deepLink: (upiId: string, amount: number, txn: string, name: string) => 
                      `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tr=${txn}&tn=${encodeURIComponent('Event Registration')}&cu=INR` },
                    { id: 'paytm', name: 'Paytm', deepLink: (upiId: string, amount: number, txn: string, name: string) => 
                      `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tr=${txn}&tn=${encodeURIComponent('Event Registration')}&cu=INR` },
                    { id: 'bhim', name: 'BHIM UPI', deepLink: (upiId: string, amount: number, txn: string, name: string) => 
                      `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tr=${txn}&tn=${encodeURIComponent('Event Registration')}&cu=INR` },
                  ].map((app) => {
                    const transactionRef = `EVT${Date.now().toString(36).toUpperCase()}`;
                    const appLink = app.deepLink(upiConfig.upiId, event.price, transactionRef, upiConfig.businessName);

                    return (
                      <motion.button
                        key={app.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePayment(app.id, appLink)}
                        disabled={isSubmitting || !playerName || !playerPhone}
                        className={cn(
                          'p-3 rounded-lg border border-white/10 bg-white/5 hover:border-neon-pink/50 transition-all text-center',
                          'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                      >
                        {isSubmitting && selectedPaymentMethod === app.id ? (
                          <div className="w-5 h-5 border-2 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                          <>
                            <div className="font-display font-bold text-white text-sm">{app.name}</div>
                            <div className="text-neon-cyan text-xs">₹{event.price}</div>
                          </>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-gray-500">Or pay at venue</span>
                  </div>
                </div>
              </>
            )}

            {/* Pay at Venue / Free Registration */}
            <Button
              onClick={() => handlePayment(event.price > 0 ? 'Cash' : 'Free')}
              disabled={isSubmitting || !playerName || !playerPhone}
              className="w-full btn-neon bg-neon-pink text-white font-display"
            >
              {isSubmitting && selectedPaymentMethod === 'Cash' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : event.price > 0 ? (
                <>Pay ₹{event.price} at Venue</>
              ) : (
                <>Register for Free</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EventsSection({ events }: { events: Event[] }) {
  const [timeLeft, setTimeLeft] = useState<Record<string, { days: number; hours: number; minutes: number; seconds: number }>>({});
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const newTimeLeft: Record<string, { days: number; hours: number; minutes: number; seconds: number }> = {};
      events.forEach((event) => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        const difference = eventDate.getTime() - Date.now();
        if (difference > 0) {
          newTimeLeft[event.id] = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          };
        }
      });
      setTimeLeft(newTimeLeft);
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [events]);

  const handleRegister = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <>
      <section id="events" className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-b from-background via-cyber-dark to-background">
        <div className="container mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge className="mb-4 bg-neon-pink/20 text-neon-pink border-neon-pink/50">Tournaments & Events</Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              <span className="text-white">Upcoming </span><span className="neon-text-pink">Events</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="cyber-card h-full overflow-hidden group hover:shadow-[0_0_30px_rgba(255,0,255,0.2)] transition-all duration-500">
                  <div className="relative h-40 bg-gradient-to-br from-neon-pink/20 to-neon-purple/20">
                    <div className="absolute inset-0 flex items-center justify-center"><Trophy className="w-16 h-16 text-neon-pink/30" /></div>
                    {event.prize && <Badge className="absolute top-2 right-2 bg-neon-green/90 text-black font-bold">{event.prize}</Badge>}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-display font-bold text-white text-lg group-hover:text-neon-pink transition-colors">{event.title}</h3>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">{event.description}</p>
                    {timeLeft[event.id] && (
                      <div className="flex gap-2 mt-4">
                        {Object.entries(timeLeft[event.id]).map(([unit, value]) => (
                          <div key={unit} className="flex-1 text-center">
                            <div className="bg-black/30 rounded-lg p-2">
                              <span className="font-display text-xl font-bold text-neon-cyan">{value.toString().padStart(2, '0')}</span>
                            </div>
                            <span className="text-xs text-gray-500 uppercase">{unit.charAt(0)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{event.date}</span></div>
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{event.time}</span></div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-1 text-gray-400"><Users className="w-4 h-4" /><span>{event.currentPlayers}/{event.maxPlayers || '∞'}</span></div>
                      <div className="flex items-center gap-2">
                        <span className="text-neon-cyan font-bold">₹{event.price}</span>
                        <Button 
                          size="sm" 
                          className="bg-neon-pink text-white font-display uppercase"
                          onClick={() => handleRegister(event)}
                          disabled={event.status !== 'upcoming' || (event.maxPlayers !== null && event.currentPlayers >= event.maxPlayers)}
                        >
                          {event.status !== 'upcoming' ? 'Closed' : 
                           (event.maxPlayers !== null && event.currentPlayers >= event.maxPlayers) ? 'Full' : 'Register'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <EventRegistrationModal 
        event={selectedEvent} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

function PricingSection() {
  const packages = [
    { name: 'Quick Play', console: 'PS4', price: 80, duration: '1 Hour', features: ['Single Player', 'Snacks Available'], popular: false },
    { name: 'PS5 Experience', console: 'PS5', price: 150, duration: '1 Hour', features: ['Next-Gen Gaming', 'Ray Tracing', 'DualSense'], popular: true },
    { name: 'Gaming Marathon', console: 'PS5', price: 400, duration: '3 Hours', features: ['Multiplayer', 'Free Snacks', 'Drinks'], popular: false, discount: '10% OFF' },
    { name: 'Party Pack', console: 'Projector', price: 800, duration: '3 Hours', features: ['Big Screen', '4 Players', 'Party Setup'], popular: false, discount: '15% OFF' },
    { name: 'VR Adventure', console: 'VR', price: 200, duration: '1 Hour', features: ['Immersive VR', 'Multiple Games'], popular: false },
    { name: 'Weekend Special', console: 'Any', price: 600, duration: '5 Hours', features: ['Extended Gaming', 'Unlimited Snacks'], popular: true, discount: '20% OFF' },
  ];

  return (
    <section id="pricing" className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="container mx-auto px-4 relative">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <Badge className="mb-4 bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50">Pricing Plans</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className="text-white">Choose Your </span><span className="neon-text-cyan">Plan</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <motion.div key={pkg.name} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className={pkg.popular ? 'lg:-mt-4 lg:mb-4' : ''}>
              {pkg.popular && <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 bg-neon-cyan text-black font-bold px-4 py-1">Most Popular</Badge>}
              <Card className={cn('cyber-card h-full', pkg.popular ? 'border-neon-cyan shadow-[0_0_30px_rgba(0,240,255,0.2)]' : '')}>
                <CardContent className="p-6">
                  {pkg.discount && <Badge className="absolute top-4 right-4 bg-neon-green/90 text-black font-bold">{pkg.discount}</Badge>}
                  <Badge className="bg-neon-purple/20 text-neon-purple mb-3">{pkg.console}</Badge>
                  <h3 className="font-display text-xl font-bold text-white mb-2">{pkg.name}</h3>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-3xl font-bold text-neon-cyan">₹{pkg.price}</span>
                    <span className="text-gray-400 text-sm mb-1">/ {pkg.duration}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-gray-300 text-sm"><Star className="w-4 h-4 text-neon-cyan" />{f}</li>)}
                  </ul>
                  <Button className={cn('w-full font-display uppercase', pkg.popular ? 'btn-neon bg-neon-cyan text-black' : 'bg-neon-purple/20 text-neon-purple border border-neon-purple/50')}
                    onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}>Book Now</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-b from-background via-cyber-dark to-background">
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Badge className="mb-4 bg-neon-purple/20 text-neon-purple border-neon-purple/50">About Us</Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              <span className="text-white">Welcome to </span><span className="neon-text-cyan">Gamer's Den</span>
            </h2>
            <p className="text-gray-400 text-lg mb-6">
              Founded in 2020, Gamer's Den is Lucknow's premier gaming destination. Experience the latest in gaming technology with PS5, PS4, VR, and big-screen projector gaming.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { icon: <Gamepad2 className="w-6 h-6" />, title: 'Premium Equipment', desc: 'Latest consoles' },
                { icon: <Users className="w-6 h-6" />, title: 'Multiplayer Setup', desc: 'Up to 4 players' },
                { icon: <Trophy className="w-6 h-6" />, title: 'Tournaments', desc: 'Monthly events' },
                { icon: <Clock className="w-6 h-6" />, title: 'Flexible Hours', desc: '7 days a week' },
              ].map((f, i) => (
                <div key={i} className="flex gap-3">
                  <div className="text-neon-cyan">{f.icon}</div>
                  <div><h4 className="font-display font-bold text-white">{f.title}</h4><p className="text-gray-400 text-sm">{f.desc}</p></div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
            {[
              { url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600', title: 'Gaming Zone' },
              { url: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600', title: 'VR Setup' },
              { url: 'https://images.unsplash.com/photo-1493711662062-fa541f7f70a3?w=600', title: 'PS5 Station' },
              { url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600', title: 'Tournament Area' },
            ].map((img, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} className={cn('relative overflow-hidden rounded-xl', i === 0 && 'col-span-2 aspect-video')}>
                <img src={img.url} alt={img.title} className="w-full h-full object-cover aspect-square" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute bottom-2 left-2 font-display text-sm text-white">{img.title}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contact" className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="container mx-auto px-4 relative">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <Badge className="mb-4 bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50">Contact Us</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className="text-white">Get in </span><span className="neon-text-cyan">Touch</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true}} className="space-y-6">
            <div className="relative h-64 rounded-xl overflow-hidden cyber-card">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 flex items-center justify-center">
                <div className="text-center"><MapPin className="w-12 h-12 text-neon-cyan mx-auto mb-2" /><p className="text-white font-display">Find Us on Map</p></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <MapPin className="w-5 h-5" />, title: 'Location', content: 'S-60/17, Block C, Rajajipuram, Lucknow' },
                { icon: <Phone className="w-5 h-5" />, title: 'Phone', content: '+91 98765 43210' },
                { icon: <Mail className="w-5 h-5" />, title: 'Email', content: 'hello@gamersden.com' },
                { icon: <Clock className="w-5 h-5" />, title: 'Hours', content: 'Mon-Sun: 10AM - 11PM' },
              ].map((item, i) => (
                <Card key={i} className="cyber-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-neon-cyan">{item.icon}</div>
                    <div><h4 className="font-display font-bold text-white">{item.title}</h4><p className="text-gray-400 text-sm">{item.content}</p></div>
                  </div>
                </Card>
              ))}
            </div>
            <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white font-display uppercase"
              onClick={() => window.open('https://wa.me/919876543210', '_blank')}>
              <MessageCircle className="w-5 h-5 mr-2" />Chat on WhatsApp
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card className="cyber-card p-6">
              <h3 className="font-display text-xl font-bold text-white mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-gray-400 mb-2 block">Name</Label><Input placeholder="Your name" className="bg-white/5 border-neon-purple/30 text-white" /></div>
                  <div><Label className="text-gray-400 mb-2 block">Phone</Label><Input placeholder="Your phone" className="bg-white/5 border-neon-purple/30 text-white" /></div>
                </div>
                <div><Label className="text-gray-400 mb-2 block">Email</Label><Input type="email" placeholder="Your email" className="bg-white/5 border-neon-purple/30 text-white" /></div>
                <div><Label className="text-gray-400 mb-2 block">Message</Label><textarea rows={4} placeholder="Your message..."
                  className="w-full bg-white/5 border border-neon-purple/30 rounded-md px-3 py-2 text-white focus:outline-none focus:border-neon-cyan" /></div>
                <Button className="w-full btn-neon bg-neon-cyan text-black font-display uppercase">Send Message</Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { openAdminPanel } = useAdminStore();
  
  return (
    <footer className="relative py-12 border-t border-neon-purple/30 bg-cyber-darker">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-8 h-8 text-neon-cyan" />
              <span className="font-display font-bold text-2xl neon-text-cyan">Gamer's Den</span>
            </div>
            <p className="text-gray-400 max-w-md mb-4">Lucknow's premier gaming destination. Experience next-gen gaming with PS5, PS4, VR, and projector setups.</p>
          </div>
          <div>
            <h4 className="font-display font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'Consoles', 'Games', 'Booking', 'Events'].map(link => (
                <li key={link}><a href={`#${link.toLowerCase()}`} className="text-gray-400 hover:text-neon-cyan transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-neon-cyan mt-1 flex-shrink-0" /><span>S-60/17, near Sparsh Diagnostic, Block C, Rajajipuram, Lucknow 226017</span></li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-neon-cyan" />+91 98765 43210</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-neon-cyan" />hello@gamersden.com</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2025 Gamer's Den. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={openAdminPanel}
              className="text-gray-600 hover:text-neon-cyan transition-colors p-1"
              title="Admin Panel"
            >
              <Shield className="w-4 h-4" />
            </button>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neon-purple" />Powered by <span className="text-neon-purple font-display font-bold">Nightmare Studios</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
