/**
 * scripts/og-image.ts — membuat web/public/og-image.jpg (1200×630) untuk pratinjau tautan WhatsApp.
 * Jalankan: npm run og:image   (ulangi bila nama/tanggal di config berubah, lalu npm run build)
 *
 * Dipanggil oleh: pengguna (terminal).
 * Memanggil: sharp (render SVG → JPEG), config/event.ts, shared/date.ts, ornamen bouquet.svg.
 *
 * Catatan: teks dirender dengan font yang terpasang di komputer (Georgia/Times sebagai cadangan
 * Playfair Display), karena renderer SVG tidak bisa memuat berkas webfont. Ukuran dijaga < 300 KB
 * karena WhatsApp sering tidak menampilkan gambar pratinjau yang terlalu besar.
 */
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { event } from '../config/event.ts';
import { formatLongDate } from '../shared/date.ts';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'web', 'public', 'og-image.jpg');
const bouquet = readFileSync(resolve(root, 'web', 'src', 'assets', 'ornaments', 'bouquet.svg')).toString('base64');
const vine = readFileSync(resolve(root, 'web', 'src', 'assets', 'ornaments', 'corner-vine.svg')).toString('base64');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const date = formatLongDate(event.sessions[0].start, event.timezone);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F8F7F4"/>
  <rect x="0" y="0" width="470" height="630" fill="#EFE7DD"/>
  <image href="data:image/svg+xml;base64,${vine}" xlink:href="data:image/svg+xml;base64,${vine}" x="940" y="-6" width="262" height="170" transform="translate(2142 0) scale(-1 1)"/>
  <image href="data:image/svg+xml;base64,${bouquet}" xlink:href="data:image/svg+xml;base64,${bouquet}" x="-40" y="190" width="520" height="470"/>
  <g font-family="'Playfair Display', Georgia, 'Times New Roman', serif" fill="#1E2022" text-anchor="middle">
    <text x="835" y="190" font-family="Lato, 'Segoe UI', Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="8" fill="#4A4F52">${esc(event.titleId.toUpperCase())}</text>
    <line x1="760" y1="222" x2="822" y2="222" stroke="#9CA0A2" stroke-width="2"/>
    <rect x="829" y="216" width="12" height="12" transform="rotate(45 835 222)" fill="#9CA0A2"/>
    <line x1="848" y1="222" x2="910" y2="222" stroke="#9CA0A2" stroke-width="2"/>
    <text x="835" y="330" font-size="68" font-weight="700">${esc(event.couple.short)}</text>
    <text x="835" y="410" font-family="Lato, 'Segoe UI', Arial, sans-serif" font-size="32" font-weight="700">${esc(date)}</text>
    <text x="835" y="458" font-family="Lato, 'Segoe UI', Arial, sans-serif" font-size="26" fill="#4A4F52">${esc(event.venue.name)}</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 84, mozjpeg: true }).toFile(out);
console.log(`OG image ditulis: ${out} (${Math.round(statSync(out).size / 1024)} KB)`);
