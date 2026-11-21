<script setup>
import { ref, defineProps } from "vue";
defineProps({ tabs: { type: Object, required: true } });

const labels = { editorial: "সম্পাদকীয়", opinion: "মতামত" };
const active = ref("editorial");

// 1 -> ১, 12 -> ১২ (works for any list length)
const toBn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
</script>

<template>
  <aside class="tabs">
    <div class="tab-list" role="tablist">
      <button
        v-for="(label, key) in labels" :key="key"
        role="tab" :aria-selected="active === key"
        :class="{ active: active === key }"
        @click="active = key"
      >{{ label }}</button>
    </div>

    <template v-if="tabs[active] && tabs[active].length">
      <!-- Editorial: numbered list -->
      <ol v-if="active === 'editorial'" class="ranked">
        <li v-for="(item, i) in tabs.editorial" :key="item.id">
          <span class="rank">{{ toBn(i + 1) }}</span>
          <div>
            <router-link :to="'/news/' + encodeURIComponent(item.slug)">{{ item.title }}</router-link>
            <span v-if="item.author" class="author">{{ item.author }}</span>
            <time>{{ item.date }}</time>
          </div>
        </li>
      </ol>

      <!-- Opinion: plain list -->
      <ul v-else class="plain">
        <li v-for="item in tabs[active]" :key="item.id">
          <router-link :to="'/news/' + encodeURIComponent(item.slug)">{{ item.title }}</router-link>
          <span v-if="item.author" class="author">{{ item.author }}</span>
          <time>{{ item.date }}</time>
        </li>
      </ul>
    </template>

    <p v-else class="empty">এই বিভাগে এখনো কোনো লেখা নেই।</p>
  </aside>
</template>

<style scoped>
/* rem sizes: scale with the root font-size on big monitors */
.tab-list { display: flex; border-bottom: 3px solid #f21b3f; margin-bottom: 0.25rem; }
.tab-list button {
  flex: 1; font: inherit; font-size: 0.875rem; font-weight: 600; padding: 0.5rem 0.25rem;
  background: #eee; border: 0; cursor: pointer; color: #444;
}
.tab-list button.active { background: #006a4e; color: #fff; }
.tab-list button:focus-visible { outline: 2px solid #f21b3f; outline-offset: -2px; }
ol, ul { list-style: none; margin: 0; padding: 0; }
li { padding: 0.75rem 0; border-bottom: 1px solid #e2e2e2; }
li:last-child { border-bottom: 0; }
a { font-size: 0.875rem; line-height: 1.5; font-weight: 600; color: #222; text-decoration: none; display: block; }
a:hover { color: #f21b3f; }
time { font-size: 0.71875rem; color: #888; display: block; margin-top: 0.1875rem; }
.author { font-size: 0.75rem; color: #006a4e; font-weight: 600; }
.ranked li { display: flex; gap: 0.625rem; }
.rank {
  font-family: 'Noto Serif Bengali', serif; font-size: 1.625rem; line-height: 1;
  color: #f21b3f; min-width: 1.375rem;
}
.empty { font-size: 0.8125rem; color: #888; padding: 0.875rem 0; margin: 0; }
</style>