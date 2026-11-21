<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, defineEmits } from "vue";
import { useRouter } from "vue-router";
import HeaderHighlights from "./HeaderHighlights.vue";
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
 * Data from the Rust API (GET /api/header): logo, name, menu, categories, featured stories
 * ===================================================================== */
const { site, menu, categories, featured, load: loadHeader } = useHeaderData();

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
// any navigation (menu, category chip, search result...) tidies up the open panels
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

// the header's featured stories follow the selected day
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

    <!-- Main Header: logo + three highlighted news
         Desktop: collapses away on scroll. Tablet/mobile: stays (holds the menu + search buttons) and just shrinks. -->
    <div class="collapse-wrap main-wrap" :class="{ collapsed: isScrolled }">
      <div class="collapse-inner">
        <div class="main-header">
          <div class="container">
            <div class="header-content">
              <router-link to="/" class="logo" :title="site.slogan || site.name">
                <div class="logo-content">
                  <span v-if="site.logo" class="logo-icon"><img :src="site.logo" :alt="site.name" /></span>
                  <div class="logo-text">
                    <span v-if="site.logo_wordmark" class="logo-main"><img :src="site.logo_wordmark" :alt="site.name" /></span>
                    <span v-else class="logo-main logo-name">{{ site.name }}</span>
                  </div>
                </div>
              </router-link>

              <HeaderHighlights :items="featured" />

              <!-- tablet / phone: search + menu buttons -->
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
              <button class="menu-toggle" :aria-expanded="isMenuOpen" aria-label="মেনু" @click="toggleMenu">
                <span></span><span></span><span></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Navigation (plain text, no icons) -->
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

          <!-- Search: compact popup anchored to the icon -->
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
                <div v-if="categories.length" class="search-tags">
                  <span class="tags-label">বিভাগ:</span>
                  <MenuLink v-for="c in categories" :key="c.id" :to="c.url" class="tag" @click="isSearchOpen = false">
                    {{ c.name }}
                  </MenuLink>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </nav>

    <!-- Tablet / phone search panel -->
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
        <div v-if="categories.length" class="search-tags">
          <span class="tags-label">বিভাগ:</span>
          <MenuLink v-for="c in categories" :key="c.id" :to="c.url" class="tag">{{ c.name }}</MenuLink>
        </div>
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

* { margin: 0; padding: 0; box-sizing: border-box; }

.news-header {
  width: 100%; position: sticky; top: 0; z-index: 1000;
  background: #fff; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}
.container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }

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
.news-header.scrolled .navbar { padding: 8px 0; }
.news-header.scrolled .nav-link,
.news-header.scrolled .nav-item { padding: 8px 9px; }

/* Topbar: date (left) · past-day button (centre) · journalist links (right) */
.topbar {
  background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
  color: #fff; font-size: 13px; padding: 8px 0; font-family: 'Inter', sans-serif;
}
.topbar .container {
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px;
}
.topbar-left { min-width: 0; }
.topbar-center { display: flex; justify-content: center; }
.topbar-right { display: flex; align-items: center; justify-content: flex-end; gap: 4px; min-width: 0; }
.date { font-weight: 500; }
.date.archive { font-weight: 700; }
.topbar-link, .admin-link {
  color: #fff; text-decoration: none; font-weight: 600; white-space: nowrap;
  padding: 4px 10px; border-radius: 4px; transition: background 0.3s;
}
.topbar-link:hover, .admin-link:hover { background: rgba(255, 255, 255, 0.2); }
.topbar-link:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

/* Same box as the links (padding 4px, no border, no extra line-height) so the topbar keeps its height.
   The outline is drawn with an inset box-shadow, which takes no space. */
.archive-btn {
  font-family: inherit; font-size: 12px; font-weight: 600; white-space: nowrap; cursor: pointer;
  line-height: normal; margin: 0; border: 0; border-radius: 50px; padding: 4px 14px;
  color: #fff; background: rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  transition: background 0.25s, color 0.25s;
}
.archive-btn:hover { background: #fff; color: #b71c1c; }
.archive-btn.back { background: #fff; color: #b71c1c; box-shadow: none; }
.archive-btn.back:hover { background: #ffe9e9; }
.archive-btn:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

/* Main Header */
.main-header {
  background: #fff; padding: 16px 0; border-bottom: 1px solid #e0e0e0;
  transition: padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.header-content { display: flex; align-items: center; justify-content: space-between; gap: 24px; }

.logo { text-decoration: none; display: flex; align-items: center; flex-shrink: 1; min-width: 0; margin-right: 16px; }
.logo-content { display: flex; align-items: center; gap: 12px; min-width: 0; }
.logo-icon, .logo-main { display: block; min-width: 0; }
.logo-content > * { min-width: 0; }
.logo img { max-width: 100%; width: auto; display: block; object-fit: contain; transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.logo-icon img { height: 70px; }
.logo-main img { height: 80px; }
.logo-icon { font-size: 36px; }
.logo-text { display: flex; flex-direction: column; }
.logo-main { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #c62828; line-height: 1; letter-spacing: -0.5px; }
.logo-name { white-space: nowrap; }

/* Mobile buttons */
.menu-toggle { flex-shrink: 0; display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 8px; }
.menu-toggle span { width: 25px; height: 3px; background: #333; border-radius: 2px; transition: all 0.3s; }
.mobile-search-btn {
  flex-shrink: 0; display: none; align-items: center; justify-content: center;
  background: none; border: none; cursor: pointer; padding: 8px; color: #333; border-radius: 8px;
}
.mobile-search-btn.active { color: #c62828; background: #fdecec; }

/* Navigation Bar */
.navbar {
  background: #fff; border-bottom: 3px solid #c62828; font-family: 'Inter', sans-serif;
  transition: padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.nav-wrapper { display: flex; align-items: center; gap: 8px; }
.nav-link, .nav-item {
  position: relative; display: flex; align-items: center; gap: 6px;
  padding: 16px 9px; text-decoration: none; color: #333;
  font-weight: 600; font-size: 13px; transition: all 0.3s;
  border-bottom: 3px solid transparent;
}
.nav-link:hover { color: #c62828; background: #f8f8f8; border-bottom-color: #c62828; }
.chevron { margin-left: 2px; flex-shrink: 0; transition: transform 0.3s; }
.nav-item:hover .chevron { transform: rotate(180deg); }

/* Navbar search: icon + popup */
.nav-search { margin-left: auto; position: relative; }
.nav-search-btn {
  background: #c62828; color: #fff; border: 0; border-radius: 50%;
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.3s;
}
.nav-search-btn:hover, .nav-search-btn.active { background: #b71c1c; }
.nav-search-btn:focus-visible { outline: 2px solid #333; outline-offset: 2px; }

.search-pop {
  position: absolute; top: calc(100% + 10px); right: 0; width: 380px;
  background: #fff; border-top: 3px solid #c62828; border-radius: 8px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18); padding: 14px; z-index: 110;
}
.search-form { display: flex; gap: 8px; }
.search-form input {
  flex: 1; min-width: 0; padding: 9px 14px; border: 2px solid #e0e0e0; border-radius: 50px;
  font-size: 13px; font-family: inherit; outline: none; transition: border-color 0.3s;
}
.search-form input:focus { border-color: #c62828; }
.search-go {
  background: #c62828; color: #fff; border: 0; border-radius: 50px; padding: 0 16px;
  font-family: inherit; font-weight: 600; font-size: 13px; cursor: pointer;
}
.search-go:hover { background: #b71c1c; }
.search-tags { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 12px; max-height: 160px; overflow-y: auto; }
.tags-label { font-size: 12px; color: #777; margin-right: 2px; }
.tag {
  display: inline-block; text-decoration: none;
  font-family: inherit; font-size: 12px; color: #333; background: #f3f3f3;
  border: 0; border-radius: 50px; padding: 4px 12px; cursor: pointer; transition: all 0.2s;
}
.tag:hover { background: #c62828; color: #fff; }

/* Desktop dropdown (plain list of names) */
.dropdown {
  position: absolute; top: 100%; left: 0; background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); border-radius: 8px;
  min-width: 200px; padding: 6px; z-index: 100; border-top: 3px solid #c62828;
}
.dropdown-item {
  display: block; padding: 10px 14px; white-space: nowrap;
  text-decoration: none; color: #333; font-weight: 600; font-size: 13px;
  border-radius: 6px; transition: background 0.3s, color 0.3s;
}
.dropdown-item:hover { background: #f8f8f8; color: #c62828; }
.dropdown-fade-enter-active, .dropdown-fade-leave-active { transition: all 0.3s ease; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* Tablet / phone search panel */
.mobile-search-panel {
  display: none; background: #f9f9f9; border-top: 1px solid #e0e0e0; border-bottom: 3px solid #c62828;
  padding: 12px 20px 14px; font-family: 'Inter', sans-serif;
}
.mobile-search-panel .search-form input { padding: 11px 16px; font-size: 14px; }
.mobile-search-panel .search-go { padding: 0 18px; }

/* Mobile menu */
.mobile-menu {
  background: #f9f9f9; border-top: 1px solid #e0e0e0; padding: 12px 0;
  max-height: calc(100vh - 90px); overflow-y: auto; font-family: 'Inter', sans-serif;
}

.mobile-archive {
  display: block; width: calc(100% - 40px); margin: 0 20px 8px; padding: 11px 16px;
  font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer;
  color: #c62828; background: #fff; border: 2px solid #c62828; border-radius: 50px;
}
.mobile-archive.back { color: #fff; background: #c62828; }

.mobile-row { display: flex; align-items: stretch; }
.mobile-row .mobile-nav-link { flex: 1; }
.mobile-nav-link {
  display: flex; align-items: center; padding: 14px 20px;
  text-decoration: none; color: #333; font-weight: 500; font-size: 15px;
  border-left: 3px solid transparent; transition: all 0.3s;
}
.mobile-nav-link:hover { background: #fff; border-left-color: #c62828; color: #c62828; }

.sub-toggle {
  width: 52px; background: none; border: 0; border-left: 1px solid #e8e8e8;
  color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.sub-toggle svg { transition: transform 0.3s; }
.sub-toggle.open { color: #c62828; }
.sub-toggle.open svg { transform: rotate(180deg); }

.mobile-sub { background: #fff; border-left: 3px solid #c62828; margin-left: 20px; overflow: hidden; }
.mobile-sub-link {
  display: block; padding: 12px 16px; font-size: 14px; font-weight: 500;
  text-decoration: none; color: #333; border-bottom: 1px solid #f0f0f0;
}
.mobile-sub-link:last-child { border-bottom: 0; }
.mobile-sub-link:hover { background: #f8f8f8; color: #c62828; }

.mobile-journalist { margin-top: 8px; padding-top: 8px; border-top: 1px solid #e8e8e8; }

.mobile-slide-enter-active, .mobile-slide-leave-active { transition: all 0.3s ease; }
.mobile-slide-enter-from, .mobile-slide-leave-to { opacity: 0; transform: translateY(-20px); }
.sub-slide-enter-active, .sub-slide-leave-active { transition: all 0.25s ease; max-height: 600px; }
.sub-slide-enter-from, .sub-slide-leave-to { opacity: 0; max-height: 0; }

/* ---------- Date picker modal ---------- */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 2000; background: rgba(0, 0, 0, 0.55);
  display: flex; align-items: center; justify-content: center; padding: 16px;
  font-family: 'Inter', sans-serif;
}
.modal {
  position: relative; width: 100%; max-width: 380px; background: #fff; border-radius: 14px;
  border-top: 4px solid #c62828; padding: 22px 20px 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}
.modal-close {
  position: absolute; top: 10px; right: 12px; width: 32px; height: 32px; border: 0; border-radius: 50%;
  background: #f3f3f3; color: #444; cursor: pointer; font-size: 14px; transition: background 0.2s;
}
.modal-close:hover { background: #e4e4e4; }
.modal-title { font-size: 18px; color: #222; margin-bottom: 4px; padding-right: 36px; }
.modal-sub { font-size: 13px; color: #777; margin-bottom: 14px; }

.quick-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.quick-chip {
  font-family: inherit; font-size: 12px; font-weight: 600; color: #c62828; background: #fdecec;
  border: 0; border-radius: 50px; padding: 6px 14px; cursor: pointer; transition: all 0.2s;
}
.quick-chip:hover:not(:disabled) { background: #c62828; color: #fff; }
.quick-chip:disabled { opacity: 0.4; cursor: not-allowed; }

.cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.cal-month { font-weight: 700; font-size: 15px; color: #222; }
.cal-nav {
  width: 32px; height: 32px; border: 0; border-radius: 50%; background: #f3f3f3; color: #333;
  font-size: 20px; line-height: 1; cursor: pointer; transition: background 0.2s;
}
.cal-nav:hover:not(:disabled) { background: #c62828; color: #fff; }
.cal-nav:disabled { opacity: 0.35; cursor: not-allowed; }

.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-weekdays { margin-bottom: 4px; }
.cal-weekdays span { text-align: center; font-size: 11px; font-weight: 600; color: #888; padding: 4px 0; }
.cal-empty { height: 38px; }
.cal-day {
  height: 38px; border: 2px solid transparent; border-radius: 8px; background: transparent;
  font-family: inherit; font-size: 14px; font-weight: 500; color: #333; cursor: pointer; transition: all 0.15s;
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
  .collapse-wrap, .collapse-inner, .main-header, .navbar, .logo img { transition: none; }
}

/* Responsive */
@media (max-width: 1024px) {
  .navbar { display: none; }
  .menu-toggle, .mobile-search-btn { display: flex; }
  .mobile-search-panel { display: block; }
  .header-content { flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; }
  /* row 1: logo (left) + search & menu buttons (right); row 2: the three headlines */
  .logo { order: 1; margin-right: auto; flex: 1 1 0; }
  .mobile-search-btn, .menu-toggle { order: 2; }
  .header-content > .highlights {
    order: 3;
    max-height: 500px;
    overflow: hidden;
    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, margin 0.35s ease;
  }

  /* On mobile/tablet the main header never disappears (it holds the buttons):
     it stays in the layout, shrinks, and hides the highlights while scrolling. */
  .main-wrap.collapsed { grid-template-rows: 1fr; }
  .main-wrap.collapsed .collapse-inner { opacity: 1; }
  .news-header.scrolled .main-header { padding: 8px 0; }
  .news-header.scrolled .header-content > .highlights {
    max-height: 0; opacity: 0; margin-top: -12px; pointer-events: none;
  }
  .news-header.scrolled .logo-icon img { height: 32px; }
  .news-header.scrolled .logo-main img { height: 36px; }
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
  .main-header { padding: 10px 0; }
  .logo-icon img { height: 50px; }
  .logo-main img { height: 60px; }
  .logo-content { gap: 8px; }
}
@media (max-width: 480px) {
  .logo-icon img { height: 40px; }
  .logo-main img { height: 48px; }
  .logo-content { gap: 6px; }
  .logo-name { font-size: 22px; }
  .header-content { gap: 4px; }
  .mobile-search-btn, .menu-toggle { padding: 6px; }
  .topbar { font-size: 12px; }
  .topbar-link { padding: 4px 6px; }
}
</style>

<!-- Unscoped: stops the browser from "correcting" scrollY when the header
     changes height, which was what made the header bounce back to the top. -->
<style>
html { overflow-anchor: none; }
</style>
