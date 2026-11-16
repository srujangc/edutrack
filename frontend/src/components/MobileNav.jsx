import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  CalendarCheck,
  CalendarDays,
  Menu
} from 'lucide-react';

export const MobileNav = ({ onOpenDrawer }) => {
  const tabs = [
    { name: 'Dashboard', to: '/app', icon: LayoutDashboard },
    { name: 'Subjects', to: '/app/subjects', icon: BookOpen },
    { name: 'Tasks', to: '/app/assignments', icon: CheckSquare },
    { name: 'Attendance', to: '/app/attendance', icon: CalendarCheck },
    { name: 'Timetable', to: '/app/timetable', icon: CalendarDays },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 lg:hidden px-2 shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.name}
            to={tab.to}
            end={tab.to === '/app'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{tab.name}</span>
          </NavLink>
        );
      })}

      <button
        onClick={onOpenDrawer}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span>More</span>
      </button>
    </nav>
  );
};
