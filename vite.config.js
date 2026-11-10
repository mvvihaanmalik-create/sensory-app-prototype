import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `vite build --mode phone` makes the full-screen version for testing on phones: no iPhone frame, same app.
// It also asks iPhones to open it full screen when added to the Home Screen.
const phoneHtml = () => ({
  name: 'phone-html',
  transformIndexHtml: (html) => html
    .replace('<meta name="viewport" content="width=device-width, initial-scale=1" />',
      '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />\n'
      + '<meta name="apple-mobile-web-app-capable" content="yes" />\n<meta name="mobile-web-app-capable" content="yes" />\n'
      + '<meta name="apple-mobile-web-app-title" content="Sensory app" />\n<meta name="apple-mobile-web-app-status-bar-style" content="default" />\n'
      + '<meta name="theme-color" content="#f7f5f1" />')
    .replace('<title>Sensory app · coded prototype</title>', '<title>Sensory app · phone</title>'),
});

export default defineConfig(({ mode }) => {
  const phone = mode === 'phone';
  return {
    plugins: [react(), viteSingleFile(), ...(phone ? [phoneHtml()] : [])],
    build: { assetsInlineLimit: 100000000, ...(phone ? { outDir: 'dist/phone', emptyOutDir: false } : {}) },
  };
});
