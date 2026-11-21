<!--
  web/src/sections/EventSection.vue — bagian kelima: waktu & tempat acara + pengisi tausiyah dalam SATU bagian
  berlatar PARALAKS (lapisan kabut warna, masjid, bulan sabit & bintang bergeser dengan kecepatan berbeda saat scroll),
  latarnya berbeda dari bagian mempelai. Akad Nikah dan Walimah satu kartu lengkung (tempatnya sama);
  di bawahnya kartu pengisi tausiyah.
  Dipanggil oleh: App.vue.
  Memanggil: config/event.ts (sessions, venue, speakers), shared/date.ts, calendar.ts, ParallaxLayer, SideFlower.
-->
<script setup lang="ts">
import { CalendarPlus, MapPin } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import { formatTime, partsInZone } from '../../../shared/date.ts';
import { googleCalendarUrl } from '../composables/calendar.ts';
import BandSection from '../components/BandSection.vue';
import Motes from '../components/Motes.vue';
import Lantern from '../components/Lantern.vue';
import Butterfly from '../components/Butterfly.vue';
import ParallaxLayer from '../components/ParallaxLayer.vue';
import SideFlower from '../components/SideFlower.vue';
import OrnamentDivider from '../components/OrnamentDivider.vue';
import SectionLabel from '../components/SectionLabel.vue';
import sprig from '../assets/ornaments/sprig.svg';
import mosque from '../assets/scenes/mosque.svg';
import crescent from '../assets/scenes/crescent.svg';
import sparkle from '../assets/scenes/sparkle.svg';

// Semua sesi di hari yang sama → tanggal diambil dari sesi pertama; jam ditulis "07.00 - 09.30 WIB".
const date = partsInZone(event.sessions[0].start, event.timezone);
const sessions = event.sessions.map((s) => {
  const start = formatTime(s.start, event.timezone, event.timezoneLabel).replace(` ${event.timezoneLabel}`, '');
  const end = formatTime(s.end, event.timezone, event.timezoneLabel);
  return { ...s, range: `${start} - ${end}`, calendar: googleCalendarUrl(s) };
});
</script>

<template>
  <BandSection id="acara" tone="paper" from="cream" fade labelledby="acara-judul">
    <!-- Latar paralaks berlapis: jauh (kabut warna) → tengah (masjid) → dekat (bulan sabit & bintang, lebih cepat dari isi) -->
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#FFFFFF_0%,#F8F7F4_55%,#EFE7DD_100%)]" />
      <ParallaxLayer :speed="0.38">
        <div class="absolute -left-16 top-[10%] size-72 rounded-full bg-[#E3D5C6]/70 blur-3xl" />
        <div class="absolute -right-20 top-[38%] size-80 rounded-full bg-[#CBD5DA]/45 blur-3xl" />
        <div class="absolute -left-12 top-[66%] size-72 rounded-full bg-[#E3D5C6]/60 blur-3xl" />
      </ParallaxLayer>
      <ParallaxLayer :speed="0.18">
        <img :src="mosque" alt="" class="absolute inset-x-0 bottom-[22%] w-full opacity-45" />
        <img :src="mosque" alt="" class="absolute inset-x-0 top-[8%] w-full -scale-y-100 opacity-[0.12]" />
      </ParallaxLayer>
      <ParallaxLayer :speed="-0.14">
        <img :src="crescent" alt="" class="bob absolute right-[12%] top-[16%] w-14" />
        <img :src="sparkle" alt="" class="twinkle absolute left-[14%] top-[24%] w-5" />
        <img :src="sparkle" alt="" class="twinkle absolute right-[22%] top-[44%] w-4" style="animation-delay: -1.1s" />
        <img :src="sparkle" alt="" class="twinkle absolute left-[18%] top-[62%] w-4" style="animation-delay: -0.5s" />
        <img :src="sparkle" alt="" class="twinkle absolute right-[10%] top-[78%] w-5" style="animation-delay: -1.8s" />
      </ParallaxLayer>
    </div>

    <Motes :count="14" :seed="19" />
    <SideFlower side="left" top="5%" />
    <SideFlower side="right" top="22%" :delay="200" />
    <SideFlower side="left" top="48%" :delay="100" />
    <SideFlower side="right" top="68%" :delay="250" />
    <Butterfly class="right-[12%] top-[230px] z-[8]" :size="22" :fx="-50" :fy="-50" :duration="13" />
    <Butterfly class="left-[12%] top-[62%] z-[8]" :size="20" :fx="50" :fy="-60" :duration="12" :delay="-4" />
    <Lantern class="left-[6%] top-[70px] z-10" :size="38" :delay="-1" />
    <Lantern class="right-[6%] top-[70px] z-10" :size="42" :delay="-3" />

    <div class="relative z-[5] mx-auto max-w-[380px] px-4 pb-28 pt-[150px] text-center">
      <SectionLabel script="Waktu & Tempat" text="Rangkaian Acara" />
      <h2 id="acara-judul" class="sr-only">Waktu dan tempat acara</h2>

      <div class="relative rounded-b-[2rem] rounded-t-[999px] bg-paper/95 px-6 pb-10 pt-24 shadow-[0_14px_44px_rgba(30,32,34,0.14)] ring-1 ring-line/35">
        <div class="pointer-events-none absolute inset-[7px] rounded-b-[1.6rem] rounded-t-[999px] border border-line/40" aria-hidden="true" />
        <img :src="crescent" alt="" aria-hidden="true" class="bob absolute left-1/2 top-7 w-12 -translate-x-1/2" />
        <img :src="sparkle" alt="" aria-hidden="true" class="twinkle absolute left-[30%] top-10 w-3" />
        <img :src="sparkle" alt="" aria-hidden="true" class="twinkle absolute right-[30%] top-12 w-4" style="animation-delay: -1.3s" />

        <div class="relative">
          <p v-reveal class="text-[11px] font-bold uppercase tracking-[0.34em] text-ink-soft">{{ date.dayName }}</p>
          <div v-reveal:zoom="150" class="mt-1 flex items-center justify-center gap-3">
            <span class="font-display text-[3.6rem] font-bold leading-none text-ink">{{ date.day }}</span>
            <span class="h-12 w-px bg-line" aria-hidden="true" />
            <span class="text-left">
              <span class="block font-display text-xl font-bold leading-tight text-ink">{{ date.monthName }}</span>
              <span class="block text-sm font-bold tracking-[0.3em] text-ink-soft">{{ date.year }}</span>
            </span>
          </div>

          <OrnamentDivider v-reveal="250" class="my-5" />

          <div class="flex flex-col gap-5">
            <article v-for="(s, i) in sessions" :key="s.key" :aria-labelledby="`sesi-${s.key}`">
              <h3 :id="`sesi-${s.key}`" v-reveal:mask="300 + i * 150" class="font-display text-[1.7rem] font-bold uppercase leading-tight tracking-wide text-ink">{{ s.label }}</h3>
              <p v-reveal="400 + i * 150" class="mt-1 text-sm text-ink-soft">Pukul</p>
              <p v-reveal="450 + i * 150" class="font-bold text-ink">{{ s.range }}</p>
              <a
                v-reveal="500 + i * 150"
                :href="s.calendar"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-1 inline-flex items-center gap-1 text-xs font-bold text-ink-soft underline decoration-line underline-offset-4 hover:text-ink"
              >
                <CalendarPlus class="size-3.5" aria-hidden="true" /> Tambah ke kalender
              </a>
            </article>
          </div>

          <OrnamentDivider v-reveal="650" class="my-5" />

          <p v-reveal="700" class="text-sm text-ink-soft">Bertempat di</p>
          <p v-reveal="750" class="font-display text-[1.3rem] font-bold leading-snug text-ink">{{ event.venue.name }}</p>
          <address v-reveal="800" class="mt-2 text-[14px] not-italic leading-relaxed text-ink">
            <span v-for="line in event.venue.addressLines" :key="line" class="block">{{ line }}</span>
          </address>
          <a
            v-reveal="900"
            :href="event.venue.mapsUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper shadow-md transition hover:bg-ink/85"
          >
            <MapPin class="size-4" aria-hidden="true" />
            Google Maps
          </a>
        </div>
      </div>

      <!-- Pengisi tausiyah -->
      <div v-if="event.speakers" class="relative mt-14 rounded-[2rem] bg-paper/90 px-6 pb-9 pt-8 shadow-[0_14px_44px_rgba(30,32,34,0.14)] ring-1 ring-line/35">
        <SectionLabel :text="event.speakers.label" />
        <h2 id="tausiyah-judul" class="sr-only">{{ event.speakers.label }}</h2>
        <ul class="flex flex-col gap-3">
          <li v-for="(name, i) in event.speakers.names" :key="i" v-reveal:mask="200 + i * 250" class="font-display text-[1.45rem] font-bold leading-snug text-ink">
            {{ name }}
          </li>
        </ul>
        <img :src="sprig" alt="" aria-hidden="true" v-reveal="700" class="mx-auto mt-6 w-40" loading="lazy" />
      </div>
    </div>

  </BandSection>
</template>
