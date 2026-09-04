import { defineConfig } from 'tsup';

/* Un seul point d'entrée : la coque s'importe depuis `@yunary/shell`, le tree-shaking ESM
   fait le reste. Tout ce qui est peer ou dépendance reste EXTERNE : le paquet ne
   ré-embarque ni React, ni le design system, ni le client Supabase — une app n'en
   veut qu'une copie. */
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  target: 'es2020',
  external: [
    'react', 'react-dom', 'react/jsx-runtime', 'react-router-dom', '@yunary/ds',
    '@tanstack/react-query', 'lucide-react', 'tailwind-merge',
    '@supabase/supabase-js', '@supabase/ssr', 'react-hook-form', 'zod', '@hookform/resolvers',
  ],
});
