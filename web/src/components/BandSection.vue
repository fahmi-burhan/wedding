<!--
  web/src/components/BandSection.vue — pembungkus satu bagian undangan: latar putih berkertas atau cream.
  Dipanggil oleh: semua section di web/src/sections/.
  Memanggil: kelas .paper / .paper-band di main.css.

  Peralihan HALUS antar bagian: prop `from` = warna bagian sebelumnya; bagian ini memulai dengan gradasi 200 px
  dari warna itu menuju warna sendiri, sehingga tidak ada garis/potongan keras. Hiasan bunga di tepi atas
  (swag) sengaja menjorok ke bagian sebelumnya, jadi tampak menyatu dengan hamparan bunga di dasarnya.

  overflow-x-clip (bukan overflow-hidden): menahan dekorasi agar tidak menimbulkan scroll horizontal TANPA
  menjadikan section sebagai scroll container (dibutuhkan oleh latar `sticky` di bagian panjang)
  dan tanpa memotong hiasan yang menjorok ke atas.
-->
<script setup lang="ts">
const COLORS = { paper: '#F8F7F4', cream: '#E3D5C6' } as const;

withDefaults(
  defineProps<{ id?: string; tone?: 'paper' | 'cream'; from?: 'paper' | 'cream'; labelledby?: string; full?: boolean }>(),
  { tone: 'paper', full: false },
);
</script>

<template>
  <section
    :id="id"
    :aria-labelledby="labelledby"
    class="relative isolate overflow-x-clip"
    :class="[tone === 'cream' ? 'paper-band' : 'paper', full ? 'flex min-h-svh flex-col' : '']"
  >
    <div
      v-if="from && from !== tone"
      class="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[220px]"
      :style="{ background: `linear-gradient(to bottom, ${COLORS[from]} 0%, ${COLORS[from]}cc 25%, transparent 100%)` }"
      aria-hidden="true"
    />
    <slot />
  </section>
</template>
