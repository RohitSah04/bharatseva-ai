import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarOpen: true,
      highContrast: false,
      largeText: false,
      language: 'en',

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
      toggleLargeText: () => set((s) => ({ largeText: !s.largeText })),
      setLanguage: (lang) => {
        localStorage.setItem('bharatseva_lang', lang)
        set({ language: lang })
      },
    }),
    {
      name: 'bharatseva_ui',
      partialize: (state) => ({
        highContrast: state.highContrast,
        largeText: state.largeText,
        language: state.language,
      }),
    },
  ),
)
