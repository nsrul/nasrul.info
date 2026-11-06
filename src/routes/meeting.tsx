import Portfolio from '../pages/Portfolio';
import { createFileRoute } from '@tanstack/react-router';

function Meeting() {
  return <Portfolio panel="meeting" />;
}

export const Route = createFileRoute('/meeting')({
  component: Meeting,
  head: () => ({ meta: [{ title: 'Book a meeting · Nasrul Huda' }] }),
});
