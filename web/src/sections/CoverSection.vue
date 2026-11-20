<!--
  web/src/sections/CoverSection.vue — sampul layar penuh (Revisi Client 1): jendela lengkung berisi
  logo → "WEDDING INVITATION" → nama Arab (gaya kaligrafi) → tanggal → "Kepada Yth." + nama tamu (tanpa kotak)
  → permintaan maaf → tombol "Buka Undangan". Hamparan bunga di dasar, bunga menggantung di atas.
  Dipanggil oleh: App.vue.
  Memanggil: useGuest.ts (nama tamu), shared/date.ts, config/event.ts, ornamen & logo di assets/.

  Saat tombol ditekan: emit('open') SEGERA (agar musik boleh diputar dalam klik yang sama), lalu seluruh sampul
  naik keluar layar dengan kurva tegas — menyingkap hero di bawahnya, tanpa gambar yang terpotong.
  Setelah selesai emit('gone') agar App melepasnya dari DOM.
-->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { MailOpen } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import { formatLongDate } from '../../../shared/date.ts';
import { guest, GENERIC_GREETING } from '../composables/useGuest.ts';
import Butterfly from '../components/Butterfly.vue';
import Lantern from '../components/Lantern.vue';
import logo from '../assets/brand/logo.png';
import bed from '../assets/scenes/bed-bottom.svg';
import swagTop from '../assets/ornaments/swag-top.svg';
import backdrop from '../assets/ornaments/backdrop.svg';
import mosque from '../assets/scenes/mosque.svg';
import sparkle from '../assets/scenes/sparkle.svg';

const emit = defineEmits<{ open: []; gone: [] }>();

const leaving = ref(false);
const openBtn = ref<HTMLButtonElement | null>(null);
const d = event.sessions[0].start;
// Tanggal gaya referensi: "27 . 12 . 2026" (zona waktu acara).
const dateLabel = computed(() => {
  const parts = formatLongDate(d, event.timezone).match(/(\d+)\s(\S+)\s(\d{4})/);
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  if (!parts) return '';
  return `${parts[1].padStart(2, '0')} . ${String(months.indexOf(parts[2]) + 1).padStart(2, '0')} . ${parts[3]}`;
});
const greetingName = computed(() => guest.name || GENERIC_GREETING);
const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

onMounted(() => openBtn.value?.focus({ preventScroll: true }));

function open() {
  if (leaving.value) return;
  leaving.value = true;
  emit('open');
  window.setTimeout(() => emit('gone'), reduced ? 300 : 1350);
}
</script>

<template>
  <div
    class="paper fixed inset-y-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 overflow-hidden transition-[translate,opacity] duration-[1300ms] ease-[cubic-bezier(.45,0,.2,1)]"
    :class="leaving ? '!-translate-y-[28%] opacity-0' : 'opacity-100'"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cover-title"
  >
    <!-- Latar: cat air lembut + siluet masjid samar -->
    <img :src="backdrop" alt="" aria-hidden="true" class="pointer-events-none absolute inset-0 size-full object-cover opacity-90" />
    <img :src="mosque" alt="" aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-[16svh] w-full opacity-60" />

    <!-- Jendela lengkung -->
    <div
      class="absolute inset-x-5 bottom-[calc(clamp(120px,22svh,210px)-26px)] top-6 rounded-b-[28px] rounded-t-[999px] border-[5px] border-white/95 bg-white/50 shadow-[0_12px_44px_rgba(30,32,34,0.12)]"
      aria-hidden="true"
    />
    <div class="pointer-events-none absolute inset-x-[30px] bottom-[calc(clamp(120px,22svh,210px)-17px)] top-[35px] rounded-b-[20px] rounded-t-[999px] border border-line/50" aria-hidden="true" />

    <!-- Bunga menggantung di atas + lampion berayun -->
    <img :src="swagTop" alt="" aria-hidden="true" class="pointer-events-none absolute left-1/2 top-0 w-[118%] max-w-none -translate-x-1/2 select-none" style="animation: rise-in 1.2s var(--ease-soft) 0.2s both" />
    <Lantern class="left-[7%] top-[46px] z-10" :size="46" />
    <Lantern class="right-[7%] top-[46px] z-10" :size="40" :delay="-2" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute left-[27%] top-[19%] z-10 w-4" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute right-[25%] top-[24%] z-10 w-3" style="animation-delay: -1.4s" />

    <!-- Isi -->
    <div class="absolute inset-x-5 bottom-[calc(clamp(120px,22svh,210px)-26px)] top-6 flex flex-col items-center justify-center px-6 pt-[clamp(28px,7svh,64px)] text-center">
      <img
        :src="logo"
        alt="Logo Husein dan Zahroh"
        class="h-[clamp(64px,11svh,104px)] w-auto"
        style="animation: rise-in 1s var(--ease-soft) 0.5s both"
      />
      <p class="mt-[clamp(10px,2svh,18px)] text-[11px] font-bold uppercase tracking-[0.36em] text-ink-soft" style="animation: rise-in 0.9s var(--ease-soft) 0.8s both">
        {{ event.title }}
      </p>
      <h1
        id="cover-title"
        dir="rtl"
        lang="ar"
        class="mt-[clamp(4px,1svh,10px)] flex items-center justify-center gap-3 font-arabic text-[clamp(2.3rem,11vw,3rem)] font-bold leading-[1.5] text-ink"
        style="animation: rise-in 1.1s var(--ease-soft) 1s both"
      >
        <span>{{ event.couple.groom.arabicName }}</span>
        <span dir="ltr" class="font-display text-[0.55em] italic font-normal text-ink-soft">&amp;</span>
        <span>{{ event.couple.bride.arabicName }}</span>
      </h1>
      <p class="mt-1 text-[13px] font-bold tracking-[0.34em] text-ink" style="animation: rise-in 0.9s var(--ease-soft) 1.3s both">{{ dateLabel }}</p>

      <div class="mt-[clamp(14px,3.4svh,32px)]" style="animation: rise-in 0.9s var(--ease-soft) 1.6s both">
        <p class="text-sm text-ink-soft">Kepada Yth.</p>
        <p class="mt-0.5 font-display text-lg font-bold leading-snug text-ink [overflow-wrap:anywhere]">{{ greetingName }}</p>
        <p class="mx-auto mt-1.5 max-w-[250px] text-[11px] italic leading-snug text-ink-soft">{{ event.cover.apology }}</p>
      </div>
      <button
        ref="openBtn"
        type="button"
        class="mt-[clamp(12px,2.6svh,22px)] inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-paper shadow-lg transition hover:bg-ink/85 active:scale-[0.98]"
        style="animation: rise-in 0.9s var(--ease-soft) 1.9s both"
        @click="open"
      >
        <MailOpen class="size-4" aria-hidden="true" />
        Buka Undangan
      </button>
    </div>

    <!-- Hamparan bunga di dasar (menempel di tepi bawah, bergoyang pelan) -->
    <img
      :src="bed"
      alt=""
      aria-hidden="true"
      class="sway-b pointer-events-none absolute inset-x-0 bottom-0 w-full select-none object-cover object-bottom"
      style="height: clamp(120px, 22svh, 210px)"
    />
    <Butterfly class="left-[16%] top-[34%] z-10" :size="24" :fx="60" :fy="-40" :duration="12" />
    <Butterfly class="right-[14%] top-[62%] z-10" :size="20" :fx="-50" :fy="-60" :duration="10" :delay="-3" />
  </div>
</template>
