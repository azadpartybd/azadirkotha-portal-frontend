<script setup>
import { computed, defineProps } from "vue";
import AdBanner from "./AdBanner.vue";
import ShareButtons from "./ShareButtons.vue";
import ArticleComments from "./ArticleComments.vue";

const props = defineProps({
  article: { type: Object, required: true },
  ads: { type: Object, required: true },
});

// Crawler-friendly share URL served by the backend: https://<backend>/share/<slug>
const shareOrigin = (process.env.VUE_APP_BASE_API_URL || "").replace(/\/api\/?$/, "");
const shareUrl = computed(() => `${shareOrigin}/share/${encodeURIComponent(props.article.slug)}`);

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Split the HTML body into top-level blocks so the inline ad can sit after the 2nd one
const blocks = computed(() => {
  const html = (props.article.body || "").trim();
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out = [];
  doc.body.childNodes.forEach((n) => {
    if (n.nodeType === 1) {
      out.push(n.outerHTML);
    } else if (n.nodeType === 3) {
      n.textContent.split(/\n+/).map((t) => t.trim()).filter(Boolean).forEach((t) => out.push(`<p>${esc(t)}</p>`));
    }
  });
  return out;
});
</script>

<template>
  <article class="article">
    <nav class="crumbs" aria-label="breadcrumb">
      <router-link to="/">হোম</router-link>
      <template v-if="article.category">
        <span>/</span>
        <router-link :to="'/category/' + article.categorySlug">{{ article.category }}</router-link>
      </template>
    </nav>

    <h1>{{ article.title }}</h1>

    <div class="meta">
      <span class="author">{{ article.author }}</span>
      <time>প্রকাশ: {{ article.date }}</time>
      <span v-if="article.views" class="views">পঠিত: {{ article.views }}</span>
    </div>

    <ShareButtons :url="shareUrl" :title="article.title" />

    <figure class="photo">
      <img :src="article.image" :alt="article.caption" />
      <figcaption>{{ article.caption }}</figcaption>
    </figure>

    <div class="body">
      <template v-for="(html, i) in blocks" :key="i">
        <div v-html="html"></div>
        <!-- ad 2: rectangle inside the article text -->
        <AdBanner v-if="i === 1" :ad="ads.inline" size="rectangle" />
      </template>
    </div>

    <div v-if="article.tags.length" class="tags">
      <span class="tags-label">বিষয়:</span>
      <template v-for="t in article.tags" :key="t.id">
        <router-link v-if="t.slug" :to="'/tag/' + encodeURIComponent(t.slug)" class="tag">{{ t.name }}</router-link>
        <span v-else class="tag">{{ t.name }}</span>
      </template>
    </div>

    <ArticleComments :slug="article.slug" />

    <!-- ad 3: banner at the end of every article -->
    <AdBanner :ad="ads.end" size="leaderboard" />
  </article>
</template>

<style scoped>
/* rem sizes: scale with the root font-size on big monitors */
.crumbs { font-size: 0.8125rem; color: #888; display: flex; gap: 0.375rem; margin-bottom: 0.625rem; }
.crumbs a { color: #006a4e; text-decoration: none; font-weight: 600; }
.crumbs a:hover { color: #f21b3f; }

h1 {
  font-family: 'Noto Serif Bengali', serif; font-size: 2.125rem; line-height: 1.4;
  margin: 0 0 0.875rem; color: #1b1b1b;
}
.meta {
  display: flex; flex-wrap: wrap; gap: 0.375rem 1.125rem; font-size: 0.8125rem; color: #666;
  padding: 0.625rem 0; border-top: 1px solid #d8d8d8; border-bottom: 1px solid #d8d8d8; margin-bottom: 0.875rem;
}
.author { font-weight: 700; color: #006a4e; }
.views { color: #666; }

.photo { margin: 0 0 1.25rem; }
.photo img { width: 100%; display: block; aspect-ratio: 16 / 9; object-fit: cover; }
.photo figcaption {
  font-size: 0.8125rem; line-height: 1.5; color: #666; padding-top: 0.375rem; margin-top: 0.375rem;
  border-top: 2px solid #006a4e;
}

/* body comes from the API as HTML, so its elements need :deep() to pick up these styles */
.body :deep(p) { font-size: 1.09375rem; line-height: 1.95; color: #2b2b2b; margin: 0 0 1.125rem; }
.body :deep(h2), .body :deep(h3) { font-family: 'Noto Serif Bengali', serif; color: #1b1b1b; line-height: 1.45; margin: 1.625rem 0 0.75rem; }
.body :deep(ul), .body :deep(ol) { font-size: 1.09375rem; line-height: 1.95; color: #2b2b2b; margin: 0 0 1.125rem; padding-left: 1.625rem; }
.body :deep(blockquote) { margin: 0 0 1.125rem; padding: 0.25rem 1.125rem; border-left: 4px solid #006a4e; color: #444; }
.body :deep(a) { color: #006a4e; }
.body :deep(img) { max-width: 100%; height: auto; display: block; margin: 0 auto 1.125rem; }
.body :deep(figure) { margin: 0 0 1.125rem; }
.body :deep(figcaption) { font-size: 0.8125rem; color: #666; padding-top: 0.375rem; border-top: 2px solid #006a4e; }
.body :deep(iframe), .body :deep(video) { max-width: 100%; }

.tags { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-top: 0.5rem; padding-top: 0.875rem; border-top: 1px solid #d8d8d8; }
.tags-label { font-size: 0.8125rem; color: #777; }
.tag { font-size: 0.8125rem; color: #333; background: #efefef; padding: 0.25rem 0.75rem; border-radius: 50px; text-decoration: none; }
.tag:hover { background: #006a4e; color: #fff; }

@media (max-width: 600px) {
  h1 { font-size: 1.625rem; }
  .body :deep(p), .body :deep(ul), .body :deep(ol) { font-size: 1.03125rem; line-height: 1.85; }
}
</style>