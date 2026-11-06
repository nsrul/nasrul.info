import type { Photo } from '@lib/photos';
import { useEffect, useRef, useState } from 'react';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function PhotoViewer({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const current = Math.min(index, photos.length - 1);
  const photo = photos[current];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }
      event.preventDefault();
      setIndex((i) => {
        const next = event.key === 'ArrowRight' ? i + 1 : i - 1;
        return Math.min(photos.length - 1, Math.max(0, next));
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [photos.length]);

  useEffect(() => {
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const thumb = stripRef.current?.querySelector<HTMLElement>(
      '[aria-current="true"]',
    );
    thumb?.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, [current]);

  if (!photo) return null;

  const shown = photo.date
    ? dateFormat.format(new Date(`${photo.date}T00:00:00`))
    : null;

  return (
    <div className="photo-viewer">
      <header aria-live="polite">
        <h2>{photo.title}</h2>
        <p className="photo-meta">
          {shown && photo.date ? (
            <time dateTime={photo.date}>{shown}</time>
          ) : null}
          <span>
            {current + 1} of {photos.length}
          </span>
        </p>
      </header>
      <div className="photo-stage">
        <button
          aria-label="Previous photograph"
          className="photo-nav prev"
          disabled={current === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          type="button"
        >
          <Chevron dir="left" />
        </button>
        <img alt={photo.alt} src={photo.src} />
        <button
          aria-label="Next photograph"
          className="photo-nav next"
          disabled={current === photos.length - 1}
          onClick={() => setIndex((i) => Math.min(photos.length - 1, i + 1))}
          type="button"
        >
          <Chevron dir="right" />
        </button>
      </div>
      <div
        aria-label="Photographs"
        className="photo-strip"
        ref={stripRef}
        role="listbox"
      >
        {photos.map((item, itemIndex) => (
          <button
            aria-current={itemIndex === current ? 'true' : undefined}
            aria-label={item.title}
            aria-selected={itemIndex === current}
            key={item.src}
            onClick={() => setIndex(itemIndex)}
            role="option"
            type="button"
          >
            <img alt="" src={item.src} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16">
      <path
        d={dir === 'left' ? 'M10.5 2.5 5 8l5.5 5.5' : 'M5.5 2.5 11 8l-5.5 5.5'}
        fill="none"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.4"
      />
    </svg>
  );
}
