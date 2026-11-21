<script setup>
import { defineProps, defineEmits } from "vue";
defineProps({
  label: { type: String, default: "" },
  subs: { type: Array, required: true },
  active: { type: String, default: "" },
});
defineEmits(["select"]);
</script>

<template>
  <nav class="subbar" :aria-label="label">
    <span class="label">{{ label }}</span>
    <div class="chips">
      <button :class="{ on: !active }" :aria-pressed="!active" @click="$emit('select', '')">সব</button>
      <button
        v-for="s in subs" :key="s.slug"
        :class="{ on: active === s.slug }" :aria-pressed="active === s.slug"
        @click="$emit('select', s.slug)"
      >{{ s.title }}</button>
    </div>
  </nav>
</template>

<style scoped>
/* rem sizes: scale with the root font-size on big monitors */
.subbar {
  display: flex; align-items: center; gap: 1rem;
  border-top: 1px solid #222; border-bottom: 1px solid #222; padding: 0.75rem 0; margin: 2.125rem 0 1.625rem;
}
.label { font-family: 'Noto Serif Bengali', serif; font-weight: 700; color: #006a4e; font-size: 0.9375rem; white-space: nowrap; }
.chips { min-width: 0; display: flex; gap: 0.5rem; overflow-x: auto; padding: 0.125rem; scrollbar-width: thin; }
button {
  font: inherit; font-size: 0.875rem; font-weight: 600; white-space: nowrap; cursor: pointer;
  padding: 0.375rem 1rem; border-radius: 50px; border: 1px solid #cfcfcf; background: #fff; color: #333;
  transition: all 0.2s;
}
button:hover { border-color: #006a4e; color: #006a4e; }
button.on { background: #006a4e; border-color: #006a4e; color: #fff; }
button:focus-visible { outline: 2px solid #f21b3f; outline-offset: 2px; }
@media (max-width: 700px) {
  .subbar { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  .chips { width: 100%; }
}
</style>