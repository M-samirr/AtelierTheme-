import type { ReactNode } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { cn } from '../../lib/cn';

export interface SectionHeadingProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Heading level; blocks on a page are `h2`, nested groups `h3`. */
  level?: 2 | 3;
  align?: 'start' | 'center';
  /** A "view all" style link at the end of the row. */
  action?: { label: ReactNode; href: string };
  className?: string;
}

/** The title row above a block, with an optional action link at the end. */
export function SectionHeading({
  title,
  subtitle,
  level = 2,
  align = 'start',
  action,
  className,
}: SectionHeadingProps) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <header className={cn('at-section-heading', `at-section-heading--${align}`, className)}>
      <div className="at-section-heading__text">
        <Heading className="at-section-heading__title">{title}</Heading>
        {subtitle && <p className="at-section-heading__subtitle">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="at-section-heading__action">
          <span>{action.label}</span>
          <i className="sicon-keyboard_arrow_left at-flip-ltr" aria-hidden="true" />
        </Link>
      )}
    </header>
  );
}
