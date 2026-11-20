/**
 * scripts/lib/art.ts — pustaka kecil untuk menggambar ornamen SVG prosedural (bunga, daun, sulur).
 *
 * Dipanggil oleh: scripts/generate-ornaments.ts, scripts/generate-scenes.ts.
 * Memanggil: tidak ada (fungsi murni penghasil string SVG).
 *
 * Posisi acak memakai PRNG ber-seed → hasil selalu sama setiap dijalankan.
 */

// ── Palet (selaras dengan token di web/src/styles/main.css) ──────────────────────────────
export const C = {
  blue: ['#56707D', '#6E8591', '#8A9EA8', '#A9BAC3', '#C7D3D9'], // tua → muda (aksen bunga)
  petalWhite: '#FBFAF7',
  cream: ['#D5C3B0', '#E2D4C5', '#EFE6DB'],
  leaf: ['#8C989C', '#A3AEB1', '#C3CBCD'], // daun abu-sage (tidak menambah warna hijau di luar palet)
  line: '#9CA0A2',
  ink: '#1E2022',
};

// ── PRNG ber-seed (mulberry32) ───────────────────────────────────────────────────────────
export function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const f = (n: number) => Number(n.toFixed(1));
export const pick = <T>(rnd: () => number, arr: T[]) => arr[Math.floor(rnd() * arr.length)];

// Filter "cat air": tepi sedikit bergelombang + warna sedikit meresap.
export const WATERCOLOR_FILTER = `
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
export const petalPath = (r: number, w = 0.55) =>
  `M0 0 C${f(r * w)} ${f(-r * 0.3)} ${f(r * w)} ${f(-r * 0.95)} 0 ${f(-r)} C${f(-r * w)} ${f(-r * 0.95)} ${f(-r * w)} ${f(-r * 0.3)} 0 0Z`;

/** Floret hydrangea: 4 kelopak + titik tengah. */
export function floret(x: number, y: number, r: number, fill: string, rot: number): string {
  const petals = [0, 90, 180, 270]
    .map((a) => `<path d="${petalPath(r, 0.42)}" transform="rotate(${a + rot})" fill="${fill}" stroke="${C.blue[1]}" stroke-opacity=".35" stroke-width=".6"/>`)
    .join('');
  return `<g transform="translate(${f(x)} ${f(y)})">${petals}<circle r="${f(r * 0.16)}" fill="${C.blue[0]}"/></g>`;
}

/** Kepala hydrangea: puluhan floret dalam elips, digambar dari belakang (atas) ke depan (bawah). */
export function hydrangea(cx: number, cy: number, R: number, seed: number, n = 40): string {
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
export function rose(cx: number, cy: number, r: number, rot = 0): string {
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
export function leaf(x: number, y: number, len: number, ang: number, fill: string): string {
  const w = len * 0.32;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})">
    <path d="M0 0 C${f(w)} ${f(-len * 0.25)} ${f(w * 0.7)} ${f(-len * 0.8)} 0 ${f(-len)} C${f(-w * 0.7)} ${f(-len * 0.8)} ${f(-w)} ${f(-len * 0.25)} 0 0Z" fill="${fill}" opacity=".92"/>
    <path d="M0 0 L0 ${f(-len * 0.92)}" stroke="${C.petalWhite}" stroke-opacity=".55" stroke-width=".9"/>
  </g>`;
}

/** Daun garis (line-art, seperti sulur di video): isi kertas, tepi abu. */
export function leafLine(x: number, y: number, len: number, ang: number): string {
  const w = len * 0.3;
  return `<path d="M0 0 C${f(w)} ${f(-len * 0.25)} ${f(w * 0.7)} ${f(-len * 0.8)} 0 ${f(-len)} C${f(-w * 0.7)} ${f(-len * 0.8)} ${f(-w)} ${f(-len * 0.25)} 0 0Z" transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})" fill="#FFFFFF" fill-opacity=".7" stroke="${C.line}" stroke-width="1"/>`;
}

/** Bunga kecil 5 kelopak (untuk sulur). */
export function blossom(x: number, y: number, r: number, light = false): string {
  const fill = light ? C.petalWhite : C.blue[3];
  const petals = [0, 72, 144, 216, 288]
    .map((a) => `<ellipse cx="0" cy="${f(-r * 0.55)}" rx="${f(r * 0.42)}" ry="${f(r * 0.58)}" transform="rotate(${a})" fill="${fill}" stroke="${C.blue[1]}" stroke-width=".8"/>`)
    .join('');
  return `<g transform="translate(${f(x)} ${f(y)})">${petals}<circle r="${f(r * 0.22)}" fill="${C.blue[0]}"/></g>`;
}

/** Titik-titik di sepanjang kurva Bézier kubik (untuk menaruh daun di sulur). */
export function bezierPoints(p: number[], count: number) {
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
export function vine(p: number[], leaves: number, seed: number, leafLen = 16): string {
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

export const svg = (w: number, h: number, body: string, extraDefs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><defs>${WATERCOLOR_FILTER}${extraDefs}</defs>${body}</svg>\n`;

