<!--
  web/src/admin/LoginView.vue — form masuk admin (kata sandi saja).
  Dipanggil oleh: AdminApp.vue.  Memanggil: api.ts (POST /api/admin/login).
  Penguncian setelah salah berulang ditangani server; di sini hanya menampilkan pesannya.
-->
<script setup lang="ts">
import { ref } from 'vue';
import { Eye, EyeOff } from 'lucide-vue-next';
import { api, ApiError } from '../composables/api.ts';

const emit = defineEmits<{ success: [] }>();
const password = ref('');
const show = ref(false);
const busy = ref(false);
const error = ref('');

async function submit() {
  if (busy.value || !password.value) return;
  busy.value = true;
  error.value = '';
  try {
    await api('/api/admin/login', { method: 'POST', json: { password: password.value } });
    password.value = '';
    emit('success');
  } catch (e) {
    error.value = (e as ApiError).message;
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <main class="grid min-h-svh place-items-center px-4">
    <form class="w-full max-w-sm rounded-2xl border border-line/60 bg-white p-7 shadow-sm" @submit.prevent="submit">
      <h1 class="font-display text-2xl font-bold">Panel Admin</h1>
      <p class="mt-1 text-sm text-ink-soft">Rekap konfirmasi kehadiran tamu.</p>

      <label for="admin-pass" class="mt-6 mb-1.5 block text-sm font-bold">Kata sandi</label>
      <div class="relative">
        <input
          id="admin-pass"
          v-model="password"
          :type="show ? 'text' : 'password'"
          autocomplete="current-password"
          required
          class="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 pr-11 outline-none focus:border-ink"
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-soft hover:text-ink"
          :aria-label="show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
          @click="show = !show"
        >
          <EyeOff v-if="show" class="size-4" aria-hidden="true" />
          <Eye v-else class="size-4" aria-hidden="true" />
        </button>
      </div>

      <p v-if="error" class="mt-3 text-sm font-bold" role="alert">{{ error }}</p>

      <button type="submit" :disabled="busy" class="mt-5 w-full rounded-md bg-ink py-3 font-bold text-paper transition hover:bg-ink/85 disabled:opacity-60">
        {{ busy ? 'Memeriksa…' : 'Masuk' }}
      </button>
    </form>
  </main>
</template>
