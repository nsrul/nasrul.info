import Portfolio from '../pages/Portfolio';
import { createFileRoute } from '@tanstack/react-router';

function Writing() {
  return <Portfolio panel="writing" />;
}

export const Route = createFileRoute('/writing')({
  component: Writing,
  head: () => ({ meta: [{ title: 'Writing · Nasrul Huda' }] }),
});
