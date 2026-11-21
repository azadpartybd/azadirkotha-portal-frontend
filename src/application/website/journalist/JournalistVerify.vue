<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api, bnDate } from "./journalistApi";
import "./journalist.css";

const route = useRoute();
const router = useRouter();

const number = ref(String(route.query.number ?? ""));
const loading = ref(false);
const result = ref(null);
const state = ref(""); // "", "found", "notfound", "error"
const message = ref("");
let session = 0;

async function verify() {
  const n = number.value.trim();
  result.value = null;
  message.value = "";
  state.value = "";
  if (!n) {
    state.value = "error";
    message.value = "সাংবাদিক আইডি নম্বর লিখুন।";
    return;
  }
  const my = ++session;
  loading.value = true;
  router.replace({ query: { number: n } });
  try {
    const res = await api.get("/journalists/verify", { params: { number: n } });
    if (my !== session) return;
    result.value = res.data;
    state.value = "found";
  } catch (e) {
    if (my !== session) return;
    if (e?.response?.status === 404) {
      state.value = "notfound";
    } else {
      state.value = "error";
      message.value = e?.response?.data?.error || "যাচাই করা যায়নি। আবার চেষ্টা করুন।";
    }
  } finally {
    if (my === session) loading.value = false;
  }
}

onMounted(() => {
  if (number.value.trim()) verify();
});
</script>

<template>
  <div class="jn-page narrow">
    <header class="jn-hero">
      <span class="jn-kicker">সাংবাদিক যাচাই</span>
      <h1>সাংবাদিক পরিচয় যাচাই করুন</h1>
      <p class="jn-lead">সাংবাদিকের প্রেস কার্ডে দেওয়া আইডি নম্বর লিখে নিশ্চিত হন তিনি সত্যিই আমাদের প্ল্যাটফর্মে কর্মরত কি না।</p>
    </header>

    <form class="jn-card" role="search" @submit.prevent="verify">
      <div class="jn-field" style="margin-bottom:16px">
        <label for="jid">সাংবাদিক আইডি নম্বর</label>
        <input id="jid" v-model="number" class="jn-input" autocomplete="off" placeholder="যেমন: BJ-2026/045" />
      </div>
      <button type="submit" class="jn-btn green" :disabled="loading">{{ loading ? "যাচাই হচ্ছে ..." : "যাচাই করুন" }}</button>
    </form>

    <p v-if="state === 'error'" class="jn-alert error" role="alert">{{ message }}</p>

    <section v-if="state === 'notfound'" class="result bad" role="status">
      <h2>✖ পাওয়া যায়নি</h2>
      <p>এই আইডি নম্বরে আমাদের কোনো সক্রিয় সাংবাদিক পাওয়া যায়নি। নম্বরটি আবার দেখে নিন। ভুল না হলে এই ব্যক্তি আমাদের প্রতিনিধি নন।</p>
    </section>

    <section v-if="state === 'found' && result" class="result" :class="result.status === 'valid' ? 'ok' : 'warn'" role="status">
      <h2 v-if="result.status === 'valid'">✔ যাচাইকৃত সাংবাদিক</h2>
      <h2 v-else>⚠ কার্ডের মেয়াদ উত্তীর্ণ</h2>

      <div class="person">
        <img v-if="result.photo" :src="result.photo" :alt="result.name" />
        <dl>
          <dt>নাম</dt><dd><b>{{ result.name }}</b></dd>
          <template v-if="result.designation"><dt>পদবি</dt><dd>{{ result.designation }}</dd></template>
          <dt>আইডি নম্বর</dt><dd>{{ result.journalist_number }}</dd>
          <template v-if="result.card_issue_date"><dt>কার্ড ইস্যু</dt><dd>{{ bnDate(result.card_issue_date) }}</dd></template>
          <template v-if="result.card_expiry_date"><dt>কার্ডের মেয়াদ</dt><dd>{{ bnDate(result.card_expiry_date) }}</dd></template>
        </dl>
      </div>

      <p v-if="result.status === 'expired'" class="note">এই কার্ডের মেয়াদ শেষ হয়ে গেছে। বর্তমান পরিচয় নিশ্চিত করতে আমাদের অফিসে যোগাযোগ করুন।</p>
    </section>

    <p class="jn-muted" style="margin-top:20px">
      সাংবাদিক হিসেবে যুক্ত হতে চান? <router-link to="/join" class="jn-link">আবেদন করুন</router-link>
    </p>
  </div>
</template>

<style scoped>
.result { border: 1px solid #d8d8d8; border-left-width: 5px; background: #fff; padding: 18px 20px; margin-top: 18px; }
.result h2 { font-family: 'Noto Serif Bengali', serif; font-size: 22px; margin: 0 0 12px; }
.result p { line-height: 1.8; margin: 0; }
.result.ok { border-left-color: #006a4e; } .result.ok h2 { color: #006a4e; }
.result.warn { border-left-color: #e0a100; } .result.warn h2 { color: #8a6500; }
.result.bad { border-left-color: #f21b3f; } .result.bad h2 { color: #b71c1c; }

.person { display: flex; gap: 18px; align-items: flex-start; flex-wrap: wrap; }
.person img { width: 110px; height: 130px; object-fit: cover; border-radius: 6px; border: 1px solid #d8d8d8; }
.person dl { margin: 0; flex: 1; min-width: 200px; display: grid; grid-template-columns: 110px 1fr; gap: 8px 12px; font-size: 14.5px; }
.person dt { color: #888; }
.person dd { margin: 0; }
.note { margin-top: 14px !important; font-size: 14px; color: #6b5200; }
</style>