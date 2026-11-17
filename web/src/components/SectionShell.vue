<!--
  web/src/components/SectionShell.vue — pembungkus setiap section: latar kertas (putih/cream),
  sulur di sudut atas, bunga kecil di sudut bawah, dan tinggi minimal satu layar (ritme "per adegan" video).
  Dipanggil oleh: semua komponen di web/src/sections/.
  Memanggil: ornamen SVG di web/src/assets/ornaments/.
-->
<script setup lang="ts">
import cornerVine from '../assets/ornaments/corner-vine.svg';
import bouquet from '../assets/ornaments/bouquet.svg';

withDefaults(
  defineProps<{
    id?: string;
    tone?: 'paper' | 'cream';
    /** Bunga di sudut bawah: kiri, kanan, keduanya, atau tidak ada. */
    flowers?: 'left' | 'right' | 'both' | 'none';
    /** Tinggi minimal satu layar (false untuk section panjang seperti ucapan). */
    full?: boolean;
    labelledby?: string;
  }>(),
  { tone: 'paper', flowers: 'none', full: true },
);
</script>

<template>
  <section
    :id="id"
    :aria-labelledby="labelledby"
    class="relative isolate overflow-hidden px-6"
    :class="[tone === 'cream' ? 'paper-cream' : 'paper', full ? 'flex min-h-svh flex-col justify-center py-28' : 'py-24']"
  >
    <!-- Sulur sudut atas: tersingkap dari kiri ke kanan seperti tumbuh. -->
    <img :src="cornerVine" alt="" aria-hidden="true" v-reveal:mask class="pointer-events-none absolute -left-2 -top-1 -z-10 w-[62%] max-w-[300px] select-none" />
    <img :src="cornerVine" alt="" aria-hidden="true" class="pointer-events-none absolute -right-2 -top-1 -z-10 w-[40%] max-w-[200px] -scale-x-100 select-none opacity-80" />

    <img
      v-if="flowers === 'left' || flowers === 'both'"
      :src="bouquet"
      alt=""
      aria-hidden="true"
      loading="lazy"
      class="float-soft pointer-events-none absolute -bottom-6 -left-10 -z-10 w-[46%] max-w-[220px] select-none"
    />
    <div
      v-if="flowers === 'right' || flowers === 'both'"
      class="pointer-events-none absolute -bottom-6 -right-10 -z-10 w-[40%] max-w-[190px] -scale-x-100"
      aria-hidden="true"
    >
      <img :src="bouquet" alt="" loading="lazy" class="float-soft w-full select-none" />
    </div>

    <div class="relative mx-auto w-full max-w-[400px] text-center">
      <slot />
    </div>
  </section>
</template>
