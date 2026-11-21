<!--
  web/src/components/ParallaxLayer.vue — lapisan latar yang bergeser dengan kecepatan BERBEDA dari isi saat scroll
  (efek parallax). Dipanggil oleh: EventSection.vue.  Memanggil: scroll window + rAF.

  speed > 0 → lapisan bergerak lebih LAMBAT dari isi (terasa jauh); speed < 0 → lebih CEPAT (terasa dekat).
  Posisi dihitung dari jarak pusat section ke pusat layar, jadi gerakannya nol saat section di tengah layar.
  Lapisan dibuat lebih tinggi dari section (inset negatif) agar tepinya tidak terlihat saat bergeser.
-->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const props = withDefaults(defineProps<{ speed?: number }>(), { speed: 0.3 });
const el = ref<HTMLElement | null>(null);
let raf = 0;

function update() {
  raf = 0;
  const host = el.value?.parentElement;
  if (!host || !el.value) return;
  const r = host.getBoundingClientRect();
  if (r.bottom < -300 || r.top > window.innerHeight + 300) return; // jauh dari layar: lewati
  const mid = r.top + r.height / 2 - window.innerHeight / 2;
  el.value.style.transform = `translate3d(0, ${(-mid * props.speed).toFixed(1)}px, 0)`;
}
function onScroll() {
  if (!raf) raf = requestAnimationFrame(update);
}
onMounted(() => {
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
});
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
  if (raf) cancelAnimationFrame(raf);
});
</script>

<template>
  <div ref="el" class="pointer-events-none absolute inset-x-0 -inset-y-[18%] will-change-transform" aria-hidden="true">
    <slot />
  </div>
</template>
