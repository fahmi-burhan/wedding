<!--
  web/src/sections/VerseSection.vue — terjemahan ayat (QS. Ar-Rum: 21) persis seperti di video undangan,
  di atas pita cream solid (padanan pita warna di website referensi).
  Dipanggil oleh: App.vue.  Memanggil: config/event.ts (verse), SectionLabel, RevealLines.
  Teks sakral: hanya dari config (sumber: pemilik acara), tidak pernah diubah di komponen.
-->
<script setup lang="ts">
import { event } from '../../../config/event.ts';
import SectionShell from '../components/SectionShell.vue';
import SectionLabel from '../components/SectionLabel.vue';
import RevealLines from '../components/RevealLines.vue';
</script>

<template>
  <SectionShell id="ayat" tone="band" decor="sides" :card="false">
    <SectionLabel :text="event.verse.label" />
    <blockquote class="px-4">
      <RevealLines :lines="event.verse.lines" :start-delay="200" :step="120" />
      <footer v-reveal="1400" class="mt-5 text-xs font-bold tracking-wide text-ink">{{ event.verse.source }}</footer>
    </blockquote>
  </SectionShell>
</template>
