<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps, defineEmits } from "vue";

const props = defineProps({
  // how early to start rendering, before the section reaches the viewport
  rootMargin: { type: String, default: "300px 0px" },
  // height of the placeholder (px), roughly the height of the real section
  minHeight: { type: Number, default: 320 },
  // shape of the placeholder: "category" | "featured" | "generic"
  variant: { type: String, default: "category" },
  // render immediately (skips the lazy part)
  eager: { type: Boolean, default: false },
});
// fired once, the first time the section becomes visible: a good place to fetch its own data later
const emit = defineEmits(["visible"]);

const visible = ref(props.eager);
const el = ref(null);
let io = null;

const show = () => {
  if (visible.value) return;
  visible.value = true;
  emit("visible");
  io?.disconnect();
  io = null;
};

onMounted(() => {
  if (props.eager) {
    emit("visible");
    return;
  }
  // very old browsers: just render
  if (typeof IntersectionObserver === "undefined") {
    show();
    return;
  }
  io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) show();
    },
    { rootMargin: props.rootMargin }
  );
  io.observe(el.value);
});
onBeforeUnmount(() => io?.disconnect());
</script>

<template>
  <div ref="el" class="lazy">
    <slot v-if="visible" />

    <div v-else class="sk" :class="variant" :style="{ minHeight: minHeight + 'px' }" aria-hidden="true">
      <!-- category section: heading, one card + a few rows -->
      <template v-if="variant === 'category'">
        <div class="sk-head"><span class="bar w30"></span><span class="bar w12"></span></div>
        <div class="sk-cat">
          <div class="sk-card">
            <span class="img"></span>
            <span class="bar w90"></span>
            <span class="bar w60"></span>
          </div>
          <div class="sk-rows">
            <div v-for="n in 4" :key="n" class="sk-row">
              <span class="thumb"></span>
              <div><span class="bar w90"></span><span class="bar w40"></span></div>
            </div>
          </div>
        </div>
      </template>

      <!-- special block: banner, dark pair, banner -->
      <template v-else-if="variant === 'featured'">
        <span class="banner-bar"></span>
        <div class="sk-dark">
          <span class="bar light w30"></span>
          <div class="sk-pair">
            <div><span class="img light"></span><span class="bar light w90"></span><span class="bar light w60"></span></div>
            <div><span class="img light"></span><span class="bar light w90"></span><span class="bar light w60"></span></div>
          </div>
        </div>
        <span class="banner-bar"></span>
      </template>

      <!-- anything else -->
      <template v-else>
        <span class="bar w30"></span>
        <span class="bar w90"></span>
        <span class="bar w90"></span>
        <span class="bar w60"></span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.sk { margin-bottom: 40px; display: flex; flex-direction: column; gap: 16px; box-sizing: border-box; }

/* shimmering shapes */
.bar, .img, .thumb, .banner-bar {
  display: block; border-radius: 4px;
  background: linear-gradient(90deg, #e9ecef 25%, #f4f6f8 37%, #e9ecef 63%);
  background-size: 400% 100%; animation: shimmer 1.4s ease infinite;
}
.bar { height: 14px; }
.bar.w12 { width: 12%; } .bar.w30 { width: 30%; } .bar.w40 { width: 40%; }
.bar.w60 { width: 60%; } .bar.w90 { width: 90%; }
.img { width: 100%; height: 200px; border-radius: 6px; }
.thumb { width: 96px; height: 68px; flex-shrink: 0; }
.banner-bar { width: 100%; max-width: 728px; height: 90px; margin: 0 auto; }

.sk-head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 3px double #d0d0d0; }
.sk-head .bar:first-child { height: 22px; }

.sk-cat { display: grid; grid-template-columns: 1fr 1.6fr; gap: 20px; }
.sk-card { display: flex; flex-direction: column; gap: 10px; }
.sk-rows { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px; align-content: start; }
.sk-row { display: flex; gap: 10px; }
.sk-row > div { flex: 1; display: flex; flex-direction: column; gap: 8px; padding-top: 4px; }

/* the dark "special" block */
.sk-dark { background: #00392b; border-top: 5px solid #f21b3f; padding: 22px 24px 26px; display: flex; flex-direction: column; gap: 16px; }
.sk-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.sk-pair > div { display: flex; flex-direction: column; gap: 10px; }
.sk-dark .img { height: 220px; }
.light { background: linear-gradient(90deg, rgba(255,255,255,.12) 25%, rgba(255,255,255,.2) 37%, rgba(255,255,255,.12) 63%); background-size: 400% 100%; }

@keyframes shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
@media (prefers-reduced-motion: reduce) {
  .bar, .img, .thumb, .banner-bar, .light { animation: none; }
}
@media (max-width: 1100px) {
  .sk-cat { grid-template-columns: 1fr; }
}
@media (max-width: 800px) {
  .sk-pair { grid-template-columns: 1fr; }
  .sk-rows { grid-template-columns: 1fr; }
}
</style>