<!--
  web/src/sections/EtiquetteSection.vue — "Adab Menghadiri Walimah": daftar ikon yang muncul bergantian (video 57–63 dtk).
  Dipanggil oleh: App.vue.  Memanggil: config/event.ts (etiquette), ikon lucide-vue-next.
  Butir larangan (emphasis) di video berwarna merah; di sini memakai lingkaran bergaris tebal hitam
  agar tetap menonjol tanpa keluar dari palet klien.
-->
<script setup lang="ts">
import { CameraOff, Clock, HandHeart, Shirt, Utensils } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import type { EtiquetteItem } from '../../../config/event.ts';
import SectionShell from '../components/SectionShell.vue';
import OrnamentDivider from '../components/OrnamentDivider.vue';

const ICONS: Record<EtiquetteItem['icon'], unknown> = {
  utensils: Utensils,
  clock: Clock,
  'hand-heart': HandHeart,
  shirt: Shirt,
  'camera-off': CameraOff,
};
</script>

<template>
  <SectionShell id="adab" tone="cream" flowers="both" labelledby="adab-judul">
    <h2 id="adab-judul" v-reveal:mask class="font-display text-[1.75rem] font-bold leading-snug text-ink">{{ event.etiquette.title }}</h2>
    <OrnamentDivider v-reveal="200" class="my-5" />
    <ul class="mx-auto flex max-w-[290px] flex-col gap-4 text-left">
      <li v-for="(item, i) in event.etiquette.items" :key="item.text" v-reveal="300 + i * 150" class="flex items-center gap-4">
        <span
          class="grid size-11 shrink-0 place-items-center rounded-full"
          :class="item.emphasis ? 'border-2 border-ink bg-paper text-ink' : 'bg-ink text-paper'"
          aria-hidden="true"
        >
          <component :is="ICONS[item.icon]" class="size-5" />
        </span>
        <span class="text-[15px] leading-snug text-ink" :class="item.emphasis ? 'font-bold' : ''">{{ item.text }}</span>
      </li>
    </ul>
  </SectionShell>
</template>
