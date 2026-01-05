import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './Button';

export function Alert({ variant = 'error', children, onDismiss, className }) {
  const variants = {
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
  };

  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info,
  };

  const Icon = icons[variant];

  return (
    <div className={cn('rounded-lg border p-4', variants[variant], className)}>
      <div className="flex items-start">
        <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1 text-sm">{children}</div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="ml-4 -mt-1 -mr-2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
