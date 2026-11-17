<!--
  web/src/sections/CoverSection.vue — sampul layar penuh: label, nama mempelai, tanggal, sapaan tamu,
  tombol "Buka Undangan".
  Dipanggil oleh: App.vue.
  Memanggil: useGuest.ts (nama tamu), shared/date.ts, ornamen bouquet & corner-vine.

  Urutan gerak saat tampil (mengikuti video 0–4 dtk): label → nama tersingkap kiri→kanan → tanggal → bunga masuk.
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
import bouquet from '../assets/ornaments/bouquet.svg';
import cornerVine from '../assets/ornaments/corner-vine.svg';

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
    class="paper fixed inset-y-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 overflow-hidden transition-opacity"
    :class="leaving ? 'opacity-0 duration-700 delay-[650ms]' : 'opacity-100'"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cover-title"
  >
    <!-- Ornamen -->
    <img :src="cornerVine" alt="" aria-hidden="true" class="pointer-events-none absolute -right-2 -top-1 w-[54%] -scale-x-100 select-none" style="animation: wipe-in 1.6s var(--ease-soft) 0.3s both" />
    <img
      :src="bouquet"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-8 -left-14 w-[82%] max-w-[400px] select-none"
      style="animation: slide-in-left 1.4s var(--ease-soft) 1.2s both"
    />
    <img
      :src="bouquet"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-6 -right-12 w-[44%] max-w-[210px] select-none"
      style="animation: slide-in-right 1.4s var(--ease-soft) 1.5s both"
    />

    <!-- Isi -->
    <div
      class="relative flex h-full flex-col items-center px-8 pb-[34vh] pt-[11vh] text-center transition duration-500"
      :class="leaving ? '-translate-y-4 opacity-0' : ''"
    >
      <p class="text-[11px] font-bold uppercase tracking-[0.36em] text-ink-soft" style="animation: rise-in 0.9s var(--ease-soft) 0.1s both">
        {{ event.title }}
      </p>
      <OrnamentDivider class="mt-3" style="animation: rise-in 0.9s var(--ease-soft) 0.25s both" />

      <h1 id="cover-title" class="mt-6 font-display text-[3.1rem] font-bold leading-[1.05] text-ink">
        <span class="block" style="animation: wipe-in 1.1s var(--ease-soft) 0.4s both">{{ event.couple.groom.shortName }}</span>
        <span class="my-1 block font-display text-3xl font-normal italic text-ink-soft" style="animation: rise-in 0.8s var(--ease-soft) 0.9s both">&amp;</span>
        <span class="block" style="animation: wipe-in 1.1s var(--ease-soft) 1s both">{{ event.couple.bride.shortName }}</span>
      </h1>

      <OrnamentDivider class="mt-6" style="animation: rise-in 0.9s var(--ease-soft) 1.3s both" />
      <p class="mt-3 text-[15px] font-bold" style="animation: rise-in 0.9s var(--ease-soft) 1.4s both">{{ dateLabel }}</p>

      <div class="mt-auto pt-8" style="animation: rise-in 0.9s var(--ease-soft) 1.7s both">
        <p class="text-sm text-ink-soft">Kepada Yth.</p>
        <p class="mt-1 font-display text-xl font-bold text-ink [overflow-wrap:anywhere]">{{ greetingName }}</p>
        <p v-if="guest.name" class="mt-1 text-xs text-ink-soft">Mohon maaf bila ada kesalahan penulisan nama/gelar.</p>
        <button
          ref="openBtn"
          type="button"
          class="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-bold tracking-wide text-paper shadow-md transition hover:bg-ink/85 active:scale-[0.98]"
          @click="open"
        >
          <MailOpen class="size-4" aria-hidden="true" />
          Buka Undangan
        </button>
      </div>
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
