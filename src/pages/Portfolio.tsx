import IdentityPane, {
  sections,
  usePaneKeyboard,
  type PanelId,
} from '@components/IdentityPane';
import ProjectMedia from '@components/ProjectMedia';
import { trackEvent } from '@lib/analytics';
import { projects } from '@lib/portfolio';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

const openSource = [
  {
    href: 'https://github.com/nsrul/fleet',
    summary:
      'Fleet is a macOS workspace for running installed coding-agent CLIs side by side, backed by a Rust daemon that owns the terminals.',
    title: 'Fleet',
    year: '2026',
  },
  {
    href: 'https://github.com/nsrul/tally',
    summary:
      'Tally is a macOS menu bar app for watching LLM spend and subscription quotas against budgets.',
    title: 'Tally',
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

export default function Portfolio({ panel }: { panel: PanelId }) {
  const paneRef = useRef<HTMLElement>(null);
  const label = sections.find((section) => section.id === panel)?.label;

  usePaneKeyboard(paneRef);

  return (
    <div className="portfolio">
      <IdentityPane current={panel} />

      <main aria-label={label} className="pane-b" ref={paneRef}>
        {panel === 'featured' ? <FeaturedPanel /> : null}
        {panel === 'writing' ? <WritingPanel /> : null}
        {panel === 'open-source' ? <OpenSourcePanel /> : null}
        {panel === 'photography' ? <PhotographyPanel /> : null}
        {panel === 'meeting' ? <MeetingPanel /> : null}
      </main>
    </div>
  );
}

function FeaturedPanel() {
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
  return (
    <p className="lede">
      If you&apos;re interested in exploring the articles that inspire me and
      shape my thinking, check out <a href="/resources">Resources</a>.
    </p>
  );
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
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'dark' ? 'dark' : 'light';
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
