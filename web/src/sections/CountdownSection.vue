<!--
  web/src/sections/CountdownSection.vue — bagian keempat: hitung mundur menuju akad nikah (bagian sendiri,
  dipisah dari bagian mempelai) + tombol simpan ke kalender. Tanpa baris tanggal/sesi di bawah angka.
  Dipanggil oleh: App.vue.
  Memanggil: useCountdown.ts, calendar.ts (.ics), config/event.ts, SectionLabel, SideFlower.
-->
<script setup lang="ts">
import { CalendarPlus } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import { useCountdown } from '../composables/useCountdown.ts';
import { downloadIcs } from '../composables/calendar.ts';
import BandSection from '../components/BandSection.vue';
import Motes from '../components/Motes.vue';
import Lantern from '../components/Lantern.vue';
import SideFlower from '../components/SideFlower.vue';
import SectionLabel from '../components/SectionLabel.vue';
import sparkle from '../assets/scenes/sparkle.svg';
import crescent from '../assets/scenes/crescent.svg';

const { days, hours, minutes, seconds, done } = useCountdown(event.sessions[0].start);
const pad = (n: number) => String(n).padStart(2, '0');
</script>

<template>
  <BandSection id="hitung-mundur" tone="cream" from="paper" labelledby="hitung-judul">
    <Motes :count="12" :seed="5" />
    <SideFlower side="left" top="8%" />
    <SideFlower side="right" top="30%" :delay="200" />
    <Lantern class="left-[6%] top-[70px] z-10" :size="38" />
    <Lantern class="right-[6%] top-[70px] z-10" :size="36" :delay="-2" />
    <img :src="crescent" alt="" aria-hidden="true" class="bob pointer-events-none absolute right-[24%] top-[120px] z-[6] w-10" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute left-[26%] top-[150px] z-10 w-4" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute right-[16%] top-[260px] z-10 w-3" style="animation-delay: -1.2s" />

    <div class="relative z-[5] mx-auto max-w-[380px] px-4 pb-24 pt-[140px] text-center">
      <div class="relative rounded-[2rem] bg-paper/92 px-6 py-10 shadow-[0_14px_44px_rgba(30,32,34,0.14)] ring-1 ring-line/35">
        <div class="pointer-events-none absolute inset-[7px] rounded-[1.6rem] border border-line/40" aria-hidden="true" />
        <div class="relative">
          <SectionLabel script="Hari Bahagia" text="Menuju Akad Nikah" />
          <h2 id="hitung-judul" class="sr-only">Hitung mundur menuju akad nikah</h2>
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

          <button
            v-reveal="450"
            type="button"
            class="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper shadow-md transition hover:bg-ink/85"
            @click="downloadIcs"
          >
            <CalendarPlus class="size-4" aria-hidden="true" />
            Simpan ke Kalender
          </button>
        </div>
      </div>
    </div>
  </BandSection>
</template>
