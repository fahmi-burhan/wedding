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
import Motes from '../components/Motes.vue';
import Lantern from '../components/Lantern.vue';
import Butterfly from '../components/Butterfly.vue';
import OrnamentDivider from '../components/OrnamentDivider.vue';
import quran from '../assets/scenes/quran.svg';
import swagTop from '../assets/ornaments/swag-top.svg';
import sparkle from '../assets/scenes/sparkle.svg';
import bed from '../assets/scenes/bed-bottom.svg';
</script>

<template>
  <BandSection id="ayat" tone="cream" from="paper" labelledby="ayat-judul">
    <Motes :count="12" :seed="23" />
    <img :src="swagTop" alt="" aria-hidden="true" class="sway-t pointer-events-none absolute -top-7 left-1/2 z-10 w-[112%] max-w-none -translate-x-1/2 select-none" />
    <Butterfly class="right-[12%] top-[230px] z-[8]" :size="22" :fx="-50" :fy="-50" :duration="13" />
    <Lantern class="left-[4%] top-[70px] z-10" :size="40" />
    <Lantern class="right-[4%] top-[70px] z-10" :size="36" :delay="-1.8" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute left-[30%] top-[150px] z-10 w-4" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute right-[28%] top-[140px] z-10 w-3" style="animation-delay: -1.2s" />

    <div class="relative z-[5] mx-auto max-w-[400px] px-5 pb-48 pt-[150px] text-center">
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

    <img :src="bed" alt="" aria-hidden="true" class="sway-b pointer-events-none absolute inset-x-0 bottom-0 z-[6] w-full select-none object-cover object-bottom" style="height: 170px" />
  </BandSection>
</template>
