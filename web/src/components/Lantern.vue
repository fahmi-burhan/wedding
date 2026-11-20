<!--
  web/src/components/Lantern.vue — lampion (fanous) yang tergantung dan berayun pelan.
  Dipanggil oleh: HeroSection, VerseSection, NoticeSection, CoverSection.
  Memanggil: scenes/lantern.svg, animasi `swing` di main.css (poros di titik gantung, atas gambar).
-->
<script setup lang="ts">
import lantern from '../assets/scenes/lantern.svg';

withDefaults(defineProps<{ size?: number; delay?: number }>(), { size: 56, delay: 0 });
</script>

<template>
  <img
    :src="lantern"
    alt=""
    aria-hidden="true"
    class="swing pointer-events-none absolute select-none"
    :style="{ width: `${size}px`, animationDelay: `${delay}s` }"
  />
</template>
