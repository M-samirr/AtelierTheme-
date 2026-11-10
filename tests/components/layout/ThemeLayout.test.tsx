import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeLayout } from '../../../app/components/layout/ThemeLayout';

const state = vi.hoisted(() => ({
  store: {} as Record<string, unknown>,
  settings: {} as Record<string, unknown>,
  isLoggedIn: false,
}));

vi.mock('@tanstack/react-router', () => ({
  useRouterState: () => '/ar',
}));
vi.mock('../../../app/components/layout/Header', () => ({
  Header: ({ onOpenNav }: { onOpenNav: () => void }) => (
    <header data-testid="theme-header">
      <button onClick={onOpenNav}>open nav</button>
    </header>
  ),
}));
vi.mock('../../../app/components/layout/Footer', () => ({
  Footer: () => <footer data-testid="theme-footer" />,
}));
vi.mock('../../../app/components/layout/BottomBar', () => ({
  BottomBar: () => <nav data-testid="bottom-bar" />,
}));
vi.mock('../../../app/components/layout/MobileNav', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="mobile-nav" /> : null),
}));
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({
    store: state.store,
    theme: { settings: state.settings },
    currency: { code: 'SAR' },
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
    locale: 'ar',
    isRTL: true,
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useUser', () => ({
  useUser: () => ({ isLoggedIn: state.isLoggedIn }),
}));
vi.mock('@salla.sa/twilight-components-react/login-modal', () => ({
  SallaLoginModal: () => <div data-testid="login-modal" />,
}));
vi.mock('@salla.sa/twilight-components-react/scopes', () => ({
  SallaScopes: (props: { selection: string }) => (
    <div data-testid="scopes" data-selection={props.selection} />
  ),
}));
vi.mock('@salla.sa/twilight-components-react/offer-modal', () => ({
  SallaOfferModal: () => <div data-testid="offer-modal" />,
}));
vi.mock('@salla.sa/twilight-components-react/localization-modal', () => ({
  SallaLocalizationModal: (props: { language: string }) => (
    <div data-testid="localization-modal" data-language={props.language} />
  ),
}));

describe('ThemeLayout', () => {
  beforeEach(() => {
    state.store = {};
    state.settings = {};
    state.isLoggedIn = false;
  });

  it('frames the page: skip link, header, main landmark, footer', () => {
    render(
      <ThemeLayout>
        <p>page</p>
      </ThemeLayout>
    );
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveProperty(
      'hash',
      '#main-content'
    );
    expect(screen.getByTestId('theme-header')).toBeTruthy();
    const main = screen.getByRole('main');
    expect(main.id).toBe('main-content');
    expect(main.textContent).toBe('page');
    expect(screen.getByTestId('theme-footer')).toBeTruthy();
  });

  it('loads the mobile menu only once it is asked for', async () => {
    render(<ThemeLayout>x</ThemeLayout>);
    expect(screen.queryByTestId('mobile-nav')).toBeNull();
    fireEvent.click(screen.getByText('open nav'));
    expect(await screen.findByTestId('mobile-nav')).toBeTruthy();
  });

  it('honours the bottom bar setting, on by default', () => {
    const { unmount } = render(<ThemeLayout>x</ThemeLayout>);
    expect(screen.getByTestId('bottom-bar')).toBeTruthy();
    unmount();
    state.settings = { mobile_bottom_bar: false };
    render(<ThemeLayout>x</ThemeLayout>);
    expect(screen.queryByTestId('bottom-bar')).toBeNull();
  });

  it('turns the shape and card settings into classes', () => {
    state.settings = {
      product_card_img_ratio: [{ value: 'square' }],
      corner_style: 'sharp',
      motion_enabled: false,
    };
    const { container } = render(<ThemeLayout>x</ThemeLayout>);
    const frame = container.querySelector('.app-inner');
    expect(frame?.className).toContain('at-card-ratio--square');
    expect(frame?.className).toContain('at-corners--sharp');
    expect(frame?.className).toContain('at-no-motion');
  });

  it('mounts the offer modal always and the login modal only for guests', async () => {
    const { unmount } = render(<ThemeLayout>x</ThemeLayout>);
    expect(await screen.findByTestId('offer-modal')).toBeTruthy();
    expect(await screen.findByTestId('login-modal')).toBeTruthy();
    unmount();

    state.isLoggedIn = true;
    render(<ThemeLayout>x</ThemeLayout>);
    expect(await screen.findByTestId('offer-modal')).toBeTruthy();
    expect(screen.queryByTestId('login-modal')).toBeNull();
  });

  it('mounts the language switcher and branch scopes only when the store has them', async () => {
    const { unmount } = render(<ThemeLayout>x</ThemeLayout>);
    await screen.findByTestId('offer-modal');
    expect(screen.queryByTestId('localization-modal')).toBeNull();
    expect(screen.queryByTestId('scopes')).toBeNull();
    unmount();

    state.store = { settings: { is_multilingual: true }, scope: { display_as: 'popup' } };
    render(<ThemeLayout>x</ThemeLayout>);
    expect((await screen.findByTestId('localization-modal')).dataset.language).toBe('ar');
    expect((await screen.findByTestId('scopes')).dataset.selection).toBe('mandatory');
  });
});
