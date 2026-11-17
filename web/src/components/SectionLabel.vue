<!--
  web/src/components/SectionLabel.vue — label kecil kapital berjarak lebar + pemisah
  (gaya "FIRMAN ALLAH", "LOKASI ACARA" di video).
  Dipanggil oleh: section-section undangan.
  Memanggil: OrnamentDivider.vue.
-->
<script setup lang="ts">
import OrnamentDivider from './OrnamentDivider.vue';

withDefaults(defineProps<{ text: string; as?: 'h2' | 'p' }>(), { as: 'h2' });
</script>

<template>
  <div class="mb-6 flex flex-col items-center gap-3">
    <component :is="as" v-reveal class="text-[11px] font-bold uppercase tracking-[0.34em] text-ink-soft">
      {{ text }}
    </component>
    <OrnamentDivider v-reveal="150" />
  </div>
</template>
