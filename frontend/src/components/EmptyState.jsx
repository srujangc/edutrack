import React from 'react';
import { Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
      {Icon && (
        <div className="w-16 h-16 mb-4 rounded-3xl bg-indigo-50 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{actionLabel}</span>
          </button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
