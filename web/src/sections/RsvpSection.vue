<!--
  web/src/sections/RsvpSection.vue — form konfirmasi kehadiran.
  Dipanggil oleh: App.vue.
  Memanggil: api.ts (GET /api/rsvp/status, POST /api/rsvp), useGuest.ts, rsvpStore.ts, config/event.ts.

  Prinsip:
  - Tamu bertautan khusus: nama sudah terisi → cukup ketuk "Hadir" lalu "Kirim" (2 ketukan).
  - "Berhasil" hanya tampil setelah server membalas OK. Bila gagal, isian TIDAK hilang dan ada tombol coba lagi.
  - Validasi di sini hanya untuk kenyamanan; server memvalidasi ulang semuanya.
  - Input "website" adalah honeypot: tak terlihat manusia, biasanya diisi bot.
-->
<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { Check, Send } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import { formatDateTime } from '../../../shared/date.ts';
import { MESSAGE_MAX, NAME_MAX } from '../../../shared/sanitize.ts';
import { api, ApiError } from '../composables/api.ts';
import { guest } from '../composables/useGuest.ts';
import type { RsvpSummary } from '../composables/useGuest.ts';
import { readLastRsvp, submissionId, wishesVersion, writeLastRsvp } from '../composables/rsvpStore.ts';
import SectionShell from '../components/SectionShell.vue';
import SectionLabel from '../components/SectionLabel.vue';

type Attendance = 'hadir' | 'tidak' | 'ragu';
const OPTIONS: { value: Attendance; label: string }[] = [
  { value: 'hadir', label: 'Hadir' },
  { value: 'tidak', label: 'Tidak hadir' },
  { value: 'ragu', label: 'Belum pasti' },
];
const LABEL: Record<Attendance, string> = { hadir: 'Hadir', tidak: 'Tidak hadir', ragu: 'Belum pasti' };

const deadlineLabel = formatDateTime(event.rsvp.deadline, event.timezone, event.timezoneLabel);
const open = ref(Date.now() <= Date.parse(event.rsvp.deadline)); // dugaan awal; server yang menentukan
const form = reactive({
  name: '',
  attendance: '' as Attendance | '',
  pax: 1,
  sessions: event.sessions.map((s) => s.key) as string[],
  message: '',
  showMessage: true,
  website: '',
});
const renderedAt = ref(Date.now());
const submitting = ref(false);
const error = ref('');
const saved = ref<RsvpSummary | null>(null);
const editing = ref(true);
const resultHeading = ref<HTMLElement | null>(null);

const paxOptions = computed(() => Array.from({ length: guest.maxPax }, (_, i) => i + 1));
const attending = computed(() => form.attendance === 'hadir' || form.attendance === 'ragu');
const sessionLabel = (keys: string[]) =>
  event.sessions.filter((s) => keys.includes(s.key)).map((s) => s.label).join(' & ');

function fillFrom(s: RsvpSummary) {
  form.name = s.name;
  form.attendance = s.attendance;
  form.pax = Math.min(Math.max(s.pax, 1), guest.maxPax);
  form.sessions = s.sessions.length ? [...s.sessions] : event.sessions.map((x) => x.key);
  form.message = s.message;
  form.showMessage = s.showMessage;
}

// Data tamu dimuat asinkron oleh App.vue → isi form begitu tersedia (tanpa menimpa ketikan tamu).
watch(
  () => [guest.name, guest.existing] as const,
  ([name, existing]) => {
    if (existing && !saved.value) {
      saved.value = existing;
      editing.value = false;
      fillFrom(existing);
    } else if (name && !form.name) {
      form.name = name;
    }
  },
  { immediate: true },
);

onMounted(async () => {
  renderedAt.value = Date.now();
  if (!guest.existing) {
    const last = readLastRsvp();
    if (last) {
      saved.value = last;
      editing.value = false;
      fillFrom(last);
    }
  }
  try {
    const s = await api<{ open: boolean }>('/api/rsvp/status');
    open.value = s.open;
  } catch {
    /* jaringan gagal: biarkan dugaan lokal; server tetap menolak bila sudah lewat tenggat */
  }
});

function validate(): string {
  if (!form.name.trim()) return 'Mohon isi nama Anda.';
  if (!form.attendance) return 'Mohon pilih status kehadiran.';
  if (attending.value && !form.sessions.length) return 'Mohon pilih minimal satu sesi acara.';
  return '';
}

async function submit() {
  if (submitting.value) return; // cegah klik ganda
  error.value = validate();
  if (error.value) return;
  submitting.value = true;
  try {
    const res = await api<{ status: string; rsvp: RsvpSummary }>('/api/rsvp', {
      method: 'POST',
      json: {
        submissionId: submissionId(),
        guestCode: guest.code,
        name: form.name,
        attendance: form.attendance,
        pax: attending.value ? form.pax : 0,
        sessions: attending.value ? form.sessions : [],
        message: form.message,
        showMessage: form.showMessage,
        website: form.website,
        renderedAt: renderedAt.value,
      },
    });
    saved.value = res.rsvp;
    editing.value = false;
    writeLastRsvp(res.rsvp);
    wishesVersion.value++;
    await nextTick();
    resultHeading.value?.focus();
  } catch (e) {
    const err = e as ApiError;
    error.value = err.message;
    if (err.data?.closed) open.value = false;
  } finally {
    submitting.value = false;
  }
}

function edit() {
  editing.value = true;
  error.value = '';
  renderedAt.value = Date.now();
}
</script>

<template>
  <SectionShell id="rsvp" flowers="none" :full="false" labelledby="rsvp-judul">
    <SectionLabel text="Konfirmasi Kehadiran" />
    <h2 id="rsvp-judul" class="sr-only">Konfirmasi Kehadiran</h2>

    <!-- Form ditutup (tenggat lewat) -->
    <div v-if="!open && !saved" v-reveal class="rounded-2xl border border-line/60 bg-white/80 p-6 text-[15px] shadow-sm">
      <p class="font-bold text-ink">Konfirmasi kehadiran telah ditutup.</p>
      <p class="mt-2 text-ink-soft">Batas konfirmasi: {{ deadlineLabel }}. Terima kasih atas perhatian Bapak/Ibu/Saudara/i.</p>
      <a
        v-if="event.rsvp.contact"
        :href="`https://wa.me/${event.rsvp.contact.whatsapp}`"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-4 inline-block font-bold underline underline-offset-4"
      >Hubungi {{ event.rsvp.contact.label }}</a>
    </div>

    <!-- Ringkasan jawaban yang tersimpan -->
    <div v-else-if="saved && !editing" class="rounded-2xl border border-line/60 bg-white/85 p-6 text-left shadow-sm" aria-live="polite">
      <p ref="resultHeading" tabindex="-1" class="flex items-center gap-2 font-display text-xl font-bold text-ink">
        <Check class="size-5 shrink-0" aria-hidden="true" />
        Terima kasih, {{ saved.name }}
      </p>
      <p class="mt-1 text-sm text-ink-soft">Konfirmasi Anda sudah tersimpan:</p>
      <dl class="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
        <dt class="text-ink-soft">Status</dt>
        <dd class="font-bold">{{ LABEL[saved.attendance] }}</dd>
        <template v-if="saved.attendance !== 'tidak'">
          <dt class="text-ink-soft">Jumlah</dt>
          <dd class="font-bold">{{ saved.pax }} orang</dd>
          <dt class="text-ink-soft">Sesi</dt>
          <dd class="font-bold">{{ sessionLabel(saved.sessions) }}</dd>
        </template>
        <template v-if="saved.message">
          <dt class="text-ink-soft">Ucapan</dt>
          <dd class="whitespace-pre-line [overflow-wrap:anywhere]">{{ saved.message }}</dd>
        </template>
      </dl>
      <button
        v-if="open"
        type="button"
        class="mt-5 rounded-md border border-ink px-4 py-2 text-sm font-bold text-ink transition hover:bg-ink hover:text-paper"
        @click="edit"
      >Ubah jawaban</button>
    </div>

    <!-- Form -->
    <form v-else v-reveal="200" class="rounded-2xl border border-line/60 bg-white/90 p-5 text-left shadow-sm sm:p-6" novalidate @submit.prevent="submit">
      <p class="mb-5 text-center text-sm text-ink-soft">Mohon konfirmasi sebelum <strong class="text-ink">{{ deadlineLabel }}</strong>.</p>

      <label for="rsvp-nama" class="mb-1.5 block text-sm font-bold">Nama</label>
      <input
        id="rsvp-nama"
        v-model="form.name"
        type="text"
        :maxlength="NAME_MAX"
        autocomplete="name"
        required
        class="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[15px] text-ink outline-none transition focus:border-ink"
        placeholder="Nama Anda"
      />

      <fieldset class="mt-5">
        <legend class="mb-2 text-sm font-bold">Kehadiran</legend>
        <div class="grid grid-cols-3 gap-2">
          <label
            v-for="o in OPTIONS"
            :key="o.value"
            class="cursor-pointer rounded-lg border px-2 py-3 text-center text-sm font-bold transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink"
            :class="form.attendance === o.value ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-ink hover:border-ink'"
          >
            <input v-model="form.attendance" type="radio" name="attendance" :value="o.value" class="sr-only" />
            {{ o.label }}
          </label>
        </div>
      </fieldset>

      <template v-if="attending">
        <div class="mt-5">
          <label for="rsvp-pax" class="mb-1.5 block text-sm font-bold">Jumlah orang</label>
          <select
            id="rsvp-pax"
            v-model.number="form.pax"
            class="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink"
          >
            <option v-for="n in paxOptions" :key="n" :value="n">{{ n }} orang</option>
          </select>
          <p class="mt-1 text-xs text-ink-soft">Undangan ini berlaku untuk maksimal {{ guest.maxPax }} orang.</p>
        </div>

        <fieldset class="mt-5">
          <legend class="mb-2 text-sm font-bold">Sesi yang dihadiri</legend>
          <div class="flex flex-col gap-2">
            <label v-for="s in event.sessions" :key="s.key" class="flex cursor-pointer items-center gap-3 text-[15px]">
              <input v-model="form.sessions" type="checkbox" :value="s.key" class="size-5 accent-ink" />
              {{ s.label }}
            </label>
          </div>
        </fieldset>
      </template>

      <div class="mt-5">
        <label for="rsvp-ucapan" class="mb-1.5 block text-sm font-bold">Ucapan &amp; doa <span class="font-normal text-ink-soft">(opsional)</span></label>
        <textarea
          id="rsvp-ucapan"
          v-model="form.message"
          rows="4"
          :maxlength="MESSAGE_MAX"
          class="w-full resize-y rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink"
          placeholder="Tulis ucapan dan doa untuk kedua mempelai"
        />
        <div class="mt-1 flex items-start justify-between gap-3">
          <label class="flex cursor-pointer items-center gap-2 text-sm">
            <input v-model="form.showMessage" type="checkbox" class="size-4 accent-ink" />
            Tampilkan ucapan saya di halaman ini
          </label>
          <span class="shrink-0 text-xs tabular-nums text-ink-soft">{{ form.message.length }}/{{ MESSAGE_MAX }}</span>
        </div>
      </div>

      <!-- Honeypot anti-bot: disembunyikan dari manusia & pembaca layar. -->
      <div class="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label for="rsvp-website">Jangan diisi</label>
        <input id="rsvp-website" v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" />
      </div>

      <p v-if="error" class="mt-4 rounded-lg border border-ink/30 bg-cream-tint px-3.5 py-2.5 text-sm font-bold text-ink" role="alert">
        {{ error }}
      </p>

      <button
        type="submit"
        :disabled="submitting"
        class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-6 py-3.5 text-[15px] font-bold text-paper shadow-md transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-70"
      >
        <Send class="size-4" aria-hidden="true" />
        {{ submitting ? 'Mengirim…' : error ? 'Coba kirim lagi' : saved ? 'Simpan perubahan' : 'Kirim Konfirmasi' }}
      </button>
    </form>
  </SectionShell>
</template>
