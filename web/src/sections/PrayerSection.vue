<!--
  web/src/sections/PrayerSection.vue — doa untuk pengantin (Arab + terjemahan + sumber) di bingkai lengkung (video 66–72 dtk).
  Dipanggil oleh: App.vue.  Memanggil: config/event.ts (prayer), ArchFrame, RevealLines.
  Teks sakral: hanya dari config (sumber: pemilik acara).
-->
<script setup lang="ts">
import { event } from '../../../config/event.ts';
import SectionShell from '../components/SectionShell.vue';
import ArchFrame from '../components/ArchFrame.vue';
import RevealLines from '../components/RevealLines.vue';
</script>

<template>
  <SectionShell id="doa" flowers="left" labelledby="doa-judul">
    <ArchFrame>
      <h2 id="doa-judul" v-reveal="200" class="text-[11px] font-bold uppercase tracking-[0.34em] text-ink-soft">{{ event.prayer.label }}</h2>
      <p lang="ar" dir="rtl" v-reveal:blur="400" class="mt-5 font-arabic-text text-[1.65rem] leading-[2.1] text-ink">{{ event.prayer.arabic }}</p>
      <RevealLines class="mt-4" :lines="event.prayer.lines" :start-delay="700" />
      <p v-reveal="1400" class="mt-4 text-xs font-bold tracking-wide text-ink-soft">{{ event.prayer.source }}</p>
    </ArchFrame>
  </SectionShell>
</template>
