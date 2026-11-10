import type { ReactNode } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from './Button';
import { cn } from '../../lib/cn';

export interface ErrorStateProps {
  title?: ReactNode;
  body?: ReactNode;
  /** Shown as a retry button when given. */
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

/** What a block shows when its data failed to load, with a retry. Announced to screen readers. */
export function ErrorState({ title, body, onRetry, retrying, className }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <div role="alert" className={cn('at-state at-state--error', className)}>
      <span className="at-state__icon">
        <i className="sicon-warning" aria-hidden="true" />
      </span>
      <p className="at-state__title">
        {title ?? t('common.states.error_title', 'Something went wrong')}
      </p>
      <p className="at-state__body">
        {body ?? t('common.states.error_body', 'We could not load this content. Please try again.')}
      </p>
      {onRetry && (
        <div className="at-state__action">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            loading={retrying}
            icon="sicon-rotate"
          >
            {t('common.actions.retry', 'Try again')}
          </Button>
        </div>
      )}
    </div>
  );
}
