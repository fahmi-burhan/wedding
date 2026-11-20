<!--
  web/src/sections/HeroSection.vue — bagian pertama (Revisi Client 1): kaligrafi "دعوة زفاف" di paling atas,
  lalu nama panggilan (script). Tanpa tanggal. Ramai dan bergerak: lampion berayun, burung melintas,
  bulan sabit melayang, bintang berkelip, kupu-kupu, masjid & hamparan bunga bergoyang di dasar.
  Dipanggil oleh: App.vue.
  Memanggil: config/event.ts, assets/brand/daawa-zifaf.png (diambil dari gambar referensi klien no. 7), Birds, Lantern, Butterfly.
-->
<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import BandSection from '../components/BandSection.vue';
import Birds from '../components/Birds.vue';
import Butterfly from '../components/Butterfly.vue';
import Lantern from '../components/Lantern.vue';
import OrnamentDivider from '../components/OrnamentDivider.vue';
import calligraphy from '../assets/brand/daawa-zifaf.png';
import backdrop from '../assets/ornaments/backdrop.svg';
import swagTop from '../assets/ornaments/swag-top.svg';
import mosque from '../assets/scenes/mosque.svg';
import bed from '../assets/scenes/bed-bottom.svg';
import crescent from '../assets/scenes/crescent.svg';
import sparkle from '../assets/scenes/sparkle.svg';
</script>

<template>
  <BandSection id="beranda" tone="paper" full labelledby="beranda-nama">
    <img :src="backdrop" alt="" aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10 size-full object-cover" />
    <img :src="mosque" alt="" aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-[110px] -z-[5] w-full opacity-80" />

    <Birds />
    <img :src="swagTop" alt="" aria-hidden="true" class="pointer-events-none absolute left-1/2 top-0 z-10 w-[118%] max-w-none -translate-x-1/2 select-none" />
    <Lantern class="left-[6%] top-[60px] z-10" :size="52" />
    <Lantern class="right-[6%] top-[60px] z-10" :size="44" :delay="-2.4" />
    <img :src="crescent" alt="" aria-hidden="true" class="bob pointer-events-none absolute right-[22%] top-[20%] z-[6] w-14" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute left-[24%] top-[28%] z-[6] w-5" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute right-[14%] top-[38%] z-[6] w-4" style="animation-delay: -1s" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute left-[12%] top-[52%] z-[6] w-3" style="animation-delay: -2s" />
    <Butterfly class="left-[10%] top-[44%] z-[8]" :size="28" :fx="80" :fy="-50" :duration="14" />
    <Butterfly class="right-[10%] top-[58%] z-[8]" :size="22" :fx="-70" :fy="-70" :duration="11" :delay="-4" />

    <div class="relative z-[7] flex flex-1 flex-col items-center px-5 pb-48 pt-[24svh] text-center">
      <!-- Kaligrafi "دعوة زفاف" (undangan pernikahan) -->
      <h2 class="sr-only">Undangan pernikahan</h2>
      <img
        v-reveal:rtl
        :src="calligraphy"
        alt="دعوة زفاف"
        lang="ar"
        class="w-[min(68%,250px)] select-none"
        style="filter: drop-shadow(0 2px 8px rgba(248, 247, 244, 0.9))"
      />

      <h1
        id="beranda-nama"
        v-reveal:mask="500"
        class="mt-16 whitespace-nowrap font-script text-[clamp(2.5rem,13.2vw,3.5rem)] leading-[1.3] text-ink"
      >
        {{ event.couple.groom.shortName }}
        <span class="font-display text-[0.5em] italic text-ink-soft">&amp;</span>
        {{ event.couple.bride.shortName }}
      </h1>
      <OrnamentDivider v-reveal="900" class="mt-3" />

      <a href="#ayat" class="mx-auto mt-10 flex w-fit flex-col items-center text-xs text-ink-soft" aria-label="Gulir ke isi undangan">
        Gulir ke bawah
        <ChevronDown class="mt-1 size-5" style="animation: nudge 1.8s ease-in-out infinite" aria-hidden="true" />
      </a>
    </div>

    <img :src="bed" alt="" aria-hidden="true" class="sway-b pointer-events-none absolute inset-x-0 bottom-0 z-[9] w-full select-none object-cover object-bottom" style="height: 190px" />
  </BandSection>
</template>
