import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { probeLiveRailwaySchedule } from './api/railway-lookup'

function railwayLookupDevPlugin(): Plugin {
  return {
    name: 'railway-lookup-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/railway-lookup', async (req, res) => {
        try {
          const reqUrl = new URL(req.url || '/', 'http://localhost');
          const from = (reqUrl.searchParams.get('from') || '').trim();
          const to = (reqUrl.searchParams.get('to') || '').trim();
          const date = (reqUrl.searchParams.get('date') || '').trim();
          res.setHeader('Content-Type', 'application/json');
          if (!from || !to) {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, error: 'Missing from or to parameter' }));
            return;
          }
          const result = await probeLiveRailwaySchedule(from, to, date);
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, from, to, date, ...result }));
        } catch {
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, checkedLive: false, liveAvailable: false, liveMatches: [] }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    railwayLookupDevPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-512x512.png',
        '20428_4-78474535-icon.png',
        'railway_emblem_official.png',
        'shohoz_synesis_vincen_jv.png',
      ],
      manifest: {
        id: '/',
        name: 'EasyPad – Prescription Software for Doctors',
        short_name: 'EasyPad',
        description: 'High-efficiency offline prescription maker, Bangladesh Railway e-ticket generator, and document suite.',
        theme_color: '#1e40af',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        categories: ['medical', 'productivity', 'utilities'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
})
