<!--
  web/src/sections/CountdownSection.vue — hitung mundur ke sesi pertama + simpan ke kalender, di atas pita cream.
  Dipanggil oleh: App.vue.
  Memanggil: useCountdown.ts, calendar.ts (berkas .ics), shared/date.ts, config/event.ts.
  Hitung mundur selalu memakai zona waktu acara (WIB) — ditulis eksplisit di bawah angka.
-->
<script setup lang="ts">
import { CalendarPlus } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import { formatDateTime } from '../../../shared/date.ts';
import { useCountdown } from '../composables/useCountdown.ts';
import { downloadIcs } from '../composables/calendar.ts';
import SectionShell from '../components/SectionShell.vue';
import SectionLabel from '../components/SectionLabel.vue';

const first = event.sessions[0];
const { days, hours, minutes, seconds, done } = useCountdown(first.start);
const when = formatDateTime(first.start, event.timezone, event.timezoneLabel);
const pad = (n: number) => String(n).padStart(2, '0');
</script>

<template>
  <SectionShell id="hitung-mundur" tone="band" decor="sides" :card="false">
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
  </SectionShell>
</template>
