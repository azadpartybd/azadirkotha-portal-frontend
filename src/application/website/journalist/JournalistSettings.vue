<script setup>
import { ref, computed, inject } from "vue";
import { api, errorMessage } from "./journalistApi";
import "./journalist.css";

const SUPPORT_EMAIL = "support@azadirkotha.com";

// the layout provides the journalist's own info (used to pre-fill the help email)
const ctx = inject("journalistMe", null);
const me = computed(() => ctx?.me?.value || null);

const current = ref("");
const next = ref("");
const again = ref("");
const sending = ref(false);
const error = ref("");
const done = ref(false);

async function submit() {
  error.value = "";
  done.value = false;

  if (!current.value || !next.value || !again.value) {
    error.value = "সবগুলো ঘর পূরণ করুন।";
    return;
  }
  if ([...next.value].length < 8) {
    error.value = "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।";
    return;
  }
  if (next.value !== again.value) {
    error.value = "নতুন পাসওয়ার্ড দুটি মিলছে না।";
    return;
  }
  if (next.value === current.value) {
    error.value = "নতুন পাসওয়ার্ড বর্তমান পাসওয়ার্ডের থেকে আলাদা হতে হবে।";
    return;
  }

  sending.value = true;
  try {
    await api.post("/journalist/password", {
      current_password: current.value,
      new_password: next.value,
    });
    current.value = "";
    next.value = "";
    again.value = "";
    done.value = true;
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    sending.value = false;
  }
}

// "forgot password" -> a ready-to-send email to support
const mailto = computed(() => {
  const subject = "পাসওয়ার্ড রিসেটের অনুরোধ";
  const lines = [
    "আমি আমার সাংবাদিক অ্যাকাউন্টের পাসওয়ার্ড ভুলে গেছি। দয়া করে পাসওয়ার্ড রিসেট করে দিন।",
    "",
    `নাম: ${me.value?.name || ""}`,
    `ইউজারনেম: ${me.value?.username || ""}`,
    `সাংবাদিক আইডি: ${me.value?.journalist_number || ""}`,
    `নিবন্ধিত মোবাইল: ${me.value?.phone || ""}`,
  ];
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
});
</script>

<template>
  <div class="jn-page narrow">
    <header class="jn-hero">
      <span class="jn-kicker">সেটিংস</span>
      <h1>পাসওয়ার্ড পরিবর্তন</h1>
    </header>

    <form class="jn-card" @submit.prevent="submit">
      <p v-if="error" class="jn-alert error" role="alert">{{ error }}</p>
      <p v-if="done" class="jn-alert ok" role="status">আপনার পাসওয়ার্ড পরিবর্তন করা হয়েছে।</p>

      <div class="jn-field" style="margin-bottom:14px">
        <label for="pw-current">বর্তমান পাসওয়ার্ড</label>
        <input id="pw-current" v-model="current" type="password" class="jn-input" autocomplete="current-password" />
      </div>
      <div class="jn-field" style="margin-bottom:14px">
        <label for="pw-new">নতুন পাসওয়ার্ড</label>
        <input id="pw-new" v-model="next" type="password" class="jn-input" autocomplete="new-password" minlength="8" maxlength="128" />
        <small class="jn-muted">কমপক্ষে ৮ অক্ষর।</small>
      </div>
      <div class="jn-field" style="margin-bottom:18px">
        <label for="pw-again">নতুন পাসওয়ার্ড আবার লিখুন</label>
        <input id="pw-again" v-model="again" type="password" class="jn-input" autocomplete="new-password" maxlength="128" />
      </div>
      <button type="submit" class="jn-btn green" :disabled="sending">{{ sending ? "অপেক্ষা করুন ..." : "পাসওয়ার্ড পরিবর্তন করুন" }}</button>
    </form>

    <div class="jn-card" style="margin-top:18px">
      <h2 style="font-size:17px;margin:0 0 8px">পাসওয়ার্ড ভুলে গেছেন?</h2>
      <p class="jn-muted" style="margin:0 0 14px">
        পাসওয়ার্ড ভুলে গেলে নিজে রিসেট করা যায় না। আপনার নিবন্ধিত ইমেইল থেকে
        <strong>{{ SUPPORT_EMAIL }}</strong> ঠিকানায় একটি ইমেইল পাঠান। যাচাইয়ের পর আমরা নতুন পাসওয়ার্ড সেট করে দেব।
      </p>
      <a :href="mailto" class="jn-btn ghost">ইমেইল পাঠান</a>
    </div>
  </div>
</template>