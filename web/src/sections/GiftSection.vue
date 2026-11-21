<!--
  web/src/sections/GiftSection.vue — bagian ketujuh: Wedding Gift. Tombol "Transfer" membuka daftar rekening
  (nama bank, nomor, atas nama) dengan tombol salin. Tidak dirender bila event.gift null.
  Dipanggil oleh: App.vue.
  Memanggil: config/event.ts (gift.bankAccounts — data rekening dari klien), SectionLabel, lucide.
  Salin nomor memakai navigator.clipboard; bila diblokir (in-app browser) tampil prompt agar tamu menyalin manual.
-->
<script setup lang="ts">
import { ref } from 'vue';
import { Check, ChevronDown, Copy, Gift } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import BandSection from '../components/BandSection.vue';
import SideFlower from '../components/SideFlower.vue';
import Motes from '../components/Motes.vue';
import SectionLabel from '../components/SectionLabel.vue';
import sparkle from '../assets/scenes/sparkle.svg';
import backdrop from '../assets/ornaments/backdrop.svg';

const open = ref(false);
const copied = ref('');

async function copy(text: string, key: string) {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = key;
    window.setTimeout(() => (copied.value === key ? (copied.value = '') : null), 2000);
  } catch {
    window.prompt('Salin nomor rekening berikut:', text);
  }
}
const spaced = (n: string) => n.replace(/(.{4})/g, '$1 ').trim();
</script>

<template>
  <BandSection fade v-if="event.gift" id="gift" tone="paper" from="cream" labelledby="gift-judul">
    <SideFlower side="left" top="6%" />
    <SideFlower side="right" top="30%" :delay="200" />
    <SideFlower side="left" top="58%" :delay="100" />
    <Motes :count="12" :seed="17" />
    <img :src="backdrop" alt="" aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10 size-full object-cover" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute left-[14%] top-[34%] z-10 w-4" />
    <img :src="sparkle" alt="" aria-hidden="true" class="twinkle pointer-events-none absolute right-[16%] top-[44%] z-10 w-3" style="animation-delay: -1.2s" />

    <div class="relative z-[5] mx-auto max-w-[380px] px-4 pb-24 pt-[150px] text-center">
      <div class="relative rounded-[2rem] bg-paper/80 px-6 pb-10 pt-9 shadow-[0_14px_44px_rgba(30,32,34,0.14)] ring-1 ring-white/70">
        <div class="relative mx-auto mb-2 size-14" aria-hidden="true">
          <span class="ping-soft absolute inset-0 rounded-full border border-ink/40" />
          <div class="bob relative grid size-full place-items-center rounded-full bg-ink text-paper shadow-md"><Gift class="size-6" /></div>
        </div>
        <SectionLabel script="Wedding Gift" :text="event.gift.title" />
        <p id="gift-judul" class="sr-only">{{ event.gift.title }}</p>
        <p v-for="(line, i) in event.gift.lines" :key="i" v-reveal="150 + i * 120" class="mb-2 text-[14.5px] leading-relaxed text-ink">{{ line }}</p>

        <button
          type="button"
          class="mt-4 inline-flex w-full max-w-[260px] items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper shadow-md transition hover:bg-ink/85"
          :aria-expanded="open"
          aria-controls="gift-rekening"
          @click="open = !open"
        >
          <Gift class="size-4" aria-hidden="true" />
          Transfer
          <ChevronDown class="size-4 transition-transform" :class="open ? 'rotate-180' : ''" aria-hidden="true" />
        </button>

        <div v-show="open" id="gift-rekening" class="mt-5 flex flex-col gap-3 text-left">
          <div v-for="(acc, i) in event.gift.bankAccounts" :key="acc.accountNumber" class="rounded-2xl bg-white/90 p-4 ring-1 ring-line/40">
            <img v-if="acc.image" :src="acc.image" :alt="acc.bank" class="mb-2 h-7 w-auto" />
            <p v-else class="text-[11px] font-bold uppercase tracking-[0.22em] text-ink-soft">{{ acc.bank }}</p>
            <p class="mt-1 font-display text-[1.45rem] font-bold tabular-nums tracking-wide text-ink">{{ spaced(acc.accountNumber) }}</p>
            <p class="text-sm text-ink-soft">a.n. {{ acc.accountName }}</p>
            <button
              type="button"
              class="mt-3 inline-flex items-center gap-1.5 rounded-full border border-ink px-4 py-1.5 text-xs font-bold text-ink transition hover:bg-ink hover:text-paper"
              @click="copy(acc.accountNumber, `r${i}`)"
            >
              <Check v-if="copied === `r${i}`" class="size-3.5" aria-hidden="true" />
              <Copy v-else class="size-3.5" aria-hidden="true" />
              {{ copied === `r${i}` ? 'Nomor tersalin' : 'Salin nomor rekening' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </BandSection>
</template>
