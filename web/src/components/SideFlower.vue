<!--
  web/src/components/SideFlower.vue — untaian bunga di TEPI KIRI/KANAN section yang "muncul" meluncur dari
  samping saat section masuk layar dan "bersembunyi" ke samping saat keluar layar; selagi tampil, bergoyang pelan.
  Dipanggil oleh: semua section (menggantikan hamparan bunga di dasar & bunga menggantung di atas).
  Memanggil: bloom-side.svg, IntersectionObserver, openState.ts.

  Tiga lapis agar animasi tidak saling menimpa: luar = posisi + gerak masuk/keluar (translate),
  tengah = cermin (kanan), dalam = goyangan (rotate dengan poros di tepi layar).
-->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import bloom from '../assets/scenes/side-bloom.svg';
import { invitationOpen } from '../composables/openState.ts';

const props = withDefaults(
  defineProps<{ side: 'left' | 'right'; top: string; width?: number; delay?: number; opacity?: number; always?: boolean }>(),
  { width: 88, delay: 0, opacity: 0.96, always: false },
);

const el = ref<HTMLElement | null>(null);
const visible = ref(false);
const shown = computed(() => visible.value && (props.always || invitationOpen.value));
let io: IntersectionObserver | undefined;

onMounted(() => {
  if (!el.value || !('IntersectionObserver' in window)) {
    visible.value = true;
    return;
  }
  io = new IntersectionObserver(([e]) => (visible.value = e.isIntersecting), { threshold: 0.05 });
  io.observe(el.value);
});
onUnmounted(() => io?.disconnect());

// Pembungkus luar TIDAK bergeser (itu yang diamati IntersectionObserver); hanya lapisan dalam yang meluncur.
const place = computed(() => ({ top: props.top, width: `${props.width}px`, [props.side]: '-10px', opacity: props.opacity }));
const slide = computed(() => ({
  transform: shown.value ? 'translate3d(0,0,0)' : `translate3d(${props.side === 'left' ? '-115%' : '115%'},0,0)`,
  transition: `transform 1700ms cubic-bezier(.22,.8,.2,1) ${shown.value ? props.delay : 0}ms`,
}));
</script>

<template>
  <div ref="el" class="pointer-events-none absolute z-[6] select-none" :style="place" aria-hidden="true">
    <div :style="slide">
      <div :class="side === 'right' ? '-scale-x-100' : ''">
        <img :src="bloom" alt="" class="side-sway w-full" :style="{ maskImage: 'linear-gradient(to bottom, transparent, #000 13%, #000 87%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 13%, #000 87%, transparent)', transformOrigin: '0% 50%', animationDelay: `${delay / -100}s` }" />
      </div>
    </div>
  </div>
</template>
