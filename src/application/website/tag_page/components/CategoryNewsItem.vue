<script setup>
import { defineProps } from "vue";
defineProps({ story: { type: Object, required: true } });
</script>

<template>
  <article class="item">
    <router-link :to="story.to" class="pic"><img :src="story.image" alt="" loading="lazy" /></router-link>
    <h3><router-link :to="story.to">{{ story.title }}</router-link></h3>
    <time>{{ story.date }}</time>
  </article>
</template>

<style scoped>
.item { min-width: 0; }
.pic { display: block; }
img { width: 100%; display: block; aspect-ratio: 3 / 2; object-fit: cover; }
h3 {
  font-size: 14.5px; line-height: 1.5; font-weight: 600; margin: 8px 0 4px;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
h3 a { color: #222; text-decoration: none; }
h3 a:hover { color: #f21b3f; }
time { font-size: 11.5px; color: #888; }
@media (max-width: 600px) { h3 { font-size: 13px; } }
</style>