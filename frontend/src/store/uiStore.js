import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarOpen: true,
      highContrast: false,
      language: 'en',
      theme: 'system', // 'light' | 'dark' | 'system'

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
      setLanguage: (lang) => {
        localStorage.setItem('bharatseva_lang', lang)
        set({ language: lang })
      },
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'bharatseva_ui',
      partialize: (state) => ({
        highContrast: state.highContrast,
        language: state.language,
        theme: state.theme,
      }),
    },
  ),
)
