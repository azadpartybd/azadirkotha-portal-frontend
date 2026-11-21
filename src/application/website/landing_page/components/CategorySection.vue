<script setup>
import { computed, defineProps } from 'vue'

const MAX_OTHERS = 8; // stories shown beside the lead

const props = defineProps({
  title: { type: String, required: true },
  slug: { type: String, default: '' },
  items: { type: Array, required: true },
});

const others = computed(() => props.items.slice(1, 1 + MAX_OTHERS));
// fewer than 8 (including none): close the list with a "no more news" note
const showEnd = computed(() => others.value.length < MAX_OTHERS);
</script>

<template>
  <section class="category">
    <header class="category-header">
      <h2>{{ title }}</h2>
      <router-link :to="'/' + slug" class="see-more">আরও দেখুন →</router-link>
    </header>

    <div class="layout">
      <!-- first story: full card with short details -->
      <article v-if="items[0]" class="news-card">
        <img :src="items[0].image" alt="" />
        <div class="news-content">
          <span class="news-date">{{ items[0].date }}</span>
          <router-link :to="'/news/' + encodeURIComponent(items[0].slug)"><h3>{{ items[0].title }}</h3></router-link>
          <p v-if="items[0].summary" class="details">{{ items[0].summary }}</p>
        </div>
      </article>

      <!-- other stories: compact rows, two columns, up to 8 -->
      <ul class="compact" :class="{ full: !showEnd }">
        <li v-for="n in others" :key="n.id" class="row">
          <img :src="n.image" alt="" />
          <div>
            <router-link :to="'/news/' + encodeURIComponent(n.slug)"><h4>{{ n.title }}</h4></router-link>
            <span class="news-date">{{ n.date }}</span>
          </div>
        </li>
        <li v-if="showEnd" class="end-note">আর কোনো খবর পাওয়া যায়নি।</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* rem sizes: scale with the root font-size on big monitors */
.category { margin-bottom: 2.5rem; }
.category-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.125rem; padding-bottom: 0.625rem; border-bottom: 3px double #222;
}
h2 { font-family: 'Noto Serif Bengali', serif; font-size: 1.5rem; margin: 0; color: #006a4e; }
.see-more { font-size: 0.875rem; color: #f21b3f; text-decoration: none; font-weight: 600; }
.see-more:hover { color: #d1173a; }
a { color: inherit; text-decoration: none; }

.layout { display: grid; grid-template-columns: 1fr 1.6fr; align-items: stretch; }
.news-card {
  background: #fff; border-radius: 8px; overflow: hidden; cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); border-top: 3px solid transparent;
  transition: transform 0.3s, box-shadow 0.3s; margin-right: 1.25rem;
  display: flex; flex-direction: column;
}
.news-card:hover { transform: translateY(-4px); box-shadow: 0 6px 20px rgba(0, 106, 78, 0.15); border-top-color: #006a4e; }
.news-card img { width: 100%; flex: 1; min-height: 12.5rem; object-fit: cover; display: block; }
.news-content { padding: 0.875rem; }
.news-date { font-size: 0.75rem; color: #999; display: block; margin-bottom: 0.375rem; }
h3 { font-size: 1.0625rem; line-height: 1.45; font-weight: 600; margin: 0; color: #222; }
.news-card a:hover h3 { color: #f21b3f; }
.details {
  font-size: 0.8125rem; line-height: 1.6; color: #555; margin: 0.5rem 0 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* two-column compact list */
.compact {
  list-style: none; margin: 0; padding: 0 0 0 1.25rem; border-left: 1px solid #c9c9c9;
  display: grid; grid-template-columns: 1fr 1fr; column-gap: 1.25rem; align-content: start;
}
.row {
  display: grid; grid-template-columns: 6rem 1fr; gap: 0.625rem; align-items: start;
  padding: 0.75rem 0; border-bottom: 1px solid #e2e2e2; cursor: pointer;
}
.row:nth-child(-n + 2) { padding-top: 0; }
/* a full list (8 stories) ends without a rule, like before */
.compact.full .row:nth-last-child(-n + 2) { border-bottom: 0; padding-bottom: 0; }
.compact img { width: 6rem; height: 4.25rem; object-fit: cover; display: block; }
h4 { font-size: 0.875rem; line-height: 1.45; font-weight: 600; margin: 0 0 0.25rem; }
.row:hover h4 { color: #f21b3f; }

/* closes a short list like the end of a newspaper column */
.end-note {
  grid-column: 1 / -1; padding: 0.75rem 0 0.875rem; text-align: center;
  font-size: 0.8125rem; color: #888;
}
.row:nth-child(-n + 2) ~ .end-note { padding-top: 0.75rem; }

@media (max-width: 1100px) {
  .layout { grid-template-columns: 1fr; }
  .news-card { margin: 0 0 1.125rem; }
  .compact { padding-left: 0; border-left: 0; }
}
@media (max-width: 600px) {
  .compact { column-gap: 0.75rem; }
  .row { grid-template-columns: 3.5rem 1fr; gap: 0.5rem; }
  .compact img { width: 3.5rem; height: 3.5rem; }
  h4 { font-size: 0.78125rem; }
  .news-date { font-size: 0.6875rem; }
}
</style>