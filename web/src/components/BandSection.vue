<!--
  web/src/components/BandSection.vue — pembungkus satu bagian undangan sebagai BLOK WARNA penuh dengan tepi lurus
  (putih berkertas atau cream), sehingga perpindahan antar bagian tegas, bukan gambar yang terpotong.
  Dipanggil oleh: semua section di web/src/sections/.
  Memanggil: kelas .paper / .paper-band di main.css.

  overflow-clip (bukan overflow-hidden): menahan dekorasi agar tidak menimbulkan scroll horizontal TANPA
  menjadikan section sebagai scroll container — dibutuhkan oleh latar `sticky` di bagian panjang.
-->
<script setup lang="ts">
withDefaults(defineProps<{ id?: string; tone?: 'paper' | 'cream'; labelledby?: string; full?: boolean }>(), {
  tone: 'paper',
  full: false,
});
</script>

<template>
  <section
    :id="id"
    :aria-labelledby="labelledby"
    class="relative isolate overflow-clip"
    :class="[tone === 'cream' ? 'paper-band' : 'paper', full ? 'flex min-h-svh flex-col' : '']"
  >
    <slot />
  </section>
</template>
