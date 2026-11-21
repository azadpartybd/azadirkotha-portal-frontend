import { ref } from "vue";

// Base URL of the Rust API. Put VITE_API_URL=https://api.yourportal.com in your .env for production.
const API = (process.env.VUE_APP_BASE_API_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

/**
 * Loads everything the header needs from ONE request: GET /api/header[?date=YYYY-MM-DD]
 *   site        { name, slogan, logo, logo_wordmark, favicon }
 *   menu        the main menu (items may have `children` = dropdown)
 *   categories  every active category (used by the search panel)
 *   featured    the three header stories, each with a ready-to-use `url`
 * Pass the past-day portal's date to get that day's featured stories; null/undefined = today.
 */
export function useHeaderData() {
  const site = ref({ name: "", slogan: "", logo: "", logo_wordmark: "", favicon: "" });
  const menu = ref([]);
  const categories = ref([]);
  const featured = ref([]);
  const loading = ref(false);
  const error = ref(null);
  let controller = null;

  async function load(date = null) {
    controller?.abort(); // a newer request wins (e.g. the user picks another day quickly)
    controller = new AbortController();
    loading.value = true;
    error.value = null;
    try {
      const url = new URL(`${API}/header`);
      if (date) url.searchParams.set("date", date);
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`Header request failed (${res.status})`);
      const data = await res.json();
      site.value = data.site;
      menu.value = data.menu;
      categories.value = data.categories;
      featured.value = data.featured;
    } catch (e) {
      if (e.name !== "AbortError") error.value = e;
    } finally {
      loading.value = false;
    }
  }

  return { site, menu, categories, featured, loading, error, load };
}
