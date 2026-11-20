<!--
  web/src/components/MusicToggle.vue — musik latar + tombol jeda/putar yang selalu terlihat di pojok layar.
  Dipanggil oleh: App.vue (hanya dirender bila event.music diisi).
  Memanggil: elemen <audio> bawaan browser, ikon lucide.

  Alur: App.vue memanggil play() DI DALAM klik "Buka Undangan" (interaksi tamu), karena browser —
  terutama in-app browser WhatsApp/Instagram — menolak audio tanpa interaksi. Musik berulang (loop).
  Bila tetap ditolak, tombol menampilkan ikon "putar" dan tamu bisa menekannya sendiri.
-->
<script setup lang="ts">
import { ref } from 'vue';
import { Pause, Play } from 'lucide-vue-next';

const props = defineProps<{ src: string; title: string; visible: boolean }>();
const audio = ref<HTMLAudioElement | null>(null);
const playing = ref(false);

async function play() {
  if (!audio.value) return;
  try {
    audio.value.volume = 0.6;
    await audio.value.play();
    playing.value = true;
  } catch {
    playing.value = false; // autoplay ditolak browser → tamu bisa menekan tombol
  }
}
function pause() {
  audio.value?.pause();
  playing.value = false;
}
function toggle() {
  if (playing.value) pause();
  else play();
}

defineExpose({ play, pause });
</script>

<template>
  <audio ref="audio" :src="props.src" loop preload="none" @pause="playing = false" @play="playing = true" />
  <button
    v-show="visible"
    type="button"
    class="fixed bottom-5 left-[max(1.25rem,calc(50vw-240px+1.25rem))] z-30 grid size-12 place-items-center rounded-full bg-ink/90 text-paper shadow-lg ring-1 ring-white/40 backdrop-blur transition hover:bg-ink"
    :aria-label="playing ? `Jeda musik: ${title}` : `Putar musik: ${title}`"
    :aria-pressed="playing"
    @click="toggle"
  >
    <!-- cincin putus-putus berputar saat musik berbunyi (seperti piringan) -->
    <span
      class="absolute inset-[3px] rounded-full border border-dashed border-paper/60"
      :style="playing ? { animation: 'spin-slow 6s linear infinite' } : {}"
      aria-hidden="true"
    />
    <Pause v-if="playing" class="relative size-5" aria-hidden="true" />
    <Play v-else class="relative size-5 translate-x-px" aria-hidden="true" />
  </button>
</template>
