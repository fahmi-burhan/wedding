<!--
  web/src/sections/EventSection.vue — bagian keempat (Revisi Client 1): waktu & tempat acara. Karena tempatnya
  sama, Akad Nikah dan Walimah digabung dalam SATU kartu berbentuk lengkung, dengan satu blok tanggal,
  dua baris jam, satu lokasi, dan tombol ke Google Maps. Siluet masjid & lampion sebagai penghibur mata.
  Dipanggil oleh: App.vue.
  Memanggil: config/event.ts (sessions, venue), shared/date.ts, calendar.ts (Google Calendar), SectionLabel.
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
import OrnamentDivider from '../components/OrnamentDivider.vue';
import SectionLabel from '../components/SectionLabel.vue';
import swagTop from '../assets/ornaments/swag-top.svg';
import mosque from '../assets/scenes/mosque.svg';
import bed from '../assets/scenes/bed-bottom.svg';
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
  <BandSection id="acara" tone="cream" from="paper" labelledby="acara-judul">
    <Motes :count="12" :seed="19" />
    <img :src="swagTop" alt="" aria-hidden="true" class="sway-t pointer-events-none absolute -top-7 left-1/2 z-10 w-[112%] max-w-none -translate-x-1/2 select-none" />
    <Butterfly class="right-[12%] top-[230px] z-[8]" :size="22" :fx="-50" :fy="-50" :duration="13" />
    <Lantern class="left-[3%] top-[70px] z-10" :size="38" :delay="-1" />
    <Lantern class="right-[3%] top-[70px] z-10" :size="42" :delay="-3" />

    <div class="relative z-[5] mx-auto max-w-[380px] px-4 pb-[230px] pt-[140px] text-center">
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
    </div>

    <img :src="mosque" alt="" aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-[60px] z-[2] w-full opacity-90" />
    <img :src="bed" alt="" aria-hidden="true" class="sway-b pointer-events-none absolute inset-x-0 bottom-0 z-[6] w-full select-none object-cover object-bottom" style="height: 150px" />
  </BandSection>
</template>
