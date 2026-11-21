<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useCrudStore } from "@/store/crud";
import CategoryNewsItem from "./components/CategoryNewsItem.vue";
import AdBox from "../news_details/components/AdBanner.vue";

// Banner at the top of the tag page. Replace with a real creative: { href, image } is enough.
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

const crud = useCrudStore();
const route = useRoute();

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
};

// same shape the category page gives to CategoryNewsItem
const normalize = (a) => ({
  id: a.id,
  title: a.title,
  summary: a.summary,
  image: a.featured_image,
  caption: a.featured_image_caption,
  date: formatDate(a.published_at),
  to: "/news/" + encodeURIComponent(a.slug),
});

const tag = ref(null);
const items = ref([]);
const total = ref(0);
const page = ref(0);
const initialLoading = ref(true);
const loading = ref(false);
const loadError = ref(false);
const notFound = ref(false);
const failed = ref(false);
const done = ref(false);
const sentinel = ref(null);

// the API sends the stories as `articles` (older builds used `items`)
const listOf = (d) => d?.articles || d?.items || [];

const totalBn = computed(() => Number(total.value).toLocaleString("bn-BD"));

let observer = null;
let session = 0; // ignore late responses after the tag changed

const fetchPage = (p) =>
  crud.getRaw(`/tags/${encodeURIComponent(route.params.slug)}/articles?page=${p}`);

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
  tag.value = null;
  items.value = [];
  total.value = 0;
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
  tag.value = d.tag;
  document.title = "#" + d.tag.name;
  window.scrollTo({ top: 0 });
  items.value = listOf(d).map(normalize);
  total.value = d.total;
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
  const more = listOf(d).map(normalize);
  items.value.push(...more);
  page.value = d.page;
  if (d.page >= d.total_pages || !more.length) {
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

// different tag -> reload from page 1
watch(() => route.params.slug, (slug, oldSlug) => {
  if (slug !== oldSlug) loadFirst();
});
</script>

<template>
  <div class="tag-page">
    <p v-if="notFound" class="state">দুঃখিত, এই ট্যাগটি খুঁজে পাওয়া যায়নি। <router-link to="/">হোম পেজে ফিরে যান</router-link></p>
    <p v-else-if="failed" class="state">সংবাদ লোড করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।</p>
    <p v-else-if="initialLoading" class="state" role="status">লোড হচ্ছে ...</p>

    <template v-else-if="tag">
      <!-- Ad at the top of the page -->
      <AdBox :ad="ad" />

      <!-- Compact page heading -->
      <header class="hero">
        <div class="hero-row">
          <span class="kicker">ট্যাগ</span>
          <h1>#{{ tag.name }}</h1>
          <span v-if="total" class="count">মোট {{ totalBn }} টি খবর</span>
        </div>
      </header>

      <!-- All stories of the tag, newest first; rows are added as more load -->
      <section v-if="items.length" aria-label="ট্যাগের খবর">
        <div class="news-grid">
          <CategoryNewsItem v-for="n in items" :key="n.id" :story="n" />
        </div>
      </section>
      <p v-else class="empty">এই ট্যাগে এখনো কোনো খবর নেই।</p>

      <div ref="sentinel" class="sentinel" aria-hidden="true"></div>
      <p v-if="loading" class="state" role="status">আরও খবর লোড হচ্ছে ...</p>
      <p v-if="loadError" class="state">
        আরও খবর লোড করা যায়নি। <button class="retry" @click="loadMore">আবার চেষ্টা করুন</button>
      </p>
      <p v-if="done && items.length" class="state end">সব খবর দেখানো হয়েছে।</p>
    </template>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700&display=swap');

.tag-page {
  font-family: 'Noto Sans Bengali', 'SolaimanLipi', sans-serif;
  max-width: 1280px; margin: 0 auto; padding: 18px 40px 40px; background: #fafafa; color: #222;
}

/* Compact heading: kicker, tag name and count on one line */
.hero { padding-bottom: 10px; border-bottom: 3px double #222; margin-bottom: 20px; }
.hero-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.kicker {
  display: inline-block; background: #f21b3f; color: #fff; font-size: 12px; font-weight: 700;
  padding: 2px 10px;
}
.hero h1 {
  font-family: 'Noto Serif Bengali', serif; font-weight: 700; color: #006a4e;
  font-size: clamp(24px, 3vw, 32px); line-height: 1.3; margin: 0; overflow-wrap: anywhere;
}
.count { font-size: 14px; color: #888; font-weight: 600; }

.empty { color: #777; font-size: 15px; padding: 10px 0 20px; margin: 0; }

/* News grid: rows of 4 stories, vertical rules between columns, horizontal rules between rows */
.news-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 26px; }
.news-grid > * { min-width: 0; padding: 0 16px 18px; border-right: 1px solid #d8d8d8; }
.news-grid > *:nth-child(4n + 1) { padding-left: 0; }
.news-grid > *:nth-child(4n) { padding-right: 0; border-right: 0; }
.news-grid > *:nth-child(n + 5) { padding-top: 18px; border-top: 1px solid #d8d8d8; }
.news-grid > *:last-child { border-right: 0; }

.sentinel { height: 1px; }
.state { text-align: center; color: #666; padding: 22px 0; font-size: 15px; }
.state a { color: #f21b3f; font-weight: 600; }
.retry { font: inherit; font-weight: 600; color: #f21b3f; background: none; border: 0; cursor: pointer; text-decoration: underline; }
.end { border-top: 4px double #222; margin-top: 18px; }

@media (max-width: 1100px) {
  .news-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .news-grid > *, .news-grid > *:nth-child(n) { padding: 0 16px 18px; border-right: 1px solid #d8d8d8; border-top: 0; }
  .news-grid > *:nth-child(3n + 1) { padding-left: 0; }
  .news-grid > *:nth-child(3n) { padding-right: 0; border-right: 0; }
  .news-grid > *:nth-child(n + 4) { padding-top: 18px; border-top: 1px solid #d8d8d8; }
  .news-grid > *:last-child { border-right: 0; }
}
@media (max-width: 800px) {
  .tag-page { padding: 14px 20px 30px; }
  .news-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .news-grid > *, .news-grid > *:nth-child(n) { padding: 0 10px 16px; border-right: 1px solid #d8d8d8; border-top: 0; }
  .news-grid > *:nth-child(2n + 1) { padding-left: 0; }
  .news-grid > *:nth-child(2n) { padding-right: 0; border-right: 0; }
  .news-grid > *:nth-child(n + 3) { padding-top: 16px; border-top: 1px solid #d8d8d8; }
  .news-grid > *:last-child { border-right: 0; }
}
</style>