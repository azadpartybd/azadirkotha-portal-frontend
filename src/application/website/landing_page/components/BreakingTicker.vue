<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

// Use the same base URL your other API calls use (env var, axios instance, etc.)
const API_BASE = process.env.VUE_APP_BASE_API_URL || ''

const items = ref([])

const isExternal = (path) => /^https?:\/\//i.test(path)

// Longer lists scroll for longer so the speed stays readable
const duration = computed(() => `${Math.max(20, items.value.length * 8)}s`)

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE}/breaking-news?limit=20`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    items.value = await res.json()
  } catch (e) {
    console.error('Failed to load breaking news', e)
    items.value = []
  }
})
</script>

<template>
  <div v-if="items.length" class="breaking-bar">
    <span class="label">জরুরি:</span>

    <div class="ticker">
      <div class="track" :style="{ animationDuration: duration }">
        <!-- the list is rendered twice so the loop has no gap -->
        <template v-for="copy in 2" :key="copy">
          <span v-for="item in items" :key="`${copy}-${item.id}`" class="item" :aria-hidden="copy === 2">
            <a
              v-if="isExternal(item.path)"
              :href="item.path"
              target="_blank"
              rel="noopener noreferrer"
              :tabindex="copy === 2 ? -1 : 0"
            >{{ item.headline }}</a>
            <RouterLink v-else :to="item.path" :tabindex="copy === 2 ? -1 : 0">
              {{ item.headline }}
            </RouterLink>
            <span class="sep" aria-hidden="true">•</span>
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* rem sizes: scale with the root font-size on big monitors */
.breaking-bar {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #006a4e 0%, #005a42 100%);
  color: #fff;
  padding: 0.5rem 1rem;
  margin-bottom: 1.25rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 106, 78, 0.2);
}
.label {
  font-weight: bold;
  margin-right: 0.75rem;
  font-size: 0.9375rem;
  flex-shrink: 0;
}
.ticker {
  flex: 1;
  overflow: hidden;
  font-size: 0.875rem;
  white-space: nowrap;
}
.track {
  display: inline-flex;
  animation: scroll linear infinite;
}
.ticker:hover .track,
.ticker:focus-within .track {
  animation-play-state: paused; /* easy to click */
}
.item a {
  color: #fff;
  text-decoration: none;
}
.item a:hover {
  text-decoration: underline;
}
.sep {
  margin: 0 1.125rem;
}
@keyframes scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); } /* exactly one copy */
}
@media (prefers-reduced-motion: reduce) {
  .track { animation: none; }
  .ticker { overflow-x: auto; }
}
</style>