<script setup>
import { defineProps } from "vue";
defineProps({ story: { type: Object, required: true } });
</script>

<template>
  <article class="card">
    <figure>
      <img :src="story.image" :alt="story.caption" />
      <figcaption>{{ story.caption }}</figcaption>
    </figure>
    <h2><router-link :to="story.to">{{ story.title }}</router-link></h2>
    <time class="date">{{ story.date }}</time>
    <p class="details">{{ story.summary }}</p>
    <router-link :to="story.to" class="read-more">বিস্তারিত পড়ুন</router-link>
  </article>
</template>

<style scoped>
figure { margin: 0 0 12px; }
img { width: 100%; display: block; aspect-ratio: 16 / 9; object-fit: cover; }
figcaption { font-size: 12.5px; line-height: 1.5; color: #666; padding-top: 6px; margin-top: 6px; border-top: 2px solid #006a4e; }
h2 { font-family: 'Noto Serif Bengali', serif; font-size: 24px; line-height: 1.4; margin: 0 0 6px; }
h2 a { color: #006a4e; text-decoration: none; }
h2 a:hover { color: #f21b3f; }
.date { font-size: 12px; color: #888; display: block; margin-bottom: 8px; }
.details {
  font-size: 14.5px; line-height: 1.75; color: #444; margin: 0 0 10px;
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
}
.read-more { font-size: 13.5px; font-weight: 700; color: #f21b3f; text-decoration: none; }
.read-more:hover { text-decoration: underline; }
@media (max-width: 600px) { h2 { font-size: 20px; } }
</style>