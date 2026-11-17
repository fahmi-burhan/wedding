<!--
  web/src/App.vue — kerangka halaman undangan: sampul → seluruh section → tombol musik.
  Dipanggil oleh: web/src/main.ts.
  Memanggil: semua komponen di web/src/sections/, useGuest.ts, reveal.ts, MusicToggle, PetalBurst.

  Alur buka undangan:
  1. Klik "Buka Undangan" → onOpen(): kunci scroll dilepas, musik diputar (masih dalam klik = diizinkan browser),
     kelopak berjatuhan, animasi scroll mulai aktif.
  2. Setelah transisi selesai, sampul dihapus dari DOM (onGone) dan fokus pindah ke isi undangan.
  sessionStorage mengingat bahwa tamu sudah membuka undangan, jadi saat halaman dimuat ulang
  sampul dilewati (musik tidak otomatis menyala — tamu bisa menekan tombol musik).
-->
<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { event } from '../../config/event.ts';
import { loadGuest } from './composables/useGuest.ts';
import { startReveals } from './composables/reveal.ts';
import CoverSection from './sections/CoverSection.vue';
import OpeningSection from './sections/OpeningSection.vue';
import VerseSection from './sections/VerseSection.vue';
import CoupleSection from './sections/CoupleSection.vue';
import CountdownSection from './sections/CountdownSection.vue';
import EventsSection from './sections/EventsSection.vue';
import SpeakerSection from './sections/SpeakerSection.vue';
import LocationSection from './sections/LocationSection.vue';
import EtiquetteSection from './sections/EtiquetteSection.vue';
import RsvpSection from './sections/RsvpSection.vue';
import WishesSection from './sections/WishesSection.vue';
import PrayerSection from './sections/PrayerSection.vue';
import ClosingSection from './sections/ClosingSection.vue';
import MusicToggle from './components/MusicToggle.vue';
import PetalBurst from './components/PetalBurst.vue';

const OPENED_KEY = 'undangan.opened';
const wasOpened = (() => {
  try {
    return sessionStorage.getItem(OPENED_KEY) === '1';
  } catch {
    return false;
  }
})();

const opened = ref(wasOpened);
const coverVisible = ref(!wasOpened);
const showPetals = ref(false);
const main = ref<HTMLElement | null>(null);
const music = ref<InstanceType<typeof MusicToggle> | null>(null);

onMounted(() => {
  loadGuest();
  if (wasOpened) {
    document.documentElement.classList.remove('is-locked');
    startReveals();
  }
});

function onOpen() {
  opened.value = true;
  music.value?.play(); // harus sinkron di dalam klik agar diizinkan browser
  showPetals.value = true;
  document.documentElement.classList.remove('is-locked');
  window.scrollTo(0, 0);
  try {
    sessionStorage.setItem(OPENED_KEY, '1');
  } catch {
    /* mode privat: abaikan */
  }
  // Mulai animasi saat sampul mulai memudar, agar tamu melihat section pertama "hidup".
  window.setTimeout(startReveals, 700);
  window.setTimeout(() => (showPetals.value = false), 4500);
}

async function onGone() {
  coverVisible.value = false;
  await nextTick();
  main.value?.focus({ preventScroll: true });
}
</script>

<template>
  <div class="leaf-shadow" aria-hidden="true" />

  <CoverSection v-if="coverVisible" @open="onOpen" @gone="onGone" />
  <PetalBurst v-if="showPetals" />

  <main
    ref="main"
    tabindex="-1"
    :inert="!opened"
    :aria-hidden="!opened"
    class="relative mx-auto w-full max-w-[480px] overflow-x-clip shadow-[0_0_60px_rgba(30,32,34,0.08)] outline-none"
  >
    <OpeningSection />
    <VerseSection />
    <CoupleSection />
    <CountdownSection />
    <EventsSection />
    <SpeakerSection />
    <LocationSection />
    <EtiquetteSection />
    <RsvpSection />
    <WishesSection />
    <PrayerSection />
    <ClosingSection />
  </main>

  <MusicToggle v-if="event.music" ref="music" :src="event.music.src" :title="event.music.title" :visible="opened" />
</template>
