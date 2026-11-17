<!--
  web/src/components/PetalBurst.vue — kelopak berjatuhan sekali saat undangan dibuka (transisi video 15–17 dtk).
  Dipanggil oleh: App.vue.
  Memanggil: web/src/assets/ornaments/petal.svg.
  Hanya transform & opacity yang dianimasikan (murah untuk GPU ponsel). Tidak tampil bila "kurangi gerakan" aktif.
-->
<script setup lang="ts">
import petal from '../assets/ornaments/petal.svg';

// Nilai acak dibuat sekali saat komponen dibuat (bukan tiap render).
const petals = Array.from({ length: 16 }, () => ({
  left: `${Math.round(Math.random() * 100)}%`,
  size: `${14 + Math.round(Math.random() * 14)}px`,
  delay: `${Math.round(Math.random() * 900)}ms`,
  duration: `${2200 + Math.round(Math.random() * 1400)}ms`,
  drift: `${Math.round((Math.random() - 0.5) * 120)}px`,
  spin: `${Math.round(180 + Math.random() * 360) * (Math.random() < 0.5 ? -1 : 1)}deg`,
}));
const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
</script>

<template>
  <div v-if="!reduced" class="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
    <img
      v-for="(p, i) in petals"
      :key="i"
      :src="petal"
      alt=""
      class="absolute top-0"
      :style="{
        left: p.left,
        width: p.size,
        animation: `petal-fall ${p.duration} ease-in ${p.delay} both`,
        '--drift': p.drift,
        '--spin': p.spin,
      }"
    />
  </div>
</template>
