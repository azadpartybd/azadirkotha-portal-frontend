// src/composables/usePortalDate.js
//
// Shared "which day's portal are we viewing?" state.
//   portalDate === null        -> today's (live) portal
//   portalDate === "YYYY-MM-DD" -> archived portal of that day
//
// The ref lives at module level, so every component that calls usePortalDate()
// sees the same value.
import { ref, computed } from "vue";

// Earliest date users can pick in the archive calendar. Change to your launch date.
export const ARCHIVE_START = "2026-01-01";

export const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const parseDateKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const todayKey = () => toDateKey(new Date());

const portalDate = ref(null);

export function usePortalDate() {
  const isArchive = computed(() => portalDate.value !== null);

  // Picking today's date is the same as going back to the live portal.
  const setPortalDate = (key) => {
    portalDate.value = key && key !== todayKey() ? key : null;
  };
  const resetToToday = () => {
    portalDate.value = null;
  };

  // Handy for API calls: axios.get('/news', { params: withDate({ page: 1 }) })
  const withDate = (params = {}) =>
    portalDate.value ? { ...params, date: portalDate.value } : params;

  return { portalDate, isArchive, setPortalDate, resetToToday, withDate };
}