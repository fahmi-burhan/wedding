<!--
  web/src/sections/NoticeSection.vue — bagian keenam: (1) Pemberitahuan Penting — konsep Infishal Tamm
  (Arab, transliterasi, penjelasan satu paragraf), (2) Adab Menghadiri Walimah (tetap seperti sebelumnya).
  Dipanggil oleh: App.vue.
  Memanggil: config/event.ts (notice, etiquette), ikon lucide, Lantern, SectionLabel.
  Teks penjelasan Infishal Tamm ditulis ulang pengembang → PERLU DIPERIKSA klien/ustadz.
-->
<script setup lang="ts">
import { CameraOff, Clock, HandHeart, Shirt, Utensils } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import type { EtiquetteItem } from '../../../config/event.ts';
import BandSection from '../components/BandSection.vue';
import Lantern from '../components/Lantern.vue';
import OrnamentDivider from '../components/OrnamentDivider.vue';
import SectionLabel from '../components/SectionLabel.vue';
import swagTop from '../assets/ornaments/swag-top.svg';
import sparkle from '../assets/scenes/sparkle.svg';
import bed from '../assets/scenes/bed-bottom.svg';

const ICONS: Record<EtiquetteItem['icon'], unknown> = {
  utensils: Utensils,
  clock: Clock,
  'hand-heart': HandHeart,
  shirt: Shirt,
  'camera-off': CameraOff,
};
const card = 'relative rounded-[2rem] bg-paper/95 px-6 shadow-[0_14px_44px_rgba(30,32,34,0.14)] ring-1 ring-line/35';
</script>

<template>
  <BandSection id="pemberitahuan" tone="cream" labelledby="pemberitahuan-judul">
    <img :src="swagTop" alt="" aria-hidden="true" class="pointer-events-none absolute left-1/2 top-0 z-10 w-[112%] max-w-none -translate-x-1/2 select-none" />
    <Lantern class="left-[4%] top-[70px] z-10" :size="38" />
    <Lantern class="right-[4%] top-[70px] z-10" :size="40" :delay="-2.2" />

    <div class="relative z-[5] mx-auto flex max-w-[380px] flex-col gap-10 px-4 pb-44 pt-[150px] text-center">
      <!-- Pemberitahuan penting -->
      <div :class="[card, 'pb-10 pt-8']">
        <SectionLabel :text="event.notice.title" />
        <p id="pemberitahuan-judul" class="sr-only">{{ event.notice.title }}</p>
        <p v-reveal="150" class="text-sm font-bold text-ink">{{ event.notice.concept }}</p>
        <p v-reveal:blur="250" lang="ar" dir="rtl" class="mt-2 font-arabic text-[2.2rem] font-bold leading-[1.7] text-ink">{{ event.notice.arabic }}</p>
        <p v-reveal="350" class="font-display text-[1.05rem] italic text-ink-soft">{{ event.notice.transliteration }}</p>
        <OrnamentDivider v-reveal="450" class="my-5" />
        <p v-reveal="550" class="text-[14.5px] leading-relaxed text-ink">{{ event.notice.paragraph }}</p>
        <img :src="sparkle" alt="" aria-hidden="true" class="twinkle absolute right-5 top-5 w-4" />
      </div>

      <!-- Adab -->
      <div :class="[card, 'pb-10 pt-9']">
        <h2 v-reveal:mask class="font-display text-[1.45rem] font-bold leading-snug text-ink">{{ event.etiquette.title }}</h2>
        <OrnamentDivider v-reveal="200" class="my-5" />
        <ul class="mx-auto flex max-w-[270px] flex-col gap-4 text-left">
          <li v-for="(item, i) in event.etiquette.items" :key="item.text" v-reveal="300 + i * 150" class="flex items-center gap-4">
            <span
              class="grid size-11 shrink-0 place-items-center rounded-full"
              :class="item.emphasis ? 'border-2 border-ink bg-paper text-ink' : 'bg-ink text-paper'"
              aria-hidden="true"
            >
              <component :is="ICONS[item.icon]" class="size-5" />
            </span>
            <span class="text-[15px] leading-snug text-ink" :class="item.emphasis ? 'font-bold' : ''">{{ item.text }}</span>
          </li>
        </ul>
      </div>
    </div>

    <img :src="bed" alt="" aria-hidden="true" class="sway-b pointer-events-none absolute inset-x-0 bottom-0 z-[6] w-full select-none object-cover object-bottom" style="height: 160px" />
  </BandSection>
</template>
