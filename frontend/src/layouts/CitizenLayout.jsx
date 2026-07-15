import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { BottomNavigation } from '@/components/BottomNavigation'
import { useUIStore } from '@/store/uiStore'
import clsx from 'clsx'

export function CitizenLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { highContrast, largeText } = useUIStore()

  return (
    <div
      className={clsx(
        'min-h-screen flex',
        highContrast && 'high-contrast',
        largeText && 'large-text',
      )}
    >
      {/*
        Single Sidebar instance.
        - On mobile: controlled by sidebarOpen state (slides in/out via translate-x).
        - On desktop (md+): the aside inside Sidebar has md:static + md:translate-x-0,
          so it is always visible and participates in the flex layout.
        Two instances were previously rendered; the second "mobile" one was also
        becoming visible on desktop via md:static, causing the duplicate.
      */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main
          className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0"
          id="main-content"
          tabIndex={-1}
          aria-label="Main content"
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNavigation />
    </div>
  )
}
