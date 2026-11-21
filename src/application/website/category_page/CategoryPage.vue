<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useCrudStore } from "@/store/crud";
import CategoryNewsItem from "./components/CategoryNewsItem.vue";
import AdBox from "../news_details/components/AdBanner.vue";

// Banner shown between today's and older news. Replace with a real creative: { href, image } is enough.
const ad = {
  href: "#",
  headline: "নিরাপদ জীবন বীমা",
  text: "পরিবারের ভবিষ্যৎ সুরক্ষিত করুন মাত্র মাসিক ৫০০ টাকা থেকে।",
  cta: "বিস্তারিত জানুন",
  bg: "#12355b",
  color: "#fff",
  accent: "#f7c948",
  accentText: "#12355b",
};

const GRID_COUNT = 6; // today's stories beside the lead (3 columns x 2 rows); the rest go in a row below

const crud = useCrudStore();
const route = useRoute();

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
};

const normalize = (a) => ({
  id: a.id,
  title: a.title,
  summary: a.summary,
  image: a.featured_image,
  caption: a.featured_image_caption,
  date: formatDate(a.published_at),
  to: "/news/" + encodeURIComponent(a.slug),
});

const category = ref(null);
const lead = ref(null);
const today = ref([]);
const older = ref([]);
const page = ref(0);
const initialLoading = ref(true);
const loading = ref(false);
const loadError = ref(false);
const notFound = ref(false);
const failed = ref(false);
const done = ref(false);
const sentinel = ref(null);

// Top block: lead (or today's newest if there is no lead) on the left, up to 6 of today's stories on the right
const stories = computed(() => (lead.value ? [lead.value, ...today.value] : today.value));
const mainStory = computed(() => stories.value[0] || null);
const gridItems = computed(() => stories.value.slice(1, 1 + GRID_COUNT));
const restToday = computed(() => stories.value.slice(1 + GRID_COUNT));
const hasNews = computed(() => stories.value.length > 0 || older.value.length > 0);

let observer = null;
let session = 0; // ignore late responses after the category changed

const fetchPage = (p) =>
  crud.getRaw(`/categories/${encodeURIComponent(route.params.slug)}/page?page=${p}`);

const observeSentinel = async () => {
  await nextTick();
  if (!observer || !sentinel.value || done.value) return;
  observer.unobserve(sentinel.value);
  observer.observe(sentinel.value); // fires again if the sentinel is still on screen
};

async function loadFirst() {
  const my = ++session;
  observer?.disconnect();
  initialLoading.value = true;
  loading.value = false;
  loadError.value = false;
  notFound.value = false;
  failed.value = false;
  done.value = false;
  lead.value = null;
  today.value = [];
  older.value = [];
  page.value = 0;

  const res = await fetchPage(1);
  if (my !== session) return;
  initialLoading.value = false;

  if (res?.status !== 200) {
    if (res?.response?.status === 404) notFound.value = true;
    else failed.value = true;
    return;
  }

  const d = res.data;
  category.value = d.category;
  document.title = d.category.name;
  window.scrollTo({ top: 0 });
  lead.value = d.leads?.[0] ? normalize(d.leads[0]) : null;
  today.value = (d.today || []).map(normalize);
  older.value = (d.older || []).map(normalize);
  page.value = d.page;
  done.value = d.page >= d.total_pages;
  observeSentinel();
}

async function loadMore() {
  if (loading.value || done.value || initialLoading.value) return;
  const my = session;
  loading.value = true;
  loadError.value = false;

  const res = await fetchPage(page.value + 1);
  if (my !== session) return;
  loading.value = false;

  if (res?.status !== 200) {
    loadError.value = true;
    return;
  }

  const d = res.data;
  older.value.push(...(d.older || []).map(normalize));
  page.value = d.page;
  if (d.page >= d.total_pages || !(d.older || []).length) {
    done.value = true;
    observer?.disconnect();
  } else {
    observeSentinel();
  }
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => { if (entries[0].isIntersecting) loadMore(); },
    { rootMargin: "0px 0px 400px 0px" }
  );
  loadFirst();
});
onBeforeUnmount(() => observer?.disconnect());

// different category -> reload from page 1
watch(() => route.params.slug, (slug, oldSlug) => {
  if (slug !== oldSlug) loadFirst();
});
</script>

<template>
  <div class="category-page">
    <p v-if="notFound" class="state">দুঃখিত, এই বিভাগটি খুঁজে পাওয়া যায়নি। <router-link to="/">হোম পেজে ফিরে যান</router-link></p>
    <p v-else-if="failed" class="state">সংবাদ লোড করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।</p>
    <p v-else-if="initialLoading" class="state" role="status">লোড হচ্ছে ...</p>

    <template v-else-if="category">
      <!-- Compact page heading -->
      <header class="hero">
        <div class="hero-row">
          <span class="kicker">বিভাগ</span>
          <h1>{{ category.name }}</h1>
        </div>
        <p v-if="category.description" class="desc">{{ category.description }}</p>
      </header>

      <!-- Top block: LEAD at the left (50%) | today's other stories at the right (50%, 3 x 2 small tiles) -->
      <section v-if="mainStory" class="top" aria-label="প্রধান খবর">
        <article class="top-main">
          <figure class="main-photo">
            <router-link :to="mainStory.to"><img :src="mainStory.image" :alt="mainStory.caption" /></router-link>
            <figcaption>{{ mainStory.caption }}</figcaption>
          </figure>
          <h2><router-link :to="mainStory.to">{{ mainStory.title }}</router-link></h2>
          <time class="date">{{ mainStory.date }}</time>
          <p class="details">{{ mainStory.summary }}</p>
          <router-link :to="mainStory.to" class="read-more">বিস্তারিত পড়ুন</router-link>
        </article>

        <div class="top-right">
          <span class="grid-label">আজকের খবর</span>
          <div v-if="gridItems.length" class="grid">
            <article v-for="n in gridItems" :key="n.id" class="tile">
              <router-link :to="n.to" class="tile-pic"><img :src="n.image" alt="" /></router-link>
              <h3><router-link :to="n.to">{{ n.title }}</router-link></h3>
              <time>{{ n.date }}</time>
            </article>
          </div>
          <p v-else class="empty">আজকের আর কোনো খবর পাওয়া যায়নি।</p>
        </div>
      </section>
      <p v-else class="empty">আজকের কোনো খবর পাওয়া যায়নি।</p>

      <div class="plain-rule"></div>

      <!-- More of today's news (only when there are more than 6) -->
      <section v-if="restToday.length" aria-label="আজকের আরও খবর">
        <h2 class="list-title">{{ category.name }} <span>আজকের আরও খবর</span></h2>
        <div class="news-grid">
          <CategoryNewsItem v-for="n in restToday" :key="n.id" :story="n" />
        </div>
      </section>

      <!-- Ad between today's and older news -->
      <AdBox v-if="hasNews" :ad="ad" />

      <!-- Older news: always shown; one grid, rows added as more load -->
      <section aria-label="পুরনো খবর">
        <h2 class="list-title">{{ category.name }} <span>পুরনো খবর</span></h2>

        <div v-if="older.length" class="news-grid">
          <CategoryNewsItem v-for="n in older" :key="n.id" :story="n" />
        </div>
        <p v-else class="empty">কোনো পুরনো খবর পাওয়া যায়নি।</p>
      </section>

      <div ref="sentinel" class="sentinel" aria-hidden="true"></div>
      <p v-if="loading" class="state" role="status">আরও খবর লোড হচ্ছে ...</p>
      <p v-if="loadError" class="state">
        আরও খবর লোড করা যায়নি। <button class="retry" @click="loadMore">আবার চেষ্টা করুন</button>
      </p>
      <p v-if="done && older.length" class="state end">সব খবর দেখানো হয়েছে।</p>
    </template>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700&display=swap');

/* All sizes are in rem so the page scales with the root font-size on big monitors.
   Borders stay in px; media-query breakpoints stay in px on purpose. */

.category-page {
  font-family: 'Noto Sans Bengali', 'SolaimanLipi', sans-serif;
  max-width: 80rem; margin: 0 auto; padding: 1.125rem 2.5rem 2.5rem; background: #fafafa; color: #222;
}

/* Compact heading: tag and name on one line */
.hero { padding-bottom: 0.625rem; border-bottom: 3px double #222; margin-bottom: 1.125rem; }
.hero-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.kicker {
  display: inline-block; background: #f21b3f; color: #fff; font-size: 0.75rem; font-weight: 700;
  padding: 0.125rem 0.625rem;
}
.hero h1 {
  font-family: 'Noto Serif Bengali', serif; font-weight: 700; color: #006a4e;
  font-size: clamp(1.5rem, 3vw, 2rem); line-height: 1.3; margin: 0;
}
.desc { font-size: 0.90625rem; color: #555; margin: 0.375rem 0 0; max-width: 45rem; line-height: 1.6; }

/* Top block: lead always takes the left 50% */
.top { display: grid; grid-template-columns: 1fr 1fr; align-items: start; }
.top-main { min-width: 0; padding-right: 1.5rem; border-right: 1px solid #222; }

.main-photo { margin: 0 0 0.5rem; }
.main-photo img { width: 100%; display: block; aspect-ratio: 16 / 9; object-fit: cover; }
.main-photo figcaption {
  font-size: 0.75rem; line-height: 1.45; color: #666; padding-top: 0.25rem; margin-top: 0.25rem; border-top: 2px solid #006a4e;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.top-main h2 { font-family: 'Noto Serif Bengali', serif; font-size: 1.5rem; line-height: 1.35; margin: 0 0 0.25rem; }
.top-main h2 a { color: #006a4e; text-decoration: none; }
.top-main h2 a:hover { color: #f21b3f; }
.date { font-size: 0.75rem; color: #888; display: block; margin-bottom: 0.375rem; }
.details {
  font-size: 0.875rem; line-height: 1.7; color: #444; margin: 0 0 0.5rem;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.read-more { font-size: 0.84375rem; font-weight: 700; color: #f21b3f; text-decoration: none; }
.read-more:hover { text-decoration: underline; }

/* Right half: fixed 3 columns so a tile is always small; newspaper rules between tiles */
.top-right { padding-left: 1.5rem; min-width: 0; }
.grid-label {
  display: block; font-family: 'Noto Serif Bengali', serif; font-weight: 700; color: #006a4e;
  font-size: 1rem; padding-bottom: 0.375rem; margin-bottom: 0.75rem; border-bottom: 2px solid #f21b3f;
}
.grid { display: grid; grid-template-columns: repeat(3, 1fr); }
.tile { min-width: 0; padding: 0 0.875rem 0.875rem; border-right: 1px solid #d8d8d8; }
.tile:nth-child(3n + 1) { padding-left: 0; }
.tile:nth-child(3n) { padding-right: 0; border-right: 0; }
.tile:nth-child(n + 4) { padding-top: 0.875rem; border-top: 1px solid #d8d8d8; }
.tile:last-child { border-right: 0; }
.tile-pic { display: block; }
.tile img { width: 100%; display: block; aspect-ratio: 3 / 2; object-fit: cover; }
.tile h3 {
  font-size: 0.875rem; line-height: 1.5; font-weight: 600; margin: 0.5rem 0 0.25rem;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.tile h3 a { color: #222; text-decoration: none; }
.tile h3 a:hover { color: #f21b3f; }
.tile time { font-size: 0.71875rem; color: #888; }

.plain-rule { border-top: 1px solid #222; margin: 1.375rem 0 1.25rem; }

.list-title {
  font-family: 'Noto Serif Bengali', serif; font-size: 1.5rem; color: #006a4e; margin: 0 0 1rem;
  padding-bottom: 0.5rem; border-bottom: 3px double #222; display: flex; align-items: baseline; gap: 0.625rem; flex-wrap: wrap;
}
.list-title span { font-size: 0.9375rem; color: #888; font-weight: 600; font-family: 'Noto Sans Bengali', sans-serif; }

.empty { color: #777; font-size: 0.9375rem; padding: 0.625rem 0 1.25rem; margin: 0; }

/* News grid: several rows of 4 stories, vertical rules between columns, horizontal rules between rows */
.news-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 1.625rem; }
.news-grid > * { min-width: 0; padding: 0 1rem 1.125rem; border-right: 1px solid #d8d8d8; }
.news-grid > *:nth-child(4n + 1) { padding-left: 0; }
.news-grid > *:nth-child(4n) { padding-right: 0; border-right: 0; }
.news-grid > *:nth-child(n + 5) { padding-top: 1.125rem; border-top: 1px solid #d8d8d8; }
.news-grid > *:last-child { border-right: 0; }

.sentinel { height: 1px; }
.state { text-align: center; color: #666; padding: 1.375rem 0; font-size: 0.9375rem; }
.state a { color: #f21b3f; font-weight: 600; }
.retry { font: inherit; font-weight: 600; color: #f21b3f; background: none; border: 0; cursor: pointer; text-decoration: underline; }
.end { border-top: 4px double #222; margin-top: 1.125rem; }

@media (max-width: 1100px) {
  .news-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .news-grid > *, .news-grid > *:nth-child(n) { padding: 0 1rem 1.125rem; border-right: 1px solid #d8d8d8; border-top: 0; }
  .news-grid > *:nth-child(3n + 1) { padding-left: 0; }
  .news-grid > *:nth-child(3n) { padding-right: 0; border-right: 0; }
  .news-grid > *:nth-child(n + 4) { padding-top: 1.125rem; border-top: 1px solid #d8d8d8; }
  .news-grid > *:last-child { border-right: 0; }
  .top-main h2 { font-size: 1.3125rem; }
  .tile h3 { font-size: 0.8125rem; }
}
@media (max-width: 900px) {
  .top { grid-template-columns: 1fr; }
  .top-main { padding: 0 0 1.125rem; border-right: 0; border-bottom: 1px solid #222; margin-bottom: 1.125rem; }
  .top-right { padding-left: 0; }
}
@media (max-width: 800px) {
  .category-page { padding: 0.875rem 1.25rem 1.875rem; }
  .news-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .news-grid > *, .news-grid > *:nth-child(n) { padding: 0 0.625rem 1rem; border-right: 1px solid #d8d8d8; border-top: 0; }
  .news-grid > *:nth-child(2n + 1) { padding-left: 0; }
  .news-grid > *:nth-child(2n) { padding-right: 0; border-right: 0; }
  .news-grid > *:nth-child(n + 3) { padding-top: 1rem; border-top: 1px solid #d8d8d8; }
  .news-grid > *:last-child { border-right: 0; }
  .top-main h2 { font-size: 1.25rem; }
}
@media (max-width: 600px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
  .tile, .tile:nth-child(n) { padding: 0 0.625rem 0.875rem; border-right: 1px solid #d8d8d8; border-top: 0; }
  .tile:nth-child(2n + 1) { padding-left: 0; }
  .tile:nth-child(2n) { padding-right: 0; border-right: 0; }
  .tile:nth-child(n + 3) { padding-top: 0.875rem; border-top: 1px solid #d8d8d8; }
  .tile:last-child { border-right: 0; }
}
</style>