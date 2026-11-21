/**
 * web/src/composables/openState.ts — penanda "undangan sudah dibuka" yang dipakai bersama.
 * Dipanggil oleh: App.vue (mengisi saat tombol "Buka Undangan" ditekan), SideFlower.vue (menunda
 * animasi bunga samping sampai sampul terbuka, agar tamu sempat melihat gerakannya).
 */
import { ref } from 'vue';

export const invitationOpen = ref(false);
