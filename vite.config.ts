// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// GitHub Pages SPA fix — no 404.html file needed in source.
// After every build, Vite copies dist/index.html → dist/404.html automatically.
// When GitHub Pages 404s a deep link (e.g. /rms/worker-guide/mg_shartex),
// it serves dist/404.html instead — which IS the React app — so React Router
// handles the path correctly. No redirect, no flash, no extra files to manage.
const copyIndexAs404 = {
  name: 'copy-index-as-404',
  closeBundle() {
    const dist = resolve(__dirname, 'dist')
    copyFileSync(
      resolve(dist, 'index.html'),
      resolve(dist, '404.html')
    )
    console.log('✅ dist/404.html created from dist/index.html')
  },
}

export default defineConfig({
  base: "/rms/",
  plugins: [react(), copyIndexAs404],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**'],
      reporter: ['text', 'html'],
    },
  },
})