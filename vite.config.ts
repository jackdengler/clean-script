import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/clean-script/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Movie Planner',
        short_name: 'Movies',
        description: 'Plan movies you want to write — stored on GitHub.',
        theme_color: '#4f46e5',
        background_color: '#fafafa',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/clean-script/',
        start_url: '/clean-script/',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/clean-script/index.html',
      },
    }),
  ],
});
