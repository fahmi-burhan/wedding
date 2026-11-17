<!--
  web/src/components/Butterfly.vue — kupu-kupu kecil yang mengepak & terbang berliku (padanan hewan
  beranimasi di website referensi). Warna cream/abu agar biru tetap khusus untuk bunga.
  Dipanggil oleh: HeroSection.vue, CoverSection.vue, SectionShell.vue (opsional).
  Memanggil: animasi `flap` & `flutter-path` di main.css. Diam bila "kurangi gerakan" aktif.
-->
<script setup lang="ts">
withDefaults(defineProps<{ size?: number; fx?: number; fy?: number; duration?: number; delay?: number }>(), {
  size: 30,
  fx: 60,
  fy: -40,
  duration: 12,
  delay: 0,
});
</script>

<template>
  <span
    class="butterfly pointer-events-none absolute block"
    :style="{
      width: `${size}px`,
      '--fx': `${fx}px`,
      '--fy': `${fy}px`,
      animation: `flutter-path ${duration}s ease-in-out ${delay}s infinite`,
    }"
    aria-hidden="true"
  >
    <svg viewBox="0 0 40 32" class="block w-full overflow-visible">
      <g class="wing-l">
        <path d="M20 15 C14 2 2 -1 2 8 C2 14 9 16 20 16Z" fill="#FBFAF7" stroke="#8C989C" stroke-width="0.9" />
        <path d="M20 17 C12 17 5 20 7 26 C9 31 16 27 20 18Z" fill="#EFE6DB" stroke="#8C989C" stroke-width="0.9" />
        <circle cx="8" cy="8" r="1.8" fill="#D5C3B0" />
      </g>
      <g class="wing-r">
        <path d="M20 15 C26 2 38 -1 38 8 C38 14 31 16 20 16Z" fill="#FBFAF7" stroke="#8C989C" stroke-width="0.9" />
        <path d="M20 17 C28 17 35 20 33 26 C31 31 24 27 20 18Z" fill="#EFE6DB" stroke="#8C989C" stroke-width="0.9" />
        <circle cx="32" cy="8" r="1.8" fill="#D5C3B0" />
      </g>
      <path d="M20 9 L20 25" stroke="#4A4F52" stroke-width="1.6" stroke-linecap="round" />
      <path d="M20 9 C18 5 16 4 15 3 M20 9 C22 5 24 4 25 3" stroke="#4A4F52" stroke-width="0.7" fill="none" />
    </svg>
  </span>
</template>
