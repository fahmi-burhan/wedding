<!--
  web/src/sections/CoupleSection.vue — nama lengkap mempelai & orang tua di dalam bingkai lengkung (video 23–29 dtk).
  Dipanggil oleh: App.vue.  Memanggil: config/event.ts (couple), ArchFrame.
-->
<script setup lang="ts">
import { event } from '../../../config/event.ts';
import SectionShell from '../components/SectionShell.vue';
import ArchFrame from '../components/ArchFrame.vue';

const { groom, bride } = event.couple;
</script>

<template>
  <SectionShell id="mempelai" flowers="left" labelledby="mempelai-judul">
    <h2 id="mempelai-judul" class="sr-only">Kedua Mempelai</h2>
    <ArchFrame>
      <p v-reveal:mask="300" class="font-display text-[1.7rem] font-bold leading-tight text-ink">{{ groom.fullName }}</p>
      <p v-reveal="600" class="mt-2 whitespace-pre-line text-sm text-ink-soft">{{ groom.parents }}</p>

      <p v-reveal:zoom="900" class="my-6 font-display text-4xl italic text-ink-soft" aria-hidden="true">&amp;</p>

      <p v-reveal:mask="1100" class="font-display text-[1.7rem] font-bold leading-tight text-ink">{{ bride.fullName }}</p>
      <p v-reveal="1400" class="mt-2 whitespace-pre-line text-sm text-ink-soft">{{ bride.parents }}</p>
    </ArchFrame>
  </SectionShell>
</template>
