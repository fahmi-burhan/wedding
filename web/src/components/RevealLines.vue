<!--
  web/src/components/RevealLines.vue — paragraf yang muncul baris demi baris
  (meniru teks ayat/doa di video yang tampil bertahap).
  Dipanggil oleh: Opening, Verse, Prayer, Closing section.
  Memanggil: directive v-reveal.
  Baris diambil dari config/event.ts (array `lines`) agar pemenggalan sama seperti undangan aslinya.
-->
<script setup lang="ts">
withDefaults(defineProps<{ lines: string[]; startDelay?: number; step?: number }>(), {
  startDelay: 0,
  step: 110,
});
</script>

<template>
  <p class="text-[15px] leading-relaxed text-ink">
    <span v-for="(line, i) in lines" :key="i" v-reveal="startDelay + i * step" class="block">{{ line }}</span>
  </p>
</template>
