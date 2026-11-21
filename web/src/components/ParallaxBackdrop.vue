<!--
  web/src/components/ParallaxBackdrop.vue — wadah latar paralaks untuk satu section: menahan lapisan
  ParallaxLayer di dalam batas section (overflow-hidden) dan menaruhnya di belakang isi (-z-10).
  Dipanggil oleh: section yang berlatar paralaks (Hero, Ayat, Hitung mundur, Waktu & tempat, Pemberitahuan, Gift, RSVP).
  Memanggil: —  (isi lewat slot, biasanya beberapa <ParallaxLayer> berkecepatan berbeda).
-->
<template>
  <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <slot />
  </div>
</template>
