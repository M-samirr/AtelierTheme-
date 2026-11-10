import { useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

/** A YouTube player that loads nothing from YouTube until it is played. */
export function YoutubeFrame({
  id,
  poster,
  title,
}: {
  id: string;
  poster?: string;
  title?: string;
}) {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);
  const label = title || t('theme.actions.play_video', 'Play video');
  return (
    <div className="at-video">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={label}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={label}>
          <img
            src={poster || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            decoding="async"
            width={1280}
            height={720}
          />
          <span className="at-video__play">
            <i className="sicon-play" aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  );
}
