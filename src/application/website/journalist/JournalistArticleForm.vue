<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api, errorMessage, isLoggedIn } from "./journalistApi";
import RichTextEditor from "./components/RichTextEditor.vue";
import "./journalist.css";

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id);
const editing = computed(() => !!id.value);

const form = reactive({
  title: "", summary: "", body: "", kind: "news", category_ids: [],
  featured_image: "", featured_image_caption: "", news_source: "",
});
const imageUrl = ref("");
const categories = ref([]);
const status = ref("draft");
const loading = ref(true);
const saving = ref(false);
const uploading = ref(false);
const error = ref("");
const locked = computed(() => status.value === "published");

// text length of the editor's HTML (tags removed)
const plainLen = (html) => html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().length;

async function init() {
  if (!isLoggedIn()) { router.replace("/journalist/login?next=" + encodeURIComponent(route.fullPath)); return; }
  try {
    categories.value = (await api.get("/journalist/categories")).data;
    if (editing.value) {
      const a = (await api.get(`/journalist/articles/${id.value}`)).data;
      Object.assign(form, {
        title: a.title, summary: a.summary, body: a.body, kind: a.kind === "opinion" ? "opinion" : "news",
        category_ids: a.category_ids, featured_image: a.featured_image, featured_image_caption: a.featured_image_caption,
        news_source: a.news_source || "",
      });
      imageUrl.value = a.featured_image_url;
      status.value = a.status;
    }
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}

async function onImage(e) {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;
  if (!/\.(jpe?g|png|webp)$/i.test(file.name) || file.size > 3 * 1024 * 1024) {
    error.value = "ছবি JPG, PNG বা WEBP হতে হবে এবং সর্বোচ্চ ৩ এমবি।";
    return;
  }
  uploading.value = true;
  error.value = "";
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post("/journalist/uploads", fd);
    form.featured_image = res.data.path;
    imageUrl.value = res.data.url;
  } catch (err) {
    error.value = errorMessage(err);
  } finally {
    uploading.value = false;
  }
}

function removeImage() {
  form.featured_image = "";
  imageUrl.value = "";
}

function validate() {
  if (!form.news_source.trim()) return "সংবাদ সূত্র লিখুন।";
  if (form.title.trim().length < 5) return "শিরোনাম কমপক্ষে ৫ অক্ষরের হতে হবে।";
  if (form.summary.trim().length < 10) return "সারসংক্ষেপ কমপক্ষে ১০ অক্ষরের হতে হবে।";
  if (!form.category_ids.length) return "কমপক্ষে একটি বিভাগ বেছে নিন।";
  if (form.category_ids.length > 5) return "সর্বোচ্চ ৫টি বিভাগ বেছে নিতে পারবেন।";
  if (plainLen(form.body) < 50) return "লেখার মূল অংশ কমপক্ষে ৫০ অক্ষরের হতে হবে।";
  return "";
}

async function save() {
  error.value = validate();
  if (error.value) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  saving.value = true;
  try {
    const payload = { ...form };
    if (editing.value) await api.put(`/journalist/articles/${id.value}`, payload);
    else await api.post("/journalist/articles", payload);
    router.push({ path: "/journalist", query: { saved: "1" } });
  } catch (e) {
    error.value = errorMessage(e);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } finally {
    saving.value = false;
  }
}

onMounted(init);
</script>

<template>
  <div class="jn-page">
    <header class="jn-hero">
      <span class="jn-kicker">{{ editing ? "লেখা সম্পাদনা" : "নতুন লেখা" }}</span>
      <h1>{{ editing ? "লেখা সম্পাদনা করুন" : "নতুন লেখা জমা দিন" }}</h1>
      <p class="jn-lead">আপনার লেখা খসড়া হিসেবে সংরক্ষিত হয়। সম্পাদক যাচাই করে প্রকাশ করবেন।</p>
    </header>

    <p v-if="error" class="jn-alert error" role="alert">{{ error }}</p>
    <p v-if="locked" class="jn-alert info">এই লেখাটি প্রকাশিত হয়ে গেছে, তাই এখান থেকে পরিবর্তন করা যাবে না।</p>
    <p v-if="loading" class="jn-center jn-muted">লোড হচ্ছে ...</p>

    <form v-else @submit.prevent="save" novalidate>
      <section class="jn-card">
        <div class="jn-grid">
          <div class="jn-field full">
            <label for="title">শিরোনাম <span class="req">*</span></label>
            <input id="title" v-model="form.title" class="jn-input" maxlength="200" :disabled="locked" />
          </div>
          <div class="jn-field full">
            <label for="summary">সারসংক্ষেপ <span class="req">*</span></label>
            <textarea id="summary" v-model="form.summary" class="jn-textarea" style="min-height:80px" maxlength="300" :disabled="locked"></textarea>
            <p class="jn-hint">{{ form.summary.length }} / ৩০০ — হোম পেজ ও অনুসন্ধানে দেখানো হবে</p>
          </div>
          <div class="jn-field">
            <label for="kind">ধরন</label>
            <select id="kind" v-model="form.kind" class="jn-select" :disabled="locked">
              <option value="news">খবর</option>
              <option value="opinion">মতামত</option>
            </select>
          </div>
          <div class="jn-field">
            <label for="source">সংবাদ সূত্র <span class="req">*</span></label>
            <input
              id="source" v-model="form.news_source" class="jn-input" maxlength="150" :disabled="locked"
              placeholder="যেমন: নিজস্ব প্রতিবেদক, বাসস, প্রথম আলো"
            />
            <p class="jn-hint">ঐচ্ছিক — খবরের সূত্র কে বা কোথা থেকে পাওয়া</p>
          </div>
          <div class="jn-field full">
            <label>বিভাগ <span class="req">*</span> <span class="jn-muted">(সর্বোচ্চ ৫টি)</span></label>
            <div style="display:flex;flex-wrap:wrap;gap:6px 16px;padding-top:4px">
              <label v-for="c in categories" :key="c.id" style="font-weight:400;display:flex;gap:6px;align-items:center">
                <input v-model="form.category_ids" type="checkbox" :value="c.id" :disabled="locked" /> {{ c.name }}
              </label>
            </div>
          </div>
        </div>
      </section>

      <section class="jn-card">
        <h2 class="jn-title">প্রধান ছবি</h2>
        <div v-if="imageUrl" style="margin-bottom:12px">
          <img :src="imageUrl" alt="" style="max-width:100%;width:360px;aspect-ratio:16/9;object-fit:cover;display:block" />
          <button v-if="!locked" type="button" class="jn-linkbtn" style="margin-top:6px" @click="removeImage">ছবি সরান</button>
        </div>
        <input v-if="!locked" type="file" accept="image/jpeg,image/png,image/webp" class="jn-input" :disabled="uploading" @change="onImage" />
        <p v-if="uploading" class="jn-hint">ছবি আপলোড হচ্ছে ...</p>
        <p v-else class="jn-hint">JPG, PNG বা WEBP, সর্বোচ্চ ৩ এমবি</p>
        <div class="jn-field" style="margin-top:14px">
          <label for="cap">ছবির ক্যাপশন</label>
          <input id="cap" v-model="form.featured_image_caption" class="jn-input" maxlength="255" :disabled="locked" />
        </div>
      </section>

      <section class="jn-card">
        <h2 class="jn-title">লেখা <span style="color:#f21b3f">*</span></h2>
        <RichTextEditor v-model="form.body" :disabled="locked" placeholder="এখানে আপনার লেখা শুরু করুন ..." />
        <p class="jn-hint">টুলবার থেকে শিরোনাম, উদ্ধৃতি, তালিকা, লিংক, অ্যালাইনমেন্ট ও ছবি যোগ করতে পারবেন। ছবি শুধু এখান থেকে আপলোড করা যাবে।</p>
      </section>

      <button v-if="!locked" type="submit" class="jn-btn green" :disabled="saving">{{ saving ? "সংরক্ষণ হচ্ছে ..." : "খসড়া সংরক্ষণ করুন" }}</button>
      <router-link to="/journalist" class="jn-btn ghost" style="margin-left:10px">বাতিল</router-link>
    </form>
  </div>
</template>