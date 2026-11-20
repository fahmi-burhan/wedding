<!--
  web/src/components/Motes.vue — partikel cahaya (debu bercahaya) yang naik pelan dan memudar, menambah suasana hidup.
  Dipanggil oleh: HeroSection, CoupleSection (latar diam), NoticeSection, RsvpSection, GiftSection.
  Memanggil: animasi `mote-rise` di main.css (hanya transform & opacity).
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{ count?: number; seed?: number }>(), { count: 12, seed: 1 });

// PRNG kecil ber-seed agar posisi tetap sama antar render (tidak "melompat" saat komponen dirender ulang).
let a = props.seed * 9301 + 49297;
const rnd = () => ((a = (a * 9301 + 49297) % 233280) / 233280);
const motes = Array.from({ length: props.count }, () => ({
  left: `${Math.round(rnd() * 100)}%`,
  bottom: `${Math.round(rnd() * 40)}%`,
  size: `${3 + Math.round(rnd() * 5)}px`,
  rise: `${180 + Math.round(rnd() * 260)}px`,
  dx: `${Math.round((rnd() - 0.5) * 60)}px`,
  dur: `${7 + Math.round(rnd() * 8)}s`,
  delay: `${-Math.round(rnd() * 12)}s`,
}));
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-[3] overflow-hidden" aria-hidden="true">
    <span
      v-for="(m, i) in motes"
      :key="i"
      class="absolute rounded-full bg-white opacity-0"
      :style="{
        left: m.left,
        bottom: m.bottom,
        width: m.size,
        height: m.size,
        boxShadow: '0 0 8px 3px rgba(199, 211, 217, 0.9)',
        '--rise': m.rise,
        '--dx': m.dx,
        animation: `mote-rise ${m.dur} ease-in-out ${m.delay} infinite`,
      }"
    />
  </div>
</template>
