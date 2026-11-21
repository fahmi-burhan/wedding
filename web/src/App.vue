<!--
  web/src/App.vue — kerangka halaman undangan: sampul → bagian (hero, ayat, mempelai, hitung mundur,
  waktu & tempat + tausiyah (paralaks), pemberitahuan+adab, wedding gift, RSVP+ucapan) → footer → tombol musik.
  Dipanggil oleh: web/src/main.ts.
  Memanggil: semua komponen di web/src/sections/, useGuest.ts, reveal.ts, MusicToggle, PetalBurst, PatternStrip.

  Antar bagian TIDAK ada garis pemisah: warna latar putih ↔ cream berpindah lewat gradasi halus (BandSection `from`),
  dan hiasan bunga bagian atas/bawah saling bertumpuk melewati batas.

  Alur buka undangan:
  1. Klik "Buka Undangan" → onOpen(): kunci scroll dilepas, MUSIK DIPUTAR (masih dalam klik = diizinkan browser),
     kelopak berjatuhan, animasi scroll mulai aktif, sampul naik keluar layar.
  2. Setelah transisi selesai, sampul dihapus dari DOM (onGone) dan fokus pindah ke isi undangan.
  Setiap halaman dimuat ulang, sampul SELALU tampil lagi (tidak ada yang diingat), dan scroll kembali ke atas.
-->
<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { event } from '../../config/event.ts';
import { loadGuest } from './composables/useGuest.ts';
import { startReveals } from './composables/reveal.ts';
import { invitationOpen } from './composables/openState.ts';
import CoverSection from './sections/CoverSection.vue';
import HeroSection from './sections/HeroSection.vue';
import VerseSection from './sections/VerseSection.vue';
import CoupleSection from './sections/CoupleSection.vue';
import EventSection from './sections/EventSection.vue';
import CountdownSection from './sections/CountdownSection.vue';
import NoticeSection from './sections/NoticeSection.vue';
import GiftSection from './sections/GiftSection.vue';
import RsvpSection from './sections/RsvpSection.vue';
import FooterSection from './sections/FooterSection.vue';
import MusicToggle from './components/MusicToggle.vue';
import PetalBurst from './components/PetalBurst.vue';
import AmbientPetals from './components/AmbientPetals.vue';

const opened = ref(false);
const coverVisible = ref(true);
const showPetals = ref(false);
const main = ref<HTMLElement | null>(null);
const music = ref<InstanceType<typeof MusicToggle> | null>(null);

// Parallax ringan: posisi scroll disimpan sebagai variabel CSS --sy (px) yang dipakai hiasan latar.
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    document.documentElement.style.setProperty('--sy', String(Math.round(window.scrollY)));
    ticking = false;
  });
}

// Setiap muat ulang SELALU mulai dari sampul, di paling atas (bukan posisi scroll lama).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

onMounted(() => {
  window.scrollTo(0, 0);
  window.addEventListener('scroll', onScroll, { passive: true });
  loadGuest();
});

onUnmounted(() => window.removeEventListener('scroll', onScroll));

function onOpen() {
  opened.value = true;
  music.value?.play(); // harus sinkron di dalam klik agar diizinkan browser
  showPetals.value = true;
  document.documentElement.classList.remove('is-locked');
  window.scrollTo(0, 0);
  // Mulai animasi saat sampul mulai naik, agar tamu melihat bagian pertama "hidup".
  window.setTimeout(startReveals, 500);
  window.setTimeout(() => (invitationOpen.value = true), 600);
  window.setTimeout(() => (showPetals.value = false), 4500);
}

async function onGone() {
  coverVisible.value = false;
  await nextTick();
  main.value?.focus({ preventScroll: true });
}
</script>

<template>
  <CoverSection v-if="coverVisible" @open="onOpen" @gone="onGone" />
  <PetalBurst v-if="showPetals" />
  <AmbientPetals v-if="opened" />

  <main
    ref="main"
    tabindex="-1"
    :inert="!opened"
    :aria-hidden="!opened"
    class="relative z-[2] mx-auto w-full max-w-[480px] overflow-x-clip shadow-[0_0_60px_rgba(30,32,34,0.08)] outline-none"
  >
    <HeroSection />
    <VerseSection />
    <CoupleSection />
    <CountdownSection />
    <EventSection />
    <NoticeSection />
    <GiftSection />
    <RsvpSection />
    <FooterSection />
  </main>

  <MusicToggle v-if="event.music" ref="music" :src="event.music.src" :title="event.music.title" :visible="opened" />
</template>
