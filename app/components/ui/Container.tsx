import type { ElementType, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface ContainerProps {
  /** The element to render. Sections and landmarks keep their semantics. */
  as?: ElementType;
  /** `wide` is the full design width; `narrow` is for reading-width content. */
  size?: 'wide' | 'narrow';
  className?: string;
  children: ReactNode;
  id?: string;
}

/** Centres content at the theme's container width with the responsive gutter. */
export function Container({
  as: Tag = 'div',
  size = 'wide',
  className,
  children,
  id,
}: ContainerProps) {
  return (
    <Tag
      id={id}
      className={cn('at-container', size === 'narrow' && 'at-container--narrow', className)}
    >
      {children}
    </Tag>
  );
}
