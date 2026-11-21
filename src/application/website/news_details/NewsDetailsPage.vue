<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useCrudStore } from "@/store/crud";
import ArticleBody from "./components/ArticleBody.vue";
import AdBanner from "./components/AdBanner.vue";
import AdBox from "../landing_page/components/AdBox.vue";
import RelatedNews from "./components/RelatedNews.vue";
import { ads } from "../landing_page/mockNews.js";
import { bannerAds } from "./mockArticles.js";

const MAX_EXTRA = 5; // how many more stories are appended after the first one

const crud = useCrudStore();
const route = useRoute();
const articles = ref([]);
const related = ref([]);
const loading = ref(false);
const done = ref(false);
const notFound = ref(false);
const failed = ref(false);
const sentinel = ref(null);

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
};

// 1234 -> ১,২৩৪
const formatCount = (n) => Number(n ?? 0).toLocaleString("bn-BD");

const normalize = (a) => ({
  id: a.id,
  slug: a.slug,
  title: a.title,
  author: a.news_source,
  date: formatDate(a.published_at),
  views: formatCount(a.view_count),
  image: a.featured_image,
  caption: a.featured_image_caption,
  body: a.body,
  category: a.categories?.[0]?.name || "",
  categorySlug: a.categories?.[0]?.slug || "",
  tags: a.tags || [],
});

const normalizeRelated = (a) => ({
  id: a.id,
  slug: a.slug,
  title: a.title,
  thumb: a.featured_image,
  date: formatDate(a.published_at),
});

const fetchArticle = (slug) => crud.getRaw(`/articles/${encodeURIComponent(slug)}`);

let observer = null;
let session = 0; // guards against late responses after navigating to another story
const skipped = new Set(); // related stories that failed to load

const stopObserving = () => observer?.disconnect();
const recheck = async () => {
  await nextTick();
  if (!observer || !sentinel.value || done.value) return;
  // re-observe so a still-visible sentinel fires again (short stories)
  observer.unobserve(sentinel.value);
  observer.observe(sentinel.value);
};

async function init(slug) {
  const my = ++session;
  stopObserving();
  articles.value = [];
  related.value = [];
  skipped.clear();
  done.value = false;
  notFound.value = false;
  failed.value = false;
  loading.value = false;

  const res = await fetchArticle(slug);
  if (my !== session) return;
  if (res?.status !== 200) {
    if (res?.response?.status === 404) notFound.value = true;
    else failed.value = true;
    return;
  }

  const d = res.data;
  articles.value = [normalize(d)];
  related.value = (d.related || []).map(normalizeRelated);
  document.title = d.title;
  window.scrollTo({ top: 0 });
  await nextTick();
  if (my === session && sentinel.value) observer.observe(sentinel.value);
}

async function loadNext() {
  if (loading.value || done.value || !articles.value.length) return;
  const loaded = new Set(articles.value.map((a) => a.id));
  const candidate = related.value.find((r) => !loaded.has(r.id) && !skipped.has(r.id));
  if (!candidate) { finish(); return; }

  const my = session;
  loading.value = true;
  const res = await fetchArticle(candidate.slug);
  if (my !== session) return;
  loading.value = false;

  if (res?.status !== 200) {
    skipped.add(candidate.id); // skip it and try the next related story
    recheck();
    return;
  }

  articles.value.push(normalize(res.data));
  if (articles.value.length - 1 >= MAX_EXTRA) { finish(); return; }
  recheck();
}

function finish() {
  done.value = true;
  stopObserving();
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => { if (entries[0].isIntersecting) loadNext(); },
    { rootMargin: "0px 0px 400px 0px" }
  );
  init(route.params.slug);
});
onBeforeUnmount(stopObserving);
watch(() => route.params.slug, (slug) => slug && init(slug));
</script>

<template>
  <div class="details-page">
    <!-- ad 1: leaderboard above the story -->
    <AdBanner :ad="bannerAds.top" size="leaderboard" />

    <p v-if="notFound" class="state">দুঃখিত, খবরটি খুঁজে পাওয়া যায়নি। <router-link to="/">হোম পেজে ফিরে যান</router-link></p>
    <p v-else-if="failed" class="state">খবর লোড করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন। <router-link to="/">হোম পেজে ফিরে যান</router-link></p>

    <div v-else class="layout">
      <main class="main">
        <p v-if="!articles.length" class="state" role="status">খবর লোড হচ্ছে ...</p>

        <template v-for="(a, i) in articles" :key="a.id">
          <div v-if="i > 0" class="next-divider"><span>পরবর্তী খবর</span></div>
          <ArticleBody :article="a" :ads="bannerAds" />
        </template>

        <div v-if="articles.length" ref="sentinel" class="sentinel" aria-hidden="true"></div>

        <p v-if="loading" class="state" role="status">আরও প্রাসঙ্গিক খবর লোড হচ্ছে ...</p>

        <div v-if="done" class="end">
          <p>এই বিষয়ে আর কোনো প্রাসঙ্গিক খবর নেই।</p>
          <router-link to="/">সর্বশেষ খবর দেখুন</router-link>
        </div>
      </main>

      <aside class="sidebar">
        <AdBox v-if="ads[0]" :ad="ads[0]" />
        <RelatedNews v-if="related.length" :items="related" />
        <div v-if="ads[1]" class="sticky-ad">
          <AdBox :ad="ads[1]" />
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700&display=swap');

/* All sizes are in rem so the page scales with the root font-size on big monitors.
   Borders stay in px; media-query breakpoints stay in px on purpose. */

.details-page {
  font-family: 'Noto Sans Bengali', 'SolaimanLipi', sans-serif;
  max-width: 80rem; margin: 0 auto; padding: 0.625rem 2.5rem 2.5rem; background: #fafafa; color: #222;
}

/* Two primary columns: wide story column | narrow ads + related column */
.layout {
  display: grid; grid-template-columns: minmax(0, 2.3fr) minmax(0, 1fr);
  border-top: 4px double #222; padding-top: 1.375rem; margin-top: 0.625rem;
}
.main { padding-right: 1.75rem; border-right: 1px solid #222; min-width: 0; }
.sidebar { padding-left: 1.75rem; display: flex; flex-direction: column; gap: 1.75rem; min-width: 0; }

/* the second sidebar ad follows the reader while the feed keeps growing
   (top is in rem so it stays below the sticky header when the header scales) */
.sticky-ad { position: sticky; top: 5.625rem; }

.next-divider {
  display: flex; align-items: center; gap: 0.875rem; margin: 1.875rem 0 1.5rem;
  border-top: 4px double #222; padding-top: 0.875rem;
  font-family: 'Noto Serif Bengali', serif; font-size: 1.125rem; color: #006a4e; font-weight: 700;
}

.state { text-align: center; color: #666; padding: 1.5rem 0; font-size: 0.9375rem; }
.state a { color: #f21b3f; font-weight: 600; }
.sentinel { height: 1px; }

.end {
  text-align: center; padding: 1.375rem 0; margin-top: 0.625rem;
  border-top: 4px double #222; color: #555;
}
.end a { display: inline-block; margin-top: 0.5rem; color: #fff; background: #006a4e; padding: 0.5rem 1.125rem; text-decoration: none; font-weight: 600; font-size: 0.875rem; }
.end a:hover { background: #f21b3f; }

@media (max-width: 900px) {
  .details-page { padding: 0.625rem 1.25rem 1.875rem; }
  .layout { grid-template-columns: 1fr; }
  .main { padding-right: 0; border-right: 0; }
  .sidebar { padding-left: 0; margin-top: 1.875rem; border-top: 1px solid #222; padding-top: 1.5rem; }
  .sticky-ad { position: static; }
}
</style>