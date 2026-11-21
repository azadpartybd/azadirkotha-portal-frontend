<script setup>
import { inject, ref, computed, onMounted } from "vue";
import { api, errorMessage, bnDate } from "./journalistApi";
import "./journalist.css";

// the layout already loaded it; fall back to loading it here if the page is used on its own
const ctx = inject("journalistMe", null);
const own = ref(null);
const ownError = ref("");
const ownLoading = ref(!ctx);

const me = computed(() => (ctx ? ctx.me.value : own.value));
const loading = computed(() => (ctx ? ctx.loading.value : ownLoading.value));
const error = computed(() => (ctx ? ctx.error.value : ownError.value));

onMounted(async () => {
  if (ctx) return;
  try {
    own.value = (await api.get("/journalist/me")).data;
  } catch (e) {
    ownError.value = errorMessage(e);
  } finally {
    ownLoading.value = false;
  }
});

const dash = (v) => (v && String(v).trim() ? v : "—");

const personal = computed(() => [
  ["নাম", dash(me.value?.name)],
  ["ইউজারনেম", dash(me.value?.username)],
  ["ইমেইল", dash(me.value?.email)],
  ["মোবাইল", dash(me.value?.phone)],
  ["রক্তের গ্রুপ", dash(me.value?.blood_group)],
]);

const professional = computed(() => [
  ["পদবি", dash(me.value?.designation)],
  ["পেশা", dash(me.value?.occupation)],
  ["বর্তমান প্রতিষ্ঠান", dash(me.value?.current_platform)],
]);
</script>

<template>
  <div class="jn-page">
    <header class="jn-hero">
      <span class="jn-kicker">আমার তথ্য</span>
      <h1>আমার প্রোফাইল</h1>
      <p class="jn-lead">এই তথ্যগুলো শুধু দেখা যাবে, এখান থেকে পরিবর্তন করা যায় না। কিছু ভুল থাকলে সম্পাদকের সাথে যোগাযোগ করুন।</p>
    </header>

    <p v-if="loading" class="jn-center jn-muted">লোড হচ্ছে ...</p>
    <p v-else-if="error" class="jn-alert error" role="alert">{{ error }}</p>

    <template v-else-if="me">
      <section class="jn-card who">
        <img v-if="me.photo" :src="me.photo" alt="" class="photo" />
        <div>
          <h2 class="jn-title" style="border:0;margin:0 0 4px;padding:0">{{ me.name }}</h2>
          <p v-if="me.designation" class="jn-muted" style="margin:0">{{ me.designation }}</p>
          <p v-if="me.bio" class="bio">{{ me.bio }}</p>
        </div>
      </section>

      <section class="jn-card">
        <h2 class="jn-title">ব্যক্তিগত তথ্য</h2>
        <dl class="info">
          <template v-for="row in personal" :key="row[0]">
            <dt>{{ row[0] }}</dt><dd>{{ row[1] }}</dd>
          </template>
        </dl>
      </section>

      <section class="jn-card">
        <h2 class="jn-title">পেশাগত তথ্য</h2>
        <dl class="info">
          <template v-for="row in professional" :key="row[0]">
            <dt>{{ row[0] }}</dt><dd>{{ row[1] }}</dd>
          </template>
        </dl>
      </section>

      <section class="jn-card">
        <h2 class="jn-title">প্রেস কার্ড</h2>
        <p v-if="!me.journalist_number" class="jn-alert info">
          আপনার প্রেস কার্ডের আইডি নম্বর এখনো দেওয়া হয়নি। সম্পাদকের সাথে যোগাযোগ করুন।
        </p>
        <dl v-else class="info">
          <dt>আইডি নম্বর</dt><dd><b>{{ me.journalist_number }}</b></dd>
          <dt>ইস্যুর তারিখ</dt><dd>{{ me.card_issue_date ? bnDate(me.card_issue_date) : "—" }}</dd>
          <dt>মেয়াদ</dt>
          <dd>
            {{ me.card_expiry_date ? bnDate(me.card_expiry_date) : "—" }}
            <span v-if="me.card_status === 'valid'" class="jn-badge published">মেয়াদ আছে</span>
            <span v-else-if="me.card_status === 'expired'" class="jn-badge rejected">মেয়াদ উত্তীর্ণ</span>
          </dd>
        </dl>
      </section>
    </template>
  </div>
</template>

<style scoped>
.who { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
.photo { width: 110px; height: 130px; object-fit: cover; border-radius: 8px; border: 1px solid #d8d8d8; }
.bio { margin: 10px 0 0; line-height: 1.8; color: #444; max-width: 640px; white-space: pre-line; }

.info { margin: 0; display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 12px 16px; font-size: 15px; }
.info dt { color: #888; }
.info dd { margin: 0; overflow-wrap: anywhere; }
.info .jn-badge { margin-left: 8px; }

@media (max-width: 600px) {
  .info { grid-template-columns: 1fr; gap: 2px 0; }
  .info dt { margin-top: 10px; font-size: 13px; }
}
</style>