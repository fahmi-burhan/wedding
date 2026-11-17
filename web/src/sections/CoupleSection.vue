<!--
  web/src/sections/CoupleSection.vue — nama lengkap mempelai & orang tua di dalam bingkai kapsul berisi
  (video 23–29 dtk + kapsul besar di website referensi).
  Dipanggil oleh: App.vue.  Memanggil: config/event.ts (couple), ArchFrame, SectionLabel.
-->
<script setup lang="ts">
import { event } from '../../../config/event.ts';
import SectionShell from '../components/SectionShell.vue';
import SectionLabel from '../components/SectionLabel.vue';
import ArchFrame from '../components/ArchFrame.vue';

const { groom, bride } = event.couple;
</script>

<template>
  <SectionShell id="mempelai" :card="false">
    <SectionLabel script="Kedua Mempelai" text="Mempelai" as="p" />
    <ArchFrame filled>
      <p v-reveal="200" class="font-script text-4xl leading-none text-ink-soft" aria-hidden="true">{{ groom.shortName }}</p>
      <h2 v-reveal:mask="300" class="mt-2 font-display text-[1.6rem] font-bold leading-tight text-ink">{{ groom.fullName }}</h2>
      <p v-reveal="600" class="mt-2 whitespace-pre-line text-sm text-ink-soft">{{ groom.parents }}</p>

      <p v-reveal:zoom="900" class="my-5 font-script text-5xl text-ink" aria-hidden="true">&amp;</p>

      <p v-reveal="1000" class="font-script text-4xl leading-none text-ink-soft" aria-hidden="true">{{ bride.shortName }}</p>
      <h2 v-reveal:mask="1100" class="mt-2 font-display text-[1.6rem] font-bold leading-tight text-ink">{{ bride.fullName }}</h2>
      <p v-reveal="1400" class="mt-2 whitespace-pre-line text-sm text-ink-soft">{{ bride.parents }}</p>
    </ArchFrame>
  </SectionShell>
</template>
