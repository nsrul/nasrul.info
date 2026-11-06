import { AppProviders, AppShell } from '../App';
import appCss from '../assets/styles/globals.css?url';
import NotFound from '../pages/NotFound';
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    links: [
      {
        href: '/static/favicons/site.webmanifest',
        rel: 'manifest',
      },
      { href: appCss, rel: 'stylesheet' },
    ],
    meta: [
      { charSet: 'utf-8' },
      {
        content: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
        name: 'viewport',
      },
      { content: 'AI/ML Engineer.', name: 'description' },
      { content: '#0a0a0a', name: 'theme-color' },
      { content: 'Nasrul Huda', property: 'og:title' },
      { content: 'website', property: 'og:type' },
      { content: 'https://nasrul.info', property: 'og:url' },
      { content: 'summary', name: 'twitter:card' },
      { content: 'Nasrul Huda', name: 'twitter:title' },
      { title: 'Nasrul Huda' },
    ],
  }),
  notFoundComponent: RootNotFound,
  shellComponent: RootDocument,
});

function RootComponent() {
  return (
    <AppProviders>
      <AppShell>
        <Outlet />
      </AppShell>
    </AppProviders>
  );
}

function RootNotFound() {
  return (
    <AppProviders>
      <AppShell>
        <NotFound />
      </AppShell>
    </AppProviders>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
