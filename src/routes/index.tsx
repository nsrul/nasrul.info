import Home from '../pages/Home';
import { createFileRoute } from '@tanstack/react-router';

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
        content: 'Nasrul Huda is an AI engineer based in Hamburg.',
        name: 'description',
      },
      { content: '#f6f6f6', name: 'theme-color' },
      { title: 'Nasrul Huda' },
    ],
  }),
});
