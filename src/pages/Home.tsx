import ProjectMedia from '@components/ProjectMedia';
import { contact, portrait, projects } from '@lib/portfolio';
import { useEffect, useRef } from 'react';

const scrollKeys = new Set([
  'ArrowDown',
  'ArrowUp',
  'End',
  'Home',
  'PageDown',
  'PageUp',
  ' ',
]);

export default function Home() {
  const paneRef = useRef<HTMLElement>(null);

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

  return (
    <div className="portfolio">
      <aside className="pane-a">
        <h1>
          <a href="/">Nasrul Huda</a>
        </h1>
        <p>
          I am an AI engineer based in Hamburg, currently working at{' '}
          <a href="https://pharos-labs.com" rel="noreferrer">
            pharoslabs
          </a>
          .
        </p>
        <p>
          Previously, I was an AI engineer at{' '}
          <a href="https://syntwin.ai" rel="noreferrer">
            SynTwin
          </a>
          .
        </p>
        <p>
          {contact.map((link, index) => (
            <span key={link.href}>
              {index > 0 ? <br /> : null}
              <a href={link.href}>{link.label}</a>
            </span>
          ))}
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

      <main className="pane-b" ref={paneRef}>
        {projects.map((project, index) => (
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
        ))}
      </main>
    </div>
  );
}
