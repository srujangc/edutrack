import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { MobileNav } from '../components/MobileNav';
import { QuickActionModal } from '../components/QuickActionModal';

export const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading EduTrack...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar
          onOpenSidebar={() => setIsMobileOpen(true)}
          onOpenQuickAction={() => setQuickActionOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <MobileNav onOpenDrawer={() => setIsMobileOpen(true)} />

      {/* Global Quick Action Modal */}
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onActionSuccess={() => {
          // Trigger a global custom event so active pages refresh data seamlessly
          window.dispatchEvent(new CustomEvent('edutrack-data-refresh'));
        }}
      />
    </div>
  );
};
