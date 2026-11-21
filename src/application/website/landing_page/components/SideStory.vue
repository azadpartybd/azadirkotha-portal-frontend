<!-- SideStory.vue -->
<script setup>
import { defineProps } from 'vue'
defineProps({ story: { type: Object, required: true } });
</script>

<template>
  <article class="side">
    <div class="top">
      <img :src="story.image" alt="" />
      <div>
        <router-link :to="'/news/' + encodeURIComponent(story.slug)"><h3>{{ story.title }}</h3></router-link>
        <time class="date">{{ story.date }}</time>
      </div>
    </div>
    <p class="details">{{ story.summary }}</p>
  </article>
</template>

<style scoped>
/* rem sizes: scale with the root font-size on big monitors */
.side { padding: 0.75rem 0; border-bottom: 1px solid #d8d8d8; }
.side:first-child { padding-top: 0; }
.side:last-child { border-bottom: 0; }
.top { display: grid; grid-template-columns: 40% 1fr; gap: 0.625rem; }
.top img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; display: block; }
a { color: inherit; text-decoration: none; }
h3 { font-size: 0.875rem; line-height: 1.45; font-weight: 700; margin: 0 0 0.25rem; cursor: pointer; }
h3:hover { color: #f21b3f; }
.date { font-size: 0.71875rem; color: #888; }
.details {
  font-size: 0.78125rem; line-height: 1.6; color: #555; margin: 0.5rem 0 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
</style>