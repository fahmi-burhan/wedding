<!--
  web/src/sections/CoupleSection.vue — bagian ketiga, halaman panjang (Revisi Client 1). Latar TIDAK bergerak
  (sticky), kartu agak transparan yang bergulir di atasnya:
    1) salam (satu baris, font dikecilkan)  2) kalimat "dengan memohon rahmat…"
    3) siluet pria (tarbusy khas Azhar) + panggilan + nama lengkap + orang tua
    4) siluet muslimah berkhimar + panggilan + nama lengkap + orang tua
    5) (jarak lumayan) hitung mundur + simpan ke kalender — tanpa menyebut tempat.
  Dipanggil oleh: App.vue.
  Memanggil: config/event.ts, useCountdown.ts, calendar.ts, shared/date.ts, RevealLines, ilustrasi di assets/scenes.

  Gaya huruf dibedakan: panggilan = script "catchy" (Great Vibes); nama lengkap = Playfair Display tebal;
  nama orang tua = Lato ringan. Latar sticky memakai overflow-clip pada section (bukan overflow-hidden).
-->
<script setup lang="ts">
import { CalendarPlus } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import { formatDateTime } from '../../../shared/date.ts';
import { useCountdown } from '../composables/useCountdown.ts';
import { downloadIcs } from '../composables/calendar.ts';
import BandSection from '../components/BandSection.vue';
import OrnamentDivider from '../components/OrnamentDivider.vue';
import SectionLabel from '../components/SectionLabel.vue';
import Butterfly from '../components/Butterfly.vue';
import backdrop from '../assets/ornaments/backdrop.svg';
import mosque from '../assets/scenes/mosque.svg';
import man from '../assets/scenes/man.svg';
import woman from '../assets/scenes/woman.svg';
import sparkle from '../assets/scenes/sparkle.svg';
import swagTop from '../assets/ornaments/swag-top.svg';

const { groom, bride } = event.couple;
const first = event.sessions[0];
const { days, hours, minutes, seconds, done } = useCountdown(first.start);
const when = formatDateTime(first.start, event.timezone, event.timezoneLabel);
const pad = (n: number) => String(n).padStart(2, '0');

const people = [
  { p: groom, img: man, alt: 'Siluet mempelai pria bertarbusy dan berjubah', delay: 0 },
  { p: bride, img: woman, alt: 'Siluet mempelai wanita berkhimar dan bergamis', delay: -2 },
];
const card =
  'relative rounded-[2rem] bg-paper/72 px-6 shadow-[0_14px_44px_rgba(30,32,34,0.14)] ring-1 ring-white/70 backdrop-blur-[2px]';
</script>

<template>
  <BandSection id="mempelai" tone="paper" labelledby="mempelai-judul">
    <!-- Latar diam: tetap di layar selama kartu bergulir -->
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div class="sticky top-0 h-svh w-full overflow-hidden">
        <img :src="backdrop" alt="" class="absolute inset-0 size-full object-cover" />
        <img :src="mosque" alt="" class="absolute inset-x-0 bottom-0 w-full opacity-70" />
        <img :src="sparkle" alt="" class="twinkle absolute left-[14%] top-[18%] w-5" />
        <img :src="sparkle" alt="" class="twinkle absolute right-[16%] top-[30%] w-4" style="animation-delay: -1.1s" />
        <img :src="sparkle" alt="" class="twinkle absolute left-[22%] top-[58%] w-3" style="animation-delay: -2s" />
        <img :src="sparkle" alt="" class="twinkle absolute right-[10%] top-[72%] w-5" style="animation-delay: -0.6s" />
      </div>
    </div>
    <img :src="swagTop" alt="" aria-hidden="true" class="pointer-events-none absolute left-1/2 top-0 z-10 w-[112%] max-w-none -translate-x-1/2 select-none" />

    <div class="relative z-[5] mx-auto flex max-w-[380px] flex-col gap-12 px-4 pb-32 pt-[150px] text-center">
      <h2 id="mempelai-judul" class="sr-only">Kedua Mempelai</h2>

      <!-- 1 & 2. Salam + kalimat undangan -->
      <div :class="[card, 'py-10']">
        <p
          lang="ar"
          dir="rtl"
          v-reveal:blur
          class="whitespace-nowrap font-arabic text-[clamp(0.95rem,4.9vw,1.2rem)] font-bold leading-[1.9] text-ink"
        >
          {{ event.opening.salamArabic }}
        </p>
        <OrnamentDivider v-reveal="200" width="sm" class="my-4" />
        <p class="text-[15px] leading-relaxed text-ink">
          <span v-for="(line, i) in event.opening.lines" :key="i" v-reveal="300 + i * 120" class="block">{{ line }}</span>
        </p>
      </div>

      <!-- 3 & 4. Mempelai -->
      <article v-for="item in people" :key="item.p.shortName" :class="[card, 'pb-10 pt-8']" :aria-label="item.p.fullName">
        <div class="relative mx-auto grid h-[230px] w-[158px] place-items-end overflow-hidden rounded-t-full bg-gradient-to-b from-white/80 to-cream-tint/80 ring-1 ring-line/40">
          <img v-reveal:zoom :src="item.img" :alt="item.alt" class="bob h-[210px] w-auto select-none" :style="{ animationDelay: `${item.delay}s` }" />
          <img :src="sparkle" alt="" aria-hidden="true" class="twinkle absolute left-3 top-10 w-3" />
          <img :src="sparkle" alt="" aria-hidden="true" class="twinkle absolute right-4 top-16 w-4" style="animation-delay: -1s" />
        </div>

        <p v-reveal:mask="150" class="mt-5 font-script text-[3.2rem] leading-[1.25] text-ink" aria-hidden="true">{{ item.p.shortName }}</p>
        <h3 v-reveal="300" class="mt-1 font-display text-[1.5rem] font-bold leading-tight tracking-tight text-ink">{{ item.p.fullName }}</h3>
        <OrnamentDivider v-reveal="400" width="sm" class="my-3" />
        <p v-reveal="500" class="whitespace-pre-line text-[13.5px] font-light leading-relaxed text-ink-soft">{{ item.p.parents }}</p>
        <Butterfly v-if="item.p === groom" class="-right-1 top-24" :size="22" :fx="-30" :fy="-30" :duration="10" />
        <Butterfly v-else class="-left-1 top-28" :size="20" :fx="30" :fy="-36" :duration="12" :delay="-3" />
      </article>

      <!-- 5. Hitung mundur (jarak lumayan dari kartu mempelai) -->
      <div :class="[card, 'mt-16 py-10']">
        <SectionLabel script="Hari Bahagia" text="Menuju Akad Nikah" />
        <div v-if="!done" v-reveal:zoom="200" class="mx-auto grid max-w-[300px] grid-cols-4 gap-2" role="timer" aria-live="off">
          <div
            v-for="unit in [
              { v: days, l: 'Hari' },
              { v: hours, l: 'Jam' },
              { v: minutes, l: 'Menit' },
              { v: seconds, l: 'Detik' },
            ]"
            :key="unit.l"
            class="rounded-2xl bg-paper px-1 py-3 shadow-[0_6px_18px_rgba(30,32,34,0.12)] ring-1 ring-line/40"
          >
            <p class="font-display text-3xl font-bold tabular-nums text-ink">{{ unit.l === 'Hari' ? unit.v : pad(unit.v) }}</p>
            <p class="mt-1 text-[11px] uppercase tracking-[0.2em] text-ink-soft">{{ unit.l }}</p>
          </div>
        </div>
        <p v-else v-reveal class="font-display text-xl text-ink">Alhamdulillah, hari bahagia telah tiba.</p>

        <p v-reveal="400" class="mt-5 text-sm font-bold text-ink">{{ first.label }} · {{ when }}</p>
        <button
          v-reveal="550"
          type="button"
          class="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper shadow-md transition hover:bg-ink/85"
          @click="downloadIcs"
        >
          <CalendarPlus class="size-4" aria-hidden="true" />
          Simpan ke Kalender
        </button>
      </div>
    </div>
  </BandSection>
</template>
