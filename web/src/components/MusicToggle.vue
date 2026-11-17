<!--
  web/src/components/MusicToggle.vue — musik latar + tombol putar/jeda yang selalu terlihat.
  Dipanggil oleh: App.vue (hanya dirender bila event.music diisi).
  Memanggil: elemen <audio> bawaan browser.

  Aturan: musik TIDAK pernah diputar otomatis. App.vue memanggil play() di dalam klik "Buka Undangan"
  (interaksi tamu), karena browser — terutama in-app browser WhatsApp/Instagram — menolak audio tanpa interaksi.
  Bila tetap ditolak, tombol menampilkan status "jeda" dan tamu bisa menekannya sendiri.
-->
<script setup lang="ts">
import { ref } from 'vue';
import { Music, VolumeX } from 'lucide-vue-next';

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
    class="fixed bottom-5 right-[max(1.25rem,calc(50vw-240px+1.25rem))] z-30 grid size-12 place-items-center rounded-full bg-ink/90 text-paper shadow-lg backdrop-blur transition hover:bg-ink"
    :aria-label="playing ? `Jeda musik: ${title}` : `Putar musik: ${title}`"
    :aria-pressed="playing"
    @click="toggle"
  >
    <Music v-if="playing" class="size-5" :style="{ animation: 'spin-slow 6s linear infinite' }" aria-hidden="true" />
    <VolumeX v-else class="size-5" aria-hidden="true" />
  </button>
</template>
