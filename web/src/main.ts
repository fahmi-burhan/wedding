/**
 * web/src/main.ts — titik masuk JavaScript halaman undangan.
 * Dipanggil oleh: web/index.html.
 * Memanggil: Vue, App.vue, directive v-reveal, font self-host (@fontsource), main.css.
 *
 * Font di-host sendiri (bukan Google Fonts CDN): lebih cepat di jaringan seluler (satu domain),
 * tidak mengirim data tamu ke pihak ketiga, dan hanya subset huruf yang dipakai yang diunduh
 * (unicode-range) — mis. font Arab baru diunduh saat teks Arab tampil.
 */
import { createApp } from 'vue';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/great-vibes/400.css';
import '@fontsource/aref-ruqaa/700.css';
import '@fontsource/amiri/400.css';
import './styles/main.css';
import App from './App.vue';
import { vReveal } from './composables/reveal.ts';

createApp(App).directive('reveal', vReveal).mount('#app');
