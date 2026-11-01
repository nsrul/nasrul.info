import ProjectMedia from '@components/ProjectMedia';
import { trackEvent } from '@lib/analytics';
import { portrait, projects } from '@lib/portfolio';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { allWritings } from 'content-collections';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react';

const scrollKeys = new Set([
  'ArrowDown',
  'ArrowUp',
  'End',
  'Home',
  'PageDown',
  'PageUp',
  ' ',
]);

const panels = [
  'writing',
  'projects',
  'open-source',
  'photography',
  'meeting',
] as const;

type PanelId = (typeof panels)[number];

const sections: { id: PanelId; label: string }[] = [
  { id: 'writing', label: 'Writing' },
  { id: 'projects', label: 'Featured Projects' },
  { id: 'open-source', label: 'Open Source' },
  { id: 'photography', label: 'Photography' },
  { id: 'meeting', label: 'Book a meeting' },
];

const openSource = [
  {
    href: 'https://github.com/nsrul/zeus',
    summary:
      'Zeus is a native macOS workbench for running coding agents in parallel without losing their terminals.',
    title: 'Zeus',
    year: '2026',
  },
  {
    href: 'https://github.com/nsrul/acl-anthology-rag',
    summary:
      'ACL Anthology Search finds papers by what they mean, not by the keywords they happen to use.',
    title: 'ACL Anthology Search',
    year: '2026',
  },
  {
    href: 'https://github.com/nsrul/ft-nicheformer',
    summary:
      'Federated Nicheformer fine-tunes a genomics model across separate regions of mouse brain data without moving the samples.',
    title: 'Federated Nicheformer',
    year: '2026',
  },
  {
    href: 'https://github.com/nsrul/prototypical-networks-bioacoustics',
    summary:
      'This project trains a model to recognise animal calls from only a handful of labelled clips.',
    title: 'Bioacoustic Sound Classification',
    year: '2026',
  },
  {
    href: 'https://github.com/nsrul/mytorch',
    summary:
      'MyTorch is a small deep-learning library written to see what sits inside PyTorch.',
    title: 'MyTorch',
    year: '2025',
  },
] as const;

const CAL_LINK = 'nasrul-huda/15min';
const CAL_NAMESPACE = 'home-meeting';

const writtenOn = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function panelFromHash(hash: string): PanelId {
  const id = hash.replace(/^#/, '');
  return (panels as readonly string[]).includes(id)
    ? (id as PanelId)
    : 'projects';
}

function formatWrittenOn(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return writtenOn.format(date);
}

type Post = {
  publishedAt: string;
  slug: string;
  summary?: string;
  title: string;
};

function writingPosts(): Post[] {
  try {
    return ((allWritings as Post[]) || [])
      .filter((post) => post.slug && post.title)
      .slice()
      .sort(
        (a, b) =>
          Number(new Date(b.publishedAt)) - Number(new Date(a.publishedAt)),
      );
  } catch {
    return [];
  }
}

export default function Home() {
  const paneRef = useRef<HTMLElement>(null);
  const seenPanel = useRef<PanelId | null>(null);
  const navigate = useNavigate();
  const hash = useRouterState({
    select: (state) => state.location.hash,
  });
  const [mounted, setMounted] = useState(false);
  const panel = mounted ? panelFromHash(hash) : 'projects';
  const label = sections.find((section) => section.id === panel)?.label;

  useEffect(() => {
    setMounted(true);
  }, []);

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
  }, []);

  const showPanel = useCallback(() => {
    const pane = paneRef.current;
    if (!pane) return;
    if (window.matchMedia('(max-width: 900px)').matches) {
      pane.scrollIntoView();
      return;
    }
    pane.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (seenPanel.current === panel) return;
    const first = seenPanel.current === null;
    seenPanel.current = panel;
    if (first) return;
    showPanel();
  }, [panel, showPanel]);

  const onSelect = (event: MouseEvent<HTMLAnchorElement>, id: PanelId) => {
    event.preventDefault();
    navigate({
      hash: id,
      hashScrollIntoView: false,
      to: '/',
    });
    if (panel === id) showPanel();
  };

  return (
    <div className="portfolio">
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
          . I completed my Bachelor’s in Computer Science at Jamia Millia
          Islamia, New Delhi.
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
                  aria-current={panel === section.id ? 'page' : undefined}
                  href={`#${section.id}`}
                  onClick={(event) => onSelect(event, section.id)}
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

      <main aria-label={label} className="pane-b" ref={paneRef}>
        {panel === 'writing' ? <WritingPanel /> : null}
        {panel === 'projects' ? <ProjectsPanel /> : null}
        {panel === 'open-source' ? <OpenSourcePanel /> : null}
        {panel === 'photography' ? <PhotographyPanel /> : null}
        {panel === 'meeting' ? <MeetingPanel /> : null}
      </main>
    </div>
  );
}

function ProjectsPanel() {
  return projects.map((project, index) => (
    <article className="entry" key={project.title}>
      <h2>{project.title}</h2>
      <p className="year">
        <time dateTime={project.year}>{project.year}</time>
      </p>
      <div className="copy">{project.copy}</div>
      <div className="media">
        <ProjectMedia
          alt={project.alt}
          eager={index === 0}
          poster={project.poster}
          video={project.video}
          webm={project.webm}
        />
      </div>
    </article>
  ));
}

function WritingPanel() {
  const posts = writingPosts();
  if (posts.length === 0) {
    return (
      <p className="lede">
        If you&apos;re interested in exploring the articles that inspire me and
        shape my thinking, check out <a href="/resources">Resources</a>.
      </p>
    );
  }

  return posts.map((post) => (
    <article className="note" key={post.slug}>
      <h2>
        <a href={`/writing/${post.slug}`}>{post.title}</a>
      </h2>
      <p className="year">
        <time dateTime={post.publishedAt}>
          {formatWrittenOn(post.publishedAt)}
        </time>
      </p>
      {post.summary ? (
        <div className="copy">
          <p>{post.summary}</p>
        </div>
      ) : null}
    </article>
  ));
}

function OpenSourcePanel() {
  return (
    <>
      <p className="lede">
        Published code is on{' '}
        <a href="https://github.com/nsrul" rel="noreferrer">
          GitHub
        </a>
        .
      </p>
      {openSource.map((item) => (
        <article className="note" key={item.href}>
          <h2>{item.title}</h2>
          <p className="year">
            <time dateTime={item.year}>{item.year}</time>
          </p>
          <div className="copy">
            <p>{item.summary}</p>
            <p>
              <a href={item.href} rel="noreferrer">
                GitHub
              </a>
            </p>
          </div>
        </article>
      ))}
    </>
  );
}

function PhotographyPanel() {
  return <p className="lede">I haven&apos;t published photographs here yet.</p>;
}

function MeetingPanel() {
  return (
    <>
      <p className="lede">
        Book a 15-minute intro call for AI and LLM engineering, data
        prototyping, or technical advisory. The first call is on me. You can
        also reach me at <a href="mailto:hi@nasrul.info">hi@nasrul.info</a>.
      </p>
      <Booking />
    </>
  );
}

function Booking() {
  const theme = 'light' as const;
  const [cal, setCal] = useState<typeof import('@calcom/embed-react') | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    import('@calcom/embed-react').then((mod) => {
      if (!cancelled) setCal(mod);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!cal) return;
    let cancelled = false;
    (async () => {
      const api = await cal.getCalApi({ namespace: CAL_NAMESPACE });
      if (cancelled) return;
      api('ui', {
        cssVarsPerTheme: {
          dark: { 'cal-brand': '#ffffff' },
          light: { 'cal-brand': '#111111' },
        },
        hideEventTypeDetails: false,
        layout: 'month_view',
        theme,
      });
      api('on', {
        action: 'bookingSuccessful',
        callback: () => {
          trackEvent('Booking');
        },
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [cal, theme]);

  if (!cal) return null;
  const Embed = cal.default;
  return (
    <div className="booking">
      <Embed
        calLink={CAL_LINK}
        config={{ layout: 'month_view', theme }}
        namespace={CAL_NAMESPACE}
        style={{ height: '100%', overflow: 'scroll', width: '100%' }}
      />
    </div>
  );
}
