import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
/* Les FONDATIONS du design system, deux imports, toujours — puis la couche Tailwind
   depuis styles.css. Le montage exact d'une app Yunary. */
import '@yunary/ds/core.css';
import '@yunary/ds/brand-yunary.css';
import './styles.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
