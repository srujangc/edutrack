import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  FileText,
  TrendingUp,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', to: '/app', icon: LayoutDashboard },
    { name: 'Subjects', to: '/app/subjects', icon: BookOpen },
    { name: 'Assignments', to: '/app/assignments', icon: CheckSquare },
    { name: 'Attendance', to: '/app/attendance', icon: CalendarCheck },
    { name: 'Timetable', to: '/app/timetable', icon: CalendarDays },
    { name: 'Exams', to: '/app/exams', icon: GraduationCap },
    { name: 'Notes', to: '/app/notes', icon: FileText },
    { name: 'Progress', to: '/app/progress', icon: TrendingUp },
    { name: 'Settings', to: '/app/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          <Link
            to="/app"
            className="flex items-center gap-3 overflow-hidden group"
            onClick={onCloseMobile}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  EduTrack
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 -mt-0.5 tracking-wider uppercase">
                  Academic Suite
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.to === '/app'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  } ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Feature Card (Reference design inspirer: clean rounded card) */}
        {!isCollapsed && (
          <div className="p-3 mx-3 mb-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-indigo-100/80 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Target Attendance
              </span>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {user?.targetAttendance || 75}%
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Keep above minimum threshold to remain exam eligible.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
