import { portrait } from '@lib/portfolio';
import { Link } from '@tanstack/react-router';
import { useTheme } from 'next-themes';
import { useEffect, useState, type RefObject } from 'react';

const scrollKeys = new Set([
  'ArrowDown',
  'ArrowUp',
  'End',
  'Home',
  'PageDown',
  'PageUp',
  ' ',
]);

export const sections = [
  { id: 'featured', label: 'Featured', to: '/' },
  { id: 'writing', label: 'Writing', to: '/writing' },
  { id: 'open-source', label: 'Open source', to: '/open-source' },
  { id: 'photography', label: 'Photography', to: '/photography' },
  { id: 'meeting', label: 'Book a meeting', to: '/meeting' },
] as const;

export type PanelId = (typeof sections)[number]['id'];

export function usePaneKeyboard(paneRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (!scrollKeys.has(event.key)) return;
      if (window.matchMedia('(max-width: 900px)').matches) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('input, textarea, select, [contenteditable="true"]'))
        return;

      const scroller = target.closest('.pane-a, .pane-b') ?? pane;
      if (!(scroller instanceof HTMLElement)) return;

      const page = scroller.clientHeight * 0.85;
      const top =
        event.key === 'ArrowDown'
          ? 80
          : event.key === 'ArrowUp'
            ? -80
            : event.key === 'PageDown' || event.key === ' '
              ? page
              : event.key === 'PageUp'
                ? -page
                : event.key === 'Home'
                  ? -scroller.scrollTop
                  : scroller.scrollHeight;

      scroller.scrollBy({ top });
      event.preventDefault();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paneRef]);
}

export default function IdentityPane({ current }: { current: PanelId | null }) {
  return (
    <aside className="pane-a">
      <ThemeSwitch />
      <h1>
        <a href="/">Nasrul Huda</a>
      </h1>
      <p>
        I’m an AI/ML Engineer. I live in <mark>Hamburg, Germany</mark>.
        Currently, I work at{' '}
        <a href="https://pharos-labs.com" rel="noreferrer">
          Pharos Labs
        </a>{' '}
        and am pursuing a Master’s in Data Science and AI at{' '}
        <a href="https://www.uni-hamburg.de/" rel="noreferrer">
          Universität Hamburg
        </a>
        .
      </p>
      <p>
        Alongside my studies, I've also worked as a Research Assistant at the
        university. Previously, I was an AI Engineer at{' '}
        <a href="https://syntwin.ai" rel="noreferrer">
          SynTwin
        </a>
        .
      </p>
      <p>
        Find me on{' '}
        <a href="https://www.linkedin.com/in/nasrul-hudaa/" rel="noreferrer">
          LinkedIn
        </a>
        ,{' '}
        <a href="https://github.com/nsrul" rel="noreferrer">
          GitHub
        </a>
        , or{' '}
        <a href="https://x.com/nnasrrull" rel="noreferrer">
          X
        </a>
        . You can also{' '}
        <a href="https://resume.nasrul.info" rel="noreferrer">
          view my résumé
        </a>{' '}
        or <a href="mailto:hi@nasrul.info">get in touch</a>.
      </p>
      <nav aria-label="Sections">
        <ul>
          {sections.map((section) => (
            <li key={section.id}>
              <Link
                aria-current={current === section.id ? 'page' : undefined}
                to={section.to}
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p>
        <em>
          Last updated: <time dateTime="2026-11-01">1 November 2026</time>
        </em>
      </p>
      {portrait ? (
        <img
          alt={portrait.alt}
          className="portrait"
          height={1600}
          src={portrait.src}
          width={1200}
        />
      ) : (
        <div aria-hidden className="portrait" />
      )}
    </aside>
  );
}

function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const dark = ready && resolvedTheme === 'dark';

  return (
    <button
      aria-pressed={dark}
      className="theme-toggle"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      type="button"
    >
      <span className="sr-only">
        {dark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16">
      <circle
        cx="8"
        cy="8"
        fill="none"
        r="2.4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M8 1.2v2M8 12.8v2M1.2 8h2M12.8 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16">
      <path
        d="M8.6 1.5a5.2 5.2 0 1 0 5.9 7.6A4.4 4.4 0 0 1 8.6 1.5z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="miter"
        strokeWidth="1.4"
      />
    </svg>
  );
}
