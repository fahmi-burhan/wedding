/**
 * scripts/process-assets.ts — mengubah gambar dari klien (referensi/) menjadi aset web transparan.
 * Jalankan: npm run assets   (hanya perlu bila gambar sumber diganti)
 *
 * Dipanggil oleh: pengguna (terminal).
 * Memanggil: sharp.
 * Hasil (di-commit, karena folder referensi/ tidak ikut git):
 *   web/src/assets/brand/logo.png          dari referensi/4.jpeg  (logo cover)
 *
 * Cara kerja: latar gambar dibuang dengan mengubah selisih terang → transparansi (alpha), lalu warnanya
 * diganti hitam #1E2022 sesuai permintaan klien (tulisan hitam). Kaligrafi "دعوة زفاف" TIDAK dari gambar:
 * dibuat sendiri sebagai vektor oleh scripts/generate-calligraphy.ts.
 */
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import type { Sharp } from 'sharp';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'web', 'src', 'assets', 'brand');
mkdirSync(outDir, { recursive: true });

const INK = { r: 30, g: 32, b: 34 };
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Gambar → PNG transparan berwarna tinta. lo/hi = ambang luminans (di bawah lo = penuh, di atas hi = bening). */
async function inkify(input: Sharp, lo: number, hi: number, file: string, width?: number) {
  let img = input;
  if (width) img = img.resize({ width, kernel: 'lanczos3' }).blur(0.8);
  const { data, info } = await img.greyscale().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i++) {
    const a = 1 - smoothstep(lo, hi, data[i]);
    out[i * 4] = INK.r;
    out[i * 4 + 1] = INK.g;
    out[i * 4 + 2] = INK.b;
    out[i * 4 + 3] = Math.round(a * 255);
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .extend({ top: 8, bottom: 8, left: 8, right: 8, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(resolve(outDir, file));
  const m = await sharp(resolve(outDir, file)).metadata();
  console.log(`${file}: ${m.width}×${m.height}`);
}

// Logo: slate gelap (±98) di atas latar abu terang (±217).
await inkify(sharp(resolve(root, 'referensi', '4.jpeg')), 120, 200, 'logo.png');
