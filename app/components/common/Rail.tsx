import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { cn } from '../../lib/cn';

export interface RailProps {
  children: ReactNode;
  /** `cards` shows 2 to 5 across by width; `wide` shows 1 to 3. */
  density?: 'cards' | 'wide';
  className?: string;
  /** Names the row for screen readers. */
  label?: string;
}

/**
 * A horizontal row that scrolls with touch and with arrows. It is CSS scroll
 * snapping rather than a slider library, so it costs almost no script and needs
 * no reflow on hydration. Works in both directions: in RTL `scrollLeft` runs
 * negative, so the arrows read the page direction.
 */
export function Rail({ children, density = 'cards', className, label }: RailProps) {
  const { t, isRTL } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const travelled = Math.abs(track.scrollLeft);
    const room = track.scrollWidth - track.clientWidth;
    setEdges({ start: travelled <= 1, end: travelled >= room - 1 });
  }, []);

  useEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure, children]);

  const step = (forward: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.firstElementChild as HTMLElement | null;
    const distance = (first?.offsetWidth ?? track.clientWidth) + 16;
    const sign = (forward ? 1 : -1) * (isRTL ? -1 : 1);
    track.scrollBy({ left: sign * distance, behavior: 'smooth' });
  };

  return (
    <div className={cn('at-rail', `at-rail--${density}`, className)}>
      {/* The slides hold the links; the track itself only scrolls. */}
      <div
        ref={trackRef}
        className="at-rail__track"
        role="group"
        aria-label={label}
        onScroll={measure}
      >
        {Children.map(children, (child) => (
          <div className="at-rail__slide">{child}</div>
        ))}
      </div>
      {!(edges.start && edges.end) && (
        <div className="at-rail__controls">
          <button
            type="button"
            className="at-rail__arrow"
            aria-label={t('theme.actions.previous', 'Previous')}
            disabled={edges.start}
            onClick={() => step(false)}
          >
            <i className="sicon-keyboard_arrow_right at-flip-ltr" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="at-rail__arrow"
            aria-label={t('theme.actions.next', 'Next')}
            disabled={edges.end}
            onClick={() => step(true)}
          >
            <i className="sicon-keyboard_arrow_left at-flip-ltr" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
