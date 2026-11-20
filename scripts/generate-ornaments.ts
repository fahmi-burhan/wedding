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

import { C, WATERCOLOR_FILTER, blossom, f, hydrangea, leaf, leafLine, petalPath, pick, prng, rose, svg, vine } from './lib/art.ts';

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

// ── 7. Pita bunga atas (melintang penuh di atas tiap section, kesan "ramai") ─────────────
{
  const rnd = prng(51);
  let leaves = '';
  for (let i = 0; i < 28; i++) {
    const x = -10 + i * 16 + (rnd() - 0.5) * 10;
    // rotate(180) = daun menggantung ke bawah; diberi variasi ±55°.
    leaves += leaf(x, 18 + rnd() * 24, 48 + rnd() * 46, 180 + (rnd() - 0.5) * 110, pick(rnd, C.leaf));
  }
  const vines =
    vine([62, 40, 74, 80, 52, 120, 66, 168], 5, 52, 14) +
    vine([248, 40, 262, 92, 238, 124, 252, 160], 5, 53, 13) +
    vine([372, 40, 384, 72, 366, 104, 378, 140], 4, 54, 12);
  const flowers =
    hydrangea(36, 26, 58, 61, 48) +
    rose(132, 46, 30, 15) +
    hydrangea(212, 20, 50, 62, 40) +
    rose(290, 50, 27, 60) +
    hydrangea(374, 26, 56, 63, 46) +
    blossom(100, 82, 8) + blossom(176, 72, 7, true) + blossom(330, 80, 8) + blossom(412, 72, 7, true);
  writeFileSync(resolve(OUT, 'swag-top.svg'), svg(420, 170, leaves + vines + flowers));
}

// ── 8. Untaian bunga vertikal di tepi kiri (dicerminkan CSS untuk kanan) ─────────────────
{
  const rnd = prng(71);
  let leaves = '';
  for (let i = 0; i < 36; i++) {
    const y = i * 22 + (rnd() - 0.5) * 10;
    // rotate(90) = daun mengarah ke kanan (ke dalam halaman), variasi ±60°.
    leaves += leaf(8 + rnd() * 24, y, 40 + rnd() * 42, 90 + (rnd() - 0.5) * 120, pick(rnd, C.leaf));
  }
  const strand = vine([22, -10, 64, 250, 2, 500, 30, 770], 26, 72, 15);
  const flowers =
    hydrangea(16, 84, 52, 72, 42) +
    rose(56, 212, 26, 20) +
    hydrangea(8, 352, 46, 73, 36) +
    rose(50, 472, 24, 50) +
    hydrangea(18, 612, 54, 74, 44) +
    rose(60, 722, 22, 0) +
    blossom(72, 142, 8) + blossom(82, 300, 7, true) + blossom(68, 542, 8) + blossom(80, 664, 7, true);
  writeFileSync(resolve(OUT, 'garland-side.svg'), svg(150, 760, leaves + strand + flowers));
}

// ── 9. Latar tetap: cat air lembut + gugus bunga pudar di tepi ───────────────────────────
{
  const rnd = prng(81);
  let washes = '';
  for (let i = 0; i < 9; i++) {
    const grad = rnd() < 0.5 ? 'wash' : 'washCream';
    washes += `<ellipse cx="${f(rnd() * 600)}" cy="${f(rnd() * 1000)}" rx="${f(140 + rnd() * 160)}" ry="${f(120 + rnd() * 140)}" fill="url(#${grad})" opacity=".55"/>`;
  }
  let sprays = '';
  for (let i = 0; i < 18; i++) {
    const edgeX = i % 2 ? 560 + rnd() * 50 : -10 + rnd() * 50;
    sprays += leaf(edgeX, rnd() * 1000, 60 + rnd() * 60, (i % 2 ? -90 : 90) + (rnd() - 0.5) * 120, pick(rnd, C.leaf));
  }
  const clusters =
    hydrangea(30, 130, 92, 81, 50) + rose(150, 40, 42, 10) +
    hydrangea(575, 430, 82, 82, 44) + rose(470, 330, 34, 40) +
    hydrangea(25, 770, 86, 83, 46) + rose(140, 880, 36, 70) +
    hydrangea(565, 950, 92, 84, 50);
  const body = `<rect width="600" height="1000" fill="${C.petalWhite}"/>${washes}<g opacity=".28">${sprays}${clusters}</g>`;
  writeFileSync(resolve(OUT, 'backdrop.svg'), svg(600, 1000, body).replace('width="600" height="1000" aria-hidden', 'width="600" height="1000" preserveAspectRatio="xMidYMid slice" aria-hidden'));
}

// ── 6. Favicon ──────────────────────────────────────────────────────────────────────────
writeFileSync(
  resolve(PUBLIC, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -20 40 40"><circle r="20" fill="#F8F7F4"/>${blossom(0, 0, 16).replace(/<g transform="translate\(0 0\)">/, '<g>')}</svg>\n`,
);

console.log(`Ornamen ditulis ke ${OUT} dan favicon ke ${PUBLIC}`);
