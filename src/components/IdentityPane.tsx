import { portrait } from '@lib/portfolio';
import { useEffect, type MouseEvent, type RefObject } from 'react';

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
  { id: 'writing', label: 'Writing' },
  { id: 'projects', label: 'Featured Projects' },
  { id: 'open-source', label: 'Open Source' },
  { id: 'photography', label: 'Photography' },
  { id: 'meeting', label: 'Book a meeting' },
] as const;

export type PanelId = (typeof sections)[number]['id'];

export const panels: readonly PanelId[] = sections.map((section) => section.id);

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

export default function IdentityPane({
  current,
  onSelect,
}: {
  current: PanelId | null;
  onSelect?: (event: MouseEvent<HTMLAnchorElement>, id: PanelId) => void;
}) {
  return (
    <aside className="pane-a">
      <h1>
        <a href="/">Nasrul Huda</a>
      </h1>
      <p>
        I’m an AI/ML Engineer based in Hamburg. Currently, I work at{' '}
        <a href="https://pharos-labs.com" rel="noreferrer">
          Pharos Labs
        </a>{' '}
        and am pursuing a Master’s in Data Science and AI at Universität
        Hamburg.
      </p>
      <p>
        Alongside my studies, I've also worked as a Research Assistant at the
        university. Previously, I was an AI Engineer at{' '}
        <a href="https://syntwin.ai" rel="noreferrer">
          SynTwin
        </a>
        . I completed my Bachelor’s in Computer Science at Jamia Millia Islamia,
        New Delhi.
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
              <a
                aria-current={current === section.id ? 'page' : undefined}
                href={`/#${section.id}`}
                onClick={
                  onSelect
                    ? (event) => onSelect(event, section.id)
                    : undefined
                }
              >
                {section.label}
              </a>
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
