import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

/* La démo consomme la coque depuis ses SOURCES : ce qui est vérifié à l'écran est
   exactement ce qui est publié. Le design system, lui, vient de node_modules, épinglé
   — comme dans une app. */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@yunary/shell': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
    },
    /* Une seule copie de React et du DS : les sources de la coque, un cran au-dessus,
       résolvent leurs peers dans les node_modules de la démo. */
    dedupe: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', '@yunary/ds'],
  },
  server: {
    /* 5274 : la vitrine du DS occupe 5273. PORT permet au harness d'en assigner un autre. */
    port: Number(process.env.PORT) || 5274,
    open: false,
    /* `../..` = apps/packages : pendant un lot, @yunary/ds peut être branché en lien symbolique vers
       le dépôt voisin, et Vite sert ses polices depuis le chemin réel. */
    fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] },
  },
});
