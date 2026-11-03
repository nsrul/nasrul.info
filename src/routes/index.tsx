import Portfolio from '../pages/Portfolio';
import { createFileRoute } from '@tanstack/react-router';

function Home() {
  return <Portfolio panel="projects" />;
}

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    links: [
      {
        as: 'font',
        crossOrigin: 'anonymous',
        href: '/static/fonts/instrument-sans-latin.woff2',
        rel: 'preload',
        type: 'font/woff2',
      },
    ],
    meta: [
      {
        content:
          'Nasrul Huda is an AI/ML engineer based in Hamburg, working at the intersection of AI, software engineering, and research.',
        name: 'description',
      },
      { content: '#f6f6f6', name: 'theme-color' },
      { title: 'Nasrul Huda' },
    ],
  }),
});
