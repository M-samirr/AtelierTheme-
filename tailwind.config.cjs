/**
 * Tailwind reads the design tokens from app/styles/01-settings/_tokens.scss, so
 * a utility and an SCSS rule always agree. Change a value there, not here.
 *
 * The "engine compatibility" entries exist because the engine's own components
 * (header, footer, cart, account pages, ...) were written against the Raed
 * starter's config and use a few of its custom class names. They are mapped
 * onto the theme's tokens so those components take the theme's look.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,scss,css}',
    // The engine renders markup with Tailwind classes; scan it or they are dropped.
    './node_modules/@salla.sa/twilight-theme-engine/dist/**/*.js',
    // SSR'd skeletons and wrapper markup of the web-component wrappers.
    './node_modules/@salla.sa/twilight-components-react/dist/**/*.js',
  ],
  // `<Image objectFit>` builds these at runtime, out of the scanner's sight.
  safelist: ['object-contain', 'object-cover'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: 'var(--at-gutter)',
      // A media query cannot read a custom property: keep equal to --at-container.
      screens: { '2xl': '1360px' },
    },
    fontFamily: {
      sans: ['var(--at-font-body)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      display: ['var(--at-font-display)', 'var(--at-font-body)', 'sans-serif'],
      // engine compatibility
      primary: ['var(--at-font-body)', 'sans-serif'],
    },
    extend: {
      screens: {
        xs: '480px',
        // engine compatibility
        xxs: { min: '380px', max: '479px' },
      },
      colors: {
        primary: {
          DEFAULT: 'var(--at-primary)',
          dark: 'var(--at-primary-dark)',
          light: 'var(--at-primary-light)',
        },
        'on-primary': 'var(--at-on-primary)',
        canvas: 'var(--at-canvas)',
        surface: {
          DEFAULT: 'var(--at-surface)',
          2: 'var(--at-surface-2)',
          3: 'var(--at-surface-3)',
        },
        ink: {
          DEFAULT: 'var(--at-ink)',
          2: 'var(--at-ink-2)',
          3: 'var(--at-ink-3)',
        },
        line: {
          DEFAULT: 'var(--at-line)',
          strong: 'var(--at-line-strong)',
        },
        success: { DEFAULT: 'var(--at-success)', soft: 'var(--at-success-soft)' },
        warning: { DEFAULT: 'var(--at-warning)', soft: 'var(--at-warning-soft)' },
        danger: { DEFAULT: 'var(--at-danger)', soft: 'var(--at-danger-soft)' },
        info: { DEFAULT: 'var(--at-info)', soft: 'var(--at-info-soft)' },
        sale: 'var(--at-sale)',
        // engine compatibility
        dark: 'var(--at-ink)',
        darker: 'var(--at-primary-dark)',
      },
      fontSize: {
        display: ['var(--at-text-display)', { lineHeight: 'var(--at-leading-tight)' }],
        '3xl': ['var(--at-text-3xl)', { lineHeight: 'var(--at-leading-tight)' }],
        '2xl': ['var(--at-text-2xl)', { lineHeight: 'var(--at-leading-tight)' }],
      },
      lineHeight: {
        tight: 'var(--at-leading-tight)',
        snug: 'var(--at-leading-snug)',
        normal: 'var(--at-leading-normal)',
        // engine compatibility
        12: '3rem',
        14: '3.5rem',
        16: '4rem',
        18: '4.5rem',
        20: '5rem',
      },
      letterSpacing: {
        display: 'var(--at-tracking-display)',
        caps: 'var(--at-tracking-caps)',
      },
      borderRadius: {
        DEFAULT: 'var(--at-radius-md)',
        xs: 'var(--at-radius-xs)',
        sm: 'var(--at-radius-sm)',
        md: 'var(--at-radius-md)',
        lg: 'var(--at-radius-lg)',
        xl: 'var(--at-radius-xl)',
        pill: 'var(--at-radius-pill)',
        // engine compatibility
        large: 'var(--at-radius-lg)',
        big: 'var(--at-radius-xl)',
        tiny: 'var(--at-radius-xs)',
      },
      boxShadow: {
        sm: 'var(--at-shadow-sm)',
        md: 'var(--at-shadow-md)',
        lg: 'var(--at-shadow-lg)',
        focus: 'var(--at-focus-ring)',
        // engine compatibility
        default: 'var(--at-shadow-md)',
        top: '0 -4px 16px rgb(28 27 31 / 0.08)',
        light: 'var(--at-shadow-sm)',
        dropdown: 'var(--at-shadow-md)',
        huge: 'var(--at-shadow-lg)',
      },
      spacing: {
        gutter: 'var(--at-gutter)',
        section: 'var(--at-section-gap)',
        block: 'var(--at-block-gap)',
        header: 'var(--at-header-height)',
        'safe-top': 'var(--at-safe-top)',
        'safe-bottom': 'var(--at-safe-bottom)',
      },
      maxWidth: {
        container: 'var(--at-container)',
        narrow: 'var(--at-container-narrow)',
      },
      width: {
        // engine compatibility
        18: '4.5rem',
        22: '5.5rem',
        74: '18.5rem',
        76: '19rem',
        78: '19.5rem',
      },
      zIndex: {
        header: 'var(--at-z-header)',
        drawer: 'var(--at-z-drawer)',
        modal: 'var(--at-z-modal)',
        toast: 'var(--at-z-toast)',
        // engine compatibility
        1: '1',
        2: '2',
        '-1': '-1',
      },
      transitionTimingFunction: {
        out: 'var(--at-ease-out)',
        'in-out': 'var(--at-ease-in-out)',
        // engine compatibility
        elastic: 'cubic-bezier(0.55, 0, 0.1, 1)',
      },
      transitionDuration: {
        fast: 'var(--at-duration-fast)',
        DEFAULT: 'var(--at-duration)',
        slow: 'var(--at-duration-slow)',
      },
      transitionProperty: {
        // engine compatibility
        height: 'height',
      },
      keyframes: {
        'at-fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'at-fade-in': 'at-fade-in var(--at-duration) var(--at-ease-out) both',
      },
    },
  },
  corePlugins: {
    // The theme sets one focus style in 02-generic/_reset.scss.
    outline: false,
  },
  plugins: [require('@salla.sa/twilight-tailwind-theme'), require('@tailwindcss/forms')],
};
