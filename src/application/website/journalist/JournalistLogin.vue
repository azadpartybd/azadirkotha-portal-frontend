<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api, errorMessage } from "./journalistApi";
import "./journalist.css";

const SUPPORT_EMAIL = "support@azadirkotha.com";

const route = useRoute();
const router = useRouter();
const username = ref("");
const password = ref("");
const sending = ref(false);
const error = ref("");

async function submit() {
  error.value = "";
  if (!username.value.trim() || !password.value) {
    error.value = "ইউজারনেম ও পাসওয়ার্ড দিন।";
    return;
  }
  sending.value = true;
  try {
    const res = await api.post("/auth/login", { username: username.value.trim(), password: password.value });
    localStorage.setItem("token", res.data.token);
    const next = String(route.query.next || "");
    router.push(next.startsWith("/") ? next : "/journalist");
  } catch (e) {
    error.value = e?.response?.status === 401 ? "ইউজারনেম বা পাসওয়ার্ড সঠিক নয়।" : errorMessage(e);
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <div class="jn-page narrow">
    <header class="jn-hero">
      <span class="jn-kicker">সাংবাদিক লগইন</span>
      <h1>লগইন</h1>
    </header>

    <form class="jn-card" @submit.prevent="submit">
      <p v-if="error" class="jn-alert error" role="alert">{{ error }}</p>
      <div class="jn-field" style="margin-bottom:14px">
        <label for="u">ইউজারনেম</label>
        <input id="u" v-model="username" class="jn-input" autocomplete="username" />
      </div>
      <div class="jn-field" style="margin-bottom:18px">
        <label for="p">পাসওয়ার্ড</label>
        <input id="p" v-model="password" type="password" class="jn-input" autocomplete="current-password" />
      </div>
      <button type="submit" class="jn-btn green" :disabled="sending">{{ sending ? "অপেক্ষা করুন ..." : "লগইন" }}</button>
      <p class="jn-muted" style="margin:14px 0 0">
        পাসওয়ার্ড ভুলে গেছেন? আপনার নিবন্ধিত ইমেইল থেকে
        <a :href="'mailto:' + SUPPORT_EMAIL" class="jn-link">{{ SUPPORT_EMAIL }}</a> ঠিকানায় ইমেইল পাঠান।
      </p>
    </form>

    <p class="jn-muted">সাংবাদিক হিসেবে যুক্ত হতে চান? <router-link to="/join" class="jn-link">আবেদন করুন</router-link></p>
  </div>
</template>