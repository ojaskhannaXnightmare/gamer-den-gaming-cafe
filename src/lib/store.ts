import { create } from 'zustand';

// User interface
export interface User {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  points: number;
  totalSpent: number;
  createdAt: string;
}

// Auth Store
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'signup';
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  toggleAuthMode: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthModalOpen: false,
  authMode: 'login',

  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  openAuthModal: (mode = 'login') => set({ isAuthModalOpen: true, authMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  toggleAuthMode: () => set((state) => ({ 
    authMode: state.authMode === 'login' ? 'signup' : 'login' 
  })),
  logout: () => set({ user: null }),
}));

export interface BookingState {
  selectedConsole: string | null;
  selectedDate: Date | null;
  selectedSlot: string | null;
  duration: number;
  players: number;
  step: 'console' | 'datetime' | 'details' | 'payment' | 'confirmation';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  
  // Actions
  setConsole: (consoleId: string) => void;
  setDate: (date: Date) => void;
  setSlot: (slotId: string) => void;
  setDuration: (duration: number) => void;
  setPlayers: (players: number) => void;
  setStep: (step: BookingState['step']) => void;
  setCustomerInfo: (name: string, phone: string, email: string) => void;
  reset: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedConsole: null,
  selectedDate: null,
  selectedSlot: null,
  duration: 60,
  players: 1,
  step: 'console',
  customerName: '',
  customerPhone: '',
  customerEmail: '',

  setConsole: (consoleId) => set({ selectedConsole: consoleId }),
  setDate: (date) => set({ selectedDate: date }),
  setSlot: (slotId) => set({ selectedSlot: slotId }),
  setDuration: (duration) => set({ duration }),
  setPlayers: (players) => set({ players }),
  setStep: (step) => set({ step }),
  setCustomerInfo: (name, phone, email) => set({ 
    customerName: name, 
    customerPhone: phone, 
    customerEmail: email 
  }),
  reset: () => set({
    selectedConsole: null,
    selectedDate: null,
    selectedSlot: null,
    duration: 60,
    players: 1,
    step: 'console',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
  }),
  nextStep: () => set((state) => {
    const steps: BookingState['step'][] = ['console', 'datetime', 'details', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex < steps.length - 1) {
      return { step: steps[currentIndex + 1] };
    }
    return state;
  }),
  prevStep: () => set((state) => {
    const steps: BookingState['step'][] = ['console', 'datetime', 'details', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex > 0) {
      return { step: steps[currentIndex - 1] };
    }
    return state;
  }),
}));

// Navigation store
export interface NavState {
  activeSection: string;
  isMenuOpen: boolean;
  setActiveSection: (section: string) => void;
  toggleMenu: () => void;
  closeMenu: () => void;
}

export const useNavStore = create<NavState>((set) => ({
  activeSection: 'home',
  isMenuOpen: false,
  setActiveSection: (section) => set({ activeSection: section }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
}));

// Admin Store
export interface AdminState {
  isAdminPanelOpen: boolean;
  isAdminLoggedIn: boolean;
  adminUser: { id: string; username: string } | null;
  adminTab: 'bookings' | 'consoles' | 'games' | 'events' | 'announcements' | 'pricing';
  openAdminPanel: () => void;
  closeAdminPanel: () => void;
  setAdminUser: (user: { id: string; username: string } | null) => void;
  adminLogout: () => void;
  setAdminTab: (tab: AdminState['adminTab']) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isAdminPanelOpen: false,
  isAdminLoggedIn: false,
  adminUser: null,
  adminTab: 'bookings',
  openAdminPanel: () => set({ isAdminPanelOpen: true }),
  closeAdminPanel: () => set({ isAdminPanelOpen: false }),
  setAdminUser: (user) => set({ adminUser: user, isAdminLoggedIn: !!user }),
  adminLogout: () => set({ adminUser: null, isAdminLoggedIn: false, isAdminPanelOpen: false }),
  setAdminTab: (tab) => set({ adminTab: tab }),
}));
