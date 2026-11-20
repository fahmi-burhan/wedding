<!--
  web/src/components/AmbientPetals.vue — beberapa kelopak yang terus melayang pelan di layar setelah
  undangan dibuka, agar halaman terasa "hidup" seperti referensi.
  Dipanggil oleh: App.vue.  Memanggil: petal.svg, animasi `petal-drift` (main.css).
  Hanya 12 kelopak, animasi transform/opacity saja (ringan untuk ponsel). Disembunyikan saat "kurangi gerakan".
-->
<script setup lang="ts">
import petal from '../assets/ornaments/petal.svg';

const petals = Array.from({ length: 12 }, (_, i) => ({
  left: `${4 + i * 8 + Math.round(Math.random() * 5)}%`,
  size: `${11 + Math.round(Math.random() * 8)}px`,
  duration: `${16 + Math.round(Math.random() * 12)}s`,
  delay: `${-Math.round(Math.random() * 20)}s`, // negatif: sebagian sudah "di tengah jalan" saat muncul
  drift: `${Math.round((Math.random() - 0.5) * 140)}px`,
  spin: `${Math.round(240 + Math.random() * 300) * (i % 2 ? -1 : 1)}deg`,
}));
</script>

<template>
  <!-- z-[1]: di atas latar tetap tetapi DI BELAKANG konten (main z-[2]) agar tidak menutupi teks/tombol. -->
  <div class="ambient-petals pointer-events-none fixed inset-y-0 left-1/2 z-[1] w-full max-w-[480px] -translate-x-1/2 overflow-hidden" aria-hidden="true">
    <img
      v-for="(p, i) in petals"
      :key="i"
      :src="petal"
      alt=""
      class="absolute top-0 opacity-0"
      :style="{ left: p.left, width: p.size, animation: `petal-drift ${p.duration} linear ${p.delay} infinite`, '--drift': p.drift, '--spin': p.spin }"
    />
  </div>
</template>
