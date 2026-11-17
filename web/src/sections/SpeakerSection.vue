<!--
  web/src/sections/SpeakerSection.vue — pengisi tausiyah (video 45–48 dtk). Tidak dirender bila event.speaker null.
  Dipanggil oleh: App.vue.  Memanggil: config/event.ts (speaker), SectionLabel.
-->
<script setup lang="ts">
import { event } from '../../../config/event.ts';
import SectionShell from '../components/SectionShell.vue';
import SectionLabel from '../components/SectionLabel.vue';
</script>

<template>
  <SectionShell v-if="event.speaker" id="tausiyah" tone="cream" flowers="right" :full="false">
    <SectionLabel :text="event.speaker.label" />
    <p v-reveal:mask="250" class="font-display text-[1.6rem] font-bold leading-snug text-ink">{{ event.speaker.name }}</p>
  </SectionShell>
</template>
