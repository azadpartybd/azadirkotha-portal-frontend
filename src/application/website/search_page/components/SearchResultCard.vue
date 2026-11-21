<script setup>
// src/components/SearchResultCard.vue
// One uniform search-result box. Every card has the same image ratio and the
// title / summary are line-clamped with reserved heights, so all boxes in the
// grid come out exactly the same size.
import { computed, defineProps } from "vue";

const props = defineProps({
  story: { type: Object, required: true },
  query: { type: String, default: "" },
});

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// wraps every searched word in <mark> (input is HTML-escaped first, so v-html is safe)
const highlight = (text) => {
  const safe = escapeHtml(text ?? "");
  const terms = props.query.trim().split(/\s+/).filter(Boolean).map((t) => escapeRegex(escapeHtml(t)));
  if (!terms.length) return safe;
  return safe.replace(new RegExp(`(${terms.join("|")})`, "gi"), "<mark>$1</mark>");
};

const titleHtml = computed(() => highlight(props.story.title));
const summaryHtml = computed(() => highlight(props.story.summary));
</script>

<template>
  <article class="card">
    <router-link :to="story.to" class="pic" tabindex="-1" aria-hidden="true">
      <img :src="story.image" alt="" loading="lazy" />
      <span v-if="story.categoryTitle" class="cat">{{ story.categoryTitle }}</span>
    </router-link>

    <div class="body">
      <h3><router-link :to="story.to"><span v-html="titleHtml"></span></router-link></h3>
      <time class="date">{{ story.date }}</time>
      <p class="summary" v-html="summaryHtml"></p>
      <router-link :to="story.to" class="read-more">বিস্তারিত পড়ুন</router-link>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex; flex-direction: column; height: 100%;
  background: #fff; border: 1px solid #d8d8d8; transition: box-shadow 0.25s, border-color 0.25s;
}
.card:hover { border-color: #006a4e; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08); }

.pic { position: relative; display: block; }
img { width: 100%; display: block; aspect-ratio: 16 / 9; object-fit: cover; background: #eee; }
.cat {
  position: absolute; left: 0; bottom: 0; background: #f21b3f; color: #fff;
  font-size: 12px; font-weight: 700; padding: 3px 12px;
}

.body { display: flex; flex-direction: column; flex: 1; padding: 14px 16px 16px; border-top: 3px solid #006a4e; }

h3 {
  font-family: 'Noto Serif Bengali', serif; font-size: 19px; line-height: 1.45; margin: 0 0 6px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  min-height: calc(1.45em * 2);
}
h3 a { color: #006a4e; text-decoration: none; }
h3 a:hover { color: #f21b3f; }

.date { font-size: 12px; color: #888; display: block; margin-bottom: 8px; }

.summary {
  font-size: 14px; line-height: 1.7; color: #444; margin: 0 0 12px;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  min-height: calc(1.7em * 3);
}

.read-more { margin-top: auto; font-size: 13.5px; font-weight: 700; color: #f21b3f; text-decoration: none; }
.read-more:hover { text-decoration: underline; }

:deep(mark) { background: #fff1b8; color: inherit; padding: 0 1px; border-radius: 2px; }

@media (max-width: 600px) { h3 { font-size: 17px; } }
</style>