<!--
  web/src/sections/VerseSection.vue — bagian kedua (Revisi Client 1): ayat Ar-Rum: 21 dalam bahasa Arab dan
  terjemahan Indonesia, di atas blok cream (perubahan warna tegas dari hero).
  Dipanggil oleh: App.vue.
  Memanggil: config/event.ts (verse), SectionLabel, Lantern, mushaf & ornamen di assets/.

  Teks tidak menyentuh bunga di samping: dekorasi hanya di atas & bawah kartu, kartu diberi margin samping.
  Teks sakral: hanya dari config (Arab: dibaca dari gambar referensi klien; PERLU DIPERIKSA ULANG).
-->
<script setup lang="ts">
import { event } from '../../../config/event.ts';
import BandSection from '../components/BandSection.vue';
import SideFlower from '../components/SideFlower.vue';
import ParallaxBackdrop from '../components/ParallaxBackdrop.vue';
import ParallaxLayer from '../components/ParallaxLayer.vue';
import crescent from '../assets/scenes/crescent.svg';
import Motes from '../components/Motes.vue';
import Butterfly from '../components/Butterfly.vue';
import OrnamentDivider from '../components/OrnamentDivider.vue';
import quran from '../assets/scenes/quran.svg';
import sparkle from '../assets/scenes/sparkle.svg';
</script>

<template>
  <BandSection id="ayat" tone="cream" from="paper" labelledby="ayat-judul">
    <SideFlower side="left" top="6%" variant="rose" :cycle="14" :phase="0" />
    <SideFlower side="right" top="26%" variant="leaf" :cycle="12" :phase="4" />
    <SideFlower side="right" top="54%" variant="rose" :cycle="16" :phase="8" />
    <SideFlower side="left" top="76%" variant="hydrangea" :cycle="13" :phase="2" />
    <ParallaxBackdrop>
      <ParallaxLayer :speed="0.34"><div class="absolute -left-16 top-[8%] size-72 rounded-full bg-[#E3D5C6]/70 blur-3xl" /><div class="absolute -right-20 top-[46%] size-80 rounded-full bg-[#CBD5DA]/50 blur-3xl" /></ParallaxLayer>
      <ParallaxLayer :speed="0.2"><img :src="crescent" alt="" class="absolute -right-6 top-[12%] w-44 opacity-30" /></ParallaxLayer>
      <ParallaxLayer :speed="-0.16">
        <img :src="sparkle" alt="" class="twinkle absolute left-[18%] top-[30%] w-5" />
        <img :src="sparkle" alt="" class="twinkle absolute right-[14%] top-[58%] w-4" style="animation-delay: -1s" />
        <img :src="sparkle" alt="" class="twinkle absolute left-[24%] top-[80%] w-4" style="animation-delay: -2s" />
      </ParallaxLayer>
    </ParallaxBackdrop>
    <Butterfly class="left-[12%] top-[58%] z-[8]" :size="20" :fx="50" :fy="-60" :duration="12" :delay="-4" />
    <Motes :count="12" :seed="23" />
    <Butterfly class="right-[12%] top-[230px] z-[8]" :size="22" :fx="-50" :fy="-50" :duration="13" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute left-[30%] top-[150px] z-10 w-4" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute right-[28%] top-[140px] z-10 w-3" style="animation-delay: -1.2s" />

    <div class="relative z-[5] mx-auto max-w-[400px] px-5 pb-28 pt-[150px] text-center">
      <img v-reveal:zoom :src="quran" alt="" aria-hidden="true" class="bob mx-auto -mb-6 w-[150px] select-none" />

      <div class="relative rounded-[2rem] bg-paper/95 px-6 pb-10 pt-12 shadow-[0_14px_44px_rgba(30,32,34,0.14)] ring-1 ring-line/35">
        <div class="pointer-events-none absolute inset-[7px] rounded-[1.6rem] border border-line/40" aria-hidden="true" />
        <div class="relative">
          <h2 id="ayat-judul" v-reveal class="text-[11px] font-bold uppercase tracking-[0.34em] text-ink-soft">{{ event.verse.label }}</h2>
          <OrnamentDivider v-reveal="150" class="my-4" />

          <p lang="ar" dir="rtl" class="font-arabic-text text-[clamp(1.2rem,5.6vw,1.45rem)] leading-[2.15] text-ink">
            <span v-for="(line, i) in event.verse.arabicLines" :key="i" v-reveal:blur="200 + i * 250" class="block">{{ line }}</span>
          </p>

          <OrnamentDivider v-reveal="700" class="my-5" />
          <p class="text-[14.5px] leading-relaxed text-ink">
            <span v-for="(line, i) in event.verse.lines" :key="i" v-reveal="750 + i * 90" class="block">{{ line }}</span>
          </p>
          <p v-reveal="1700" class="mt-5 text-xs font-bold tracking-wide text-ink">{{ event.verse.source }}</p>
        </div>
      </div>
    </div>

  </BandSection>
</template>
