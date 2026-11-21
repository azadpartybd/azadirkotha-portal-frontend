import { defineStore } from "pinia";
import axios from "axios";

let pending = null; // shared in-flight request, so header and footer never fetch twice

export const useSiteStore = defineStore("site", {
  state: () => ({
    menus: {},
    settings: {},
    loaded: false,
  }),
  actions: {
    async load() {
      if (this.loaded) return;
      if (!pending) {
        pending = (async () => {
          const base = process.env.VUE_APP_BASE_API_URL;
          const [m, s] = await Promise.allSettled([
            axios.get(base + "/menus"),
            axios.get(base + "/settings"),
          ]);
          if (m.status === "fulfilled") this.menus = m.value.data || {};
          if (s.status === "fulfilled") this.settings = s.value.data || {};
          this.loaded = true;
        })();
      }
      return pending;
    },
  },
});