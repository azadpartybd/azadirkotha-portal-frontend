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
/* rem sizes: scale with the root font-size on big monitors */
figure { margin: 0 0 0.75rem; }
img { width: 100%; display: block; aspect-ratio: 16 / 9; object-fit: cover; }
figcaption { font-size: 0.78125rem; line-height: 1.5; color: #666; padding-top: 0.375rem; margin-top: 0.375rem; border-top: 2px solid #006a4e; }
h2 { font-family: 'Noto Serif Bengali', serif; font-size: 1.5rem; line-height: 1.4; margin: 0 0 0.375rem; }
h2 a { color: #006a4e; text-decoration: none; }
h2 a:hover { color: #f21b3f; }
.date { font-size: 0.75rem; color: #888; display: block; margin-bottom: 0.5rem; }
.details {
  font-size: 0.90625rem; line-height: 1.75; color: #444; margin: 0 0 0.625rem;
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
}
.read-more { font-size: 0.84375rem; font-weight: 700; color: #f21b3f; text-decoration: none; }
.read-more:hover { text-decoration: underline; }
@media (max-width: 600px) { h2 { font-size: 1.25rem; } }
</style>