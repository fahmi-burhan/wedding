<!--
  web/src/components/SectionLabel.vue — judul section: (opsional) judul script besar, label kecil kapital
  berjarak lebar (gaya "FIRMAN ALLAH" di video), lalu pemisah.
  Dipanggil oleh: section-section undangan.
  Memanggil: OrnamentDivider.vue.
-->
<script setup lang="ts">
import OrnamentDivider from './OrnamentDivider.vue';

withDefaults(defineProps<{ text: string; script?: string; as?: 'h2' | 'p' }>(), { as: 'h2' });
</script>

<template>
  <div class="mb-6 flex flex-col items-center gap-3">
    <p v-if="script" v-reveal:mask aria-hidden="true" class="-mb-1 font-script text-[2.9rem] leading-none text-ink">{{ script }}</p>
    <component :is="as" v-reveal="150" class="text-[11px] font-bold uppercase tracking-[0.34em] text-ink-soft">
      {{ text }}
    </component>
    <OrnamentDivider v-reveal="250" />
  </div>
</template>
