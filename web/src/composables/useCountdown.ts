/**
 * web/src/composables/useCountdown.ts — hitung mundur ke waktu acara.
 *
 * Dipanggil oleh: web/src/sections/CountdownSection.vue.
 * Memanggil: Vue (ref, onMounted, onUnmounted).
 *
 * Waktu target berupa ISO dengan offset +07:00 → mewakili satu instan absolut. Selisihnya dengan
 * Date.now() sama di mana pun tamu berada, jadi hitung mundur tetap benar walau ponsel tamu
 * memakai zona waktu lain.
 */
import { onMounted, onUnmounted, ref } from 'vue';

export function useCountdown(targetIso: string) {
  const target = Date.parse(targetIso);
  const days = ref(0);
  const hours = ref(0);
  const minutes = ref(0);
  const seconds = ref(0);
  const done = ref(false);
  let timer: ReturnType<typeof setInterval> | undefined;

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      done.value = true;
      days.value = hours.value = minutes.value = seconds.value = 0;
      if (timer) clearInterval(timer);
      return;
    }
    const s = Math.floor(diff / 1000);
    days.value = Math.floor(s / 86400);
    hours.value = Math.floor((s % 86400) / 3600);
    minutes.value = Math.floor((s % 3600) / 60);
    seconds.value = s % 60;
  }

  onMounted(() => {
    tick();
    timer = setInterval(tick, 1000);
  });
  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  return { days, hours, minutes, seconds, done };
}
