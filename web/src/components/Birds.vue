<!--
  web/src/components/Birds.vue — tiga burung melintas pelan di langit bagian hero (objek penghibur mata).
  Dipanggil oleh: HeroSection.vue.  Memanggil: scenes/bird.svg, animasi `fly` di main.css.
  Tidak tampil bila pengguna memilih "kurangi gerakan".
-->
<script setup lang="ts">
import bird from '../assets/scenes/bird.svg';

const birds = [
  { top: '14%', w: 34, dur: 24, delay: 0, s: 1 },
  { top: '20%', w: 26, dur: 28, delay: -9, s: 0.85 },
  { top: '9%', w: 22, dur: 32, delay: -17, s: 0.7 },
];
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden="true">
    <img
      v-for="(b, i) in birds"
      :key="i"
      :src="bird"
      alt=""
      class="fly absolute left-0"
      :style="{ top: b.top, width: `${b.w}px`, '--dur': `${b.dur}s`, '--delay': `${b.delay}s`, '--s': b.s }"
    />
  </div>
</template>
