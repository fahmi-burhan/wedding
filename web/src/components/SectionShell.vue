<!--
  web/src/components/SectionShell.vue — pembungkus setiap section dengan dekorasi berlapis ("ramai"):
    • pita bunga melintang di atas (menindih tepi kartu, seperti bunga yang "tumpah" di referensi)
    • untaian bunga di tepi kiri & kanan sepanjang section
    • buket di sudut bawah
    • isi di dalam kartu kertas tembus pandang yang mengambang di atas latar tetap (App.vue)
  Dipanggil oleh: semua komponen di web/src/sections/.
  Memanggil: ornamen SVG di web/src/assets/ornaments/.

  Props:
    tone  'clear' = latar tetap terlihat (default) · 'band' = pita cream solid
    decor 'full' (atas + sisi + bawah) · 'sides' (atas + sisi) · 'none'
    card  true = isi dibungkus kartu; false = isi langsung di atas latar (mis. sudah punya bingkai lengkung)
    full  tinggi minimal satu layar (ritme "per adegan" video)
-->
<script setup lang="ts">
import swagTop from '../assets/ornaments/swag-top.svg';
import garland from '../assets/ornaments/garland-side.svg';
import bouquet from '../assets/ornaments/bouquet.svg';

withDefaults(
  defineProps<{
    id?: string;
    tone?: 'clear' | 'band';
    decor?: 'full' | 'sides' | 'none';
    card?: boolean;
    full?: boolean;
    labelledby?: string;
  }>(),
  { tone: 'clear', decor: 'full', card: true, full: true },
);
</script>

<template>
  <section
    :id="id"
    :aria-labelledby="labelledby"
    class="relative isolate overflow-hidden px-4 pb-28 pt-36"
    :class="[tone === 'band' ? 'paper-band' : '', full ? 'flex min-h-svh flex-col justify-center' : '']"
  >
    <template v-if="decor !== 'none'">
      <!-- Untaian sisi: di bawah kartu (z-0). object-cover + object-left memotong lebarnya saja. -->
      <img
        :src="garland"
        alt=""
        aria-hidden="true"
        loading="lazy"
        class="pointer-events-none absolute bottom-16 left-0 top-20 z-0 w-[92px] select-none object-cover object-left-top"
      />
      <img
        :src="garland"
        alt=""
        aria-hidden="true"
        loading="lazy"
        class="pointer-events-none absolute bottom-16 right-0 top-28 z-0 w-[92px] -scale-x-100 select-none object-cover object-left-top"
      />
      <!-- Pita bunga atas: di atas kartu (z-20) supaya bunga tampak menindih tepi bingkai. -->
      <img
        :src="swagTop"
        alt=""
        aria-hidden="true"
        loading="lazy"
        v-reveal:blur
        class="pointer-events-none absolute -top-3 left-1/2 z-20 w-[112%] max-w-none -translate-x-1/2 select-none"
      />
      <template v-if="decor === 'full'">
        <img :src="bouquet" alt="" aria-hidden="true" loading="lazy" class="float-soft pointer-events-none absolute -bottom-8 -left-12 z-20 w-[52%] max-w-[250px] select-none" />
        <div class="pointer-events-none absolute -bottom-6 -right-12 z-20 w-[44%] max-w-[210px] -scale-x-100" aria-hidden="true">
          <img :src="bouquet" alt="" loading="lazy" class="float-soft w-full select-none" style="animation-delay: -3s" />
        </div>
      </template>
    </template>

    <div
      class="relative z-10 mx-auto w-full text-center"
      :class="card
        ? 'max-w-[330px] rounded-[2rem] bg-paper/90 px-6 py-12 shadow-[0_12px_40px_rgba(30,32,34,0.12)] ring-1 ring-line/35'
        : 'max-w-[360px]'"
    >
      <!-- Garis bingkai dalam tipis pada kartu (detail kartu undangan cetak). -->
      <div v-if="card" class="pointer-events-none absolute inset-[7px] rounded-[1.6rem] border border-line/40" aria-hidden="true" />
      <div class="relative">
        <slot />
      </div>
    </div>
  </section>
</template>
