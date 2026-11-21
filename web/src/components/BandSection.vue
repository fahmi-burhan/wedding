<!--
  web/src/components/BandSection.vue — pembungkus satu bagian undangan: latar putih berkertas atau cream.
  Dipanggil oleh: semua section di web/src/sections/.
  Memanggil: kelas .paper / .paper-band di main.css.

  Peralihan HALUS antar bagian (tanpa garis/potongan):
    • prop `from` = warna bagian sebelumnya → bagian ini dibuka dengan gradasi 320 px berkurva halus ke warnanya sendiri;
    • prop `fade` = bagian ini berlatar gambar → ujung bawahnya dipudarkan ke warnanya sendiri, supaya gradasi
      bagian berikutnya menyambung tanpa sambungan terlihat.
  Hiasan bunga ditaruh di SAMPING (SideFlower), bukan di batas antar bagian.

  overflow-x-clip (bukan overflow-hidden): menahan dekorasi agar tidak menimbulkan scroll horizontal TANPA
  menjadikan section sebagai scroll container (dibutuhkan oleh latar `sticky` di bagian panjang).
-->
<script setup lang="ts">
import { computed } from 'vue';

const COLORS = { paper: '#F8F7F4', cream: '#E3D5C6' } as const;
// Kurva "ease": perubahan transparansi melandai di kedua ujung, tidak linear.
const STOPS = [
  [0, 'ff'], [10, 'f4'], [22, 'dc'], [36, 'b8'], [50, '8c'], [64, '5e'], [78, '36'], [90, '14'], [100, '00'],
] as const;

const props = withDefaults(
  defineProps<{ id?: string; tone?: 'paper' | 'cream'; from?: 'paper' | 'cream'; labelledby?: string; full?: boolean; fade?: boolean }>(),
  { tone: 'paper', full: false, fade: false },
);

const ramp = (color: string, dir: 'to bottom' | 'to top') =>
  `linear-gradient(${dir}, ${STOPS.map(([p, a]) => `${color}${a} ${p}%`).join(', ')})`;
const topGradient = computed(() => (props.from && props.from !== props.tone ? ramp(COLORS[props.from], 'to bottom') : ''));
const bottomGradient = computed(() => (props.fade ? ramp(COLORS[props.tone], 'to top') : ''));
</script>

<template>
  <section
    :id="id"
    :aria-labelledby="labelledby"
    class="relative isolate overflow-x-clip"
    :class="[tone === 'cream' ? 'paper-band' : 'paper', full ? 'flex min-h-svh flex-col' : '']"
  >
    <div v-if="topGradient" class="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[320px]" :style="{ background: topGradient }" aria-hidden="true" />
    <div v-if="bottomGradient" class="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[300px]" :style="{ background: bottomGradient }" aria-hidden="true" />
    <slot />
  </section>
</template>
