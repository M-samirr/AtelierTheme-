import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../../../app/components/ui/EmptyState';
import { ErrorState } from '../../../app/components/ui/ErrorState';

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ href, children }: { href: string; children?: unknown }) => (
    <a href={href}>{children as never}</a>
  ),
}));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
    locale: 'en',
    isRTL: false,
  }),
}));

describe('EmptyState', () => {
  it('shows icon, title, body and action', () => {
    render(
      <EmptyState
        icon="sicon-shopping-bag"
        title="Your bag is empty"
        body="Start with our new arrivals."
        action={<button>Shop</button>}
      />
    );
    expect(screen.getByText('Your bag is empty')).toBeTruthy();
    expect(screen.getByText('Start with our new arrivals.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Shop' })).toBeTruthy();
    expect(document.querySelector('i.sicon-shopping-bag')?.getAttribute('aria-hidden')).toBe(
      'true'
    );
  });
});

describe('ErrorState', () => {
  it('is announced as an alert with default copy and retries on click', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Something went wrong');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('hides the retry button when there is nothing to retry', () => {
    render(<ErrorState title="Offline" body="Check your connection." />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Offline')).toBeTruthy();
  });
});
