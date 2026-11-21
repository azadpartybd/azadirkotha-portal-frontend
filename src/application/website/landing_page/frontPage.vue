<script setup>
import { ref, computed, onMounted } from "vue";
import { useCrudStore } from "@/store/crud";
import BreakingTicker from "./components/BreakingTicker.vue";
import LeadStory from "./components/LeadStory.vue";
import CenterStoryCard from "./components/CenterStoryCard.vue";
import SideStory from "./components/SideStory.vue";
import TabbedSidebar from "./components/TabbedSidebar.vue";
import FeaturedPair from "./components/FeaturedPair.vue";
import CategorySection from "./components/CategorySection.vue";
import LazySection from "@/components/LazySection.vue";
import AdBox from "./components/AdBox.vue";
import AdBanner from "../news_details/components/AdBanner.vue";
// Only the ticker and the sidebar ads still come from mock data (not in the API yet)
import { ads } from "./mockNews.js";

// Banners above and below the special section. Placeholder creatives: replace with real ones.
const bannerAds = {
  before: {
    href: "#",
    headline: "দ্রুত ও নিরাপদ মোবাইল ব্যাংকিং",
    text: "ঘরে বসেই লেনদেন করুন, মাত্র কয়েক সেকেন্ডে।",
    cta: "এখনই শুরু করুন",
    bg: "#0b3d2e",
    color: "#fff",
    accent: "#f7c948",
    accentText: "#0b3d2e",
  },
  after: {
    href: "#",
    headline: "নিরাপদ জীবন বীমা",
    text: "পরিবারের ভবিষ্যৎ সুরক্ষিত করুন মাত্র মাসিক ৫০০ টাকা থেকে।",
    cta: "বিস্তারিত জানুন",
    bg: "#12355b",
    color: "#fff",
    accent: "#f7c948",
    accentText: "#12355b",
  },
};

const crud = useCrudStore();
const loading = ref(true);
const failed = ref(false);

const CENTER_COUNT = 6;
const LEFT_COUNT = 6;
const CATEGORY_OTHERS = 8;
const FEATURED_SLUGS = ["special", "crime"]; // shown in the "বিশেষ আয়োজন" block
const HIDDEN_SLUGS = ["featured"];           // not used anywhere on the frontpage

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
};

const normalize = (a) =>
  a
    ? {
        id: a.id,
        slug: a.slug,
        title: a.title,
        summary: a.summary,
        image: a.featured_image,
        caption: a.featured_image_caption,
        date: formatDate(a.published_at),
        kind: a.kind,
      }
    : null;

const home = computed(() => crud.rawData || {});

const lead = computed(() => normalize(home.value.lead));
const centerStories = computed(() => (home.value.center || []).slice(0, CENTER_COUNT).map(normalize));
const leftStories = computed(() => (home.value.left || []).slice(0, LEFT_COUNT).map(normalize));

const sidebarTabs = computed(() => ({
  editorial: (home.value.editorials || []).map(normalize),
  opinion: (home.value.opinions || []).map(normalize),
}));

const sectionList = computed(() => home.value.sections || []);

// Special + Crime (in that order). Uses the category lead, falls back to its first article.
const featuredPair = computed(() =>
  FEATURED_SLUGS
    .map((slug) => sectionList.value.find((s) => s.category?.slug === slug))
    .filter(Boolean)
    .map((s) => normalize(s.lead || (s.articles || [])[0]))
    .filter(Boolean)
);

// Regular categories: lead + up to 8 others; categories with no news are dropped.
const categorySections = computed(() =>
  sectionList.value
    .filter((s) => ![...FEATURED_SLUGS, ...HIDDEN_SLUGS].includes(s.category?.slug))
    .map((s) => ({
      slug: s.category.slug,
      title: s.category.name,
      items: [s.lead, ...(s.articles || []).slice(0, CATEGORY_OTHERS)].filter(Boolean).map(normalize),
    }))
    .filter((s) => s.items.length > 0)
);

onMounted(async () => {
  const res = await crud.getRaw("/home");
  if (!res || res.status !== 200) failed.value = true;
  loading.value = false;
});
</script>

<template>
  <div class="newspaper-body">
    <BreakingTicker />

    <!-- front page skeleton while the first request is running -->
    <div v-if="loading" class="front-page" aria-busy="true" aria-label="লোড হচ্ছে" role="status">
      <section class="col col-left">
        <div v-for="n in 5" :key="n" class="sk-side">
          <span class="sk-box thumb"></span>
          <div><span class="sk-bar w90"></span><span class="sk-bar w40"></span></div>
        </div>
      </section>
      <section class="col col-center">
        <div class="sk-lead">
          <span class="sk-box lead-img"></span>
          <div><span class="sk-bar w90 big"></span><span class="sk-bar w60"></span><span class="sk-bar w90"></span><span class="sk-bar w40"></span></div>
        </div>
        <div class="sk-grid">
          <div v-for="n in 6" :key="n"><span class="sk-box card-img"></span><span class="sk-bar w90"></span><span class="sk-bar w60"></span></div>
        </div>
      </section>
      <section class="col col-right">
        <span class="sk-box tabs"></span>
        <div v-for="n in 4" :key="n" class="sk-line"><span class="sk-bar w90"></span><span class="sk-bar w40"></span></div>
      </section>
    </div>

    <p v-else-if="failed" class="state">সংবাদ লোড করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।</p>

    <template v-else>
      <!-- Front page (first screen): rendered right away -->
      <div class="front-page">
        <section class="col col-left" aria-label="সর্বশেষ সংবাদ">
          <SideStory v-for="s in leftStories" :key="s.id" :story="s" />
          <p v-if="!leftStories.length" class="no-news">কোনো খবর পাওয়া যায়নি।</p>
        </section>

        <section class="col col-center" aria-label="প্রধান সংবাদ">
          <LeadStory v-if="lead" :story="lead" />
          <div v-if="centerStories.length" class="center-grid">
            <CenterStoryCard v-for="s in centerStories" :key="s.id" :story="s" />
          </div>
          <p v-if="!lead && !centerStories.length" class="no-news">কোনো খবর পাওয়া যায়নি।</p>
        </section>

        <section class="col col-right">
          <TabbedSidebar :tabs="sidebarTabs" />
          <div class="ad-stack">
            <AdBox v-for="(ad, i) in ads" :key="i" :ad="ad" />
          </div>
        </section>
      </div>

      <!-- Special section with a banner above and below it: rendered when it is about to be seen -->
      <LazySection v-if="featuredPair.length" variant="featured" :min-height="560">
        <div class="banner">
          <AdBanner :ad="bannerAds.before" size="leaderboard" />
        </div>

        <FeaturedPair :stories="featuredPair" />

        <div class="banner">
          <AdBanner :ad="bannerAds.after" size="leaderboard" />
        </div>
      </LazySection>

      <!-- One lazy block per category section -->
      <LazySection v-for="sec in categorySections" :key="sec.slug" variant="category" :min-height="380">
        <CategorySection :title="sec.title" :slug="sec.slug" :items="sec.items" />
      </LazySection>
    </template>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700&display=swap');

/* All sizes are in rem so the page scales with the root font-size on big monitors.
   Borders stay in px; media-query breakpoints stay in px on purpose. */

.newspaper-body {
  font-family: 'Noto Sans Bengali', 'SolaimanLipi', sans-serif;
  padding: 1.25rem 2.5rem; background: #fafafa; color: #222;
}

.state { text-align: center; padding: 3.75rem 0; color: #666; font-size: 0.9375rem; }

/* shown in the left / center columns when there is no news */
.no-news { text-align: center; color: #777; font-size: 0.9375rem; padding: 2.5rem 0.75rem; margin: 0; }

/* banners above and below the special section */
.banner { margin: 0 0 1.875rem; }

/* Newspaper front page: heavy double rules frame it, thin rules divide columns */
.front-page {
  display: grid;
  grid-template-columns: 1fr 2.4fr 1fr;
  border-top: 4px double #222;
  border-bottom: 4px double #222;
  padding: 1.25rem 0;
  margin-bottom: 1.875rem;
}
.col { padding: 0 1.25rem; min-width: 0; }
.col-left { padding-left: 0; border-right: 1px solid #222; }
.col-right { padding-right: 0; border-left: 1px solid #222; }

.ad-stack { display: grid; gap: 1.25rem; margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid #d8d8d8; }

.center-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
.center-grid > * { padding: 0 0.875rem 1rem; border-right: 1px solid #d8d8d8; }
.center-grid > *:nth-child(3n + 1) { padding-left: 0; }
.center-grid > *:nth-child(3n) { padding-right: 0; border-right: 0; }
.center-grid > *:nth-child(n + 4) { padding-top: 1rem; border-top: 1px solid #d8d8d8; }

/* ---------- front page skeleton ---------- */
.sk-box, .sk-bar {
  display: block; border-radius: 4px;
  background: linear-gradient(90deg, #e9ecef 25%, #f4f6f8 37%, #e9ecef 63%);
  background-size: 400% 100%; animation: shimmer 1.4s ease infinite;
}
.sk-bar { height: 0.8125rem; margin-bottom: 0.5rem; }
.sk-bar.big { height: 1.25rem; }
.sk-bar.w40 { width: 40%; } .sk-bar.w60 { width: 60%; } .sk-bar.w90 { width: 90%; }
.sk-side { display: grid; grid-template-columns: 40% 1fr; gap: 0.625rem; padding: 0.75rem 0; border-bottom: 1px solid #e2e2e2; }
.sk-side:first-child { padding-top: 0; }
.sk-side .thumb { aspect-ratio: 4 / 3; }
.sk-lead { display: grid; grid-template-columns: 1fr 1fr; gap: 1.125rem; padding-bottom: 1.125rem; margin-bottom: 1.125rem; border-bottom: 1px solid #d8d8d8; }
.sk-lead .lead-img { aspect-ratio: 10 / 7; }
.sk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.125rem 0.875rem; }
.sk-grid .card-img { aspect-ratio: 3 / 2; margin-bottom: 0.5rem; }
.sk-box.tabs { height: 2.25rem; margin-bottom: 0.875rem; }
.sk-line { padding: 0.75rem 0; border-bottom: 1px solid #e2e2e2; }

@keyframes shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
@media (prefers-reduced-motion: reduce) {
  .sk-box, .sk-bar { animation: none; }
}

@media (max-width: 1100px) {
  .front-page { grid-template-columns: 1fr 2fr; }
  .col-right { grid-column: 1 / -1; border-left: 0; border-top: 1px solid #222; padding: 1.25rem 0 0; margin-top: 1.25rem; }
  .ad-stack { grid-template-columns: 1fr 1fr; gap: 1rem; }
}
@media (max-width: 800px) {
  .front-page { grid-template-columns: 1fr; }
  .col, .col-left, .col-right { padding: 0; border: 0; }
  .col-center { order: -1; margin-bottom: 1.25rem; }
  .col-left { margin-bottom: 1.25rem; }
  .center-grid { grid-template-columns: 1fr 1fr; column-gap: 0.75rem; }
  .center-grid > * { border: 0 !important; border-bottom: 1px solid #e2e2e2 !important; padding: 0 0 0.75rem !important; margin-bottom: 0.75rem; }
  .sk-lead { grid-template-columns: 1fr; }
  .sk-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .newspaper-body { padding: 0.9375rem 1.25rem; }
  .ad-stack { grid-template-columns: 1fr; max-width: 20rem; margin-left: auto; margin-right: auto; }
}
</style>