<script setup>
import { reactive, defineProps, defineEmits } from "vue";

// Used for both the main comment box and the inline reply box.
const props = defineProps({
  slug: { type: String, required: true },
  parentId: { type: Number, default: null }, // comment or reply being answered
  replyingTo: { type: String, default: "" },
});
const emit = defineEmits(["posted", "cancel"]);

const API = (process.env.VUE_APP_BASE_API_URL || "/api").replace(/\/$/, "");
const NAME_KEY = "comment_author";
const MAX_NAME = 60;
const MAX_BODY = 2000;

const readName = () => {
  try { return localStorage.getItem(NAME_KEY) || ""; } catch { return ""; }
};
const saveName = (v) => {
  try { localStorage.setItem(NAME_KEY, v); } catch { /* private mode: ignore */ }
};

const bn = (v) => String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

const f = reactive({ name: readName(), body: "", website: "", busy: false, error: "", notice: "" });

async function submit() {
  if (f.busy) return;
  const name = f.name.trim();
  const body = f.body.trim();
  f.error = "";
  f.notice = "";
  if (!name) { f.error = "আপনার নাম লিখুন।"; return; }
  if (!body) { f.error = "মন্তব্য লিখুন।"; return; }

  f.busy = true;
  try {
    const res = await fetch(`${API}/articles/${encodeURIComponent(props.slug)}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, body, parent_id: props.parentId, website: f.website }),
    });
    if (res.status === 429) {
      f.error = "অনেক দ্রুত মন্তব্য করা হচ্ছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
      return;
    }
    if (!res.ok) throw new Error(String(res.status));

    const c = await res.json();
    saveName(name);
    f.body = "";
    if (c.status === "approved") emit("posted", c);
    else f.notice = "আপনার মন্তব্যটি পর্যালোচনার পর প্রকাশিত হবে।";
  } catch {
    f.error = "মন্তব্য পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।";
  } finally {
    f.busy = false;
  }
}
</script>

<template>
  <form class="form" :class="{ 'is-reply': parentId }" novalidate @submit.prevent="submit">
    <p v-if="replyingTo" class="replying">{{ replyingTo }}-কে উত্তর দিচ্ছেন</p>

    <label class="field">
      <span class="label">আপনার নাম</span>
      <input v-model="f.name" type="text" :maxlength="MAX_NAME" autocomplete="name" placeholder="নাম লিখুন" />
    </label>

    <label class="field">
      <span class="label">{{ parentId ? "আপনার উত্তর" : "আপনার মন্তব্য" }}</span>
      <textarea
        v-model="f.body" :maxlength="MAX_BODY" :rows="parentId ? 3 : 4"
        :placeholder="parentId ? 'উত্তর লিখুন ...' : 'আপনার মন্তব্য লিখুন ...'"
      ></textarea>
    </label>

    <!-- honeypot: hidden from people, bots fill it in -->
    <input v-model="f.website" class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />

    <div class="row">
      <span class="count">{{ bn(f.body.length) }}/{{ bn(MAX_BODY) }}</span>
      <div class="actions">
        <button v-if="parentId" type="button" class="ghost" @click="$emit('cancel')">বাতিল</button>
        <button type="submit" class="send" :disabled="f.busy">
          {{ f.busy ? "পাঠানো হচ্ছে ..." : parentId ? "উত্তর পাঠান" : "মন্তব্য করুন" }}
        </button>
      </div>
    </div>

    <p v-if="f.error" class="msg err" role="alert">{{ f.error }}</p>
    <p v-if="f.notice" class="msg ok" role="status">{{ f.notice }}</p>
  </form>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: 0.75rem; }
.form.is-reply { margin-top: 0.75rem; padding: 0.875rem; background: #f3f5f4; border-left: 3px solid #006a4e; }

.replying { margin: 0; font-size: 0.8125rem; font-weight: 600; color: #006a4e; }

.field { display: flex; flex-direction: column; gap: 0.25rem; }
.label { font-size: 0.8125rem; color: #555; font-weight: 600; }

input[type="text"], textarea {
  font: inherit; font-size: 0.9375rem; color: #222; background: #fff;
  border: 1px solid #c9cdcb; border-radius: 4px; padding: 0.5rem 0.75rem; width: 100%; box-sizing: border-box;
}
textarea { resize: vertical; line-height: 1.7; min-height: 5rem; }
input[type="text"]:focus-visible, textarea:focus-visible { outline: 2px solid #006a4e; outline-offset: 1px; border-color: #006a4e; }

.hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }

.row { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.count { font-size: 0.75rem; color: #888; }
.actions { display: flex; gap: 0.5rem; margin-left: auto; }

.send, .ghost {
  font: inherit; font-size: 0.875rem; font-weight: 600; padding: 0.5rem 1.125rem; cursor: pointer; transition: all 0.3s;
}
.send { color: #fff; background: #006a4e; border: 1px solid #006a4e; }
.send:hover:not(:disabled) { background: #f21b3f; border-color: #f21b3f; }
.send:disabled { opacity: 0.6; cursor: default; }
.ghost { color: #444; background: transparent; border: 1px solid #c9cdcb; }
.ghost:hover { border-color: #444; }
.send:focus-visible, .ghost:focus-visible { outline: 2px solid #f21b3f; outline-offset: 2px; }

.msg { margin: 0; font-size: 0.875rem; }
.err { color: #c4122f; }
.ok { color: #006a4e; }
</style>