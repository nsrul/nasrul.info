import { useEffect, useRef, useState } from 'react';

type ProjectMediaProps = {
  alt: string;
  eager?: boolean;
  poster?: string;
  video?: string;
  webm?: string;
};

export default function ProjectMedia({
  alt,
  eager = false,
  poster,
  video,
  webm,
}: ProjectMediaProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playable, setPlayable] = useState(false);

  useEffect(() => {
    if (!video) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPlayable(!media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [video]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !playable) return;

    el.muted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          el.play().catch(() => undefined);
        } else {
          el.pause();
        }
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [playable]);

  if (playable && video) {
    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        preload={eager ? 'metadata' : 'none'}
        ref={ref}
      >
        {webm ? <source src={webm} type="video/webm" /> : null}
        <source src={video} type="video/mp4" />
      </video>
    );
  }

  if (poster) {
    return <img alt={alt} src={poster} />;
  }

  return <div aria-hidden className="media-fallback" />;
}
