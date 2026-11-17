/**
 * web/src/admin-main.ts — titik masuk panel admin.
 * Dipanggil oleh: web/admin.html.
 * Memanggil: Vue, admin/AdminApp.vue, font Lato & Playfair, main.css (token warna yang sama).
 */
import { createApp } from 'vue';
import '@fontsource/playfair-display/700.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import './styles/main.css';
import AdminApp from './admin/AdminApp.vue';

createApp(AdminApp).mount('#admin');
