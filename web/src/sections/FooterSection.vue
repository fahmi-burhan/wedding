<!--
  web/src/sections/FooterSection.vue — penutup singkat: logo + nama pasangan + tanggal, agar halaman tidak
  berakhir mendadak. Bukan bagian isi undangan (tanpa teks baru).
  Dipanggil oleh: App.vue.  Memanggil: config/event.ts, shared/date.ts, logo di assets/brand.
-->
<script setup lang="ts">
import { event } from '../../../config/event.ts';
import { formatLongDate } from '../../../shared/date.ts';
import BandSection from '../components/BandSection.vue';
import logo from '../assets/brand/logo.png';

const date = formatLongDate(event.sessions[0].start, event.timezone);
</script>

<template>
  <BandSection tone="paper">
    <footer class="mx-auto max-w-[380px] px-6 py-14 text-center">
      <img v-reveal:zoom :src="logo" alt="Logo Husein dan Zahroh" class="bob mx-auto h-20 w-auto" />
      <p v-reveal="200" class="mt-4 font-script text-[2.2rem] leading-tight text-ink">{{ event.couple.short }}</p>
      <p v-reveal="300" class="mt-1 text-xs tracking-[0.2em] text-ink-soft">{{ date }}</p>
    </footer>
  </BandSection>
</template>
