import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useAppStore from '@/stores/useAppStore';

export default function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const updateStreak = useAppStore(s => s.updateStreak);
  const location = useLocation();

  useEffect(() => { updateStreak(); }, [updateStreak]);
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  // Track screen size
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const marginLeft = isDesktop ? (sidebarCollapsed ? '68px' : '240px') : '0px';

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div
        className="flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ease-smooth"
        style={{ marginLeft }}
      >
        <Header
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          onSearchClick={() => {}}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
