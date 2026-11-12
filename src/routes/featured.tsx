import Portfolio from '../pages/Portfolio';
import { createFileRoute } from '@tanstack/react-router';

function Featured() {
  return <Portfolio panel="featured" />;
}

export const Route = createFileRoute('/featured')({
  component: Featured,
  head: () => ({
    meta: [
      {
        content:
          'Selected work by Nasrul Huda, from agentic platforms for medical writing to macOS tools and research projects.',
        name: 'description',
      },
      { title: 'Featured · Nasrul Huda' },
    ],
  }),
});
