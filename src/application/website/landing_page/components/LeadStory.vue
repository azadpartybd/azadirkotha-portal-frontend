<!-- LeadStory.vue -->
<script setup>
import { defineProps } from 'vue'
defineProps({ story: { type: Object, required: true } });
</script>

<template>
  <article class="lead">
    <figure class="lead-photo">
      <img :src="story.image" :alt="story.caption" />
      <figcaption>{{ story.caption }}</figcaption>
    </figure>
    <div class="lead-text">
      <router-link :to="'/news/' + encodeURIComponent(story.slug)" class="title-link"><h1>{{ story.title }}</h1></router-link>
      <time class="date">{{ story.date }}</time>
      <p class="details">{{ story.summary }}</p>
      <router-link :to="'/news/' + encodeURIComponent(story.slug)" class="read-more">বিস্তারিত পড়ুন</router-link>
    </div>
  </article>
</template>

<style scoped>
/* rem sizes: scale with the root font-size on big monitors */
.lead {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.125rem;
  padding-bottom: 1.125rem; margin-bottom: 1.125rem;
  border-bottom: 1px solid #d8d8d8;
}
.lead-photo { margin: 0; }
.lead-photo img { width: 100%; display: block; aspect-ratio: 10 / 7; object-fit: cover; }
.lead-photo figcaption {
  font-size: 0.75rem; line-height: 1.5; color: #666; padding-top: 0.375rem;
  border-top: 2px solid #006a4e; margin-top: 0.375rem;
}
.lead-text { display: flex; flex-direction: column; }
.title-link { text-decoration: none; }
.lead-text h1 {
  font-family: 'Noto Serif Bengali', serif; font-size: 1.625rem; line-height: 1.4;
  margin: 0 0 0.5rem; color: #006a4e;
}
.date { font-size: 0.75rem; color: #888; margin-bottom: 0.625rem; }
.details {
  font-size: 0.875rem; line-height: 1.7; color: #444; margin: 0 0 0.625rem;
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
}
.read-more { font-size: 0.8125rem; font-weight: 600; color: #f21b3f; text-decoration: none; margin-top: auto; }
.read-more:hover { text-decoration: underline; }
@media (max-width: 600px) { .lead { grid-template-columns: 1fr; } }
</style>