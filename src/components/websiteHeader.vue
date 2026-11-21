<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, defineEmits } from "vue";
import { useRouter } from "vue-router";
import MenuLink from "./MenuLink.vue";
import { useHeaderData } from "@/composables/useHeaderData";
import JournalistButtons from "./JournalistButtons.vue";
import {
  usePortalDate,
  ARCHIVE_START,
  toDateKey,
  parseDateKey,
  todayKey,
} from "@/composables/usePortalDate";

const emit = defineEmits(["date-change"]);

// Where the two journalist links go. Change these to your real routes.
const VERIFY_JOURNALIST_ROUTE = "/journalist/verify";
const JOIN_JOURNALIST_ROUTE = "/journalist/join";

/* =====================================================================
 * Data from the Rust API (GET /api/header): logo, name, menu, featured stories
 * (featured stories are no longer shown in the header, so `featured` is unused)
 * ===================================================================== */
const { site, menu, load: loadHeader } = useHeaderData();

// One menu definition, used by both the desktop navbar and the mobile menu.
// Items that have `children` become a dropdown.
const navItems = computed(() =>
  menu.value.map((m) => ({
    key: m.id,
    label: m.label,
    to: m.url,
    newTab: m.new_tab,
    children: (m.children || []).map((c) => ({ key: c.id, title: c.label, to: c.url, newTab: c.new_tab })),
  }))
);

/* =====================================================================
 * Menus + search
 * ===================================================================== */
const isMenuOpen = ref(false);
const isSearchOpen = ref(false); // desktop popup
const isMobileSearchOpen = ref(false); // tablet / phone panel
const searchQuery = ref("");
const searchInput = ref(null);
const mobileSearchInput = ref(null);
const searchWrap = ref(null);
const router = useRouter();

const activeDropdown = ref(null);
const openMobileSub = ref(null);
const isScrolled = ref(false);

const toggleSearch = async () => {
  isSearchOpen.value = !isSearchOpen.value;
  if (isSearchOpen.value) {
    await nextTick();
    searchInput.value?.focus();
  }
};
const toggleMobileSearch = async () => {
  isMobileSearchOpen.value = !isMobileSearchOpen.value;
  if (isMobileSearchOpen.value) {
    closeMobileMenu();
    await nextTick();
    mobileSearchInput.value?.focus();
  }
};
const closeSearch = () => {
  isSearchOpen.value = false;
  isMobileSearchOpen.value = false;
};
const submitSearch = (q = searchQuery.value) => {
  const query = String(q).trim();
  if (!query) return;
  searchQuery.value = query;
  closeSearch();
  closeMobileMenu();
  router.push({ path: "/search", query: { q: query } });
};
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) isMobileSearchOpen.value = false;
};
const toggleMobileSub = (key) => {
  openMobileSub.value = openMobileSub.value === key ? null : key;
};
const closeMobileMenu = () => {
  isMenuOpen.value = false;
  openMobileSub.value = null;
};
const closeOnOutside = (e) => {
  if (isSearchOpen.value && searchWrap.value && !searchWrap.value.contains(e.target)) {
    isSearchOpen.value = false;
  }
  if (isMobileSearchOpen.value && !e.target.closest?.(".mobile-search-panel, .mobile-search-btn")) {
    isMobileSearchOpen.value = false;
  }
};
// any navigation (menu, search result...) tidies up the open panels
router.afterEach(() => {
  closeSearch();
  closeMobileMenu();
});

/* =====================================================================
 * Past-day portal (archive)
 * ===================================================================== */
const { portalDate, isArchive, setPortalDate, resetToToday } = usePortalDate();

const fullDateFmt = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
const topbarDate = computed(() =>
  (portalDate.value ? parseDateKey(portalDate.value) : new Date()).toLocaleDateString("bn-BD", fullDateFmt)
);

const showModal = ref(false);
const viewYear = ref(new Date().getFullYear());
const viewMonth = ref(new Date().getMonth());
const weekdays = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];

const openModal = () => {
  const base = portalDate.value ? parseDateKey(portalDate.value) : new Date();
  viewYear.value = base.getFullYear();
  viewMonth.value = base.getMonth();
  showModal.value = true;
};
const closeModal = () => {
  showModal.value = false;
};

const monthLabel = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1).toLocaleDateString("bn-BD", { month: "long", year: "numeric" })
);

const cells = computed(() => {
  const y = viewYear.value;
  const m = viewMonth.value;
  const today = todayKey();
  const current = portalDate.value || today;
  const out = [];
  for (let i = 0; i < new Date(y, m, 1).getDay(); i++) out.push(null);
  for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
    const key = toDateKey(new Date(y, m, d));
    out.push({
      key,
      label: d.toLocaleString("bn-BD"),
      disabled: key > today || key < ARCHIVE_START,
      selected: key === current,
      isToday: key === today,
    });
  }
  return out;
});

const canPrev = computed(() => toDateKey(new Date(viewYear.value, viewMonth.value, 0)) >= ARCHIVE_START);
const canNext = computed(() => toDateKey(new Date(viewYear.value, viewMonth.value + 1, 1)) <= todayKey());
const goMonth = (delta) => {
  if ((delta < 0 && !canPrev.value) || (delta > 0 && !canNext.value)) return;
  const d = new Date(viewYear.value, viewMonth.value + delta, 1);
  viewYear.value = d.getFullYear();
  viewMonth.value = d.getMonth();
};

const quickPicks = computed(() => {
  const mk = (label, daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const key = toDateKey(d);
    return { label, key, disabled: key < ARCHIVE_START };
  };
  return [mk("গতকাল", 1), mk("২ দিন আগে", 2), mk("৭ দিন আগে", 7)];
});

const pickDate = (cell) => {
  if (!cell || cell.disabled) return;
  setPortalDate(cell.key);
  emit("date-change", portalDate.value);
  closeModal();
};
const backToToday = () => {
  resetToToday();
  emit("date-change", null);
  closeMobileMenu();
};
const onArchiveClick = () => {
  closeMobileMenu();
  if (isArchive.value) backToToday();
  else openModal();
};

// the header data follows the selected day
watch(portalDate, (d) => loadHeader(d || null));

// lock page scroll while the modal is open
watch(showModal, (open) => {
  document.body.style.overflow = open ? "hidden" : "";
});
const onKeydown = (e) => {
  if (e.key !== "Escape") return;
  if (showModal.value) closeModal();
  closeSearch();
};

/* =====================================================================
 * Scroll handling
 *
 * The header collapses after just a few pixels of scrolling and only
 * expands again when the user is back at the very top.
 *
 * Collapsing shrinks the page layout; browsers' scroll-anchoring then used to
 * "compensate" by moving scrollY back up, which re-expanded the header and
 * made it bounce. Scroll anchoring is disabled for the page (see the
 * unscoped <style> block at the bottom), and a short cooldown after each
 * change ignores any layout-induced scroll events while the transition runs.
 * ===================================================================== */
const COLLAPSE_AT = 8;
const EXPAND_AT = 2;
const COOLDOWN_MS = 380;
let ticking = false;
let lockUntil = 0;
let recheckTimer = null;

const updateScrolled = () => {
  ticking = false;
  if (performance.now() < lockUntil) return;
  const y = window.scrollY;
  const next = isScrolled.value ? y > EXPAND_AT : y > COLLAPSE_AT;
  if (next !== isScrolled.value) {
    isScrolled.value = next;
    lockUntil = performance.now() + COOLDOWN_MS;
    clearTimeout(recheckTimer);
    recheckTimer = setTimeout(updateScrolled, COOLDOWN_MS + 20);
  }
};
const handleScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateScrolled);
};
onMounted(() => {
  loadHeader(portalDate.value || null);
  window.addEventListener("scroll", handleScroll, { passive: true });
  document.addEventListener("click", closeOnOutside);
  window.addEventListener("keydown", onKeydown);
  updateScrolled();
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  document.removeEventListener("click", closeOnOutside);
  window.removeEventListener("keydown", onKeydown);
  clearTimeout(recheckTimer);
  document.body.style.overflow = "";
});
</script>

<template>
  <header class="news-header" :class="{ scrolled: isScrolled }">
    <!-- Topbar (collapses smoothly via grid-template-rows) -->
    <div class="collapse-wrap topbar-wrap" :class="{ collapsed: isScrolled }" :aria-hidden="isScrolled">
      <div class="collapse-inner">
        <div class="topbar">
          <div class="container">
            <div class="topbar-left">
              <span class="date" :class="{ archive: isArchive }">
                📅 {{ topbarDate }}<template v-if="isArchive"> • আর্কাইভ</template>
              </span>
            </div>

            <!-- the past-day button sits in the middle -->
            <div class="topbar-center">
              <button
                type="button"
                class="archive-btn"
                :class="{ back: isArchive }"
                :tabindex="isScrolled ? -1 : 0"
                @click="onArchiveClick"
              >
                {{ isArchive ? "আজকে পোর্টালে ফেরত যান" : "বিগত দিনের পোর্টাল দেখুন" }}
              </button>
            </div>

            <div class="topbar-right">
              <JournalistButtons />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Brand: centered and prominent.
         Desktop: collapses away on scroll. Tablet/mobile: stays (holds the menu + search buttons) and just shrinks. -->
    <div class="collapse-wrap main-wrap" :class="{ collapsed: isScrolled }">
      <div class="collapse-inner">
        <div class="main-header">
          <div class="container">
            <div class="header-content">
              <!-- tablet / phone: menu button (left) -->
              <button class="menu-toggle" :aria-expanded="isMenuOpen" aria-label="মেনু" @click="toggleMenu">
                <span></span><span></span><span></span>
              </button>

              <router-link to="/" class="brand" :title="site.slogan || site.name">
                <div class="brand-row">
                  <span v-if="site.logo" class="brand-icon"><img :src="site.logo" :alt="site.name" /></span>
                  <span v-if="site.logo_wordmark" class="brand-wordmark"><img :src="site.logo_wordmark" :alt="site.name" /></span>
                  <span v-else class="brand-wordmark brand-name">{{ site.name }}</span>
                </div>
                <span v-if="site.slogan" class="brand-slogan">{{ site.slogan }}</span>
              </router-link>

              <!-- tablet / phone: search button (right) -->
              <button
                class="mobile-search-btn"
                :class="{ active: isMobileSearchOpen }"
                :aria-expanded="isMobileSearchOpen"
                aria-label="অনুসন্ধান"
                @click="toggleMobileSearch"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Navigation: centered. Few items stay in a tight centered group;
         as more are added they grow to share the row evenly, then wrap centered. -->
    <nav class="navbar">
      <div class="container">
        <div class="nav-wrapper">
          <template v-for="item in navItems" :key="item.key">
            <!-- with dropdown -->
            <div
              v-if="item.children.length"
              class="nav-item"
              @mouseenter="activeDropdown = item.key"
              @mouseleave="activeDropdown = null"
            >
              <MenuLink :to="item.to" :new-tab="item.newTab" class="nav-link">
                <span>{{ item.label }}</span>
                <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </MenuLink>
              <transition name="dropdown-fade">
                <div v-if="activeDropdown === item.key" class="dropdown">
                  <MenuLink v-for="c in item.children" :key="c.key" :to="c.to" :new-tab="c.newTab" class="dropdown-item">
                    {{ c.title }}
                  </MenuLink>
                </div>
              </transition>
            </div>

            <!-- plain link -->
            <MenuLink v-else :to="item.to" :new-tab="item.newTab" class="nav-link">
              <span>{{ item.label }}</span>
            </MenuLink>
          </template>

          <!-- Search: sits in the same centered row as the menu items -->
          <div ref="searchWrap" class="nav-search">
            <button
              class="nav-search-btn"
              :class="{ active: isSearchOpen }"
              aria-label="অনুসন্ধান"
              :aria-expanded="isSearchOpen"
              @click="toggleSearch"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>

            <transition name="dropdown-fade">
              <div v-if="isSearchOpen" class="search-pop" role="dialog" aria-label="খবর খুঁজুন">
                <form class="search-form" @submit.prevent="submitSearch()">
                  <input
                    ref="searchInput"
                    v-model="searchQuery"
                    type="text"
                    placeholder="খবর, প্রার্থী কিংবা পার্টি খুঁজুন ..."
                    @keydown.esc="isSearchOpen = false"
                  />
                  <button type="submit" class="search-go">খুঁজুন</button>
                </form>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </nav>

    <!-- Tablet / phone search panel (input + button only) -->
    <transition name="mobile-slide">
      <div v-if="isMobileSearchOpen" class="mobile-search-panel" role="dialog" aria-label="খবর খুঁজুন">
        <form class="search-form" @submit.prevent="submitSearch()">
          <input
            ref="mobileSearchInput"
            v-model="searchQuery"
            type="search"
            placeholder="খবর, প্রার্থী কিংবা পার্টি খুঁজুন ..."
            @keydown.esc="isMobileSearchOpen = false"
          />
          <button type="submit" class="search-go">খুঁজুন</button>
        </form>
      </div>
    </transition>

    <!-- Mobile Menu (same items as desktop, dropdowns expand on tap) -->
    <transition name="mobile-slide">
      <div v-if="isMenuOpen" class="mobile-menu">
        <button type="button" class="mobile-archive" :class="{ back: isArchive }" @click="onArchiveClick">
          📅 {{ isArchive ? "আজকে পোর্টালে ফেরত যান" : "বিগত দিনের পোর্টাল দেখুন" }}
        </button>

        <template v-for="item in navItems" :key="item.key">
          <div v-if="item.children.length" class="mobile-group">
            <div class="mobile-row">
              <MenuLink :to="item.to" :new-tab="item.newTab" class="mobile-nav-link" @click="closeMobileMenu">
                {{ item.label }}
              </MenuLink>
              <button
                class="sub-toggle"
                :class="{ open: openMobileSub === item.key }"
                :aria-expanded="openMobileSub === item.key"
                :aria-label="item.label + ' উপমেনু'"
                @click="toggleMobileSub(item.key)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <transition name="sub-slide">
              <div v-if="openMobileSub === item.key" class="mobile-sub">
                <MenuLink v-for="c in item.children" :key="c.key" :to="c.to" :new-tab="c.newTab" class="mobile-sub-link" @click="closeMobileMenu">
                  {{ c.title }}
                </MenuLink>
              </div>
            </transition>
          </div>

          <MenuLink v-else :to="item.to" :new-tab="item.newTab" class="mobile-nav-link" @click="closeMobileMenu">
            {{ item.label }}
          </MenuLink>
        </template>

        <div class="mobile-journalist">
          <router-link :to="VERIFY_JOURNALIST_ROUTE" class="mobile-nav-link" @click="closeMobileMenu">সাংবাদিক যাচাই করুন</router-link>
          <router-link :to="JOIN_JOURNALIST_ROUTE" class="mobile-nav-link" @click="closeMobileMenu">সাংবাদিক হিসেবে যুক্ত হোন</router-link>
        </div>
      </div>
    </transition>

    <!-- Date picker modal (teleported to <body> so the sticky header can't clip it) -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
          <div class="modal" role="dialog" aria-modal="true" aria-labelledby="archive-title">
            <button type="button" class="modal-close" aria-label="বন্ধ করুন" @click="closeModal">✕</button>
            <h3 id="archive-title" class="modal-title">📰 বিগত দিনের পোর্টাল</h3>
            <p class="modal-sub">যে তারিখের পোর্টাল দেখতে চান, সেটি বেছে নিন</p>

            <div class="quick-row">
              <button
                v-for="q in quickPicks"
                :key="q.label"
                type="button"
                class="quick-chip"
                :disabled="q.disabled"
                @click="pickDate(q)"
              >{{ q.label }}</button>
            </div>

            <div class="cal-head">
              <button type="button" class="cal-nav" :disabled="!canPrev" aria-label="আগের মাস" @click="goMonth(-1)">‹</button>
              <div class="cal-month">{{ monthLabel }}</div>
              <button type="button" class="cal-nav" :disabled="!canNext" aria-label="পরের মাস" @click="goMonth(1)">›</button>
            </div>

            <div class="cal-grid cal-weekdays">
              <span v-for="w in weekdays" :key="w">{{ w }}</span>
            </div>
            <div class="cal-grid">
              <template v-for="(cell, i) in cells" :key="i">
                <span v-if="!cell" class="cal-empty"></span>
                <button
                  v-else
                  type="button"
                  class="cal-day"
                  :class="{ selected: cell.selected, today: cell.isToday }"
                  :disabled="cell.disabled"
                  @click="pickDate(cell)"
                >{{ cell.label }}</button>
              </template>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </header>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

/* All sizes are in rem so the header scales with the root font-size on big monitors.
   Media-query breakpoints stay in px on purpose. */

* { margin: 0; padding: 0; box-sizing: border-box; }

.news-header {
  width: 100%; position: sticky; top: 0; z-index: 1000;
  background: #fff; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}
.container { max-width: 87.5rem; margin: 0 auto; padding: 0 1.25rem; }

/* ---------- Smooth collapse (animates real height, no display:none) ---------- */
.collapse-wrap {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.collapse-wrap.collapsed { grid-template-rows: 0fr; }
.collapse-inner {
  min-height: 0;
  overflow: hidden;
  transition: opacity 0.25s ease;
}
.collapse-wrap.collapsed .collapse-inner { opacity: 0; }

/* Scrolled state */
.news-header.scrolled { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
.news-header.scrolled .navbar { padding: 0.25rem 0; }

/* Topbar: date (left) · past-day button (centre) · journalist links (right).
   White like the header, with a thin divider so it still reads as its own strip. */
.topbar {
  background: #fff;
  border-bottom: 1px solid #eee;
  color: #333; font-size: 0.8125rem; padding: 0.5rem 0; font-family: 'Inter', sans-serif;
}
.topbar .container {
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 0.75rem;
}
.topbar-left { min-width: 0; }
.topbar-center { display: flex; justify-content: center; }
.topbar-right { display: flex; align-items: center; justify-content: flex-end; gap: 0.25rem; min-width: 0; }
.date { font-weight: 500; color: #555; }
.date.archive { font-weight: 700; color: #c62828; }
.topbar-link, .admin-link {
  color: #333; text-decoration: none; font-weight: 600; white-space: nowrap;
  padding: 0.25rem 0.625rem; border-radius: 4px; transition: background 0.3s, color 0.3s;
}
.topbar-link:hover, .admin-link:hover { background: #fdecec; color: #c62828; }
.topbar-link:focus-visible { outline: 2px solid #c62828; outline-offset: 2px; }

/* Same box as the links (padding 4px, no border, no extra line-height) so the topbar keeps its height.
   The outline is drawn with an inset box-shadow, which takes no space.
   Default: red text with a red outline. Back-to-today state: solid red with white text. */
.archive-btn {
  font-family: inherit; font-size: 0.75rem; font-weight: 600; white-space: nowrap; cursor: pointer;
  line-height: normal; margin: 0; border: 0; border-radius: 50px; padding: 0.25rem 0.875rem;
  color: #c62828; background: #fff;
  box-shadow: inset 0 0 0 1px #c62828;
  transition: background 0.25s, color 0.25s;
}
.archive-btn:hover { background: #c62828; color: #fff; }
.archive-btn.back { background: #c62828; color: #fff; box-shadow: none; }
.archive-btn.back:hover { background: #b71c1c; }
.archive-btn:focus-visible { outline: 2px solid #c62828; outline-offset: 2px; }

/* ---------- Brand (centered, prominent) ---------- */
.main-header {
  background: #fff; padding: 1.5rem 0 1.25rem; border-bottom: 1px solid #e0e0e0;
  transition: padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.header-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-areas: "menu brand search";
  align-items: center;
  gap: 1rem;
}
.brand {
  grid-area: brand;
  justify-self: center;
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  text-decoration: none; min-width: 0; text-align: center;
}
.brand-row { display: flex; align-items: center; justify-content: center; gap: 1rem; min-width: 0; }
.brand-icon, .brand-wordmark { display: block; min-width: 0; }
.brand img { max-width: 100%; width: auto; display: block; object-fit: contain; transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.brand-icon img { height: 5rem; }
.brand-wordmark img { height: 5.5rem; }
.brand-name {
  font-family: 'Playfair Display', serif; font-size: 3rem; font-weight: 700;
  color: #c62828; line-height: 1.1; letter-spacing: -0.5px; white-space: nowrap;
}
.brand-slogan {
  font-family: 'Inter', sans-serif; font-size: 0.8125rem; font-weight: 500; color: #666;
  letter-spacing: 0.08em; text-transform: uppercase; max-height: 3rem; overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.25s ease;
}

/* Mobile buttons */
.menu-toggle {
  grid-area: menu; justify-self: start;
  flex-shrink: 0; display: none; flex-direction: column; gap: 0.3125rem; background: none; border: none; cursor: pointer; padding: 0.5rem;
}
.menu-toggle span { width: 1.5625rem; height: 3px; background: #333; border-radius: 2px; transition: all 0.3s; }
.mobile-search-btn {
  grid-area: search; justify-self: end;
  flex-shrink: 0; display: none; align-items: center; justify-content: center;
  background: none; border: none; cursor: pointer; padding: 0.5rem; color: #333; border-radius: 8px;
}
.mobile-search-btn svg { width: 1.375rem; height: 1.375rem; }
.mobile-search-btn.active { color: #c62828; background: #fdecec; }

/* ---------- Navigation Bar: centered, spreads as items grow ---------- */
.navbar {
  background: #fff; border-bottom: 3px solid #c62828; font-family: 'Inter', sans-serif;
  transition: padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
/* The row is only as wide as its items (fit-content) and centered, so a short menu
   stays a tight group with no extra gaps. Once the items need more than the available
   width, the row fills the container and the items grow to share it evenly. */
.nav-wrapper {
  display: flex; align-items: stretch; justify-content: center; flex-wrap: wrap; gap: 0;
  width: fit-content; max-width: 100%; margin: 0 auto;
}
.nav-link, .nav-item {
  position: relative; display: flex; align-items: center; justify-content: center; gap: 0.375rem;
  flex: 1 1 auto;
  padding: 1rem 0.875rem; text-decoration: none; color: #333; text-align: center;
  font-weight: 600; font-size: 0.875rem; transition: all 0.3s;
  border-bottom: 3px solid transparent;
}
/* the link inside a dropdown item should fill it, not nest another padded box */
.nav-item > .nav-link { flex: 1 1 auto; max-width: none; padding: 0; border-bottom: 0; background: none; }
.nav-item:hover { color: #c62828; background: #f8f8f8; border-bottom-color: #c62828; }
.nav-link:hover { color: #c62828; background: #f8f8f8; border-bottom-color: #c62828; }
.nav-item > .nav-link:hover { background: none; }
.chevron { width: 0.875rem; height: 0.875rem; margin-left: 2px; flex-shrink: 0; transition: transform 0.3s; }
.nav-item:hover .chevron { transform: rotate(180deg); }

/* Search icon: part of the same centered row */
.nav-search { position: relative; flex: 0 0 auto; display: flex; align-items: center; padding: 0 0.5rem; }
.nav-search-btn {
  background: #c62828; color: #fff; border: 0; border-radius: 50%;
  width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.3s;
}
.nav-search-btn svg { width: 1.125rem; height: 1.125rem; }
.nav-search-btn:hover, .nav-search-btn.active { background: #b71c1c; }
.nav-search-btn:focus-visible { outline: 2px solid #333; outline-offset: 2px; }

.search-pop {
  position: absolute; top: calc(100% + 0.5rem); right: 0; width: 23.75rem; max-width: 90vw;
  background: #fff; border-top: 3px solid #c62828; border-radius: 8px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18); padding: 0.875rem; z-index: 110;
}
.search-form { display: flex; gap: 0.5rem; }
.search-form input {
  flex: 1; min-width: 0; padding: 0.5625rem 0.875rem; border: 2px solid #e0e0e0; border-radius: 50px;
  font-size: 0.8125rem; font-family: inherit; outline: none; transition: border-color 0.3s;
}
.search-form input:focus { border-color: #c62828; }
.search-go {
  background: #c62828; color: #fff; border: 0; border-radius: 50px; padding: 0 1rem;
  font-family: inherit; font-weight: 600; font-size: 0.8125rem; cursor: pointer;
}
.search-go:hover { background: #b71c1c; }

/* Desktop dropdown (plain list of names), centered under its parent */
.dropdown {
  position: absolute; top: 100%; left: 50%; margin-left: -6.5rem; background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); border-radius: 8px;
  width: 13rem; padding: 0.375rem; z-index: 100; border-top: 3px solid #c62828;
}
.dropdown-item {
  display: block; padding: 0.625rem 0.875rem; white-space: nowrap; text-align: left;
  text-decoration: none; color: #333; font-weight: 600; font-size: 0.8125rem;
  border-radius: 6px; transition: background 0.3s, color 0.3s;
}
.dropdown-item:hover { background: #f8f8f8; color: #c62828; }
.dropdown-fade-enter-active, .dropdown-fade-leave-active { transition: all 0.3s ease; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* Tablet / phone search panel */
.mobile-search-panel {
  display: none; background: #f9f9f9; border-top: 1px solid #e0e0e0; border-bottom: 3px solid #c62828;
  padding: 0.75rem 1.25rem 0.875rem; font-family: 'Inter', sans-serif;
}
.mobile-search-panel .search-form input { padding: 0.6875rem 1rem; font-size: 0.875rem; }
.mobile-search-panel .search-go { padding: 0 1.125rem; }

/* Mobile menu */
.mobile-menu {
  background: #f9f9f9; border-top: 1px solid #e0e0e0; padding: 0.75rem 0;
  max-height: calc(100vh - 90px); overflow-y: auto; font-family: 'Inter', sans-serif;
}

.mobile-archive {
  display: block; width: calc(100% - 2.5rem); margin: 0 1.25rem 0.5rem; padding: 0.6875rem 1rem;
  font-family: 'Inter', sans-serif; font-size: 0.875rem; font-weight: 600; cursor: pointer;
  color: #c62828; background: #fff; border: 2px solid #c62828; border-radius: 50px;
}
.mobile-archive.back { color: #fff; background: #c62828; }

.mobile-row { display: flex; align-items: stretch; }
.mobile-row .mobile-nav-link { flex: 1; }
.mobile-nav-link {
  display: flex; align-items: center; padding: 0.875rem 1.25rem;
  text-decoration: none; color: #333; font-weight: 500; font-size: 0.9375rem;
  border-left: 3px solid transparent; transition: all 0.3s;
}
.mobile-nav-link:hover { background: #fff; border-left-color: #c62828; color: #c62828; }

.sub-toggle {
  width: 3.25rem; background: none; border: 0; border-left: 1px solid #e8e8e8;
  color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.sub-toggle svg { width: 1.125rem; height: 1.125rem; transition: transform 0.3s; }
.sub-toggle.open { color: #c62828; }
.sub-toggle.open svg { transform: rotate(180deg); }

.mobile-sub { background: #fff; border-left: 3px solid #c62828; margin-left: 1.25rem; overflow: hidden; }
.mobile-sub-link {
  display: block; padding: 0.75rem 1rem; font-size: 0.875rem; font-weight: 500;
  text-decoration: none; color: #333; border-bottom: 1px solid #f0f0f0;
}
.mobile-sub-link:last-child { border-bottom: 0; }
.mobile-sub-link:hover { background: #f8f8f8; color: #c62828; }

.mobile-journalist { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #e8e8e8; }

.mobile-slide-enter-active, .mobile-slide-leave-active { transition: all 0.3s ease; }
.mobile-slide-enter-from, .mobile-slide-leave-to { opacity: 0; transform: translateY(-20px); }
.sub-slide-enter-active, .sub-slide-leave-active { transition: all 0.25s ease; max-height: 600px; }
.sub-slide-enter-from, .sub-slide-leave-to { opacity: 0; max-height: 0; }

/* ---------- Date picker modal ---------- */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 2000; background: rgba(0, 0, 0, 0.55);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
  font-family: 'Inter', sans-serif;
}
.modal {
  position: relative; width: 100%; max-width: 23.75rem; background: #fff; border-radius: 14px;
  border-top: 4px solid #c62828; padding: 1.375rem 1.25rem 1.25rem; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}
.modal-close {
  position: absolute; top: 0.625rem; right: 0.75rem; width: 2rem; height: 2rem; border: 0; border-radius: 50%;
  background: #f3f3f3; color: #444; cursor: pointer; font-size: 0.875rem; transition: background 0.2s;
}
.modal-close:hover { background: #e4e4e4; }
.modal-title { font-size: 1.125rem; color: #222; margin-bottom: 0.25rem; padding-right: 2.25rem; }
.modal-sub { font-size: 0.8125rem; color: #777; margin-bottom: 0.875rem; }

.quick-row { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-bottom: 1rem; }
.quick-chip {
  font-family: inherit; font-size: 0.75rem; font-weight: 600; color: #c62828; background: #fdecec;
  border: 0; border-radius: 50px; padding: 0.375rem 0.875rem; cursor: pointer; transition: all 0.2s;
}
.quick-chip:hover:not(:disabled) { background: #c62828; color: #fff; }
.quick-chip:disabled { opacity: 0.4; cursor: not-allowed; }

.cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.cal-month { font-weight: 700; font-size: 0.9375rem; color: #222; }
.cal-nav {
  width: 2rem; height: 2rem; border: 0; border-radius: 50%; background: #f3f3f3; color: #333;
  font-size: 1.25rem; line-height: 1; cursor: pointer; transition: background 0.2s;
}
.cal-nav:hover:not(:disabled) { background: #c62828; color: #fff; }
.cal-nav:disabled { opacity: 0.35; cursor: not-allowed; }

.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; }
.cal-weekdays { margin-bottom: 0.25rem; }
.cal-weekdays span { text-align: center; font-size: 0.6875rem; font-weight: 600; color: #888; padding: 0.25rem 0; }
.cal-empty { height: 2.375rem; }
.cal-day {
  height: 2.375rem; border: 2px solid transparent; border-radius: 8px; background: transparent;
  font-family: inherit; font-size: 0.875rem; font-weight: 500; color: #333; cursor: pointer; transition: all 0.15s;
}
.cal-day:hover:not(:disabled) { background: #fdecec; color: #c62828; }
.cal-day.today { border-color: #c62828; }
.cal-day.selected { background: #c62828; color: #fff; font-weight: 700; }
.cal-day:disabled { color: #ccc; cursor: not-allowed; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-active .modal, .modal-fade-leave-active .modal { transition: transform 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal, .modal-fade-leave-to .modal { transform: translateY(16px) scale(0.97); }

/* Respect reduced-motion preferences */
@media (prefers-reduced-motion: reduce) {
  .collapse-wrap, .collapse-inner, .main-header, .navbar, .brand img, .brand-slogan { transition: none; }
}

/* Responsive */
@media (max-width: 1024px) {
  .navbar { display: none; }
  .menu-toggle, .mobile-search-btn { display: flex; }
  .mobile-search-panel { display: block; }
  .main-header { padding: 0.875rem 0; }
  .brand-icon img { height: 3.25rem; }
  .brand-wordmark img { height: 3.75rem; }
  .brand-name { font-size: 2.25rem; }
  .brand-row { gap: 0.625rem; }

  /* On mobile/tablet the brand row never disappears (it holds the buttons):
     it stays in the layout and shrinks while scrolling. */
  .main-wrap.collapsed { grid-template-rows: 1fr; }
  .main-wrap.collapsed .collapse-inner { opacity: 1; }
  .news-header.scrolled .main-header { padding: 0.5rem 0; }
  .news-header.scrolled .brand-slogan { max-height: 0; opacity: 0; }
  .news-header.scrolled .brand { gap: 0; }
  .news-header.scrolled .brand-icon img { height: 2rem; }
  .news-header.scrolled .brand-wordmark img { height: 2.25rem; }
  .news-header.scrolled .brand-name { font-size: 1.5rem; }
}
@media (max-width: 900px) {
  .topbar-left { display: none; }
  .topbar .container { grid-template-columns: auto 1fr; }
}
@media (max-width: 768px) {
  /* the past-day button lives in the mobile menu here; the two journalist links share the bar */
  .topbar-center { display: none; }
  .topbar .container { grid-template-columns: 1fr; }
  .topbar-right { justify-content: space-between; }
  .main-header { padding: 0.625rem 0; }
  .brand-icon img { height: 2.75rem; }
  .brand-wordmark img { height: 3.25rem; }
  .brand-name { font-size: 1.875rem; }
  .brand-slogan { font-size: 0.6875rem; }
}
@media (max-width: 480px) {
  .brand-icon img { height: 2.25rem; }
  .brand-wordmark img { height: 2.75rem; }
  .brand-name { font-size: 1.5rem; }
  .brand-row { gap: 0.375rem; }
  .brand-slogan { display: none; }
  .header-content { gap: 0.25rem; }
  .mobile-search-btn, .menu-toggle { padding: 0.375rem; }
  .topbar { font-size: 0.75rem; }
  .topbar-link { padding: 0.25rem 0.375rem; }
}
</style>

<!-- Unscoped: stops the browser from "correcting" scrollY when the header
     changes height, which was what made the header bounce back to the top. -->
<style>
html { overflow-anchor: none; }
</style>