import type { ReactNode } from 'react';

/** Text for screen readers only. */
export function VisuallyHidden({
  children,
  as: Tag = 'span',
}: {
  children: ReactNode;
  as?: 'span' | 'div';
}) {
  return <Tag className="sr-only">{children}</Tag>;
}
