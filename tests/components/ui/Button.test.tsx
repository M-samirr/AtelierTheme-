import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../../app/components/ui/Button';

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: { href: string; children?: unknown } & Record<string, unknown>) => (
    <a href={href} {...rest}>
      {children as never}
    </a>
  ),
}));

describe('Button', () => {
  it('renders a type=button by default with variant and size classes', () => {
    render(<Button>Add to bag</Button>);
    const button = screen.getByRole('button', { name: 'Add to bag' });
    expect(button.getAttribute('type')).toBe('button');
    expect(button.className).toContain('at-btn--primary');
    expect(button.className).toContain('at-btn--md');
  });

  it('applies variant, size and block modifiers', () => {
    render(
      <Button variant="outline" size="lg" block>
        Go
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('at-btn--outline');
    expect(button.className).toContain('at-btn--lg');
    expect(button.className).toContain('at-btn--block');
  });

  it('blocks clicks and announces busy while loading', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button.querySelector('.at-btn__spinner')).not.toBeNull();
  });

  it('renders a Salla icon class as a hidden <i>', () => {
    render(<Button icon="sicon-cart">Cart</Button>);
    const icon = screen.getByRole('button').querySelector('i');
    expect(icon?.className).toContain('sicon-cart');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders the engine Link when given an href, with the same look', () => {
    render(
      <Button href="/ar/cart" variant="secondary">
        View cart
      </Button>
    );
    const link = screen.getByRole('link', { name: 'View cart' });
    expect(link.getAttribute('href')).toBe('/ar/cart');
    expect(link.className).toContain('at-btn--secondary');
  });
});
