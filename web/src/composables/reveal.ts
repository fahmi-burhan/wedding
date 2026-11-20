/**
 * web/src/composables/reveal.ts — directive `v-reveal` untuk animasi muncul saat elemen masuk layar.
 *
 * Dipanggil oleh: web/src/main.ts (registrasi global), semua section (v-reveal, v-reveal:mask, dst).
 *                 App.vue memanggil startReveals() setelah tamu membuka undangan.
 * Memanggil: IntersectionObserver bawaan browser.
 *
 * Pemakaian:
 *   <h2 v-reveal:mask>          tirai kiri→kanan
 *   <p v-reveal="200">           fade-up dengan jeda 200 ms
 *   <div v-reveal:zoom / :blur / :draw>
 *
 * Kenapa menunggu startReveals()? Selama sampul menutupi layar, section pertama sebenarnya sudah
 * "terlihat" oleh observer — animasinya akan selesai di balik sampul dan tamu tidak melihatnya.
 */
import type { Directive } from 'vue';

const VARIANTS: Record<string, string> = {
  up: 'reveal',
  mask: 'reveal-mask',
  rtl: 'reveal-mask-rtl',
  zoom: 'reveal-zoom',
  blur: 'reveal-blur',
  draw: 'reveal-draw',
};

let started = false;
const pending = new Set<Element>();

const observer =
  typeof window !== 'undefined' && 'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              observer?.unobserve(entry.target);
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
      )
    : null;

function watch(el: Element) {
  if (observer) observer.observe(el);
  else el.classList.add('is-in'); // browser sangat tua: langsung tampil
}

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    el.classList.add(VARIANTS[binding.arg ?? 'up'] ?? 'reveal');
    if (binding.value) el.style.setProperty('--d', `${binding.value}ms`);
    if (started) watch(el);
    else pending.add(el);
  },
  unmounted(el) {
    pending.delete(el);
    observer?.unobserve(el);
  },
};

/** Mulai mengamati semua elemen (dipanggil sekali saat undangan dibuka). */
export function startReveals() {
  if (started) return;
  started = true;
  for (const el of pending) watch(el);
  pending.clear();
}
