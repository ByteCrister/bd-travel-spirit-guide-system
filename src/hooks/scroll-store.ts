// stores/scroll-store.ts
import { create } from 'zustand';

interface ScrollStore {
  // Scroll function that will be set by a component with router access
  scrollToSection: (sectionId: string) => void;
  // Method to set the scroll function (called once in the layout)
  setScrollToSection: (fn: (sectionId: string) => void) => void;
  // Track if scroll function is ready
  isReady: boolean;
  // Mobile menu state (can be shared across components)
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const useScrollStore = create<ScrollStore>((set) => ({
  scrollToSection: () => {
    console.warn('Scroll function not initialized yet. Make sure ScrollInitializer is mounted.');
  },
  setScrollToSection: (fn) => set({ scrollToSection: fn, isReady: true }),
  isReady: false,
  mobileOpen: false,
  setMobileOpen: (open) => set({ mobileOpen: open }),
}));

// Optional: Create a custom hook for better TypeScript support
export const useScroll = () => {
  const scrollToSection = useScrollStore((state) => state.scrollToSection);
  const isReady = useScrollStore((state) => state.isReady);
  
  return {
    scrollToSection,
    isReady,
  };
};