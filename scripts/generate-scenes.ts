/**
 * scripts/generate-scenes.ts — menggambar adegan & objek ilustrasi undangan (Revisi Client 1) sebagai SVG.
 * Jalankan: npm run scenes   (hasil ke web/src/assets/scenes/)
 *
 * Dipanggil oleh: pengguna (terminal), sekali atau saat ingin mengubah bentuk/warna.
 * Memanggil: scripts/lib/art.ts (bunga, daun, sulur), node:fs.
 *
 * Isi: pita motif pemisah, siluet pria (kopyah/tarbusy Azhar) & muslimah, cincin + bunga, masjid,
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

// ── 1. Pita motif pemisah antar bagian (ubin berulang, tegas seperti pita motif di referensi) ──
{
  const W = 64;
  const H = 46;
  const cx = W / 2;
  const cy = H / 2;
  const star = (r: number, stroke: string, sw: number) =>
    `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>` +
    `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="none" stroke="${stroke}" stroke-width="${sw}" transform="rotate(45 ${cx} ${cy})"/>`;
  const body =
    `<rect width="${W}" height="${H}" fill="${INK}"/>` +
    star(13, C.cream[0], 1.4) +
    star(7, C.cream[1], 1) +
    `<circle cx="${cx}" cy="${cy}" r="2" fill="${C.cream[0]}"/>` +
    // belah ketupat penyambung di batas ubin
    `<path d="M0 ${cy} l5 -5 l5 5 l-5 5Z M${W} ${cy} l-5 -5 l-5 5 l5 5Z" fill="none" stroke="${C.cream[0]}" stroke-width="1"/>` +
    `<path d="M0 3H${W}M0 ${H - 3}H${W}" stroke="${C.cream[0]}" stroke-opacity=".55" stroke-width="1"/>`;
  write('pattern-tile.svg', plain(W, H, body));
}

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

// ── 6. Cincin + bunga (referensi foto no. 8: cincin berpadu di tengah karangan bunga) ─────
{
  const defs =
    WATERCOLOR_FILTER +
    `<linearGradient id="ringA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.blue[4]}"/><stop offset=".45" stop-color="${C.blue[0]}"/><stop offset="1" stop-color="${C.blue[3]}"/></linearGradient>
     <linearGradient id="ringB" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.cream[2]}"/><stop offset=".5" stop-color="#B9A58F"/><stop offset="1" stop-color="${C.cream[0]}"/></linearGradient>
     <clipPath id="lowerX"><rect x="148" y="132" width="32" height="40"/></clipPath>`;
  const R = 36;
  const ring = (cx: number, g: string) => `<circle cx="${cx}" cy="124" r="${R}" fill="none" stroke="url(#${g})" stroke-width="9"/><circle cx="${cx}" cy="124" r="${R - 4.5}" fill="none" stroke="#FFFFFF" stroke-opacity=".45" stroke-width="1.2"/>`;
  const rnd = prng(91);
  let leaves = '';
  for (let i = 0; i < 18; i++) {
    const ang = -165 + i * 18 + (rnd() - 0.5) * 8;
    const rad = 70 + rnd() * 16;
    const px = 160 + Math.cos((ang * Math.PI) / 180) * rad;
    const py = 128 + Math.sin((ang * Math.PI) / 180) * rad * 0.78;
    leaves += leaf(px, py, 34 + rnd() * 24, ang + 90, pick(rnd, C.leaf));
  }
  const body =
    leaves +
    hydrangea(62, 96, 40, 92, 26) +
    hydrangea(258, 92, 40, 93, 26) +
    rose(104, 40, 26, 10) +
    rose(220, 38, 24, 50) +
    hydrangea(160, 196, 44, 94, 30) +
    rose(66, 168, 20, 5) +
    rose(254, 166, 20, 30) +
    ring(142, 'ringB') +
    ring(178, 'ringA') +
    // A di depan B pada titik silang bawah → tampak saling mengait
    `<g clip-path="url(#lowerX)">${ring(142, 'ringB')}</g>` +
    // permata di cincin kanan
    `<path d="M178 82 l6 7 l-6 9 l-6 -9Z" fill="#FFFFFF" stroke="${C.blue[0]}" stroke-width="1.4"/>` +
    blossom(120, 70, 8) + blossom(206, 66, 7, true) + blossom(150, 160, 6, true) + blossom(300, 128, 7);
  write('rings-floral.svg', svg(320, 240, body, defs));
}

// ── 7. Siluet pria (jubah, kopyah/tarbusy khas Azhar, sorban melingkar) ───────────────────
{
  const defs = `<linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK}"/><stop offset=".7" stop-color="${INK}"/><stop offset="1" stop-color="#3B4144"/></linearGradient>
  <mask id="cut"><rect width="200" height="340" fill="#fff"/>
    <path d="M74 64 Q100 74 126 64" fill="none" stroke="#000" stroke-width="2.4"/>
    <path d="M96 120 L100 134 L104 120" fill="none" stroke="#000" stroke-width="2.4"/>
    <path d="M58 150 C52 180 52 205 56 226" fill="none" stroke="#000" stroke-width="2.6"/>
    <path d="M142 150 C148 180 148 205 144 226" fill="none" stroke="#000" stroke-width="2.6"/>
    <path d="M90 232 Q100 238 110 232" fill="none" stroke="#000" stroke-width="2.2"/>
    <path d="M100 238 V330" fill="none" stroke="#000" stroke-width="1.6" stroke-opacity=".9"/>
  </mask>`;
  const body =
    `<g mask="url(#cut)" fill="url(#fill)">` +
    // tarbusy: kerucut terpancung (lebih lebar di bawah), sorban tebal melilit pangkalnya, jumbai di atas
    `<path d="M76 58 L88 20 Q89 15 94 15 H106 Q111 15 112 20 L124 58Z"/>` +
    `<path d="M72 60 Q72 48 86 46 H114 Q128 48 128 60 Q128 70 114 68 H86 Q72 70 72 60Z"/>` +
    `<path d="M100 15 Q116 8 124 22 q4 10 -2 22" fill="none" stroke="${INK}" stroke-width="2.6"/><circle cx="122" cy="46" r="3.2"/>` +
    `<path d="M124 62 q14 8 12 30 q-4 -16 -14 -20Z"/>` +
    // kepala, leher, jenggot tipis
    `<ellipse cx="100" cy="86" rx="21" ry="25"/>` +
    `<path d="M80 94 q20 40 40 0 q-20 12 -40 0Z"/>` +
    `<path d="M89 106 h22 v18 h-22Z"/>` +
    // bahu & jubah panjang dengan lengan merapat
    `<path d="M91 116 C68 120 46 130 43 154 L36 250 C34 282 30 306 28 330 H172 C170 306 166 282 164 250 L157 154 C154 130 132 120 109 116 Q100 124 91 116Z"/>` +
    `</g>`;
  write('man.svg', plain(200, 340, body, defs));
}

// ── 8. Siluet muslimah (khimar panjang, gamis lebar, tanpa cadar) ─────────────────────────
{
  const defs = `<linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK}"/><stop offset=".7" stop-color="${INK}"/><stop offset="1" stop-color="#3B4144"/></linearGradient>
  <mask id="cut"><rect width="200" height="340" fill="#fff"/>
    <path d="M62 170 C54 186 56 204 62 214" fill="none" stroke="#000" stroke-width="2.4"/>
    <path d="M138 170 C146 186 144 204 138 214" fill="none" stroke="#000" stroke-width="2.4"/>
    <path d="M92 214 Q100 222 108 214" fill="none" stroke="#000" stroke-width="2.2"/>
  </mask>`;
  const body =
    `<g mask="url(#cut)" fill="url(#fill)">` +
    // khimar: kepala membulat melebar menjadi cape sampai pinggang
    `<path d="M100 22 C78 22 66 42 66 68 C66 90 70 104 58 120 C42 140 36 166 36 196 Q100 216 164 196 C164 166 158 140 142 120 C130 104 134 90 134 68 C134 42 122 22 100 22Z"/>` +
    // gamis: bahu → pinggang ramping → melebar ke ujung
    `<path d="M64 190 C60 216 62 236 58 262 C54 290 40 312 30 332 H170 C160 312 146 290 142 262 C138 236 140 216 136 190 Q100 204 64 190Z"/>` +
    // wajah: oval sedikit lebih terang agar terbaca sebagai wajah berhijab (tanpa cadar)
    `<path d="M82 70 C80 54 90 46 100 46 C110 46 120 54 118 70 C120 92 110 108 100 108 C90 108 80 92 82 70Z" fill="#555B5F"/>` +
    `</g>`;
  write('woman.svg', plain(200, 340, body, defs));
}

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
