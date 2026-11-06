import '@/assets/styles/portfolio.css';
import AnalyticsTracker from '@components/AnalyticsTracker';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider, useTheme } from 'next-themes';
import { useEffect } from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="portfolio-shell">
      {children}
      <PortfolioThemeColor />
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
