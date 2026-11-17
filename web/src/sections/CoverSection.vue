<!--
  web/src/sections/CoverSection.vue — sampul layar penuh: dekorasi bunga berlapis, monogram, nama (script),
  tanggal, sapaan tamu, tombol "Buka Undangan".
  Dipanggil oleh: App.vue.
  Memanggil: useGuest.ts (nama tamu), shared/date.ts, Monogram, Butterfly, ornamen SVG.

  Urutan gerak saat tampil (mengikuti video 0–4 dtk): bunga & untaian masuk → monogram → nama tersingkap → tanggal → sapaan.
  Saat tombol ditekan: emit('open') SEGERA (agar musik boleh diputar dalam klik yang sama), lalu
  buket "menyapu" layar dan sampul memudar; setelah selesai emit('gone') agar App melepasnya dari DOM.
-->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { MailOpen } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import { formatLongDate } from '../../../shared/date.ts';
import { guest, GENERIC_GREETING } from '../composables/useGuest.ts';
import OrnamentDivider from '../components/OrnamentDivider.vue';
import Monogram from '../components/Monogram.vue';
import Butterfly from '../components/Butterfly.vue';
import bouquet from '../assets/ornaments/bouquet.svg';
import swagTop from '../assets/ornaments/swag-top.svg';
import garland from '../assets/ornaments/garland-side.svg';

const emit = defineEmits<{ open: []; gone: [] }>();

const leaving = ref(false);
const openBtn = ref<HTMLButtonElement | null>(null);
const dateLabel = formatLongDate(event.sessions[0].start, event.timezone);
const greetingName = computed(() => guest.name || GENERIC_GREETING);
const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

onMounted(() => openBtn.value?.focus({ preventScroll: true }));

function open() {
  if (leaving.value) return;
  leaving.value = true;
  emit('open');
  window.setTimeout(() => emit('gone'), reduced ? 250 : 1500);
}
</script>

<template>
  <div
    class="fixed inset-y-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 overflow-hidden transition-opacity"
    :class="leaving ? 'opacity-0 duration-700 delay-[650ms]' : 'opacity-100'"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cover-title"
  >
    <!-- Latar sampul: sama dengan latar tetap halaman, ditambah tekstur kertas. -->
    <div class="backdrop" style="position: absolute" aria-hidden="true" />

    <!-- Dekorasi berlapis -->
    <img :src="garland" alt="" aria-hidden="true" class="pointer-events-none absolute inset-y-0 left-0 w-[96px] select-none object-cover object-left-top" style="animation: slide-in-left 1.3s var(--ease-soft) 0.1s both" />
    <div class="pointer-events-none absolute inset-y-0 right-0 w-[96px] -scale-x-100" aria-hidden="true">
      <img :src="garland" alt="" class="h-full w-full select-none object-cover object-left-top" style="animation: slide-in-left 1.3s var(--ease-soft) 0.25s both" />
    </div>
    <img :src="swagTop" alt="" aria-hidden="true" class="pointer-events-none absolute -top-4 left-1/2 w-[118%] max-w-none -translate-x-1/2 select-none" style="animation: rise-in 1.2s var(--ease-soft) 0.2s both" />
    <img :src="bouquet" alt="" aria-hidden="true" class="pointer-events-none absolute -bottom-10 -left-16 w-[78%] max-w-[380px] select-none" style="animation: slide-in-left 1.4s var(--ease-soft) 1.1s both" />
    <img :src="bouquet" alt="" aria-hidden="true" class="pointer-events-none absolute -bottom-8 -right-14 w-[56%] max-w-[260px] select-none" style="animation: slide-in-right 1.4s var(--ease-soft) 1.3s both" />
    <Butterfly class="left-[18%] top-[30%] z-10" :size="26" :fx="60" :fy="-40" :duration="12" />
    <Butterfly class="right-[16%] top-[58%] z-10" :size="20" :fx="-50" :fy="-60" :duration="10" :delay="-3" />

    <!-- Isi -->
    <div
      class="relative flex h-full flex-col items-center justify-center px-10 pb-[18vh] pt-[14vh] text-center transition duration-500"
      :class="leaving ? '-translate-y-4 opacity-0' : ''"
    >
      <div style="animation: rise-in 1s var(--ease-soft) 0.5s both"><Monogram /></div>

      <p class="mt-10 text-[11px] font-bold uppercase tracking-[0.36em] text-ink-soft" style="animation: rise-in 0.9s var(--ease-soft) 0.8s both">
        {{ event.title }}
      </p>
      <h1 id="cover-title" class="mt-2 font-script text-[3.3rem] leading-[1.1] text-ink" style="animation: wipe-in 1.2s var(--ease-soft) 1s both">
        {{ event.couple.groom.shortName }}
        <span class="font-display text-[1.8rem] italic text-ink-soft">&amp;</span>
        {{ event.couple.bride.shortName }}
      </h1>
      <OrnamentDivider class="mt-3" style="animation: rise-in 0.9s var(--ease-soft) 1.3s both" />
      <p class="mt-2 text-[15px] font-bold" style="animation: rise-in 0.9s var(--ease-soft) 1.4s both">{{ dateLabel }}</p>

      <div class="mt-7 w-full max-w-[290px] rounded-3xl bg-paper/90 px-5 py-4 shadow-[0_10px_30px_rgba(30,32,34,0.12)] ring-1 ring-line/35" style="animation: rise-in 0.9s var(--ease-soft) 1.7s both">
        <p class="text-sm text-ink-soft">Kepada Yth.</p>
        <p class="mt-0.5 font-display text-lg font-bold leading-snug text-ink [overflow-wrap:anywhere]">{{ greetingName }}</p>
        <p v-if="guest.name" class="mt-1 text-[11px] italic text-ink-soft">Mohon maaf bila ada kesalahan penulisan nama/gelar.</p>
      </div>
      <button
        ref="openBtn"
        type="button"
        class="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-paper shadow-lg transition hover:bg-ink/85 active:scale-[0.98]"
        style="animation: rise-in 0.9s var(--ease-soft) 1.9s both"
        @click="open"
      >
        <MailOpen class="size-4" aria-hidden="true" />
        Buka Undangan
      </button>
    </div>

    <!-- Buket yang menyapu layar saat dibuka (transisi video 5–6 dtk). -->
    <img
      v-if="leaving && !reduced"
      :src="bouquet"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute bottom-0 left-0 z-10 w-[120%] max-w-none select-none"
      style="animation: bouquet-sweep 1.4s cubic-bezier(0.55, 0, 0.35, 1) both"
    />
  </div>
</template>
