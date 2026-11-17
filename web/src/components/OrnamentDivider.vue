<!--
  web/src/components/OrnamentDivider.vue — garis pemisah tipis dengan belah ketupat di tengah (motif video).
  Dipanggil oleh: SectionLabel.vue dan banyak section.
  Memanggil: tidak ada.
-->
<script setup lang="ts">
defineProps<{ width?: 'sm' | 'md' }>();
</script>

<template>
  <div class="flex items-center justify-center gap-2" aria-hidden="true">
    <span class="h-px bg-line" :class="width === 'sm' ? 'w-10' : 'w-16'" />
    <span class="size-1.5 rotate-45 bg-line" />
    <span class="h-px bg-line" :class="width === 'sm' ? 'w-10' : 'w-16'" />
  </div>
</template>
