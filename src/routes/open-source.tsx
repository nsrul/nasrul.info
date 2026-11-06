import Portfolio from '../pages/Portfolio';
import { createFileRoute } from '@tanstack/react-router';

function OpenSource() {
  return <Portfolio panel="open-source" />;
}

export const Route = createFileRoute('/open-source')({
  component: OpenSource,
  head: () => ({ meta: [{ title: 'Open Source · Nasrul Huda' }] }),
});
