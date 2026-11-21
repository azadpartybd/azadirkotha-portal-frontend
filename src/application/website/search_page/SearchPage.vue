<script setup>
// Route: { path: "/search", component: SearchPage }   (the header already pushes /search?q=...)
// URL state:  /search?q=<words>&cat=<category slug>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCrudStore } from "@/store/crud";
import SubCategoryBar from "../category_page/components/SubCategoryBar.vue";
import SearchResultCard from "./components/SearchResultCard.vue";
import { usePortalDate, parseDateKey } from "@/composables/usePortalDate";

const PAGE_SIZE = 12; // 3 columns x 4 rows per load
const popularTags = ["নির্বাচন", "ইশতেহার", "জরিপ", "অর্থনীতি"];

const crud = useCrudStore();
const route = useRoute();
const router = useRouter();
const { portalDate, isArchive } = usePortalDate();

const q = computed(() => String(route.query.q ?? "").trim());
const cat = computed(() => String(route.query.cat ?? ""));
const hasCriteria = computed(() => !!q.value || !!cat.value);
const archiveLabel = computed(() =>
  portalDate.value
    ? parseDateKey(portalDate.value).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })
    : ""
);

// Departments (categories) for the filter bar, from the API
const categories = ref([]);
const activeCatTitle = computed(() => categories.value.find((c) => c.slug === cat.value)?.title ?? "");

async function loadCategories() {
  const res = await crud.getRaw("/search/categories");
  if (res?.status === 200) {
    categories.value = (res.data || []).map((c) => ({ slug: c.slug, title: c.name }));
  }
}

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
};

// API item -> the shape SearchResultCard expects
const toItem = (a) => ({
  id: a.id,
  title: a.title,
  summary: a.summary,
  image: a.featured_image,
  date: formatDate(a.published_at),
  categoryTitle: a.category_name || "",
  to: "/news/" + encodeURIComponent(a.slug),
});

const term = ref(q.value); // what is typed in the box
watch(q, (v) => { term.value = v; });

const items = ref([]);
const total = ref(null);
const loading = ref(false);
const done = ref(false);
const error = ref(false);
const sentinel = ref(null);

let observer = null;
let listSession = 0; // ignore late responses after the search changed

const recheck = async () => {
  await nextTick();
  if (!observer || !sentinel.value || done.value) return;
  observer.unobserve(sentinel.value);
  observer.observe(sentinel.value); // fires again if the sentinel is still on screen
};

async function loadMore() {
  if (loading.value || done.value || !hasCriteria.value) return;
  const my = listSession;
  loading.value = true;
  error.value = false;

  const params = new URLSearchParams();
  if (q.value) params.set("q", q.value);
  if (cat.value) params.set("cat", cat.value);
  if (portalDate.value) params.set("date", String(portalDate.value));
  params.set("offset", String(items.value.length));
  params.set("limit", String(PAGE_SIZE));

  const res = await crud.getRaw(`/search?${params.toString()}`);
  if (my !== listSession) return;
  loading.value = false;

  if (res?.status !== 200) {
    error.value = true;
    return;
  }

  const d = res.data;
  const got = (d.items || []).map(toItem);
  items.value.push(...got);
  total.value = d.total;
  if (items.value.length >= d.total || !got.length) {
    done.value = true;
    observer?.disconnect();
  } else {
    recheck();
  }
}

async function resetList() {
  listSession++;
  observer?.disconnect();
  items.value = [];
  total.value = null;
  done.value = false;
  loading.value = false;
  error.value = false;
  document.title = q.value ? `“${q.value}” - অনুসন্ধান` : "অনুসন্ধান";
  await loadMore();
}

const buildQuery = (text, slug) => ({ ...(text && { q: text }), ...(slug && { cat: slug }) });
const submit = (value = term.value) => {
  const text = String(value).trim();
  term.value = text;
  router.push({ path: "/search", query: buildQuery(text, cat.value) });
};
const selectCat = (slug) => {
  router.push({ path: "/search", query: buildQuery(q.value, slug) });
};

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => { if (entries[0].isIntersecting) loadMore(); },
    { rootMargin: "0px 0px 400px 0px" }
  );
  loadCategories();
  resetList();
});
onBeforeUnmount(() => observer?.disconnect());

// new words -> back to the top; any change (words, category or archive day) -> reload the list
watch(q, () => window.scrollTo({ top: 0 }));
watch(() => [q.value, cat.value, portalDate.value], resetList);
</script>

<template>
  <div class="search-page">
    <!-- Heading + search box -->
    <header class="hero">
      <span class="kicker">অনুসন্ধান</span>
      <h1>খবর খুঁজুন</h1>

      <form class="search-form" role="search" @submit.prevent="submit()">
        <input
          v-model="term"
          type="search"
          placeholder="খবর, প্রার্থী কিংবা পার্টি খুঁজুন ..."
          aria-label="অনুসন্ধান"
          autocomplete="off"
        />
        <button type="submit">খুঁজুন</button>
      </form>

      <p v-if="isArchive" class="archive-note">📅 আর্কাইভ: {{ archiveLabel }} এর পোর্টালে খোঁজা হচ্ছে</p>
    </header>

    <!-- Department (category) filter -->
    <SubCategoryBar v-if="categories.length" label="বিভাগ" :subs="categories" :active="cat" @select="selectCat" />
    <div v-else class="plain-rule"></div>

    <!-- Nothing typed yet -->
    <section v-if="!hasCriteria" class="state prompt">
      <p>কী খুঁজতে চান? উপরের বক্সে শব্দ লিখুন অথবা কোনো একটি বিভাগ বেছে নিন।</p>
      <div class="tags">
        <span>জনপ্রিয় বিষয়:</span>
        <button v-for="t in popularTags" :key="t" type="button" class="tag" @click="submit(t)">{{ t }}</button>
      </div>
    </section>

    <!-- Results: all cards are the same size, no featured stories -->
    <section v-else aria-label="অনুসন্ধানের ফলাফল">
      <h2 class="list-title">
        <template v-if="q">“{{ q }}” এর ফলাফল</template>
        <template v-else>{{ activeCatTitle }}</template>
        <span v-if="q && activeCatTitle">{{ activeCatTitle }} বিভাগে</span>
        <span v-if="total !== null">{{ total.toLocaleString("bn-BD") }} টি খবর</span>
      </h2>

      <div class="grid">
        <SearchResultCard v-for="n in items" :key="n.id" :story="n" :query="q" />
      </div>

      <div ref="sentinel" class="sentinel" aria-hidden="true"></div>
      <p v-if="loading" class="state" role="status">খবর লোড হচ্ছে ...</p>
      <p v-if="error" class="state" role="alert">
        খবর লোড করা যায়নি। <button type="button" class="retry" @click="loadMore">আবার চেষ্টা করুন</button>
      </p>
      <p v-if="done && items.length" class="state end">সব ফলাফল দেখানো হয়েছে।</p>
      <p v-if="done && !items.length && !loading" class="state">
        দুঃখিত, <template v-if="q">“{{ q }}” এর জন্য </template>কোনো খবর পাওয়া যায়নি। অন্য শব্দ বা বিভাগ দিয়ে চেষ্টা করুন।
      </p>
    </section>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700&display=swap');

.search-page {
  font-family: 'Noto Sans Bengali', 'SolaimanLipi', sans-serif;
  max-width: 1280px; margin: 0 auto; padding: 24px 40px 40px; background: #fafafa; color: #222;
  min-height: 60vh;
}

/* Heading */
.hero { padding-bottom: 22px; border-bottom: 4px double #222; margin-bottom: 0; }
.kicker {
  display: inline-block; background: #f21b3f; color: #fff; font-size: 13px; font-weight: 700;
  padding: 3px 12px; margin-bottom: 10px;
}
.hero h1 {
  font-family: 'Noto Serif Bengali', serif; font-weight: 700; color: #006a4e;
  font-size: clamp(36px, 7vw, 48px); line-height: 1.25; margin: 0 0 18px;
}

.search-form { display: flex; gap: 10px; max-width: 720px; }
.search-form input {
  flex: 1; min-width: 0; font: inherit; font-size: 16px; padding: 12px 20px;
  border: 2px solid #cfcfcf; border-radius: 50px; background: #fff; outline: none; transition: border-color 0.25s;
}
.search-form input:focus { border-color: #006a4e; }
.search-form button {
  font: inherit; font-size: 16px; font-weight: 700; color: #fff; background: #f21b3f; border: 0;
  border-radius: 50px; padding: 0 28px; cursor: pointer; transition: background 0.25s;
}
.search-form button:hover { background: #d0102f; }
.search-form button:focus-visible { outline: 2px solid #222; outline-offset: 2px; }

.archive-note {
  display: inline-block; margin: 14px 0 0; padding: 4px 14px; font-size: 13.5px; font-weight: 600;
  color: #b71c1c; background: #fdecec; border-radius: 50px;
}

.plain-rule { border-top: 1px solid #222; margin: 34px 0 26px; }

/* Results */
.list-title {
  font-family: 'Noto Serif Bengali', serif; font-size: 26px; color: #006a4e; margin: 0 0 20px;
  padding-bottom: 10px; border-bottom: 3px double #222; display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
}
.list-title span { font-size: 16px; color: #888; font-weight: 600; font-family: 'Noto Sans Bengali', sans-serif; }

.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }

.sentinel { height: 1px; }
.state { text-align: center; color: #666; padding: 22px 0; font-size: 15px; }
.end { border-top: 4px double #222; margin-top: 22px; }
.retry {
  font: inherit; font-weight: 700; color: #f21b3f; background: none; border: 0; cursor: pointer; text-decoration: underline;
}

/* Empty / prompt state */
.prompt { padding: 40px 0; }
.prompt p { margin: 0 0 16px; }
.tags { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; font-size: 14px; }
.tag {
  font: inherit; font-size: 14px; color: #333; background: #fff; border: 1px solid #cfcfcf;
  border-radius: 50px; padding: 5px 16px; cursor: pointer; transition: all 0.2s;
}
.tag:hover { background: #006a4e; border-color: #006a4e; color: #fff; }

@media (max-width: 1000px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 800px) {
  .search-page { padding: 18px 20px 30px; }
}
@media (max-width: 600px) {
  .grid { grid-template-columns: 1fr; gap: 18px; }
  .search-form button { padding: 0 18px; }
}
</style>