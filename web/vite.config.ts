/**
 * web/vite.config.ts — konfigurasi Vite untuk halaman undangan (index.html) & panel admin (admin.html).
 *
 * Dipanggil oleh: `npm run dev:web` (server dev + proxy API) dan `npm run build` (hasil ke /dist).
 * Memanggil: @vitejs/plugin-vue, @tailwindcss/vite, config/event.ts (meta Open Graph).
 *
 * Plugin `ogMeta` mengisi placeholder %OG_...% di index.html dari config/event.ts saat build.
 * WhatsApp TIDAK menjalankan JavaScript saat membuat pratinjau tautan, jadi meta OG harus
 * sudah tertulis di HTML statis — tidak bisa diisi oleh Vue.
 */
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { event } from '../config/event.ts';

const webDir = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(webDir, '..');

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function ogMeta(baseUrl: string): Plugin {
  return {
    name: 'og-meta',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!ctx.filename.endsWith('index.html')) return html;
        if (!baseUrl) {
          console.warn('\n[og-meta] PUBLIC_BASE_URL kosong → og:image relatif; pratinjau WhatsApp butuh URL absolut. Isi .env sebelum build produksi.\n');
        }
        const image = baseUrl ? `${baseUrl}${event.og.image}` : event.og.image;
        return html
          .replaceAll('%OG_TITLE%', escapeHtml(event.og.title))
          .replaceAll('%OG_DESCRIPTION%', escapeHtml(event.og.description))
          .replaceAll('%OG_IMAGE%', escapeHtml(image))
          .replaceAll('%OG_URL%', escapeHtml(baseUrl ? `${baseUrl}/` : '/'));
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '');
  const baseUrl = (env.PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  // Proxy dev harus menuju port yang SAMA dengan server API (PORT di .env), bukan angka tetap.
  const apiPort = env.PORT || '3000';
  return {
    root: webDir,
    publicDir: resolve(webDir, 'public'),
    // Hanya variabel berawalan VITE_ yang boleh masuk ke kode browser (rahasia di .env tetap aman).
    envDir: rootDir,
    plugins: [vue(), tailwindcss(), ogMeta(baseUrl)],
    server: {
      host: true, // bisa dibuka dari ponsel di Wi-Fi yang sama
      port: 5173,
      proxy: { '/api': `http://127.0.0.1:${apiPort}` },
      fs: { allow: [rootDir] }, // izinkan impor config/ & shared/ di luar folder web
    },
    build: {
      outDir: resolve(rootDir, 'dist'),
      emptyOutDir: true,
      target: 'es2020', // dukung WebView/in-app browser yang sedikit lebih tua
      rolldownOptions: {
        input: {
          main: resolve(webDir, 'index.html'),
          admin: resolve(webDir, 'admin.html'),
        },
      },
    },
  };
});
