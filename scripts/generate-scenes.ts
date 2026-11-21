/**
 * scripts/generate-scenes.ts — menggambar adegan & objek ilustrasi undangan (Revisi Client 1) sebagai SVG.
 * Jalankan: npm run scenes   (hasil ke web/src/assets/scenes/)
 *
 * Dipanggil oleh: pengguna (terminal), sekali atau saat ingin mengubah bentuk/warna.
 * Memanggil: scripts/lib/art.ts (bunga, daun, sulur), node:fs.
 *
 * Isi: potret pria (kopyah/tarbusy Azhar) & muslimah, cincin + bunga, masjid,
 * lampion, bulan sabit & kerlip bintang, mushaf di rehal, burung, hamparan bunga bawah.
 * Semua digambar sendiri (milik proyek) dengan palet klien: putih/cream, hitam, biru HANYA untuk bunga.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { C, WATERCOLOR_FILTER, blossom, f, hydrangea, leaf, pick, prng, rose, svg, vine } from './lib/art.ts';

const OUT = resolve(import.meta.dirname, '..', 'web', 'src', 'assets', 'scenes');
mkdirSync(OUT, { recursive: true });
const write = (name: string, content: string) => writeFileSync(resolve(OUT, name), content);

const PAPER = '#F8F7F4';
const INK = C.ink;

/** SVG tanpa filter cat air (objek geometris yang tegas). */
const plain = (w: number, h: number, body: string, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><defs>${defs}</defs>${body}</svg>\n`;

// ── 2. Masjid (siluet berlapis) ────────────────────────────────────────────────────────────
{
  const dome = (x: number, base: number, r: number, fill: string) =>
    `<path d="M${f(x - r)} ${base} C${f(x - r)} ${f(base - r * 1.05)} ${f(x - r * 0.25)} ${f(base - r * 1.45)} ${x} ${f(base - r * 1.85)} C${f(x + r * 0.25)} ${f(base - r * 1.45)} ${f(x + r)} ${f(base - r * 1.05)} ${f(x + r)} ${base}Z" fill="${fill}"/>` +
    `<path d="M${x} ${f(base - r * 1.85)} v-14" stroke="${fill}" stroke-width="2.2"/>`;
  const crescent = (x: number, y: number, r: number, fill: string) =>
    `<path d="M${x} ${y - r} a${r} ${r} 0 1 0 ${r * 0.9} ${r * 1.4} a${r * 0.78} ${r * 0.78} 0 1 1 ${-r * 0.9} ${-r * 1.4}Z" fill="${fill}"/>`;
  const minaret = (x: number, top: number, w: number, fill: string) =>
    `<path d="M${x - w / 2} 200 L${x - w / 2 + 1} ${top + 40} h${w - 2} L${x + w / 2} 200Z" fill="${fill}"/>` +
    `<rect x="${x - w * 0.85}" y="${top + 34}" width="${w * 1.7}" height="6" rx="2" fill="${fill}"/>` +
    `<path d="M${x - w * 0.6} ${top + 34} L${x} ${top} L${x + w * 0.6} ${top + 34}Z" fill="${fill}"/>` +
    `<path d="M${x} ${top} v-12" stroke="${fill}" stroke-width="2"/>`;
  const arch = (x: number, y: number, w: number, h: number) =>
    `<path d="M${x - w / 2} ${y + h} V${y + w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 V${y + h}Z" fill="${PAPER}" fill-opacity=".55"/>`;

  const back = C.blue[4];
  const mid = C.blue[3];
  const front = C.blue[2];
  const body =
    // lapisan belakang
    minaret(52, 66, 13, back) + minaret(428, 78, 13, back) +
    dome(118, 168, 22, back) + dome(362, 168, 22, back) +
    `<rect x="0" y="168" width="480" height="32" fill="${back}"/>` +
    // lapisan tengah: dua menara tinggi dan kubah samping
    minaret(150, 52, 12, mid) + minaret(330, 52, 12, mid) +
    dome(188, 150, 26, mid) + dome(292, 150, 26, mid) +
    `<rect x="150" y="150" width="180" height="50" fill="${mid}"/>` +
    // lapisan depan: kubah utama
    dome(240, 136, 54, front) +
    `<rect x="186" y="136" width="108" height="64" fill="${front}"/>` +
    `<rect x="178" y="130" width="124" height="8" rx="3" fill="${front}"/>` +
    crescent(240, 22, 7, C.blue[0]) +
    [206, 240, 274].map((x) => arch(x, 150, 20, 50)).join('') +
    [168, 312].map((x) => arch(x, 166, 14, 34)).join('') +
    [52, 428].map((x) => arch(x, 156, 8, 44)).join('');
  const defs = `<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="m"><rect width="480" height="200" fill="url(#fade)"/></mask>`;
  write('mosque.svg', plain(480, 200, `<g mask="url(#m)">${body}</g>`, defs));
}

// ── 3. Lampion (fanous) — digantung, diayun lewat CSS ─────────────────────────────────────
{
  const defs = `<radialGradient id="glow" cx="50%" cy="55%" r="55%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="${C.cream[2]}"/><stop offset="1" stop-color="${C.blue[4]}"/></radialGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.cream[2]}" stop-opacity=".7"/><stop offset="1" stop-color="${C.cream[2]}" stop-opacity="0"/></radialGradient>`;
  const frame = C.blue[0];
  let lattice = '';
  for (let i = 0; i < 5; i++) {
    const y = 104 + i * 14;
    lattice += `<path d="M${30 - i * 0.6} ${y} Q50 ${y + 8} ${70 + i * 0.6} ${y}" fill="none" stroke="${frame}" stroke-width="1.2"/>`;
  }
  const body =
    `<circle cx="50" cy="128" r="58" fill="url(#halo)"/>` +
    // rantai
    `<path d="M50 0 V46" stroke="${frame}" stroke-width="2" stroke-dasharray="5 3"/>` +
    `<circle cx="50" cy="46" r="5" fill="none" stroke="${frame}" stroke-width="2.2"/>` +
    // tutup
    `<path d="M28 84 L50 54 L72 84Z" fill="${frame}"/><circle cx="50" cy="52" r="4" fill="${frame}"/>` +
    `<rect x="26" y="83" width="48" height="9" rx="3" fill="${C.blue[1]}"/>` +
    // badan kaca
    `<path d="M30 92 L25 160 Q50 178 75 160 L70 92Z" fill="url(#glow)" stroke="${frame}" stroke-width="2"/>` +
    lattice +
    `<path d="M50 92 V172 M38 92 L33 164 M62 92 L67 164" stroke="${frame}" stroke-width="1.3" fill="none"/>` +
    `<circle cx="50" cy="132" r="9" fill="none" stroke="${frame}" stroke-width="1.4"/><circle cx="50" cy="132" r="3" fill="${frame}"/>` +
    // alas & jumbai
    `<path d="M26 160 h48 l-6 12 h-36Z" fill="${C.blue[1]}"/>` +
    `<path d="M50 172 v18" stroke="${frame}" stroke-width="2"/><circle cx="50" cy="194" r="4" fill="${frame}"/>` +
    `<path d="M44 198 q6 14 12 0" fill="none" stroke="${frame}" stroke-width="1.6"/>`;
  write('lantern.svg', plain(100, 210, body, defs));
}

// ── 4. Kerlip bintang 4 sudut + bulan sabit ──────────────────────────────────────────────
{
  const star4 = (r: number, fill: string) =>
    `<path d="M0 ${-r} Q${r * 0.14} ${-r * 0.14} ${r} 0 Q${r * 0.14} ${r * 0.14} 0 ${r} Q${-r * 0.14} ${r * 0.14} ${-r} 0 Q${-r * 0.14} ${-r * 0.14} 0 ${-r}Z" fill="${fill}"/>`;
  write('sparkle.svg', plain(40, 40, `<g transform="translate(20 20)">${star4(18, C.blue[1])}${star4(8, PAPER)}</g>`));
  const defs = `<linearGradient id="moon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.cream[2]}"/><stop offset="1" stop-color="${C.cream[0]}"/></linearGradient>`;
  write(
    'crescent.svg',
    plain(
      120,
      120,
      `<path d="M78 8 A52 52 0 1 0 108 84 A42 42 0 1 1 78 8Z" fill="url(#moon)" stroke="${C.cream[0]}" stroke-width="2"/>` +
        `<g transform="translate(92 36)">${star4(9, C.blue[1])}</g>`,
      defs,
    ),
  );
}

// ── 5. Mushaf terbuka di rehal ───────────────────────────────────────────────────────────
{
  const defs = `<linearGradient id="pg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cream[2]}"/><stop offset=".5" stop-color="#FFFFFF"/><stop offset="1" stop-color="${C.cream[2]}"/></linearGradient>`;
  let lines = '';
  for (let i = 0; i < 7; i++) {
    const y = 56 + i * 11;
    lines += `<path d="M34 ${y} q22 -5 48 0 M118 ${y} q22 5 48 0" fill="none" stroke="${C.blue[1]}" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>`;
  }
  const body =
    // kaki rehal (X)
    `<path d="M60 142 L150 198 M140 142 L50 198" stroke="${C.blue[0]}" stroke-width="7" stroke-linecap="round"/>` +
    `<path d="M62 198 H138" stroke="${C.blue[0]}" stroke-width="6" stroke-linecap="round"/>` +
    // sampul & halaman
    `<path d="M14 40 Q100 22 186 40 L190 134 Q100 114 10 134Z" fill="${C.blue[1]}"/>` +
    `<path d="M20 44 Q60 32 100 46 L100 128 Q60 114 20 124Z" fill="url(#pg)"/>` +
    `<path d="M100 46 Q140 32 180 44 L180 124 Q140 114 100 128Z" fill="url(#pg)"/>` +
    `<path d="M100 46 V128" stroke="${C.blue[2]}" stroke-width="2"/>` +
    lines +
    // bingkai hias di tengah atas halaman
    `<g transform="translate(50 30)"><circle r="5" fill="none" stroke="${C.blue[0]}" stroke-width="1.6"/><circle r="1.8" fill="${C.blue[0]}"/></g>` +
    `<g transform="translate(150 30)"><circle r="5" fill="none" stroke="${C.blue[0]}" stroke-width="1.6"/><circle r="1.8" fill="${C.blue[0]}"/></g>`;
  write('quran.svg', plain(200, 210, body, defs));
}

// ── 6. Cincin + bunga (referensi foto no. 8): karangan bunga sebagai dudukan, dua cincin emas
//       bertumpuk saling mengait di atasnya ─────
{
  const defs =
    WATERCOLOR_FILTER +
    `<linearGradient id="goldA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3E2B3"/><stop offset=".4" stop-color="#C9A45E"/><stop offset=".75" stop-color="#E7CF91"/><stop offset="1" stop-color="#B58C45"/></linearGradient>
     <linearGradient id="goldB" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6E8BF"/><stop offset=".5" stop-color="#C39B52"/><stop offset="1" stop-color="#E9D399"/></linearGradient>
     <radialGradient id="rs" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#1E2022" stop-opacity=".28"/><stop offset="1" stop-color="#1E2022" stop-opacity="0"/></radialGradient>
     <clipPath id="cross"><rect x="150" y="116" width="30" height="40"/></clipPath>`;
  const ring = (cx: number, cy: number, rot: number, g: string) =>
    `<g transform="translate(${cx} ${cy}) rotate(${rot})"><ellipse rx="38" ry="28" fill="none" stroke="url(#${g})" stroke-width="9"/><ellipse rx="33.5" ry="23.5" fill="none" stroke="#FFFFFF" stroke-opacity=".5" stroke-width="1.1"/><ellipse rx="42" ry="32" fill="none" stroke="#7A5B22" stroke-opacity=".25" stroke-width=".8"/></g>`;
  const rnd = prng(91);
  let leaves = '';
  for (let i = 0; i < 20; i++) {
    const ang = -200 + i * 22 + (rnd() - 0.5) * 8;
    const rad = 66 + rnd() * 22;
    const px = 160 + Math.cos((ang * Math.PI) / 180) * rad * 1.15;
    const py = 190 + Math.sin((ang * Math.PI) / 180) * rad * 0.6;
    leaves += leaf(px, py, 32 + rnd() * 24, ang + 90, pick(rnd, C.leaf));
  }
  const body =
    leaves +
    hydrangea(160, 188, 52, 94, 40) +
    hydrangea(96, 200, 34, 95, 22) +
    hydrangea(226, 202, 34, 96, 22) +
    rose(122, 168, 24, 10) +
    rose(200, 166, 22, 50) +
    rose(160, 214, 20, 5) +
    rose(66, 214, 16, 30) +
    rose(256, 216, 16, 70) +
    blossom(96, 160, 8) + blossom(226, 156, 7, true) + blossom(52, 190, 6, true) + blossom(272, 190, 7) + blossom(160, 150, 6, true) +
    // bayangan lembut di tempat cincin bertumpu
    `<ellipse cx="160" cy="156" rx="62" ry="10" fill="url(#rs)"/>` +
    ring(138, 120, -16, 'goldB') +
    ring(180, 112, 12, 'goldA') +
    // cincin kiri di depan pada titik silang bawah → tampak saling mengait
    `<g clip-path="url(#cross)">${ring(138, 120, -16, 'goldB')}</g>` +
    `<path d="M181 76 l6 7 l-6 9 l-6 -9Z" fill="#FFFFFF" stroke="#B58C45" stroke-width="1.4"/>`;
  write('rings-floral.svg', svg(320, 250, body, defs));
}

// ── 6b. Rangkaian bunga tepi (menempel di tepi KIRI layar, dicerminkan untuk kanan) — 4 corak berbeda ───────
type Spot = [number, number, number];
function sideArt(name: string, seed: number, o: { leafN: number[]; leafLen: [number, number]; hydr: Spot[]; roses: Spot[]; blossoms: number; vine: boolean }) {
  const rnd = prng(seed);
  let back = '';
  let lines = '';
  if (o.vine) lines += `<path d="M2 0 C26 90 -8 180 18 270 C34 350 0 430 14 520" fill="none" stroke="${C.line}" stroke-opacity=".75" stroke-width="1.4"/>`;
  for (let i = 0; i < 12; i++) {
    const y = 20 + i * 42 + rnd() * 14;
    const n = o.leafN[i % o.leafN.length];
    for (let k = 0; k < n; k++) {
      back += leaf(-2, y + (rnd() - 0.5) * 16, o.leafLen[0] + rnd() * (o.leafLen[1] - o.leafLen[0]), 56 + k * 24 + (rnd() - 0.5) * 26, pick(rnd, C.leaf));
    }
  }
  let blooms = '';
  o.hydr.forEach(([x, y, r], i) => (blooms += hydrangea(x, y, r, seed + i, 26 + (i % 2) * 8)));
  o.roses.forEach(([x, y, r], i) => (blooms += rose(x, y, r, i * 40)));
  for (let i = 0; i < o.blossoms; i++) blooms += blossom(36 + rnd() * 80, 20 + i * (500 / o.blossoms) + rnd() * 24, 5 + rnd() * 3, i % 2 === 0);
  write(name, svg(170, 540, back + lines + blooms));
}
// campuran (mawar + hydrangea)
sideArt('side-bloom.svg', 321, { leafN: [3, 4], leafLen: [52, 114], hydr: [[6, 50, 40], [10, 196, 44], [4, 350, 42], [12, 470, 36]], roses: [[52, 112, 22], [58, 256, 24], [50, 404, 22], [46, 24, 16], [40, 520, 16]], blossoms: 10, vine: true });
// hydrangea biru lebat
sideArt('side-hydrangea.svg', 411, { leafN: [2, 3], leafLen: [40, 80], hydr: [[8, 40, 50], [14, 130, 46], [6, 230, 52], [14, 330, 46], [8, 430, 50], [12, 515, 40]], roses: [[62, 180, 14], [60, 380, 14]], blossoms: 14, vine: false });
// mawar krem dengan daun ramping
sideArt('side-rose.svg', 511, { leafN: [2, 2, 3], leafLen: [70, 130], hydr: [[4, 300, 30]], roses: [[24, 60, 30], [56, 150, 22], [20, 250, 32], [58, 340, 22], [22, 430, 30], [52, 510, 20]], blossoms: 6, vine: true });
// ranting daun saja (ringan)
sideArt('side-leaf.svg', 611, { leafN: [4, 3, 5], leafLen: [60, 140], hydr: [], roses: [[40, 270, 14]], blossoms: 12, vine: true });

// ── 9. Burung layang-layang ──────────────────────────────────────────────────────────────
write(
  'bird.svg',
  plain(
    44,
    22,
    `<path d="M2 14 C10 2 18 4 22 12 C26 4 34 2 42 14 C34 10 28 12 22 18 C16 12 10 10 2 14Z" fill="${C.blue[0]}" fill-opacity=".75"/>`,
  ),
);

// ── 10. Hamparan bunga bawah (menempel di dasar section, tidak terpotong) ─────────────────
{
  const rnd = prng(111);
  let leaves = '';
  for (let i = 0; i < 40; i++) {
    const x = -10 + i * 12.5 + (rnd() - 0.5) * 8;
    leaves += leaf(x, 262, 70 + rnd() * 70, (rnd() - 0.5) * 80, pick(rnd, C.leaf));
  }
  let sprigs = '';
  for (let i = 0; i < 5; i++) {
    const x = 40 + i * 100 + rnd() * 30;
    sprigs += vine([x, 262, x - 16 + rnd() * 32, 200, x + 14, 150, x - 6 + rnd() * 12, 96 + rnd() * 20], 6, 120 + i, 14);
  }
  const body =
    leaves +
    sprigs +
    hydrangea(40, 214, 56, 112, 44) +
    hydrangea(440, 218, 58, 113, 44) +
    hydrangea(236, 232, 62, 114, 48) +
    rose(130, 216, 30, 20) +
    rose(342, 218, 28, 60) +
    rose(36, 262, 24, 0) +
    rose(444, 262, 24, 40) +
    hydrangea(140, 262, 40, 115, 30) +
    hydrangea(334, 262, 42, 116, 30) +
    blossom(86, 176, 9) + blossom(196, 158, 8, true) + blossom(286, 170, 9) + blossom(396, 164, 8, true) + blossom(238, 120, 8);
  write('bed-bottom.svg', svg(480, 272, body));
}

console.log(`Adegan ditulis ke ${OUT}`);
