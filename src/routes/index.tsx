import Portfolio from '../pages/Portfolio';
import { createFileRoute } from '@tanstack/react-router';

function About() {
  return <Portfolio panel="about" />;
}

export const Route = createFileRoute('/')({
  component: About,
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
          'Nasrul Huda is an AI/ML engineer living in Hamburg, Germany, working at the intersection of AI, software engineering, and research.',
        name: 'description',
      },
      { content: '#f6f6f6', name: 'theme-color' },
      { title: 'Nasrul Huda' },
    ],
  }),
});
