<script setup>
import { computed, defineProps } from "vue";

// One link component for everything the editors can put in a menu:
// a page on this site (/politics), or an external address (https://..., mailto:, tel:).
const props = defineProps({
  to: { type: String, required: true },
  newTab: { type: Boolean, default: false },
});
const external = computed(() => /^(https?:|mailto:|tel:)/i.test(props.to));
</script>

<template>
  <a v-if="external" :href="to" :target="newTab ? '_blank' : null" :rel="newTab ? 'noopener noreferrer' : null"><slot /></a>
  <router-link v-else :to="to" :target="newTab ? '_blank' : null"><slot /></router-link>
</template>
