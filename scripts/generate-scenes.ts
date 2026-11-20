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

// ── 7 & 8. Potret setengah dada (siluet profil gaya cameo) dalam bingkai lengkung + karangan bunga ─────
/** Bingkai lengkung + latar lembut + karangan bunga di dasar; `fig` = isi (siluet) yang digambar di antaranya. */
function portrait(fig: string, seed: number): string {
  const arch = 'M16 274 V122 A104 104 0 0 1 224 122 V274 Q224 298 200 298 H40 Q16 298 16 274Z';
  const defs =
    WATERCOLOR_FILTER +
    `<linearGradient id="plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="${C.cream[2]}"/><stop offset="1" stop-color="${C.cream[1]}"/></linearGradient>
     <linearGradient id="ink" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="300"><stop offset="0" stop-color="${INK}"/><stop offset=".62" stop-color="#262A2D"/><stop offset="1" stop-color="#3E4549"/></linearGradient>
     <radialGradient id="aura" cx="50%" cy="38%" r="48%"><stop offset="0" stop-color="${C.blue[4]}" stop-opacity=".75"/><stop offset="1" stop-color="${C.blue[4]}" stop-opacity="0"/></radialGradient>
     <clipPath id="clip"><path d="${arch}"/></clipPath>`;
  const rnd = prng(seed);
  let leaves = '';
  for (let i = 0; i < 14; i++) leaves += leaf(14 + i * 15.5 + (rnd() - 0.5) * 8, 306, 44 + rnd() * 40, (rnd() - 0.5) * 100, pick(rnd, C.leaf));
  const flowers =
    leaves +
    hydrangea(40, 284, 44, seed + 1, 34) +
    hydrangea(204, 286, 44, seed + 2, 34) +
    rose(98, 292, 22, 10) +
    rose(146, 296, 20, 50) +
    hydrangea(120, 306, 36, seed + 3, 26) +
    blossom(30, 238, 7) + blossom(214, 240, 7, true) + blossom(64, 256, 6, true) + blossom(180, 258, 6);
  const body =
    `<path d="${arch}" fill="url(#plate)"/>` +
    `<g clip-path="url(#clip)">` +
    `<ellipse cx="120" cy="118" rx="104" ry="118" fill="url(#aura)"/>` +
    // lingkaran cahaya tipis di belakang kepala
    `<circle cx="120" cy="112" r="66" fill="none" stroke="${C.blue[3]}" stroke-opacity=".5" stroke-width="1.2"/>` +
    `<circle cx="120" cy="112" r="74" fill="none" stroke="${C.blue[3]}" stroke-opacity=".28" stroke-width="1"/>` +
    fig +
    flowers +
    `</g>` +
    `<path d="${arch}" fill="none" stroke="${C.line}" stroke-width="2"/>` +
    `<path d="M24 274 V122 A96 96 0 0 1 216 122 V274 Q216 290 200 290 H40 Q24 290 24 274Z" fill="none" stroke="${C.line}" stroke-opacity=".55" stroke-width="1"/>` +
    blossom(120, 18, 9) + blossom(100, 24, 5, true) + blossom(140, 24, 5, true);
  return svg(240, 300, body, defs);
}

// Pria (menghadap depan): tarbusy khas Azhar + sorban melilit, jenggot tipis, jubah. Dua nada tinta: wajah sedikit
// lebih terang agar terbaca, selebihnya siluet pekat.
{
  const FACE = '#566066';
  const fig =
    // bahu & dada (jubah) — simetris
    `<g transform="translate(0 -14)"><path d="M4 322 C6 262 24 236 62 224 C84 217 98 214 104 204 L136 204 C142 214 156 217 178 224 C216 236 234 262 236 322Z" fill="url(#ink)"/>` +
    // leher
    `<path d="M103 168 L137 168 L140 214 C132 224 108 224 100 214Z" fill="url(#ink)"/></g>` +
    // telinga
    `<ellipse cx="87" cy="134" rx="5.5" ry="10" fill="url(#ink)"/><ellipse cx="153" cy="134" rx="5.5" ry="10" fill="url(#ink)"/>` +
    // kepala & wajah
    `<path d="M88 128 C88 104 100 92 120 92 C140 92 152 104 152 128 C152 154 140 178 120 180 C100 178 88 154 88 128Z" fill="${FACE}"/>` +
    // jenggot tipis mengikuti rahang
    `<path d="M88 134 C90 160 104 182 120 184 C136 182 150 160 152 134 C148 152 138 162 120 164 C102 162 92 152 88 134Z" fill="url(#ink)"/>` +
    `<path d="M108 150 C114 146 126 146 132 150 C126 153 114 153 108 150Z" fill="url(#ink)" fill-opacity=".85"/>` +
    // tarbusy (kerucut terpancung)
    `<path d="M87 94 C87 70 98 46 109 40 C116 36 124 36 131 40 C142 46 153 70 153 94Z" fill="url(#ink)"/>` +
    // sorban melingkar di pangkal tarbusy
    `<path d="M80 99 C80 84 96 77 120 77 C144 77 160 84 160 99 C160 110 144 114 120 114 C96 114 80 110 80 99Z" fill="url(#ink)"/>` +
    // jumbai tarbusy
    `<path d="M120 38 C140 28 158 38 160 60" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>` +
    `<path d="M156 60 q4 -4 8 0 l-1.5 16 q-2.5 3 -5 0Z" fill="${INK}"/>` +
    // lipatan sorban, kerah & lipatan jubah (garis halus berwarna kertas)
    `<g fill="none" stroke="${PAPER}" stroke-opacity=".5" stroke-width="1.5" stroke-linecap="round">` +
    `<path d="M84 94 C102 104 138 104 156 94"/><path d="M86 104 C104 112 136 112 154 104" stroke-opacity=".32"/>` +
    `<path d="M104 192 C112 218 116 262 120 302"/><path d="M136 192 C128 218 124 262 120 302" stroke-opacity=".4"/>` +
    `<path d="M104 192 C96 200 80 206 64 212" stroke-opacity=".4"/><path d="M136 192 C144 200 160 206 176 212" stroke-opacity=".4"/>` +
    `</g>`;
  write('man.svg', portrait(fig, 211));
}

// Wanita (menghadap depan): khimar panjang menutup dada, tanpa cadar; wajah oval lebih terang.
{
  const FACE = '#5B6166';
  const fig =
    // khimar: kepala membulat → melebar menjadi cape sampai dada (simetris)
    `<path d="M120 38 C80 38 64 74 66 112 C68 140 60 166 42 188 C22 212 10 244 8 302 L232 302 C230 244 218 212 198 188 C180 166 172 140 174 112 C176 74 160 38 120 38Z" fill="url(#ink)"/>` +
    // wajah
    `<path d="M120 80 C100 80 91 98 91 118 C91 144 104 164 120 166 C136 164 149 144 149 118 C149 98 140 80 120 80Z" fill="${FACE}"/>` +
    // bayangan lembut di sekeliling wajah (kedalaman kain)
    `<path d="M120 76 C94 76 84 98 84 118 C84 148 100 170 120 172 C140 170 156 148 156 118 C156 98 146 76 120 76Z" fill="none" stroke="${PAPER}" stroke-opacity=".3" stroke-width="1.4"/>` +
    // lipatan khimar
    `<g fill="none" stroke="${PAPER}" stroke-opacity=".4" stroke-width="1.5" stroke-linecap="round">` +
    `<path d="M120 46 C92 46 76 76 78 112"/><path d="M120 46 C148 46 164 76 162 112"/>` +
    `<path d="M98 176 C80 200 62 222 54 262"/><path d="M142 176 C160 200 178 222 186 262"/>` +
    `<path d="M120 170 C118 206 116 250 112 302" stroke-opacity=".28"/>` +
    `</g>` +
    // bros kecil di dada
    `<g transform="translate(120 214)"><circle r="7" fill="${PAPER}" fill-opacity=".85"/><circle r="3" fill="${C.blue[1]}"/></g>`;
  write('woman.svg', portrait(fig, 311));
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
