import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { BottomNavigation } from '@/components/BottomNavigation'
import { ToastContainer } from '@/components/Toast'
import { useUIStore } from '@/store/uiStore'
import clsx from 'clsx'

export function CitizenLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { highContrast } = useUIStore()

  return (
    <div
      className={clsx(
        'min-h-screen flex transition-colors',
        highContrast && 'high-contrast',
      )}
      style={{ background: 'rgb(var(--ds-canvas))' }}
    >
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main
          className="flex-1 overflow-y-auto pb-16 md:pb-0 transition-colors"
          style={{ background: 'rgb(var(--ds-canvas))' }}
          id="main-content"
          tabIndex={-1}
          aria-label="Main content"
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNavigation />

      {/* Global toast notifications */}
      <ToastContainer />
    </div>
  )
}
