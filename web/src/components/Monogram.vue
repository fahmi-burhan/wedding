<!--
  web/src/components/Monogram.vue — monogram inisial mempelai (H & Z) di dalam kapsul putih berbingkai ganda,
  dengan buket kecil di kakinya. Padanan monogram kaligrafi di website referensi, dibuat dari huruf.
  Dipanggil oleh: CoverSection.vue, HeroSection.vue, ClosingSection.vue.
  Memanggil: config/event.ts (nama panggilan → inisial), ornamen bouquet.svg.
-->
<script setup lang="ts">
import { event } from '../../../config/event.ts';
import bouquet from '../assets/ornaments/bouquet.svg';

withDefaults(defineProps<{ size?: 'md' | 'lg' }>(), { size: 'md' });
const a = event.couple.groom.shortName.charAt(0);
const b = event.couple.bride.shortName.charAt(0);
</script>

<template>
  <div
    class="relative mx-auto rounded-full bg-white/90 shadow-[0_10px_34px_rgba(30,32,34,0.14)] ring-1 ring-line/40"
    :class="size === 'lg' ? 'h-[210px] w-[146px]' : 'h-[170px] w-[118px]'"
    role="img"
    :aria-label="`Monogram ${event.couple.short}`"
  >
    <div class="absolute inset-[7px] rounded-full border border-line/70" aria-hidden="true" />
    <!-- Inisial pertama kiri-atas, kedua kanan-bawah, "&" kecil di tengah (komposisi monogram klasik). -->
    <div
      class="absolute inset-0 flex flex-col justify-center font-script leading-[0.85] text-ink"
      :class="size === 'lg' ? 'px-6 pb-6 text-[4.1rem]' : 'px-5 pb-5 text-[3.3rem]'"
      aria-hidden="true"
    >
      <span class="self-start">{{ a }}</span>
      <span class="-my-1 self-center font-display text-[0.3em] italic leading-none text-ink-soft">&amp;</span>
      <span class="self-end">{{ b }}</span>
    </div>
    <img :src="bouquet" alt="" aria-hidden="true" class="pointer-events-none absolute -bottom-7 -left-10 w-[110px] select-none" />
    <img :src="bouquet" alt="" aria-hidden="true" class="pointer-events-none absolute -bottom-5 -right-9 w-[80px] -scale-x-100 select-none" />
  </div>
</template>
