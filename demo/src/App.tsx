import { useEffect, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { Logo, Tabs } from '@yunary/ds';
import { SHELL_VERSION } from '@yunary/shell';
import { LayoutPage } from './pages/Layout';

document.title = 'Yunary — Shell';

const PAGES: { value: string; label: string; render: () => JSX.Element }[] = [
  { value: 'layout', label: 'Layout', render: () => <LayoutPage /> },
  { value: 'accueil', label: 'À propos', render: () => <p className="caption">Coque {SHELL_VERSION} — la vitrine rend les vues avec des fixtures, sans back.</p> },
];

const THEMES = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'split', label: 'Côte à côte' },
];

export function App() {
  const [page, setPage] = useState('layout');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const current = PAGES.find(p => p.value === page) ?? PAGES[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="page flex flex-wrap items-center justify-between gap-space-4 py-space-3">
          <div className="flex items-baseline gap-space-3">
            <Logo variant="wordmark" height="1.375rem" />
            <span className="caption">Shell · recette visuelle</span>
          </div>
          <Tabs onCard items={THEMES} value={theme} onChange={setTheme} />
        </div>
      </header>
      <main className="page flex flex-col gap-space-6 py-space-7">
        <nav aria-label="Familles" className="-mx-space-1 overflow-x-auto px-space-1">
          <Tabs items={PAGES.map(p => ({ value: p.value, label: p.label }))} value={page} onChange={setPage} />
        </nav>
        {theme === 'split' ? (
          <div className="grid grid-cols-1 gap-space-5 lg:grid-cols-2">
            <Panel label="Clair">{current.render()}</Panel>
            <Panel label="Sombre" dark>{current.render()}</Panel>
          </div>
        ) : current.render()}
      </main>
    </div>
  );
}

function Panel({ label, dark, children }: { label: string; dark?: boolean; children: ReactNode }) {
  return (
    <div className={`${dark ? 'dark' : ''} rounded-xl border border-border bg-background text-foreground shadow-sm`}>
      <div className="border-b border-border px-space-5 py-space-3"><span className="eyebrow">{label}</span></div>
      <div className="p-space-5">{children}</div>
    </div>
  );
}
