import Portfolio from '../pages/Portfolio';
import { createFileRoute } from '@tanstack/react-router';

function Photography() {
  return <Portfolio panel="photography" />;
}

export const Route = createFileRoute('/photography')({
  component: Photography,
  head: () => ({ meta: [{ title: 'Photography · Nasrul Huda' }] }),
});
