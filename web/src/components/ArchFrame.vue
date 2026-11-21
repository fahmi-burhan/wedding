<!--
  web/src/components/ArchFrame.vue — bingkai lengkung ganda (bentuk kapsul) yang "tergambar" saat muncul,
  seperti bingkai nama mempelai & doa di video.
  Dipanggil oleh: CoupleSection.vue, PrayerSection.vue.
  Memanggil: ResizeObserver (mengukur ukuran isi agar lengkungnya tidak gepeng), directive v-reveal:draw.

  Kenapa diukur dengan JavaScript? SVG yang di-stretch (preserveAspectRatio="none") membuat lengkung
  terdistorsi. Dengan mengukur lebar/tinggi asli, path selalu berupa setengah lingkaran sempurna.
-->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

/** filled = kapsul diberi latar kertas (dipakai di atas latar bergambar). */
defineProps<{ filled?: boolean }>();

const box = ref<HTMLElement | null>(null);
const w = ref(320);
const h = ref(520);
let ro: ResizeObserver | undefined;

onMounted(() => {
  if (!box.value) return;
  const measure = () => {
    w.value = box.value!.offsetWidth;
    h.value = box.value!.offsetHeight;
  };
  measure();
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(measure);
    ro.observe(box.value);
  }
});
onUnmounted(() => ro?.disconnect());

/** Persegi panjang dengan sudut setengah lingkaran (kapsul), menjorok `inset` px dari tepi. */
function capsule(inset: number) {
  const width = Math.max(w.value - inset * 2, 10);
  const height = Math.max(h.value - inset * 2, 10);
  const r = Math.min(width, height) / 2;
  return { x: inset, y: inset, width, height, r };
}
</script>

<template>
  <div ref="box" v-reveal:draw class="relative mx-auto w-full max-w-[340px] px-8 py-28">
    <!-- Isi kapsul: kertas tembus pandang (rounded-full pada persegi panjang = ujung setengah lingkaran). -->
    <div
      v-if="filled"
      class="absolute inset-0 rounded-full bg-paper/85 shadow-[0_12px_40px_rgba(30,32,34,0.12)]"
      aria-hidden="true"
    />
    <svg class="pointer-events-none absolute inset-0 size-full overflow-visible" :viewBox="`0 0 ${w} ${h}`" aria-hidden="true">
      <rect
        v-for="(c, i) in [capsule(1), capsule(8)]"
        :key="i"
        class="draw-path"
        :style="{ '--d': `${i * 250}ms` }"
        :x="c.x"
        :y="c.y"
        :width="c.width"
        :height="c.height"
        :rx="c.r"
        pathLength="1"
        fill="none"
        stroke="var(--color-line)"
        :stroke-width="i === 0 ? 1.4 : 0.9"
      />
    </svg>
    <div class="relative text-center">
      <slot />
    </div>
  </div>
</template>
