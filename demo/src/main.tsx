import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
/* Les FONDATIONS du design system, deux imports, toujours — puis la couche Tailwind
   depuis styles.css. Le montage exact d'une app Yunary. */
import '@yunary/ds/core.css';
import '@yunary/ds/brand-yunary.css';
import './styles.css';
import { configureShell } from '@yunary/shell';
import { App } from './App';

/* La vitrine ne parle à aucun back : la configuration est factice, aucune requête ne part
   (les vues sont rendues avec des fixtures). Elle existe parce que le registre des outils
   et les liens de la coque lisent `hubUrl`. */
configureShell({
  supabaseUrl: 'https://demo.invalid',
  supabasePublishableKey: 'sb_publishable_demo',
  hubUrl: 'https://app.yunary.com',
});

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
