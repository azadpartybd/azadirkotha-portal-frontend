<script setup>
import { computed, defineProps } from "vue";

const props = defineProps({
  url: { type: String, required: true },
  title: { type: String, default: "" },
});

const links = computed(() => {
  const u = encodeURIComponent(props.url);
  const t = encodeURIComponent(props.title);
  return [
    { key: "facebook", label: "ফেসবুক", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { key: "twitter", label: "টুইটার", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { key: "linkedin", label: "লিংকডইন", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  ];
});
</script>

<template>
  <div class="share">
    <span class="share-label">শেয়ার করুন:</span>
    <a
      v-for="s in links" :key="s.key"
      :href="s.href" :class="['btn', s.key]"
      target="_blank" rel="noopener noreferrer"
      :aria-label="s.label + '-এ শেয়ার করুন'"
    >{{ s.label }}</a>
  </div>
</template>

<style scoped>
.share { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 0 0 18px; }
.share-label { font-size: 13px; color: #777; }
.btn {
  font-size: 13px; font-weight: 600; color: #333; background: #efefef;
  padding: 5px 14px; border-radius: 50px; text-decoration: none; transition: all 0.2s;
}
.btn:hover { color: #fff; }
.btn.facebook:hover { background: #1877f2; }
.btn.twitter:hover { background: #111; }
.btn.linkedin:hover { background: #0a66c2; }
.btn:focus-visible { outline: 2px solid #f21b3f; outline-offset: 2px; }
</style>