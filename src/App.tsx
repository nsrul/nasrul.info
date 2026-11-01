import '@/assets/styles/portfolio.css';
import { cn } from '@/lib/className';
import AnalyticsTracker from '@components/AnalyticsTracker';
import AudioToggle from '@components/AudioToggle';
import Background from '@components/Background';
import CustomCursor from '@components/CustomCursor';
import MenuOverlay from '@components/MenuOverlay';
import Navbar from '@components/Navbar';
import { useRouterState } from '@tanstack/react-router';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider, useTheme } from 'next-themes';
import { useEffect } from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  if (pathname === '/' || pathname === '/resources') {
    return (
      <div className="portfolio-shell">
        {children}
        <PortfolioThemeColor />
        <Analytics />
        <AnalyticsTracker />
      </div>
    );
  }

  const isArticle =
    pathname.startsWith('/writing/') ||
    pathname.startsWith('/highlights/') ||
    pathname.startsWith('/work/');
  const isEditorial =
    pathname === '/writing' ||
    pathname === '/highlights' ||
    pathname === '/work' ||
    isArticle;
  const isPlayground = pathname === '/playground';
  return (
    <div
      className={cn('relative min-h-screen', isEditorial && 'article-shell')}
    >
      {isEditorial ? <div className="article-surface" /> : <Background />}
      <CustomCursor />
      <div aria-hidden className="nav-fade" />
      <div aria-hidden className="page-frame-fade-bottom" />
      <Navbar />
      <MenuOverlay />

      <main
        className={cn(
          'relative z-10 w-full font-sans antialiased',
          'pointer-events-none flex min-h-screen flex-col justify-start',
          '[&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_input]:pointer-events-auto [&_nav]:pointer-events-auto',
          '[&_canvas]:pointer-events-auto [&_div[class*="cursor-pointer"]]:pointer-events-auto',
        )}
      >
        {children}
      </main>

      {!isPlayground && <AudioToggle />}
      <Analytics />
      <AnalyticsTracker />
    </div>
  );
}

function PortfolioThemeColor() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    const color = resolvedTheme === 'dark' ? '#242220' : '#f6f6f6';
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute('content', color);
    });
  }, [resolvedTheme]);
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
      enableSystem={false}
    >
      {children}
    </ThemeProvider>
  );
}
