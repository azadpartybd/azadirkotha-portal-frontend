<script setup>
import { defineProps } from "vue";
defineProps({
  ad: { type: Object, required: true },
  size: { type: String, default: "leaderboard" },
});
</script>

<template>
  <aside class="ad" :class="size" aria-label="বিজ্ঞাপন">
    <span class="ad-label">বিজ্ঞাপন</span>
    <a :href="ad.href || '#'" class="ad-box" target="_blank" rel="sponsored noopener">
      <img v-if="ad.image" :src="ad.image" :alt="ad.headline || 'বিজ্ঞাপন'" />
      <div v-else class="creative" :style="{ background: ad.bg, color: ad.color }">
        <div class="copy">
          <h4>{{ ad.headline }}</h4>
          <p>{{ ad.text }}</p>
        </div>
        <span class="cta" :style="{ background: ad.accent, color: ad.accentText }">{{ ad.cta }}</span>
      </div>
    </a>
  </aside>
</template>

<style scoped>
.ad { margin: 20px auto; }
.ad-label { display: block; font-size: 11px; color: #888; text-align: center; margin-bottom: 4px; }
.ad-box { display: block; border: 1px solid #cfcfcf; overflow: hidden; text-decoration: none; background: #fff; }
.ad-box:focus-visible { outline: 2px solid #f21b3f; outline-offset: 2px; }
.ad-box img { width: 100%; height: 100%; object-fit: cover; display: block; }

.leaderboard { max-width: 728px; }
.leaderboard .ad-box { aspect-ratio: 728 / 90; }
.leaderboard .creative { flex-direction: row; align-items: center; justify-content: space-between; padding: 0 24px; gap: 16px; }
.leaderboard h4 { font-size: 18px; }
.leaderboard p { font-size: 12.5px; }

.rectangle { max-width: 300px; }
.rectangle .ad-box { aspect-ratio: 300 / 250; }
.rectangle .creative { flex-direction: column; justify-content: center; align-items: flex-start; padding: 8%; gap: 14px; }
.rectangle h4 { font-size: 22px; }

.creative { height: 100%; display: flex; }
h4 { font-family: 'Noto Serif Bengali', serif; line-height: 1.35; margin: 0 0 4px; }
p { line-height: 1.55; margin: 0; opacity: 0.92; }
.cta { font-size: 13px; font-weight: 700; padding: 7px 16px; white-space: nowrap; }

@media (max-width: 600px) {
  .leaderboard .ad-box { aspect-ratio: 320 / 100; }
  .leaderboard .creative { padding: 0 14px; gap: 10px; }
  .leaderboard h4 { font-size: 14px; margin: 0; }
  .leaderboard p { display: none; }
  .leaderboard .cta { font-size: 11.5px; padding: 6px 10px; }
}
</style>