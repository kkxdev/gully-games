import Link from 'next/link';
import type { ReactNode } from 'react';

export function SiteHeader() {
  return (
    <header className="masthead">
      <Link href="/" className="brand">
        <span className="brand-mark">gg</span>Gully Games
        <span className="brand-caption">EST. IN OUR CHILDHOOD</span>
      </Link>
      <span className="school-tag">
        LUNCH BREAK · 1994 <span>●</span>
      </span>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <span>Gully Games</span>
      <p>Made for the kid who never wanted to go home.</p>
      <span>PLAY. REPEAT. REMEMBER.</span>
    </footer>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main>
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}
