<script setup>
import { ref, computed, provide, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSiteStore } from "@/store/site";
import { api, isLoggedIn, logout, errorMessage } from "../website/journalist/journalistApi";
import "../website/journalist/journalist.css";

const route = useRoute();
const router = useRouter();
const site = useSiteStore();

// shared with the pages inside the layout (the "my info" page reads it)
const me = ref(null);
const loading = ref(true);
const error = ref("");
provide("journalistMe", { me, loading, error });

const dashActive = computed(() => route.path === "/journalist" || route.path.startsWith("/journalist/articles"));
const profileActive = computed(() => route.path === "/journalist/profile");
const settingsActive = computed(() => route.path === "/journalist/settings");
const termsActive = computed(() => route.path === "/journalist/terms");
const initial = computed(() => (me.value?.name || "?").trim().charAt(0));

async function load() {
  if (!isLoggedIn()) {
    router.replace("/journalist/login?next=" + encodeURIComponent(route.fullPath));
    return;
  }
  try {
    me.value = (await api.get("/journalist/me")).data;
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}

function signOut() {
  logout();
  router.push("/journalist/login");
}

onMounted(() => {
  site.load();
  load();
});
</script>

<template>
  <div class="jl">
    <aside class="jl-side" aria-label="সাংবাদিক মেনু">
      <router-link to="/" class="jl-brand" aria-label="পোর্টালের হোমপেজ">
        <span v-if="site.settings.logo" class="jl-logo"><img :src="site.settings.logo" alt="" /></span>
        <span class="jl-name">{{ site.settings.site_name || "সাংবাদিক ড্যাশবোর্ড" }}</span>
      </router-link>

      <div v-if="me" class="jl-user">
        <img v-if="me.photo" :src="me.photo" alt="" class="jl-avatar" />
        <span v-else class="jl-avatar jl-initial" aria-hidden="true">{{ initial }}</span>
        <div class="jl-who">
          <strong>{{ me.name }}</strong>
          <span v-if="me.designation">{{ me.designation }}</span>
        </div>
      </div>

      <nav class="jl-nav">
        <router-link to="/journalist" class="jl-link" :class="{ on: dashActive }">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>ড্যাশবোর্ড</span>
        </router-link>

        <router-link to="/journalist/profile" class="jl-link" :class="{ on: profileActive }">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>আমার তথ্য</span>
        </router-link>

        <router-link to="/journalist/settings" class="jl-link" :class="{ on: settingsActive }">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>সেটিংস</span>
        </router-link>

        <router-link to="/journalist/terms" class="jl-link" :class="{ on: termsActive }">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span>নীতিমালা ও শর্তাবলী</span>
        </router-link>
      </nav>

      <button type="button" class="jl-link jl-out" @click="signOut">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>লগআউট</span>
      </button>
    </aside>

    <main class="jl-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.jl {
  display: grid; grid-template-columns: 250px minmax(0, 1fr); min-height: 100vh; background: #fafafa;
  font-family: 'Noto Sans Bengali', 'SolaimanLipi', sans-serif;
}

/* ---------- sidebar: light and neutral ---------- */
.jl-side, .jl-side * { box-sizing: border-box; }
.jl-side {
  position: sticky; top: 0; align-self: start; height: 100vh;
  overflow-x: hidden; overflow-y: auto;
  display: flex; flex-direction: column; gap: 16px; padding: 18px 12px;
  background: #fff; color: #333; border-right: 1px solid #e3e6ea;
}

.jl-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #1f2933; padding: 0 6px; min-width: 0; }
.jl-logo { flex-shrink: 0; display: inline-flex; }
.jl-logo img { height: 34px; max-width: 80px; object-fit: contain; display: block; }
.jl-name { font-family: 'Noto Serif Bengali', serif; font-size: 16px; font-weight: 700; line-height: 1.35; min-width: 0; overflow-wrap: anywhere; }

.jl-user {
  display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px;
  background: #f4f6f8; border: 1px solid #eceff2;
}
.jl-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex-shrink: 0; background: #dfe5ea; }
.jl-initial { display: flex; align-items: center; justify-content: center; color: #006a4e; background: #e1efe9; font-weight: 700; font-size: 17px; }
.jl-who { display: flex; flex-direction: column; min-width: 0; }
.jl-who strong { color: #1f2933; font-size: 14px; line-height: 1.4; overflow-wrap: anywhere; }
.jl-who span { font-size: 12px; color: #6b7785; overflow-wrap: anywhere; }

.jl-nav { display: flex; flex-direction: column; gap: 2px; }
.jl-link {
  display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px; border-radius: 8px;
  border: 0; border-left: 3px solid transparent; background: none;
  font: inherit; font-size: 14.5px; font-weight: 600; text-align: left;
  color: #4a5561; text-decoration: none; cursor: pointer; transition: background 0.2s, color 0.2s;
}
.jl-link svg { flex-shrink: 0; }
.jl-link span { min-width: 0; overflow-wrap: anywhere; }
.jl-link:hover { background: #f1f3f5; color: #1f2933; }
.jl-link.on { background: #e8f3ef; color: #006a4e; border-left-color: #006a4e; }
.jl-link:focus-visible { outline: 2px solid #006a4e; outline-offset: 2px; }

.jl-out { margin-top: auto; border: 1px solid #dfe3e8; border-left-width: 1px; }
.jl-out:hover { background: #fdecec; border-color: #f3c6c6; color: #b71c1c; }

.jl-main { min-width: 0; }

/* ---------- small screens: the sidebar becomes a top block ---------- */
@media (max-width: 900px) {
  .jl { grid-template-columns: 1fr; }
  .jl-side { position: static; height: auto; overflow: visible; gap: 12px; border-right: 0; border-bottom: 1px solid #e3e6ea; }
  .jl-nav { flex-direction: row; flex-wrap: wrap; gap: 6px; }
  .jl-nav .jl-link { width: auto; flex: 1 1 140px; border: 1px solid #e3e6ea; }
  .jl-nav .jl-link.on { border-color: #006a4e; }
  .jl-out { margin-top: 0; }
}
</style>