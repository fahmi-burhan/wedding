<!--
  web/src/sections/HeroSection.vue — layar pembuka setelah sampul: monogram, nama pasangan (script),
  tanggal, kupu-kupu, dan dekorasi bunga penuh. Padanan "adegan pembuka" bergambar di website referensi.
  Dipanggil oleh: App.vue.
  Memanggil: config/event.ts, shared/date.ts, Monogram, Butterfly, SectionShell, OrnamentDivider.
-->
<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import { formatLongDate } from '../../../shared/date.ts';
import SectionShell from '../components/SectionShell.vue';
import OrnamentDivider from '../components/OrnamentDivider.vue';
import Monogram from '../components/Monogram.vue';
import Butterfly from '../components/Butterfly.vue';

const date = formatLongDate(event.sessions[0].start, event.timezone);
</script>

<template>
  <SectionShell id="beranda" :card="false" labelledby="beranda-nama">
    <Butterfly class="left-[12%] top-[14%] z-30" :size="28" :fx="70" :fy="-50" :duration="13" />
    <Butterfly class="right-[14%] top-[52%] z-30" :size="22" :fx="-60" :fy="-70" :duration="11" :delay="-4" />

    <div v-reveal:zoom><Monogram size="lg" /></div>
    <p v-reveal="300" class="mt-12 text-[11px] font-bold uppercase tracking-[0.36em] text-ink-soft">{{ event.title }}</p>
    <h1 id="beranda-nama" v-reveal:mask="450" class="mt-3 font-script text-[3.6rem] leading-[1.1] text-ink">
      {{ event.couple.groom.shortName }}
      <span class="font-display text-3xl italic text-ink-soft">&amp;</span>
      {{ event.couple.bride.shortName }}
    </h1>
    <OrnamentDivider v-reveal="700" class="my-4" />
    <p v-reveal="800" class="inline-block rounded-full bg-paper/85 px-5 py-1.5 text-[15px] font-bold shadow-sm ring-1 ring-line/40">{{ date }}</p>

    <a href="#pembuka" class="mx-auto mt-10 flex w-fit flex-col items-center text-xs text-ink-soft" aria-label="Gulir ke isi undangan">
      Gulir ke bawah
      <ChevronDown class="mt-1 size-5" style="animation: nudge 1.8s ease-in-out infinite" aria-hidden="true" />
    </a>
  </SectionShell>
</template>
