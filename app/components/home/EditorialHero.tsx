import { useEffect, useState } from 'react';
import { Image } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../ui';
import { useMotionAllowed } from '../../hooks/useMotionAllowed';
import { items, linkUrl } from '../../lib/blockData';
import { cn } from '../../lib/cn';
import { settingBoolean, settingChoice, settingNumber, settingText } from '../../lib/settings';
import type { HomeBlockProps } from './types';

interface Slide {
  image?: string;
  mobile_image?: string;
  video?: string;
  kicker?: string;
  headline?: string;
  body?: string;
  cta_label?: string;
  cta_url?: unknown;
  cta2_label?: string;
  cta2_url?: unknown;
}

const HEIGHTS = ['medium', 'tall', 'screen'] as const;
const ALIGNS = ['start', 'center', 'end'] as const;
const WIDTHS = [640, 828, 1080, 1280, 1920] as const;
const INTERVAL = 6000;

/** Full-bleed slides of image or muted video, with a headline and up to two buttons. */
export function EditorialHero({ data }: HomeBlockProps) {
  const { t } = useTranslation();
  const slides = items<Slide>(data.slides).filter((slide) => slide.image);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const motionAllowed = useMotionAllowed();
  const autoplay = settingBoolean(data.autoplay, true) && slides.length > 1;
  const height = settingChoice(data.height, HEIGHTS, 'tall');
  const align = settingChoice(data.align, ALIGNS, 'center');
  const overlay = settingNumber(data.overlay, 35, { min: 0, max: 80 });

  useEffect(() => {
    if (!autoplay || paused || !motionAllowed) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      INTERVAL
    );
    return () => window.clearInterval(timer);
  }, [autoplay, paused, motionAllowed, slides.length]);

  if (!slides.length) return null;

  return (
    <div
      className={cn('at-hero', `at-hero--${height}`, `at-hero--${align}`)}
      style={{ '--hero-overlay': overlay / 100 } as React.CSSProperties}
      role="group"
      aria-roledescription={t('theme.block.carousel', 'carousel')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((slide, index) => {
        const url = linkUrl(slide.cta_url);
        const url2 = linkUrl(slide.cta2_url);
        const isActive = index === active;
        return (
          <div
            key={`${slide.image}-${index}`}
            className={cn('at-hero__slide', isActive && 'is-active')}
            aria-hidden={!isActive}
            inert={!isActive}
          >
            <Image
              src={slide.image}
              mobileSrc={slide.mobile_image || undefined}
              alt=""
              className="at-hero__media"
              width={1280}
              srcSetWidths={WIDTHS}
              sizes="100vw"
              priority={index === 0}
            />
            {slide.video && motionAllowed && isActive && (
              <video
                className="at-hero__media"
                src={slide.video}
                poster={slide.image}
                autoPlay
                muted
                loop
                playsInline
                aria-hidden="true"
              />
            )}
            <div className="at-hero__scrim" />
            <div className="at-container at-hero__content">
              <div className="at-hero__copy">
                {settingText(slide.kicker) && <p className="at-hero__kicker">{slide.kicker}</p>}
                {settingText(slide.headline) && (
                  <h2 className="at-hero__headline">{slide.headline}</h2>
                )}
                {settingText(slide.body) && <p className="at-hero__body">{slide.body}</p>}
                {((slide.cta_label && url) || (slide.cta2_label && url2)) && (
                  <div className="at-hero__actions">
                    {slide.cta_label && url && (
                      <Button href={url} size="lg" className="at-hero__cta">
                        {slide.cta_label}
                      </Button>
                    )}
                    {slide.cta2_label && url2 && (
                      <Button href={url2} size="lg" variant="outline" className="at-hero__cta-alt">
                        {slide.cta2_label}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {slides.length > 1 && (
        <div className="at-hero__dots">
          {slides.map((slide, index) => (
            <button
              key={`${slide.image}-${index}`}
              type="button"
              className={cn('at-hero__dot', index === active && 'is-active')}
              aria-label={t('theme.block.go_to_slide', {
                defaultValue: 'Go to slide {{n}}',
                n: index + 1,
              })}
              aria-current={index === active ? 'true' : undefined}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
