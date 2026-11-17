<!--
  web/src/admin/AdminApp.vue — pengatur tampilan panel admin: cek sesi → login atau dasbor.
  Dipanggil oleh: web/src/admin-main.ts.
  Memanggil: api.ts (GET /api/admin/me), LoginView.vue, DashboardView.vue.
-->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../composables/api.ts';
import LoginView from './LoginView.vue';
import DashboardView from './DashboardView.vue';

const state = ref<'checking' | 'login' | 'dashboard'>('checking');

onMounted(async () => {
  try {
    await api('/api/admin/me');
    state.value = 'dashboard';
  } catch {
    state.value = 'login';
  }
});
</script>

<template>
  <div class="paper min-h-svh text-ink">
    <p v-if="state === 'checking'" class="p-10 text-center text-ink-soft">Memuat…</p>
    <LoginView v-else-if="state === 'login'" @success="state = 'dashboard'" />
    <DashboardView v-else @logout="state = 'login'" />
  </div>
</template>
