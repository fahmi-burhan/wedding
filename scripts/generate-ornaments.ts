/**
 * scripts/generate-ornaments.ts — menggambar semua ornamen SVG undangan secara prosedural.
 * Jalankan: npm run ornaments   (hasil ditulis ke web/src/assets/ornaments/ dan web/public/favicon.svg)
 *
 * Dipanggil oleh: pengguna (sekali, atau saat ingin mengubah warna/bentuk ornamen).
 * Memanggil: node:fs.
 *
 * Kenapa digambar sendiri? Ornamen di video & mockup milik pihak lain dan tidak boleh disalin.
 * Ornamen di sini 100% dibuat untuk proyek ini (bebas dipakai), terinspirasi gaya referensi:
 * hydrangea dusty blue + mawar cream (mockup), sulur garis tipis & bayangan daun (video).
 * Posisi acak memakai PRNG ber-seed → hasil selalu sama setiap dijalankan.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT = resolve(import.meta.dirname, '..', 'web', 'src', 'assets', 'ornaments');
const PUBLIC = resolve(import.meta.dirname, '..', 'web', 'public');
mkdirSync(OUT, { recursive: true });
mkdirSync(PUBLIC, { recursive: true });

// ── Palet (selaras dengan token di web/src/styles/main.css) ──────────────────────────────
const C = {
  blue: ['#56707D', '#6E8591', '#8A9EA8', '#A9BAC3', '#C7D3D9'], // tua → muda (aksen bunga)
  petalWhite: '#FBFAF7',
  cream: ['#D5C3B0', '#E2D4C5', '#EFE6DB'],
  leaf: ['#8C989C', '#A3AEB1', '#C3CBCD'], // daun abu-sage (tidak menambah warna hijau di luar palet)
  line: '#9CA0A2',
  ink: '#1E2022',
};

// ── PRNG ber-seed (mulberry32) ───────────────────────────────────────────────────────────
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n: number) => Number(n.toFixed(1));
const pick = <T>(rnd: () => number, arr: T[]) => arr[Math.floor(rnd() * arr.length)];

// Filter "cat air": tepi sedikit bergelombang + warna sedikit meresap.
const WATERCOLOR_FILTER = `
  <filter id="wc" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <radialGradient id="wash" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${C.blue[3]}" stop-opacity="0.55"/>
    <stop offset="100%" stop-color="${C.blue[4]}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="washCream" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${C.cream[0]}" stop-opacity="0.6"/>
    <stop offset="100%" stop-color="${C.cream[2]}" stop-opacity="0"/>
  </radialGradient>`;

// ── Bentuk dasar ─────────────────────────────────────────────────────────────────────────
/** Kelopak runcing-membulat dari titik (0,0) ke atas sepanjang r. */
const petalPath = (r: number, w = 0.55) =>
  `M0 0 C${f(r * w)} ${f(-r * 0.3)} ${f(r * w)} ${f(-r * 0.95)} 0 ${f(-r)} C${f(-r * w)} ${f(-r * 0.95)} ${f(-r * w)} ${f(-r * 0.3)} 0 0Z`;

/** Floret hydrangea: 4 kelopak + titik tengah. */
function floret(x: number, y: number, r: number, fill: string, rot: number): string {
  const petals = [0, 90, 180, 270]
    .map((a) => `<path d="${petalPath(r, 0.42)}" transform="rotate(${a + rot})" fill="${fill}" stroke="${C.blue[1]}" stroke-opacity=".35" stroke-width=".6"/>`)
    .join('');
  return `<g transform="translate(${f(x)} ${f(y)})">${petals}<circle r="${f(r * 0.16)}" fill="${C.blue[0]}"/></g>`;
}

/** Kepala hydrangea: puluhan floret dalam elips, digambar dari belakang (atas) ke depan (bawah). */
function hydrangea(cx: number, cy: number, R: number, seed: number, n = 40): string {
  const rnd = prng(seed);
  const items: { x: number; y: number; r: number; c: string; rot: number }[] = [];
  for (let i = 0; i < n; i++) {
    const ang = rnd() * Math.PI * 2;
    const dist = Math.sqrt(rnd()) * R * 0.92;
    const x = cx + Math.cos(ang) * dist;
    const y = cy + Math.sin(ang) * dist * 0.85;
    // Floret di bagian atas-kiri lebih muda (terkena cahaya), bagian bawah lebih tua.
    const shade = (y - cy) / R + (x - cx) / (R * 3) + (rnd() - 0.5) * 0.9;
    const c = shade < -0.45 ? C.petalWhite : shade < -0.1 ? C.blue[4] : shade < 0.3 ? C.blue[3] : shade < 0.6 ? C.blue[2] : C.blue[1];
    items.push({ x, y, r: R * (0.12 + rnd() * 0.06), c, rot: rnd() * 90 });
  }
  items.sort((a, b) => a.y - b.y);
  return `<g>
    <ellipse cx="${cx}" cy="${cy}" rx="${f(R * 1.15)}" ry="${f(R * 1.0)}" fill="url(#wash)"/>
    <g filter="url(#wc)">${items.map((it) => floret(it.x, it.y, it.r, it.c, it.rot)).join('')}</g>
  </g>`;
}

/** Mawar cream: lapisan kelopak luar + pusaran garis di tengah. */
function rose(cx: number, cy: number, r: number, rot = 0): string {
  const outer = [0, 72, 144, 216, 288]
    .map((a) => `<path d="${petalPath(r, 0.8)}" transform="rotate(${a + rot})" fill="${C.cream[2]}" stroke="${C.cream[0]}" stroke-width="1"/>`)
    .join('');
  const inner = [36, 108, 180, 252, 324]
    .map((a) => `<path d="${petalPath(r * 0.7, 0.75)}" transform="rotate(${a + rot})" fill="${C.cream[1]}" stroke="${C.cream[0]}" stroke-width=".8"/>`)
    .join('');
  const swirl = `<path d="M0 ${f(r * 0.1)} C${f(r * 0.35)} ${f(r * 0.05)} ${f(r * 0.3)} ${f(-r * 0.35)} 0 ${f(-r * 0.32)} C${f(-r * 0.3)} ${f(-r * 0.3)} ${f(-r * 0.32)} ${f(r * 0.12)} ${f(-r * 0.05)} ${f(r * 0.22)} C${f(r * 0.25)} ${f(r * 0.3)} ${f(r * 0.45)} 0 ${f(r * 0.3)} ${f(-r * 0.25)}" fill="none" stroke="#BFA88F" stroke-width="1.2" stroke-linecap="round"/>`;
  return `<g transform="translate(${cx} ${cy})" filter="url(#wc)"><circle r="${f(r * 1.05)}" fill="url(#washCream)"/>${outer}${inner}<circle r="${f(r * 0.38)}" fill="${C.cream[1]}"/>${swirl}</g>`;
}

/** Daun almond terisi + tulang daun. len = panjang, ang = arah (derajat, 0 = ke atas). */
function leaf(x: number, y: number, len: number, ang: number, fill: string): string {
  const w = len * 0.32;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})">
    <path d="M0 0 C${f(w)} ${f(-len * 0.25)} ${f(w * 0.7)} ${f(-len * 0.8)} 0 ${f(-len)} C${f(-w * 0.7)} ${f(-len * 0.8)} ${f(-w)} ${f(-len * 0.25)} 0 0Z" fill="${fill}" opacity=".92"/>
    <path d="M0 0 L0 ${f(-len * 0.92)}" stroke="${C.petalWhite}" stroke-opacity=".55" stroke-width=".9"/>
  </g>`;
}

/** Daun garis (line-art, seperti sulur di video): isi kertas, tepi abu. */
function leafLine(x: number, y: number, len: number, ang: number): string {
  const w = len * 0.3;
  return `<path d="M0 0 C${f(w)} ${f(-len * 0.25)} ${f(w * 0.7)} ${f(-len * 0.8)} 0 ${f(-len)} C${f(-w * 0.7)} ${f(-len * 0.8)} ${f(-w)} ${f(-len * 0.25)} 0 0Z" transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})" fill="#FFFFFF" fill-opacity=".7" stroke="${C.line}" stroke-width="1"/>`;
}

/** Bunga kecil 5 kelopak (untuk sulur). */
function blossom(x: number, y: number, r: number, light = false): string {
  const fill = light ? C.petalWhite : C.blue[3];
  const petals = [0, 72, 144, 216, 288]
    .map((a) => `<ellipse cx="0" cy="${f(-r * 0.55)}" rx="${f(r * 0.42)}" ry="${f(r * 0.58)}" transform="rotate(${a})" fill="${fill}" stroke="${C.blue[1]}" stroke-width=".8"/>`)
    .join('');
  return `<g transform="translate(${f(x)} ${f(y)})">${petals}<circle r="${f(r * 0.22)}" fill="${C.blue[0]}"/></g>`;
}

/** Titik-titik di sepanjang kurva Bézier kubik (untuk menaruh daun di sulur). */
function bezierPoints(p: number[], count: number) {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = p;
  const pts: { x: number; y: number; ang: number }[] = [];
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const u = 1 - t;
    const x = u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3;
    const y = u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3;
    const dx = 3 * u * u * (x1 - x0) + 6 * u * t * (x2 - x1) + 3 * t * t * (x3 - x2);
    const dy = 3 * u * u * (y1 - y0) + 6 * u * t * (y2 - y1) + 3 * t * t * (y3 - y2);
    pts.push({ x, y, ang: (Math.atan2(dy, dx) * 180) / Math.PI });
  }
  return pts;
}

/** Sulur garis dengan daun bergantian kiri-kanan dan "buah" bulat kecil. */
function vine(p: number[], leaves: number, seed: number, leafLen = 16): string {
  const rnd = prng(seed);
  const [x0, y0, x1, y1, x2, y2, x3, y3] = p;
  let out = `<path class="draw" pathLength="1" d="M${x0} ${y0} C${x1} ${y1} ${x2} ${y2} ${x3} ${y3}" fill="none" stroke="${C.line}" stroke-width="1.3" stroke-linecap="round"/>`;
  bezierPoints(p, leaves).forEach((pt, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    if (rnd() < 0.18) {
      out += `<circle cx="${f(pt.x + side * 6)}" cy="${f(pt.y - 4)}" r="3" fill="#FFFFFF" stroke="${C.line}" stroke-width="1"/>`;
    } else {
      // Daun "menghadap ke atas" saat rotate(0); +90 menyelaraskannya dengan arah sulur,
      // lalu dimiringkan 45–65° ke kiri/kanan secara bergantian.
      out += leafLine(pt.x, pt.y, leafLen * (0.75 + rnd() * 0.5), pt.ang + 90 + side * (45 + rnd() * 20));
    }
  });
  return out;
}

const svg = (w: number, h: number, body: string, extraDefs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><defs>${WATERCOLOR_FILTER}${extraDefs}</defs>${body}</svg>\n`;

// ── 1. Buket sudut kiri-bawah (cover + transisi sapuan) ─────────────────────────────────
{
  const rnd = prng(11);
  let leaves = '';
  for (let i = 0; i < 18; i++) {
    const ang = -100 + i * 9 + (rnd() - 0.5) * 10;
    const len = 110 + rnd() * 70;
    leaves += leaf(160 + (rnd() - 0.5) * 50, 270 + (rnd() - 0.5) * 30, len, ang, pick(rnd, C.leaf));
  }
  const body = `
    ${leaves}
    ${hydrangea(150, 240, 100, 3, 70)}
    ${rose(262, 196, 36, 10)}
    ${hydrangea(318, 300, 62, 5, 40)}
    ${rose(56, 318, 30, 40)}
    ${blossom(250, 120, 10)}${blossom(276, 104, 7, true)}${blossom(352, 230, 8)}
  `;
  writeFileSync(resolve(OUT, 'bouquet.svg'), svg(420, 380, body));
}

// ── 2. Sulur sudut kiri-atas (dicerminkan CSS untuk kanan) ──────────────────────────────
{
  const main = [-6, 34, 90, 6, 190, 18, 318, 58];
  const drop = [318, 58, 334, 100, 328, 150, 306, 210];
  const body = `
    ${vine(main, 18, 21, 22)}
    ${vine(drop, 9, 22, 18)}
    ${vine([40, 30, 60, 60, 50, 100, 30, 140], 5, 23, 12)}
    ${leaf(28, 36, 30, 120, C.leaf[2])}${leaf(34, 30, 26, 70, C.leaf[1])}${leaf(120, 18, 24, 40, C.leaf[2])}
    ${blossom(26, 22, 14)}${blossom(52, 14, 10, true)}${blossom(14, 48, 9)}
    ${blossom(122, 12, 9)}${blossom(300, 50, 8, true)}
  `;
  writeFileSync(resolve(OUT, 'corner-vine.svg'), svg(340, 220, body));
}

// ── 3. Ranting simetris (pengganti siluet pasangan; dipakai di penutup & dinding ucapan) ─
{
  const rnd = prng(31);
  let body = `<path d="M10 52 Q120 34 230 52" fill="none" stroke="${C.line}" stroke-width="1.3"/>`;
  for (let i = 0; i < 9; i++) {
    const x = 22 + i * 12;
    const y = 50 - i * 1.6;
    // Separuh kiri: daun condong ke kiri-atas (-60°) dan kiri-bawah (-120°); separuh kanan dicerminkan.
    body += leaf(x, y, 20 + rnd() * 8, -60 - rnd() * 15, pick(rnd, C.leaf));
    body += leaf(x + 4, y + 2, 18 + rnd() * 8, -120 + rnd() * 15, pick(rnd, C.leaf));
    const x2 = 218 - i * 12;
    body += leaf(x2, y, 20 + rnd() * 8, 60 + rnd() * 15, pick(rnd, C.leaf));
    body += leaf(x2 - 4, y + 2, 18 + rnd() * 8, 120 - rnd() * 15, pick(rnd, C.leaf));
  }
  body += blossom(120, 38, 12) + blossom(102, 44, 7, true) + blossom(138, 44, 7, true);
  writeFileSync(resolve(OUT, 'sprig.svg'), svg(240, 80, body));
}

// ── 4. Bayangan dedaunan (lapisan latar, seperti cahaya lewat pepohonan di video) ────────
{
  const rnd = prng(41);
  let body = '';
  for (let b = 0; b < 11; b++) {
    const sx = 60 + rnd() * 480;
    const sy = 60 + rnd() * 780;
    const ang = rnd() * 360;
    const len = 160 + rnd() * 160;
    let branch = `<path d="M0 0 Q${f(len * 0.4)} ${f(-20 + rnd() * 40)} ${f(len)} 0" stroke="${C.ink}" stroke-width="5" fill="none"/>`;
    const n = 7 + Math.floor(rnd() * 5);
    for (let i = 0; i < n; i++) {
      const t = (i + 1) / (n + 1);
      const side = i % 2 ? 1 : -1;
      branch += leaf(t * len, 0, 46 + rnd() * 34, side * (40 + rnd() * 40) + 90, C.ink);
    }
    body += `<g transform="translate(${f(sx)} ${f(sy)}) rotate(${f(ang)})">${branch}</g>`;
  }
  const defs = `<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>`;
  writeFileSync(
    resolve(OUT, 'leaf-shadow.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900" aria-hidden="true"><defs>${defs}</defs><g filter="url(#soft)">${body}</g></svg>\n`,
  );
}

// ── 5. Kelopak tunggal (untuk animasi kelopak jatuh) ────────────────────────────────────
{
  const defs = `<linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.petalWhite}"/><stop offset="1" stop-color="${C.blue[3]}"/></linearGradient>`;
  writeFileSync(
    resolve(OUT, 'petal.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-14 -36 28 38" width="28" height="38" aria-hidden="true"><defs>${defs}</defs><path d="${petalPath(34, 0.5)}" fill="url(#pg)" stroke="${C.blue[2]}" stroke-width=".8"/><path d="M0 -2 L0 -30" stroke="${C.blue[2]}" stroke-opacity=".5" stroke-width=".7"/></svg>\n`,
  );
}

// ── 6. Favicon ──────────────────────────────────────────────────────────────────────────
writeFileSync(
  resolve(PUBLIC, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -20 40 40"><circle r="20" fill="#F8F7F4"/>${blossom(0, 0, 16).replace(/<g transform="translate\(0 0\)">/, '<g>')}</svg>\n`,
);

console.log(`Ornamen ditulis ke ${OUT} dan favicon ke ${PUBLIC}`);
