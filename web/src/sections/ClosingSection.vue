<!--
  web/src/sections/ClosingSection.vue — penutup: monogram, kalimat penutup, nama pasangan (script),
  salam penutup (video 76–80 dtk; monogram penutup seperti website referensi).
  Dipanggil oleh: App.vue.  Memanggil: config/event.ts (closing, couple), Monogram, RevealLines, Butterfly.
-->
<script setup lang="ts">
import { event } from '../../../config/event.ts';
import SectionShell from '../components/SectionShell.vue';
import OrnamentDivider from '../components/OrnamentDivider.vue';
import RevealLines from '../components/RevealLines.vue';
import Monogram from '../components/Monogram.vue';
import Butterfly from '../components/Butterfly.vue';
</script>

<template>
  <SectionShell id="penutup" labelledby="penutup-nama">
    <Butterfly class="-right-2 -top-8 z-30" :size="24" :fx="-50" :fy="-30" :duration="12" />
    <div v-reveal:zoom class="mb-12"><Monogram /></div>
    <RevealLines :lines="event.closing.lines" :start-delay="200" />
    <OrnamentDivider v-reveal="700" class="my-6" />
    <h2 id="penutup-nama" v-reveal:mask="850" class="whitespace-nowrap font-script text-[2.5rem] leading-tight text-ink">{{ event.couple.short }}</h2>
    <p lang="ar" dir="rtl" v-reveal:blur="1100" class="mt-3 font-arabic text-[1.35rem] font-bold leading-[1.9] text-ink">{{ event.closing.salamArabic }}</p>
  </SectionShell>
</template>
