<script setup>
import { computed, defineProps } from "vue";

// `items` come straight from GET /api/header -> featured: [{ title, featured_image, url, ... }]
const props = defineProps({
  items: { type: Array, default: () => [] },
});

const list = computed(() =>
  props.items.slice(0, 3).map((i) => ({
    title: i.title,
    image: i.featured_image || i.image || "",
    to: i.url || i.to || "/",
  }))
);
</script>

<template>
  <div v-if="list.length" class="highlights">
    <router-link v-for="(item, i) in list" :key="i" :to="item.to" class="highlight">
      <img v-if="item.image" :src="item.image" alt="" loading="lazy" />
      <h3>{{ item.title }}</h3>
    </router-link>
  </div>
</template>

<style scoped>
/* All sizes are in rem so they scale with the root font-size (see global scaling snippet). */
.highlights {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-left: 2.5rem;
  border-left: 1px solid #d9d9d9;
}
.highlight {
  display: grid;
  grid-template-columns: 4.5rem 1fr;
  gap: 0.625rem;
  align-items: center;
  padding: 0 0.875rem;
  text-decoration: none;
  color: #222;
  border-right: 1px solid #e4e4e4;
}
.highlight:first-child { padding-left: 1.25rem; }
.highlight:last-child { border-right: 0; }
.highlight img { width: 4.5rem; height: 3.375rem; object-fit: cover; display: block; }
.highlight h3 {
  font-size: 0.8125rem;
  line-height: 1.45;
  font-weight: 600;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.highlight:hover h3 { color: #c62828; }
.highlight:focus-visible { outline: 2px solid #c62828; outline-offset: 2px; }

/* tablet / phone: no photos, three text columns under the logo row */
@media (max-width: 1024px) {
  .highlights { flex: 0 0 100%; margin-left: 0; border-left: 0; border-top: 1px solid #e4e4e4; padding-top: 0.625rem; }
  .highlight { display: flex; padding: 0 0.625rem; }
  .highlight:first-child { padding-left: 0; }
  .highlight:last-child { padding-right: 0; }
  .highlight img { display: none; }
  .highlight h3 { font-size: 0.875rem; line-height: 1.5; }
}
@media (max-width: 600px) {
  .highlight { padding: 0 0.375rem; }
  .highlight h3 { font-size: 0.75rem; line-height: 1.4; -webkit-line-clamp: 4; }
}
</style>