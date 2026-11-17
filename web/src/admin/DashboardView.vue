<!--
  web/src/admin/DashboardView.vue — dasbor penyelenggara: rekap, daftar RSVP, daftar tamu + tautan, ekspor CSV.
  Dipanggil oleh: AdminApp.vue.
  Memanggil: api.ts (/api/admin/summary, /rsvps, /guests, PATCH /rsvps/:id, /logout), shared/date.ts.

  Semua data di sini bersifat pribadi; halaman ini hanya bisa diakses dengan sesi admin yang valid.
-->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Check, Copy, Download, LogOut, RefreshCw, Send } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import { formatDateTime } from '../../../shared/date.ts';
import { api, ApiError } from '../composables/api.ts';

const emit = defineEmits<{ logout: [] }>();

interface Summary {
  attendance: Record<'hadir' | 'tidak' | 'ragu', { responses: number; people: number }>;
  sessions: { key: string; label: string; confirmedPeople: number; confirmedResponses: number; tentativePeople: number; tentativeResponses: number }[];
  guests: { invited: number; responded: number };
  spam: number;
  deadline: string;
}
interface Rsvp {
  id: number;
  name: string;
  attendance: 'hadir' | 'tidak' | 'ragu';
  pax: number;
  sessions: string[];
  message: string;
  showMessage: boolean;
  hidden: boolean;
  guestCode: string | null;
  updatedAt: string;
}
interface Guest {
  id: number;
  code: string;
  name: string;
  maxPax: number;
  attendance: string | null;
  pax: number | null;
  link: string;
  whatsappText: string;
}

const LABEL = { hadir: 'Hadir', tidak: 'Tidak hadir', ragu: 'Belum pasti' } as const;
const tab = ref<'rekap' | 'rsvp' | 'tamu'>('rekap');
const summary = ref<Summary | null>(null);
const rsvps = ref<Rsvp[]>([]);
const guests = ref<Guest[]>([]);
const query = ref('');
const loading = ref(false);
const error = ref('');
const copied = ref('');

const sessionName = (k: string) => event.sessions.find((s) => s.key === k)?.label ?? k;
const when = (iso: string) => formatDateTime(iso, event.timezone, event.timezoneLabel);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q ? rsvps.value.filter((r) => r.name.toLowerCase().includes(q) || r.message.toLowerCase().includes(q)) : rsvps.value;
});
const filteredGuests = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q ? guests.value.filter((g) => g.name.toLowerCase().includes(q) || g.code.toLowerCase().includes(q)) : guests.value;
});

async function guard<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 401) emit('logout'); // sesi kedaluwarsa
    else error.value = err.message;
    return undefined;
  }
}

async function loadAll() {
  loading.value = true;
  error.value = '';
  await guard(async () => {
    const [s, r, g] = await Promise.all([
      api<Summary>('/api/admin/summary'),
      api<{ items: Rsvp[] }>('/api/admin/rsvps'),
      api<{ items: Guest[] }>('/api/admin/guests'),
    ]);
    summary.value = s;
    rsvps.value = r.items;
    guests.value = g.items;
  });
  loading.value = false;
}

async function toggleHidden(r: Rsvp) {
  await guard(async () => {
    await api(`/api/admin/rsvps/${r.id}`, { method: 'PATCH', json: { hidden: !r.hidden } });
    r.hidden = !r.hidden;
  });
}

async function copy(text: string, key: string) {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = key;
    setTimeout(() => (copied.value === key ? (copied.value = '') : null), 1800);
  } catch {
    window.prompt('Salin teks berikut:', text); // cadangan bila clipboard diblokir
  }
}

async function logout() {
  await api('/api/admin/logout', { method: 'POST' }).catch(() => undefined);
  emit('logout');
}

onMounted(loadAll);
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold">Rekap {{ event.couple.short }}</h1>
        <p v-if="summary" class="text-sm text-ink-soft">Tenggat RSVP: {{ when(summary.deadline) }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="inline-flex items-center gap-1.5 rounded-md border border-ink px-3 py-2 text-sm font-bold hover:bg-ink hover:text-paper" @click="loadAll">
          <RefreshCw class="size-4" :class="loading ? 'animate-spin' : ''" aria-hidden="true" /> Muat ulang
        </button>
        <a href="/api/admin/export.csv" class="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-sm font-bold text-paper hover:bg-ink/85">
          <Download class="size-4" aria-hidden="true" /> Unduh CSV
        </a>
        <button type="button" class="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm hover:border-ink" @click="logout">
          <LogOut class="size-4" aria-hidden="true" /> Keluar
        </button>
      </div>
    </header>

    <p v-if="error" class="mt-4 rounded-lg border border-ink/30 bg-cream-tint px-4 py-3 text-sm font-bold" role="alert">{{ error }}</p>

    <nav class="mt-6 flex gap-1 border-b border-line/60" aria-label="Bagian dasbor">
      <button
        v-for="t in [{ k: 'rekap', l: 'Rekap' }, { k: 'rsvp', l: `RSVP (${rsvps.length})` }, { k: 'tamu', l: `Daftar Tamu (${guests.length})` }] as const"
        :key="t.k"
        type="button"
        class="-mb-px border-b-2 px-4 py-2.5 text-sm font-bold"
        :class="tab === t.k ? 'border-ink text-ink' : 'border-transparent text-ink-soft hover:text-ink'"
        :aria-current="tab === t.k ? 'page' : undefined"
        @click="tab = t.k"
      >{{ t.l }}</button>
    </nav>

    <!-- REKAP -->
    <section v-if="tab === 'rekap' && summary" class="mt-6">
      <div class="grid gap-3 sm:grid-cols-3">
        <div v-for="k in (['hadir', 'ragu', 'tidak'] as const)" :key="k" class="rounded-xl border border-line/60 bg-white p-5">
          <p class="text-sm text-ink-soft">{{ LABEL[k] }}</p>
          <p class="mt-1 font-display text-3xl font-bold">{{ summary.attendance[k].responses }} <span class="text-base font-normal text-ink-soft">RSVP</span></p>
          <p v-if="k !== 'tidak'" class="text-sm">{{ summary.attendance[k].people }} orang</p>
        </div>
      </div>

      <h2 class="mt-8 font-display text-lg font-bold">Perkiraan tamu per sesi</h2>
      <div class="mt-3 overflow-x-auto rounded-xl border border-line/60 bg-white">
        <table class="w-full text-left text-sm">
          <thead class="bg-cream-tint">
            <tr>
              <th class="px-4 py-3">Sesi</th>
              <th class="px-4 py-3">Pasti hadir</th>
              <th class="px-4 py-3">Belum pasti</th>
              <th class="px-4 py-3">Maksimal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in summary.sessions" :key="s.key" class="border-t border-line/40">
              <td class="px-4 py-3 font-bold">{{ s.label }}</td>
              <td class="px-4 py-3">{{ s.confirmedPeople }} orang <span class="text-ink-soft">({{ s.confirmedResponses }} RSVP)</span></td>
              <td class="px-4 py-3">{{ s.tentativePeople }} orang <span class="text-ink-soft">({{ s.tentativeResponses }} RSVP)</span></td>
              <td class="px-4 py-3 font-bold">{{ s.confirmedPeople + s.tentativePeople }} orang</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <p class="rounded-xl border border-line/60 bg-white p-4">
          Daftar tamu: <strong>{{ summary.guests.responded }}</strong> dari <strong>{{ summary.guests.invited }}</strong> tamu berkode sudah menjawab.
        </p>
        <p class="rounded-xl border border-line/60 bg-white p-4">
          Kiriman spam yang ditolak: <strong>{{ summary.spam }}</strong>
        </p>
      </div>
    </section>

    <!-- RSVP -->
    <section v-if="tab === 'rsvp'" class="mt-6">
      <label for="cari-rsvp" class="sr-only">Cari nama atau ucapan</label>
      <input id="cari-rsvp" v-model="query" type="search" placeholder="Cari nama atau ucapan…" class="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 outline-none focus:border-ink sm:max-w-sm" />
      <p v-if="!filtered.length" class="mt-6 text-sm text-ink-soft">Belum ada RSVP.</p>
      <ul class="mt-4 flex flex-col gap-3">
        <li v-for="r in filtered" :key="r.id" class="rounded-xl border border-line/60 bg-white p-4">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <p class="font-bold [overflow-wrap:anywhere]">{{ r.name }} <span v-if="r.guestCode" class="ml-1 rounded bg-cream-tint px-1.5 py-0.5 text-xs font-normal">{{ r.guestCode }}</span></p>
            <p class="text-xs text-ink-soft">{{ when(r.updatedAt) }}</p>
          </div>
          <p class="mt-1 text-sm">
            <strong>{{ LABEL[r.attendance] }}</strong>
            <template v-if="r.attendance !== 'tidak'"> · {{ r.pax }} orang · {{ r.sessions.map(sessionName).join(' & ') }}</template>
          </p>
          <template v-if="r.message">
            <p class="mt-2 whitespace-pre-line text-sm [overflow-wrap:anywhere]" :class="r.hidden ? 'text-ink-soft line-through' : ''">{{ r.message }}</p>
            <div class="mt-2 flex items-center gap-3 text-xs text-ink-soft">
              <span>{{ !r.showMessage ? 'Tamu memilih tidak dipublikasikan' : r.hidden ? 'Disembunyikan dari dinding' : 'Tampil di dinding ucapan' }}</span>
              <button v-if="r.showMessage" type="button" class="font-bold text-ink underline underline-offset-2" @click="toggleHidden(r)">
                {{ r.hidden ? 'Tampilkan' : 'Sembunyikan' }}
              </button>
            </div>
          </template>
        </li>
      </ul>
    </section>

    <!-- TAMU -->
    <section v-if="tab === 'tamu'" class="mt-6">
      <p v-if="!guests.length" class="text-sm text-ink-soft">
        Belum ada daftar tamu. Isi <code>data/guests.csv</code> lalu jalankan <code>npm run guests:import</code> (lihat README).
      </p>
      <template v-else>
        <label for="cari-tamu" class="sr-only">Cari tamu</label>
        <input id="cari-tamu" v-model="query" type="search" placeholder="Cari nama atau kode…" class="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 outline-none focus:border-ink sm:max-w-sm" />
        <ul class="mt-4 flex flex-col gap-3">
          <li v-for="g in filteredGuests" :key="g.id" class="rounded-xl border border-line/60 bg-white p-4">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="font-bold [overflow-wrap:anywhere]">{{ g.name }}</p>
              <p class="text-xs text-ink-soft">{{ g.code }} · maks {{ g.maxPax }} orang</p>
            </div>
            <p class="mt-1 text-sm">
              {{ g.attendance ? `${LABEL[g.attendance as keyof typeof LABEL]}${g.attendance !== 'tidak' ? ` · ${g.pax} orang` : ''}` : 'Belum menjawab' }}
            </p>
            <p class="mt-2 truncate text-xs text-ink-soft">{{ g.link }}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button type="button" class="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-bold hover:border-ink" @click="copy(g.link, `l${g.id}`)">
                <Check v-if="copied === `l${g.id}`" class="size-3.5" aria-hidden="true" /><Copy v-else class="size-3.5" aria-hidden="true" />
                {{ copied === `l${g.id}` ? 'Tersalin' : 'Salin tautan' }}
              </button>
              <button type="button" class="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-bold hover:border-ink" @click="copy(g.whatsappText, `w${g.id}`)">
                <Check v-if="copied === `w${g.id}`" class="size-3.5" aria-hidden="true" /><Copy v-else class="size-3.5" aria-hidden="true" />
                {{ copied === `w${g.id}` ? 'Tersalin' : 'Salin pesan' }}
              </button>
              <a
                :href="`https://wa.me/?text=${encodeURIComponent(g.whatsappText)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-xs font-bold text-paper hover:bg-ink/85"
              >
                <Send class="size-3.5" aria-hidden="true" /> Buka di WhatsApp
              </a>
            </div>
          </li>
        </ul>
      </template>
    </section>
  </div>
</template>
