<!--
  web/src/components/SideFlower.vue — rangkaian bunga di TEPI KIRI/KANAN section yang TERUS-MENERUS muncul
  meluncur dari samping, bertahan sebentar sambil bergoyang, lalu bersembunyi lagi ke samping (berulang tanpa
  henti, tidak bergantung pada scroll). Tiap pemakaian punya durasi siklus & fase sendiri agar tidak serempak.
  Dipanggil oleh: semua section.  Memanggil: side-*.svg (4 corak), openState.ts, IntersectionObserver.

  Lapisan: luar = posisi (diamati observer, tidak bergeser) → gerak muncul/sembunyi (keyframes peek-l / peek-r
  di main.css) → cermin (kanan) → goyangan. Animasi dijeda saat section di luar layar (hemat baterai)
  dan baru mulai setelah sampul dibuka.
-->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import bloom from '../assets/scenes/side-bloom.svg';
import hydrangea from '../assets/scenes/side-hydrangea.svg';
import rose from '../assets/scenes/side-rose.svg';
import leaf from '../assets/scenes/side-leaf.svg';
import { invitationOpen } from '../composables/openState.ts';

const ART = { bloom, hydrangea, rose, leaf };

const props = withDefaults(
  defineProps<{
    side: 'left' | 'right';
    top: string;
    variant?: keyof typeof ART;
    width?: number;
    /** durasi satu siklus muncul→sembunyi (detik) */
    cycle?: number;
    /** fase awal (detik) agar tiap rangkaian tidak serempak */
    phase?: number;
    always?: boolean;
  }>(),
  { variant: 'bloom', width: 88, cycle: 14, phase: 0, always: false },
);

const el = ref<HTMLElement | null>(null);
const visible = ref(false);
const running = computed(() => visible.value && (props.always || invitationOpen.value));
let io: IntersectionObserver | undefined;

onMounted(() => {
  if (!el.value || !('IntersectionObserver' in window)) {
    visible.value = true;
    return;
  }
  io = new IntersectionObserver(([e]) => (visible.value = e.isIntersecting), { rootMargin: '120px 0px', threshold: 0 });
  io.observe(el.value);
});
onUnmounted(() => io?.disconnect());

const place = computed(() => ({ top: props.top, width: `${props.width}px`, [props.side]: '-10px' }));
const peek = computed(() => ({
  animation: `${props.side === 'left' ? 'peek-l' : 'peek-r'} ${props.cycle}s cubic-bezier(.45,.05,.25,1) ${-props.phase}s infinite`,
  animationPlayState: running.value ? 'running' : 'paused',
  // sebelum sampul dibuka: tetap bersembunyi
  opacity: props.always || invitationOpen.value ? 1 : 0,
}));
const mask = 'linear-gradient(to bottom, transparent, #000 13%, #000 87%, transparent)';
</script>

<template>
  <div ref="el" class="pointer-events-none absolute z-[6] select-none" :style="place" aria-hidden="true">
    <div :style="peek">
      <div :class="side === 'right' ? '-scale-x-100' : ''">
        <img
          :src="ART[variant]"
          alt=""
          class="side-sway w-full"
          :style="{ maskImage: mask, WebkitMaskImage: mask, transformOrigin: '0% 50%', animationDelay: `${-phase}s` }"
        />
      </div>
    </div>
  </div>
</template>
