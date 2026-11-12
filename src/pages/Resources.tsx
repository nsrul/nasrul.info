import IdentityPane, {
  SectionNav,
  usePaneKeyboard,
} from '@components/IdentityPane';
import { resources } from '@data/resources';
import { useRef } from 'react';

function faviconSrc(href: string) {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(href).hostname}&sz=64`;
  } catch {
    return '';
  }
}

export default function Resources() {
  const paneRef = useRef<HTMLElement>(null);
  usePaneKeyboard(paneRef);

  return (
    <div className="portfolio">
      <SectionNav current={null} />
      <IdentityPane />
      <main aria-label="Resources" className="pane-b" ref={paneRef}>
        <p className="lede">
          Articles, essays, and videos that have shaped my thinking.
        </p>
        <div className="resource-board">
          <ul className="resources">
            {resources.map((resource) => {
              const icon = faviconSrc(resource.link);
              return (
                <li key={resource.link}>
                  <a href={resource.link} rel="noreferrer">
                    <span aria-hidden className="resource-mark">
                      {icon ? (
                        <img alt="" height={64} src={icon} width={64} />
                      ) : null}
                    </span>
                    <span className="resource-copy">
                      <span className="resource-title">{resource.title}</span>
                      {resource.description ? (
                        <span className="resource-desc">
                          {resource.description}
                        </span>
                      ) : null}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </div>
  );
}
