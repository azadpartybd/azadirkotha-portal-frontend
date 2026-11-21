<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api, errorMessage, isLoggedIn, logout, bnDate, bnNum } from "./journalistApi";
import "./journalist.css";

const route = useRoute();
const router = useRouter();

const profile = ref(null);
const data = ref(null);
const status = ref("");
const page = ref(1);
const loading = ref(true);
const error = ref("");
const saved = computed(() => route.query.saved === "1");

const STATUS_LABEL = { draft: "খসড়া", published: "প্রকাশিত" };
const canReview = computed(() => (profile.value?.permissions || []).includes("journalist_applications.manage"));

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const res = await api.get("/journalist/articles", { params: { status: status.value || undefined, page: page.value } });
    data.value = res.data;
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}

async function init() {
  if (!isLoggedIn()) { router.replace("/journalist/login"); return; }
  try {
    profile.value = (await api.get("/auth/profile")).data;
  } catch (e) {
    error.value = errorMessage(e);
    loading.value = false;
    return;
  }
  if (profile.value.journalist) await load();
  else loading.value = false;
}

async function remove(a) {
  if (!confirm(`“${a.title}” লেখাটি মুছে ফেলবেন?`)) return;
  try {
    await api.delete(`/journalist/articles/${a.id}`);
    await load();
  } catch (e) {
    error.value = errorMessage(e);
  }
}

function signOut() {
  logout();
  router.push("/journalist/login");
}

onMounted(init);
watch([status, page], () => { if (profile.value?.journalist) load(); });
watch(status, () => { page.value = 1; });
</script>

<template>
  <div class="jn-page">
    <header class="jn-hero">
      <span class="jn-kicker">সাংবাদিক ড্যাশবোর্ড</span>
      <h1>স্বাগতম<template v-if="profile">, {{ profile.name }}</template></h1>
    </header>

    <p v-if="error" class="jn-alert error" role="alert">{{ error }}</p>
    <p v-if="saved" class="jn-alert ok">লেখাটি সংরক্ষণ করা হয়েছে। সম্পাদক যাচাই করে প্রকাশ করবেন।</p>
    <p v-if="loading" class="jn-center jn-muted">লোড হচ্ছে ...</p>

    <div v-else-if="profile && !profile.journalist" class="jn-card">
      <p class="jn-alert info">এই অ্যাকাউন্টটি অনুমোদিত সাংবাদিক অ্যাকাউন্ট নয়।</p>
      <router-link v-if="canReview" to="/admin/journalist-applications" class="jn-btn green">সাংবাদিকদের আবেদন দেখুন</router-link>
      <button class="jn-btn ghost" style="margin-left:10px" @click="signOut">লগআউট</button>
    </div>

    <template v-else-if="data">
      <div class="jn-stats">
        <div class="jn-stat"><b>{{ bnNum(data.summary.total) }}</b><span>মোট লেখা</span></div>
        <div class="jn-stat"><b>{{ bnNum(data.summary.published) }}</b><span>প্রকাশিত</span></div>
        <div class="jn-stat"><b>{{ bnNum(data.summary.drafts) }}</b><span>খসড়া</span></div>
        <div class="jn-stat"><b>{{ bnNum(data.summary.views) }}</b><span>মোট পঠিত</span></div>
      </div>

      <div class="jn-toolbar">
        <div style="display:flex;gap:10px;align-items:center">
          <select v-model="status" class="jn-select" style="width:auto" aria-label="অবস্থা">
            <option value="">সব লেখা</option>
            <option value="draft">খসড়া</option>
            <option value="published">প্রকাশিত</option>
          </select>
        </div>
        <div>
          <router-link to="/journalist/articles/new" class="jn-btn">+ নতুন লেখা</router-link>
          <button class="jn-btn ghost" style="margin-left:10px" @click="signOut">লগআউট</button>
        </div>
      </div>

      <div class="jn-card">
        <div v-if="data.items.length" class="jn-table-wrap">
          <table class="jn-table">
            <thead><tr><th>শিরোনাম</th><th>অবস্থা</th><th>ধরন</th><th>প্রকাশের তারিখ</th><th>পঠিত</th><th></th></tr></thead>
            <tbody>
              <tr v-for="a in data.items" :key="a.id">
                <td>
                  <router-link v-if="a.status === 'published'" :to="'/news/' + encodeURIComponent(a.slug)" class="jn-link">{{ a.title }}</router-link>
                  <template v-else>{{ a.title }}</template>
                </td>
                <td><span class="jn-badge" :class="a.status">{{ STATUS_LABEL[a.status] || a.status }}</span></td>
                <td>{{ a.kind === "opinion" ? "মতামত" : a.kind === "editorial" ? "সম্পাদকীয়" : "খবর" }}</td>
                <td>{{ bnDate(a.published_at) }}</td>
                <td>{{ bnNum(a.view_count) }}</td>
                <td style="white-space:nowrap">
                  <template v-if="a.status !== 'published'">
                    <router-link :to="`/journalist/articles/${a.id}/edit`" class="jn-link">সম্পাদনা</router-link>
                    <button class="jn-linkbtn" style="margin-left:12px" @click="remove(a)">মুছুন</button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="jn-center jn-muted">কোনো লেখা পাওয়া যায়নি। “নতুন লেখা” বাটনে ক্লিক করে শুরু করুন।</p>

        <div v-if="data.total_pages > 1" class="jn-pager">
          <button class="jn-btn ghost small" :disabled="page <= 1" @click="page--">← আগের</button>
          <span>{{ bnNum(page) }} / {{ bnNum(data.total_pages) }}</span>
          <button class="jn-btn ghost small" :disabled="page >= data.total_pages" @click="page++">পরের →</button>
        </div>
      </div>
    </template>
  </div>
</template>