import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  // Cambia esto por tu dominio real cuando lo tengas. Astro lo usa para
  // generar el sitemap y las URLs canónicas.
  site: 'https://reservaviva.com',
  integrations: [react()],
});
