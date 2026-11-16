import React from 'react';

export const CardSkeleton = () => (
  <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm animate-pulse space-y-4">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="w-16 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
    </div>
    <div className="space-y-2">
      <div className="w-2/3 h-5 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="w-1/2 h-3.5 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
    </div>
    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
      <div className="w-24 h-4 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="w-8 h-4 rounded-lg bg-slate-200 dark:bg-slate-800" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 4 }) => (
  <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 animate-pulse">
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-full" />
    ))}
  </div>
);
