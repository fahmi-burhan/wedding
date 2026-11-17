<!--
  web/src/sections/OpeningSection.vue — salam pembuka berbahasa Arab + kalimat undangan, di dalam kartu.
  Dipanggil oleh: App.vue.  Memanggil: config/event.ts (opening), SectionShell, RevealLines, OrnamentDivider.
-->
<script setup lang="ts">
import { event } from '../../../config/event.ts';
import SectionShell from '../components/SectionShell.vue';
import OrnamentDivider from '../components/OrnamentDivider.vue';
import RevealLines from '../components/RevealLines.vue';
</script>

<template>
  <SectionShell id="pembuka" labelledby="pembuka-salam">
    <h2 id="pembuka-salam" lang="ar" dir="rtl" v-reveal:blur class="font-arabic text-[2rem] font-bold leading-[1.9] text-ink">
      {{ event.opening.salamArabic }}
    </h2>
    <OrnamentDivider v-reveal="300" class="my-6" />
    <RevealLines :lines="event.opening.lines" :start-delay="450" />
  </SectionShell>
</template>
