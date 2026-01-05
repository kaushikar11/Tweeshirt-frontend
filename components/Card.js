import { cn } from '../lib/utils';

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-700/50 bg-glass-dark p-6 shadow-lg transition-all hover:shadow-xl hover:shadow-violet-500/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('font-display text-xl font-semibold text-white', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn('text-sm text-slate-400', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}
