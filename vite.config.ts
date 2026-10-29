/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Everything MindHaven loads comes from its own origin, so the policy can be strict: no third-party
 * scripts, styles, fonts, images or network requests, and no inline script. `frame-ancestors` can't be
 * set from a <meta> tag (GitHub Pages doesn't let us send headers), so clickjacking protection is not
 * covered here.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

/** Production builds only: the dev server needs inline scripts and websockets for hot reload. */
function securityMeta(): Plugin {
  return {
    name: 'mindhaven:security-meta',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: (html) =>
        html.replace(
          '<meta charset="UTF-8" />',
          `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="no-referrer" />`,
        ),
    },
  }
}

/**
 * Where the app is served from. The default is the GitHub Pages project URL
 * (https://unchartedpr.github.io/mindhaven/), a sub-path. To serve from a domain root (e.g. a custom
 * domain), build with `BASE_PATH=/`. Always normalised to start and end with a slash.
 */
const BASE = `/${(process.env.BASE_PATH || '/mindhaven/').replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/')

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    securityMeta(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: BASE,
        name: 'MindHaven — mental wellbeing companion',
        short_name: 'MindHaven',
        description:
          'A free, private, no-login mental wellbeing companion: mood tracking, guided coping exercises, and crisis resources. All data stays on your device.',
        categories: ['health', 'lifestyle'],
        start_url: '.',
        display: 'standalone',
        background_color: '#f4f7f4',
        theme_color: '#436e47',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // Long-press the installed app icon for one-tap entry points.
        shortcuts: [
          { name: 'Check in', url: './#/check-in', icons: [{ src: 'icon-192.png', sizes: '192x192' }] },
          { name: 'Get help', url: './#/resources', icons: [{ src: 'icon-192.png', sizes: '192x192' }] },
          { name: 'Safety plan', url: './#/safety-plan', icons: [{ src: 'icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/vite-env.d.ts'],
      reporter: ['text-summary', 'html'],
      thresholds: { lines: 85, statements: 85, functions: 80, branches: 75 },
    },
  },
})
