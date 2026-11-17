<!--
  web/src/sections/ClosingSection.vue — kalimat penutup, nama pasangan, salam penutup (video 76–80 dtk).
  Dipanggil oleh: App.vue.  Memanggil: config/event.ts (closing, couple), RevealLines, ornamen sprig.
-->
<script setup lang="ts">
import { event } from '../../../config/event.ts';
import SectionShell from '../components/SectionShell.vue';
import OrnamentDivider from '../components/OrnamentDivider.vue';
import RevealLines from '../components/RevealLines.vue';
import sprig from '../assets/ornaments/sprig.svg';
</script>

<template>
  <SectionShell id="penutup" tone="cream" flowers="both" labelledby="penutup-nama">
    <RevealLines :lines="event.closing.lines" />
    <OrnamentDivider v-reveal="600" class="my-7" />
    <h2 id="penutup-nama" v-reveal:mask="750" class="font-display text-[2.2rem] font-bold leading-tight text-ink">{{ event.couple.short }}</h2>
    <p lang="ar" dir="rtl" v-reveal:blur="1100" class="mt-4 font-arabic text-2xl font-bold leading-[1.9] text-ink">{{ event.closing.salamArabic }}</p>
    <img :src="sprig" alt="" aria-hidden="true" v-reveal="1300" class="mx-auto mt-8 w-40" loading="lazy" />
  </SectionShell>
</template>
