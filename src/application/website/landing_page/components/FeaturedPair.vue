<script setup>
import { defineProps } from 'vue'
defineProps({ stories: { type: Array, required: true } });
</script>

<template>
  <section v-if="stories.length" class="featured">
    <h2>বিশেষ আয়োজন</h2>
    <div class="pair" :class="{ one: stories.length === 1 }">
      <article v-for="s in stories" :key="s.id" class="big">
        <img :src="s.image" alt="" />
        <div class="body">
          <time>{{ s.date }}</time>
          <h3>{{ s.title }}</h3>
          <p>{{ s.summary }}</p>
          <router-link class="featured-btn" :to="'/news/' + encodeURIComponent(s.slug)">সম্পূর্ণ প্রতিবেদন পড়ুন</router-link>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
/* rem sizes: scale with the root font-size on big monitors */
.featured { background: #00392b; color: #fff; padding: 1.375rem 1.5rem 1.625rem; margin: 0 0 2.5rem; border-top: 5px solid #f21b3f; }
h2 {
  font-family: 'Noto Serif Bengali', serif; font-size: 1.5rem; margin: 0 0 1.125rem;
  padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.35);
}
.pair { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.pair.one { grid-template-columns: 1fr; }
.big { padding: 0 1.25rem; }
.big:first-child { padding-left: 0; border-right: 1px solid rgba(255, 255, 255, 0.35); }
.big:last-child { padding-right: 0; }
.pair.one .big { padding: 0; border-right: 0; }
img { width: 100%; aspect-ratio: 5 / 3; object-fit: cover; display: block; }
.body { padding-top: 0.875rem; }
time { font-size: 0.75rem; color: #f7c948; }
h3 { font-family: 'Noto Serif Bengali', serif; font-size: 1.5rem; line-height: 1.4; margin: 0.375rem 0 0.5rem; }
p { font-size: 0.90625rem; line-height: 1.7; color: #d7e8e2; margin: 0 0 0.75rem; }
.featured-btn { display: inline-block; background: #f7c948; color: #00392b; font-weight: 700; font-size: 0.875rem; padding: 0.5rem 1rem; text-decoration: none; }
.featured-btn:hover { background: #fff; }
.featured-btn:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
@media (max-width: 800px) {
  .pair { grid-template-columns: 1fr; }
  .big, .big:first-child, .big:last-child { padding: 0 0 1.375rem; border-right: 0; }
}
</style>