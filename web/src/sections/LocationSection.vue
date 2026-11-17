<!--
  web/src/sections/LocationSection.vue — nama & alamat lokasi + tombol buka Google Maps (video 50–53 dtk).
  Dipanggil oleh: App.vue.  Memanggil: config/event.ts (venue).
  Peta tersemat hanya dimuat bila event.venue.embedUrl diisi, dan baru dimuat setelah tamu mengetuk
  (iframe Google Maps berat ±1 MB — tidak boleh memperlambat tampilan awal).
-->
<script setup lang="ts">
import { ref } from 'vue';
import { MapPin } from 'lucide-vue-next';
import { event } from '../../../config/event.ts';
import SectionShell from '../components/SectionShell.vue';
import SectionLabel from '../components/SectionLabel.vue';

const showMap = ref(false);
</script>

<template>
  <SectionShell id="lokasi">
    <SectionLabel script="Lokasi" text="Lokasi Acara" />
    <p v-reveal:mask="200" class="font-display text-[1.45rem] font-bold leading-snug text-ink">{{ event.venue.name }}</p>
    <address v-reveal="400" class="mt-3 not-italic text-[15px] text-ink">
      <span v-for="line in event.venue.addressLines" :key="line" class="block">{{ line }}</span>
    </address>

    <a
      v-reveal="550"
      :href="event.venue.mapsUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper shadow-md transition hover:bg-ink/85"
    >
      <MapPin class="size-4" aria-hidden="true" />
      Buka Google Maps
    </a>

    <div v-if="event.venue.embedUrl" class="mt-6">
      <iframe
        v-if="showMap"
        :src="event.venue.embedUrl"
        :title="`Peta ${event.venue.name}`"
        class="aspect-[4/3] w-full rounded-xl border border-line/60"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      />
      <button v-else type="button" class="text-sm font-bold underline underline-offset-4" @click="showMap = true">Tampilkan peta di sini</button>
    </div>
  </SectionShell>
</template>
