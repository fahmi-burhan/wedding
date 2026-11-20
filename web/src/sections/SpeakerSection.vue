<!--
  web/src/sections/SpeakerSection.vue — bagian kelima: pengisi tausiyah (dipertahankan) + tempat untuk satu
  pengisi lagi yang belum diketahui (ditulis "Fulan" sampai klien memastikan).
  Dipanggil oleh: App.vue.  Memanggil: config/event.ts (speakers), SectionLabel.
  Tidak dirender bila event.speakers null.
-->
<script setup lang="ts">
import { event } from '../../../config/event.ts';
import BandSection from '../components/BandSection.vue';
import SectionLabel from '../components/SectionLabel.vue';
import crescent from '../assets/scenes/crescent.svg';
import sparkle from '../assets/scenes/sparkle.svg';
import sprig from '../assets/ornaments/sprig.svg';
</script>

<template>
  <BandSection v-if="event.speakers" id="tausiyah" tone="paper" labelledby="tausiyah-judul">
    <img :src="crescent" alt="" aria-hidden="true" class="bob pointer-events-none absolute right-[8%] top-10 w-14 opacity-90" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute left-[12%] top-14 w-4" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute bottom-12 left-[20%] w-3" style="animation-delay: -1.5s" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute bottom-16 right-[16%] w-4" style="animation-delay: -0.7s" />

    <div class="relative mx-auto max-w-[380px] px-6 py-24 text-center">
      <SectionLabel :text="event.speakers.label" />
      <h2 id="tausiyah-judul" class="sr-only">{{ event.speakers.label }}</h2>
      <ul class="flex flex-col gap-3">
        <li v-for="(name, i) in event.speakers.names" :key="i" v-reveal:mask="200 + i * 250" class="font-display text-[1.45rem] font-bold leading-snug text-ink">
          {{ name }}
        </li>
      </ul>
      <img :src="sprig" alt="" aria-hidden="true" v-reveal="700" class="mx-auto mt-8 w-40" loading="lazy" />
    </div>
  </BandSection>
</template>
