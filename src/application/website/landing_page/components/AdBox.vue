<script setup>
import { defineProps } from 'vue'
defineProps({
  ad: { type: Object, required: true },
});
</script>

<template>
  <aside class="ad" aria-label="বিজ্ঞাপন">
    <span class="ad-label">বিজ্ঞাপন</span>
    <a :href="ad.href || '#'" class="ad-box" target="_blank" rel="sponsored noopener">
      <img v-if="ad.image" :src="ad.image" :alt="ad.headline || 'বিজ্ঞাপন'" />
      <div v-else class="creative" :style="{ background: ad.bg, color: ad.color }">
        <h4>{{ ad.headline }}</h4>
        <p>{{ ad.text }}</p>
        <span class="cta" :style="{ background: ad.accent, color: ad.accentText }">{{ ad.cta }}</span>
      </div>
    </a>
  </aside>
</template>

<style scoped>
.ad { width: 100%; }
.ad-label { display: block; font-size: 11px; color: #888; text-align: center; margin-bottom: 4px; }
.ad-box {
  display: block; aspect-ratio: 1 / 1; border: 1px solid #cfcfcf; overflow: hidden;
  text-decoration: none; background: #fff;
}
.ad-box:focus-visible { outline: 2px solid #f21b3f; outline-offset: 2px; }
.ad-box img { width: 100%; height: 100%; object-fit: cover; display: block; }
.creative {
  height: 100%; padding: 8%; display: flex; flex-direction: column;
  justify-content: center; align-items: flex-start; gap: 10px;
}
h4 { font-family: 'Noto Serif Bengali', serif; font-size: 22px; line-height: 1.35; margin: 0; }
p { font-size: 13.5px; line-height: 1.6; margin: 0; opacity: 0.92; }
.cta { font-size: 13px; font-weight: 700; padding: 7px 16px; margin-top: 4px; }
</style>