import Portfolio from '../pages/Portfolio';
import { createFileRoute } from '@tanstack/react-router';

function Work() {
  return <Portfolio panel="projects" />;
}

export const Route = createFileRoute('/work')({
  component: Work,
  head: () => ({ meta: [{ title: 'Work · Nasrul Huda' }] }),
});
