<!--
  web/src/sections/WishesSection.vue — dinding ucapan & doa dari tamu, berhalaman.
  Dipanggil oleh: App.vue.
  Memanggil: api.ts (GET /api/wishes), rsvpStore.ts (muat ulang setelah tamu mengirim), shared/date.ts.

  Privasi: hanya nama + ucapan + waktu. Status hadir & jumlah orang TIDAK pernah ditampilkan publik.
  Teks ucapan dirender lewat {{ }} → di-escape Vue, aman dari HTML/skrip sisipan.
-->
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import { formatDateTime } from '../../../shared/date.ts';
import { api } from '../composables/api.ts';
import { wishesVersion } from '../composables/rsvpStore.ts';
import SectionShell from '../components/SectionShell.vue';
import SectionLabel from '../components/SectionLabel.vue';
import sprig from '../assets/ornaments/sprig.svg';

interface Wish {
  id: number;
  name: string;
  message: string;
  createdAt: string;
}

const items = ref<Wish[]>([]);
const page = ref(1);
const totalPages = ref(1);
const total = ref(0);
const loading = ref(false);
const failed = ref(false);
const listTop = ref<HTMLElement | null>(null);

async function load(p = page.value, scroll = false) {
  loading.value = true;
  failed.value = false;
  try {
    const data = await api<{ items: Wish[]; page: number; totalPages: number; total: number }>(`/api/wishes?page=${p}`);
    items.value = data.items;
    page.value = data.page;
    totalPages.value = data.totalPages;
    total.value = data.total;
    if (scroll) listTop.value?.scrollIntoView({ block: 'start' });
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => load(1));
watch(wishesVersion, () => load(1));

const when = (iso: string) => formatDateTime(iso, event.timezone, event.timezoneLabel);
</script>

<template>
  <SectionShell id="ucapan" tone="cream" flowers="none" :full="false" labelledby="ucapan-judul">
    <SectionLabel text="Ucapan &amp; Doa" />
    <h2 id="ucapan-judul" class="sr-only">Ucapan dan Doa dari Tamu</h2>
    <p v-reveal class="-mt-2 mb-6 text-sm text-ink-soft">{{ total }} ucapan</p>

    <div ref="listTop" class="scroll-mt-6" aria-live="polite" :aria-busy="loading">
      <p v-if="failed" class="text-sm text-ink-soft">
        Ucapan belum dapat dimuat.
        <button type="button" class="font-bold text-ink underline underline-offset-4" @click="load(page)">Coba lagi</button>
      </p>
      <p v-else-if="!loading && !items.length" class="text-sm text-ink-soft">Belum ada ucapan. Jadilah yang pertama mendoakan kedua mempelai.</p>

      <ul v-else class="flex flex-col gap-3 text-left" :class="loading ? 'opacity-60' : ''">
        <li v-for="w in items" :key="w.id" class="rounded-xl border border-line/50 bg-paper/90 p-4 shadow-sm">
          <p class="font-bold text-ink [overflow-wrap:anywhere]">{{ w.name }}</p>
          <p class="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-ink [overflow-wrap:anywhere]">{{ w.message }}</p>
          <p class="mt-2 text-xs text-ink-soft">{{ when(w.createdAt) }}</p>
        </li>
      </ul>
    </div>

    <nav v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-4" aria-label="Halaman ucapan">
      <button
        type="button"
        class="grid size-10 place-items-center rounded-full border border-ink text-ink transition hover:bg-ink hover:text-paper disabled:opacity-30"
        :disabled="page <= 1 || loading"
        aria-label="Halaman sebelumnya"
        @click="load(page - 1, true)"
      >
        <ChevronLeft class="size-5" aria-hidden="true" />
      </button>
      <span class="text-sm tabular-nums">{{ page }} / {{ totalPages }}</span>
      <button
        type="button"
        class="grid size-10 place-items-center rounded-full border border-ink text-ink transition hover:bg-ink hover:text-paper disabled:opacity-30"
        :disabled="page >= totalPages || loading"
        aria-label="Halaman berikutnya"
        @click="load(page + 1, true)"
      >
        <ChevronRight class="size-5" aria-hidden="true" />
      </button>
    </nav>

    <img :src="sprig" alt="" aria-hidden="true" class="mx-auto mt-10 w-44" loading="lazy" />
  </SectionShell>
</template>
