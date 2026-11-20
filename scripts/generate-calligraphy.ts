/**
 * scripts/generate-calligraphy.ts — membuat kaligrafi "دعوة زفاف" (undangan pernikahan) sebagai SVG VEKTOR
 * buatan sendiri (tidak memakai gambar referensi), sehingga selalu tajam di layar apa pun.
 * Jalankan: npm run calligraphy   (hasil: web/src/assets/brand/daawa-zifaf.svg)
 *
 * Dipanggil oleh: pengguna (terminal), sekali atau saat ingin mengubah gaya.
 * Memanggil: opentype.js (huruf Arab diubah menjadi kurva dari font Aref Ruqaa, SIL OFL), node:fs.
 *
 * Gaya (terinspirasi ide: kaligrafi emas bergaya tulis tangan dengan hiasan hati):
 *  - dua kata ditata dinamis: ukuran & garis dasar sedikit berbeda, agak miring seperti tulisan tangan;
 *  - hiasan hati + ekor sapuan digambar dengan "pena bermata lebar": tebal-tipis mengikuti arah goresan,
 *    sehingga terlihat seperti tinta, bukan garis seragam;
 *  - goresan kecil di atas huruf & titik hias sebagai pemanis.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import opentype from 'opentype.js';

const root = resolve(import.meta.dirname, '..');
const FONT = resolve(root, 'node_modules', '@fontsource', 'aref-ruqaa', 'files', 'aref-ruqaa-arabic-700-normal.woff');
const OUT = resolve(root, 'web', 'src', 'assets', 'brand', 'daawa-zifaf.svg');
const INK = '#1E2022';

const font = opentype.parse(readFileSync(FONT).buffer.slice(0));
const FEATURES = { liga: true, rlig: true, init: true, medi: true, fina: true };

interface Pt { x: number; y: number }
const f1 = (n: number) => Number(n.toFixed(1));

/** Kata Arab → path, digeser/diputar/diskalakan; kembalikan data path + kotak batas setelah transformasi. */
function word(text: string, size: number, x: number, y: number, rotateDeg: number) {
  const p = font.getPath(text, 0, 0, size, { features: FEATURES });
  const bb = p.getBoundingBox();
  const cx = (bb.x1 + bb.x2) / 2;
  const cy = (bb.y1 + bb.y2) / 2;
  const a = (rotateDeg * Math.PI) / 180;
  const tf = `translate(${f1(x)} ${f1(y)}) rotate(${rotateDeg}) translate(${f1(-cx)} ${f1(-cy)})`;
  const w = bb.x2 - bb.x1;
  const h = bb.y2 - bb.y1;
  // sudut-sudut kotak setelah transformasi (untuk menentukan posisi hiasan)
  const corner = (px: number, py: number): Pt => {
    const dx = px - cx;
    const dy = py - cy;
    return { x: x + dx * Math.cos(a) - dy * Math.sin(a), y: y + dx * Math.sin(a) + dy * Math.cos(a) };
  };
  return {
    svg: `<path transform="${tf}" d="${p.toPathData(1)}"/>`,
    tl: corner(bb.x1, bb.y1),
    tr: corner(bb.x2, bb.y1),
    bl: corner(bb.x1, bb.y2),
    br: corner(bb.x2, bb.y2),
    w,
    h,
  };
}

/**
 * Goresan "pena bermata lebar": titik tengah + sudut mata pena → poligon dengan lebar yang berubah.
 * lebar = tipis + (tebal − tipis) × |sin(arah goresan − sudut pena)| lalu diruncingkan di kedua ujung.
 */
function brush(pts: Pt[], thick: number, thin: number, nibDeg = -38, taper = 0.18): string {
  const nib = (nibDeg * Math.PI) / 180;
  const n = pts.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const contrast = Math.abs(Math.sin(ang - nib));
    const s = i / (n - 1);
    const edge = Math.min(1, Math.min(s, 1 - s) / taper);
    const w = (thin + (thick - thin) * contrast) * (0.12 + 0.88 * Math.sin((edge * Math.PI) / 2));
    left.push({ x: pts[i].x - (Math.sin(ang) * w) / 2, y: pts[i].y + (Math.cos(ang) * w) / 2 });
    right.push({ x: pts[i].x + (Math.sin(ang) * w) / 2, y: pts[i].y - (Math.cos(ang) * w) / 2 });
  }
  const all = [...left, ...right.reverse()];
  return `<path d="M${all.map((p) => `${f1(p.x)} ${f1(p.y)}`).join(' L')}Z"/>`;
}

/** Titik-titik sepanjang kurva Bézier kubik. */
function bez(p0: Pt, p1: Pt, p2: Pt, p3: Pt, steps = 40): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    });
  }
  return out;
}

// ── Tata letak ─────────────────────────────────────────────────────────────────────────────
// Arab dibaca kanan → kiri: "دعوة" di kanan, "زفاف" di kiri (agak lebih besar, sedikit lebih rendah).
const w1 = word('دعوة', 132, 520, 120, -4);
const w2 = word("زفاف", 150, 238, 138, -3);

// ── Hiasan hati: muncul dari ujung huruf terakhir (kiri) lalu menyapu ke bawah kata ────────
const tip: Pt = { x: w2.bl.x - 6, y: w2.bl.y - 34 }; // titik temu di ujung kiri kata
const heart: Pt[] = [];
{
  // Lead-in dari ujung huruf, lalu satu putaran hati (kurva hati parametrik), lalu ekor sapuan.
  const S = 4.1;
  const hx = tip.x - 20;
  const hy = tip.y - 10;
  const lead = bez({ x: tip.x + 46, y: tip.y + 12 }, { x: tip.x + 24, y: tip.y + 22 }, { x: tip.x + 8, y: tip.y + 10 }, { x: hx, y: hy + 17 * S * 0.84 }, 14);
  heart.push(...lead);
  for (let i = 0; i <= 120; i++) {
    const t = Math.PI + (i / 120) * Math.PI * 2; // mulai dari ujung bawah hati, satu putaran penuh
    const px = 16 * Math.sin(t) ** 3;
    const py = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    heart.push({ x: hx + px * S * 0.84, y: hy + py * S * 0.84 });
  }
  const end = heart[heart.length - 1];
  heart.push(...bez(end, { x: end.x + 40, y: end.y + 26 }, { x: end.x + 120, y: end.y + 34 }, { x: end.x + 230, y: end.y + 14 }, 40).slice(1));
}

// ── Goresan kecil di atas huruf (seperti harakat hias) & titik pemanis ─────────────────────
const marks: string[] = [];
const mark = (x: number, y: number, len: number, deg: number, thick = 5) => {
  const a = (deg * Math.PI) / 180;
  const pts = bez({ x, y }, { x: x + Math.cos(a) * len * 0.3, y: y + Math.sin(a) * len * 0.3 - 2 }, { x: x + Math.cos(a) * len * 0.7, y: y + Math.sin(a) * len * 0.7 - 2 }, { x: x + Math.cos(a) * len, y: y + Math.sin(a) * len }, 12);
  marks.push(brush(pts, thick, 1.2, -38, 0.3));
};
mark(w1.tr.x - 150, w1.tl.y - 4, 22, -28);
mark(w1.tr.x - 118, w1.tl.y - 12, 18, -34, 4);
mark(w2.tr.x - 40, w2.tl.y - 8, 24, -30);
mark(w2.tl.x + 60, w2.tl.y - 2, 20, -24, 4.5);
const dots = [
  { x: w1.tr.x - 20, y: w1.tl.y - 6, r: 3.6 },
  { x: w2.tl.x + 96, y: w2.tl.y - 20, r: 2.8 },
  { x: w2.bl.x + 70, y: w2.bl.y + 8, r: 2.6 },
];

const all: Pt[] = [w1.tl, w1.tr, w1.bl, w1.br, w2.tl, w2.tr, w2.bl, w2.br, ...heart];
const minX = Math.min(...all.map((p) => p.x)) - 16;
const maxX = Math.max(...all.map((p) => p.x)) + 16;
const minY = Math.min(...all.map((p) => p.y)) - 30;
const maxY = Math.max(...all.map((p) => p.y)) + 20;

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f1(minX)} ${f1(minY)} ${f1(maxX - minX)} ${f1(maxY - minY)}" role="img" aria-label="دعوة زفاف">` +
  `<g fill="${INK}">${w1.svg}${w2.svg}${brush(heart, 9.5, 1.8, -38, 0.1)}${marks.join('')}${dots.map((d) => `<circle cx="${f1(d.x)}" cy="${f1(d.y)}" r="${d.r}"/>`).join('')}</g></svg>\n`;
writeFileSync(OUT, svg);
console.log(`Kaligrafi ditulis: ${OUT} (${Math.round(svg.length / 1024)} KB, vektor)`);
