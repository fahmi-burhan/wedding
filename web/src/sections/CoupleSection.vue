<!--
  web/src/sections/CoupleSection.vue — bagian ketiga: SATU kapsul panjang (bingkai garis ganda yang "tergambar"
  saat muncul) berisi berurutan: salam Arab, kalimat "dengan memohon rahmat…", mempelai pria (panggilan script,
  nama lengkap, orang tua), "&", lalu mempelai wanita. Hitung mundur ada di bagian sendiri (CountdownSection).
  Dipanggil oleh: App.vue.
  Memanggil: config/event.ts, ArchFrame, OrnamentDivider, SideFlower, ornamen di assets/.

  Gaya huruf dibedakan: panggilan = script (Great Vibes); nama lengkap = Playfair Display tebal;
  nama orang tua = Lato ringan. Latar sticky memakai overflow-clip pada section (bukan overflow-hidden).
-->
<script setup lang="ts">
import { event } from '../../../config/event.ts';
import BandSection from '../components/BandSection.vue';
import ArchFrame from '../components/ArchFrame.vue';
import OrnamentDivider from '../components/OrnamentDivider.vue';
import SideFlower from '../components/SideFlower.vue';
import Butterfly from '../components/Butterfly.vue';
import Motes from '../components/Motes.vue';
import backdrop from '../assets/ornaments/backdrop.svg';
import mosque from '../assets/scenes/mosque.svg';
import sparkle from '../assets/scenes/sparkle.svg';

const { groom, bride } = event.couple;
const people = [groom, bride];
</script>

<template>
  <BandSection id="mempelai" tone="paper" from="cream" fade labelledby="mempelai-judul">
    <SideFlower side="left" top="6%" variant="bloom" :cycle="14" :phase="0" />
    <SideFlower side="right" top="26%" variant="hydrangea" :cycle="15" :phase="6" />
    <SideFlower side="left" top="50%" variant="rose" :cycle="13" :phase="9" />
    <SideFlower side="right" top="72%" variant="leaf" :cycle="12" :phase="3" />
    <!-- Latar diam: tetap di layar selama kapsul bergulir -->
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div class="sticky top-0 h-svh w-full overflow-hidden">
        <img :src="backdrop" alt="" class="absolute inset-0 size-full object-cover" />
        <img :src="mosque" alt="" class="parallax-slow absolute inset-x-0 bottom-0 w-full opacity-70" />
        <Motes :count="16" :seed="3" />
        <img :src="sparkle" alt="" class="twinkle absolute left-[14%] top-[18%] w-5" />
        <img :src="sparkle" alt="" class="twinkle absolute right-[16%] top-[30%] w-4" style="animation-delay: -1.1s" />
        <img :src="sparkle" alt="" class="twinkle absolute left-[22%] top-[58%] w-3" style="animation-delay: -2s" />
        <img :src="sparkle" alt="" class="twinkle absolute right-[10%] top-[72%] w-5" style="animation-delay: -0.6s" />
      </div>
    </div>

    <div class="relative z-[5] mx-auto max-w-[380px] px-3 pb-24 pt-[120px] text-center">
      <h2 id="mempelai-judul" class="sr-only">Kedua Mempelai</h2>

      <ArchFrame filled>
        <p lang="ar" dir="rtl" v-reveal:blur class="whitespace-nowrap font-arabic text-[clamp(0.95rem,4.9vw,1.2rem)] font-bold leading-[1.9] text-ink">
          {{ event.opening.salamArabic }}
        </p>
        <OrnamentDivider v-reveal="200" width="sm" class="my-4" />
        <p class="text-[15px] leading-relaxed text-ink">
          <span v-for="(line, i) in event.opening.lines" :key="i" v-reveal="300 + i * 120" class="block">{{ line }}</span>
        </p>

        <OrnamentDivider v-reveal class="my-9" />

        <template v-for="(p, i) in people" :key="p.shortName">
          <p v-if="i === 1" v-reveal:zoom class="my-7 font-script text-5xl text-ink" aria-hidden="true">&amp;</p>
          <div :aria-label="p.fullName" class="relative">
            <p v-reveal:mask="100" class="font-script text-[3.4rem] leading-[1.25] text-ink" aria-hidden="true">{{ p.shortName }}</p>
            <h3 v-reveal="250" class="mt-1 font-display text-[1.5rem] font-bold leading-tight tracking-tight text-ink">{{ p.fullName }}</h3>
            <OrnamentDivider v-reveal="350" width="sm" class="my-3" />
            <p v-reveal="450" class="whitespace-pre-line text-[13.5px] font-light leading-relaxed text-ink-soft">{{ p.parents }}</p>
            <Butterfly v-if="i === 0" class="-right-3 top-2" :size="22" :fx="-30" :fy="-30" :duration="10" />
            <Butterfly v-else class="-left-3 top-6" :size="20" :fx="30" :fy="-36" :duration="12" :delay="-3" />
          </div>
        </template>
      </ArchFrame>
    </div>
  </BandSection>
</template>
