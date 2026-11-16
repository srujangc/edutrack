import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  Sun,
  Moon,
  Plus,
  LogOut,
  User,
  Settings,
  Calendar,
  Menu,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ onOpenSidebar, onOpenQuickAction }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left: Mobile Menu button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-1 text-slate-600 dark:text-slate-300 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full">
          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Right: Quick Action, Theme Toggle, Notification Bell, User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Button */}
        <button
          onClick={onOpenQuickAction}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Quick Add</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center ring-2 ring-indigo-200 dark:ring-indigo-900 shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {user?.name || 'Student'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {user?.semester || 'Semester 5'}
              </span>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                  <div className="mt-1.5 inline-block text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-md">
                    {user?.college || 'College Student'}
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/app/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    Student Profile
                  </Link>

                  <Link
                    to="/app/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    Account Settings
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
