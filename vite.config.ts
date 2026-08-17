import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const { version: appVersion } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string };

function adsenseAssets(): Plugin {
  const client = () => String(process.env.VITE_ADSENSE_CLIENT ?? '').trim();

  return {
    name: 'adsense-assets',
    // Keep ads.txt in the build. Do not inject adsbygoogle.js into the empty
    // SPA shell — AdSense rejected geoking.fr for ads on screens without
    // publisher content. Units load the script after article pages mount.
    generateBundle() {
      const match = client().match(/^(?:ca-)?(pub-\d+)$/);
      if (!match) return;
      this.emitFile({
        type: 'asset',
        fileName: 'ads.txt',
        source: `google.com, ${match[1]}, DIRECT, f08c47fec0942fa0\n`,
      });
    },
  };
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [react(), tailwindcss(), adsenseAssets()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          xml: ['fast-xml-parser'],
          search: ['minisearch'],
          graph: ['cytoscape'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8788',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
