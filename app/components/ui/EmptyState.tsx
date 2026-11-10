import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface EmptyStateProps {
  /** A Salla icon class, for example `sicon-shopping-bag`. */
  icon?: string;
  title: ReactNode;
  body?: ReactNode;
  /** Usually a `Button`. */
  action?: ReactNode;
  className?: string;
}

/** What a list shows when it has nothing: calm, centred, with one way forward. */
export function EmptyState({ icon, title, body, action, className }: EmptyStateProps) {
  return (
    <div className={cn('at-state at-state--empty', className)}>
      {icon && (
        <span className="at-state__icon">
          <i className={icon} aria-hidden="true" />
        </span>
      )}
      <p className="at-state__title">{title}</p>
      {body && <p className="at-state__body">{body}</p>}
      {action && <div className="at-state__action">{action}</div>}
    </div>
  );
}
