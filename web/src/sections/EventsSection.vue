<!--
  web/src/sections/EventsSection.vue — sesi acara (Akad Nikah & Walimah) di dalam satu kapsul tinggi berisi
  (website referensi), dengan blok tanggal besar "AHAD / 27 │ Desember 2026" (video 32–43 dtk).
  Dipanggil oleh: App.vue.
  Memanggil: config/event.ts (sessions, venue), shared/date.ts, calendar.ts (Google Calendar), ArchFrame.
-->
<script setup lang="ts">
import { CalendarPlus } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import { formatTime, partsInZone } from '../../../shared/date.ts';
import { googleCalendarUrl } from '../composables/calendar.ts';
import SectionShell from '../components/SectionShell.vue';
import SectionLabel from '../components/SectionLabel.vue';
import ArchFrame from '../components/ArchFrame.vue';
import OrnamentDivider from '../components/OrnamentDivider.vue';
import sprig from '../assets/ornaments/sprig.svg';

const sessions = event.sessions.map((s) => ({
  ...s,
  parts: partsInZone(s.start, event.timezone),
  time: formatTime(s.start, event.timezone, event.timezoneLabel),
  calendar: googleCalendarUrl(s),
}));
</script>

<template>
  <SectionShell id="acara" :card="false" :full="false">
    <SectionLabel script="Waktu & Tempat" text="Rangkaian Acara" />
    <ArchFrame filled>
      <template v-for="(s, i) in sessions" :key="s.key">
        <img v-if="i > 0" :src="sprig" alt="" aria-hidden="true" v-reveal class="mx-auto my-10 w-36" />
        <article :aria-labelledby="`sesi-${s.key}`">
          <p lang="ar" dir="rtl" v-reveal:blur class="font-arabic text-[1.7rem] font-bold leading-[1.6] text-ink">{{ s.labelArabic }}</p>
          <h3 :id="`sesi-${s.key}`" v-reveal:mask="150" class="font-display text-[2.1rem] font-bold leading-tight text-ink">{{ s.label }}</h3>
          <OrnamentDivider v-reveal="300" width="sm" class="my-3" />

          <p v-reveal="400" class="text-[11px] font-bold uppercase tracking-[0.34em] text-ink-soft">{{ s.parts.dayName }}</p>
          <div v-reveal:zoom="500" class="mt-1 flex items-center justify-center gap-3">
            <span class="font-display text-[3.4rem] font-bold leading-none text-ink">{{ s.parts.day }}</span>
            <span class="h-11 w-px bg-line" aria-hidden="true" />
            <span class="text-left">
              <span class="block font-display text-xl font-bold leading-tight text-ink">{{ s.parts.monthName }}</span>
              <span class="block text-sm font-bold tracking-[0.3em] text-ink-soft">{{ s.parts.year }}</span>
            </span>
          </div>

          <p v-reveal="650" class="mt-4 text-sm text-ink-soft">Pukul</p>
          <p v-reveal="700" class="font-bold text-ink">{{ s.endNote ? `${s.time} ${s.endNote}` : s.time }}</p>
          <p v-reveal="800" class="mt-2 text-sm text-ink-soft">Bertempat di</p>
          <p v-reveal="850" class="font-bold text-ink">{{ event.venue.name }}</p>

          <a
            v-reveal="950"
            :href="s.calendar"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4 inline-flex items-center gap-1.5 rounded-full border border-ink px-4 py-2 text-xs font-bold text-ink transition hover:bg-ink hover:text-paper"
          >
            <CalendarPlus class="size-4" aria-hidden="true" />
            Google Calendar
          </a>
        </article>
      </template>
    </ArchFrame>
  </SectionShell>
</template>
