<!-- CenterStoryCard.vue -->
<script setup>
import { defineProps } from 'vue'
defineProps({ story: { type: Object, required: true } });
</script>

<template>
  <article class="card">
    <img :src="story.image" alt="" />
    <router-link :to="'/news/' + encodeURIComponent(story.slug)"><h3>{{ story.title }}</h3></router-link>
    <time class="date">{{ story.date }}</time>
    <p class="details">{{ story.summary }}</p>
  </article>
</template>

<style scoped>
/* rem sizes: scale with the root font-size on big monitors */
.card img { width: 100%; display: block; aspect-ratio: 3 / 2; object-fit: cover; }
a { color: inherit; text-decoration: none; }
h3 { font-size: 0.9375rem; line-height: 1.45; font-weight: 700; margin: 0.5rem 0 0.25rem; color: #222; cursor: pointer; }
h3:hover { color: #f21b3f; }
.date { font-size: 0.71875rem; color: #888; display: block; margin-bottom: 0.375rem; }
.details {
  font-size: 0.8125rem; line-height: 1.6; color: #555; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
}
@media (max-width: 800px) {
  h3 { font-size: 0.8125rem; margin-top: 0.375rem; }
  .date { font-size: 0.6875rem; margin-bottom: 0.25rem; }
  .details { font-size: 0.71875rem; line-height: 1.5; -webkit-line-clamp: 3; }
}
</style>