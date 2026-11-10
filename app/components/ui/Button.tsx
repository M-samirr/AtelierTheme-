import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretches to the parent's width. */
  block?: boolean;
  /** Shows a spinner, sets `aria-busy` and blocks clicks. */
  loading?: boolean;
  /** A Salla icon class (`sicon-*`) or any node, rendered before the label. */
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export interface ButtonAsButtonProps
  extends ButtonBaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  href?: undefined;
}

export interface ButtonAsLinkProps extends ButtonBaseProps {
  /** Renders the engine `Link` so the move stays in-app. */
  href: string;
  'aria-label'?: string;
  target?: string;
  rel?: string;
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

function classes({ variant = 'primary', size = 'md', block, loading, className }: ButtonBaseProps) {
  return cn(
    'at-btn',
    `at-btn--${variant}`,
    `at-btn--${size}`,
    block && 'at-btn--block',
    loading && 'at-btn--loading',
    className
  );
}

function renderIcon(icon: ReactNode) {
  if (typeof icon === 'string')
    return <i className={cn('at-btn__icon', icon)} aria-hidden="true" />;
  return icon ? <span className="at-btn__icon">{icon}</span> : null;
}

/**
 * The theme's button. Renders a `<button>`, or the engine `Link` when `href`
 * is given, with the same look. Icon-only buttons must pass `aria-label`.
 */
export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { href, icon, children, variant, size, block, loading, className, ...rest } = props;
    return (
      <Link href={href} className={classes({ variant, size, block, loading, className })} {...rest}>
        {renderIcon(icon)}
        {children !== undefined && <span className="at-btn__label">{children}</span>}
      </Link>
    );
  }

  const {
    icon,
    children,
    variant,
    size,
    block,
    loading = false,
    className,
    type = 'button',
    disabled,
    ...rest
  } = props;
  return (
    <button
      type={type}
      className={classes({ variant, size, block, loading, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="at-btn__spinner" aria-hidden="true" /> : renderIcon(icon)}
      {children !== undefined && <span className="at-btn__label">{children}</span>}
    </button>
  );
}
