<script setup>
import { defineProps } from "vue";
defineProps({
  title: { type: String, default: "সম্পর্কিত খবর" },
  items: { type: Array, required: true },
});
</script>

<template>
  <section class="related">
    <h2>{{ title }}</h2>
    <ul>
      <li v-for="n in items" :key="n.id">
        <router-link :to="'/news/' + encodeURIComponent(n.slug)" class="row">
          <img :src="n.thumb" alt="" />
          <div>
            <h3>{{ n.title }}</h3>
            <time>{{ n.date }}</time>
          </div>
        </router-link>
      </li>
    </ul>
  </section>
</template>

<style scoped>
/* rem sizes: scale with the root font-size on big monitors */
h2 {
  font-family: 'Noto Serif Bengali', serif; font-size: 1.25rem; color: #006a4e;
  margin: 0 0 0.375rem; padding-bottom: 0.5rem; border-bottom: 3px double #222;
}
ul { list-style: none; margin: 0; padding: 0; }
li { border-bottom: 1px solid #e2e2e2; }
li:last-child { border-bottom: 0; }
.row { display: grid; grid-template-columns: 6rem 1fr; gap: 0.75rem; padding: 0.75rem 0; text-decoration: none; color: #222; align-items: start; }
.row img { width: 6rem; height: 4.125rem; object-fit: cover; display: block; }
h3 { font-size: 0.875rem; line-height: 1.45; font-weight: 600; margin: 0 0 0.25rem; }
.row:hover h3 { color: #f21b3f; }
time { font-size: 0.71875rem; color: #888; }
</style>