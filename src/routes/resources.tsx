import Resources from '../pages/Resources';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/resources')({
  component: Resources,
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
          'Articles, essays, and videos that have shaped Nasrul Huda’s thinking.',
        name: 'description',
      },
      { content: '#f6f6f6', name: 'theme-color' },
      { title: 'Resources · Nasrul Huda' },
    ],
  }),
});
