import { cn } from '../lib/utils';

export function Input({ className, error, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 transition-colors',
        'placeholder:text-slate-500',
        'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        className
      )}
      {...props}
    />
  );
}

export function Label({ children, className, required, ...props }) {
  return (
    <label
      className={cn(
        'block text-sm font-medium text-slate-300 mb-1.5',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

export function Select({ children, className, error, ...props }) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 transition-colors',
        'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, error, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 transition-colors resize-none',
        'placeholder:text-slate-500',
        'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        className
      )}
      {...props}
    />
  );
}
