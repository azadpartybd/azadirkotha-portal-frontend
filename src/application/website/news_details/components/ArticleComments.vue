<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps } from "vue";
import CommentForm from "./CommentForm.vue";

const props = defineProps({
  slug: { type: String, required: true },
});

const API = (process.env.VUE_APP_BASE_API_URL || "/api").replace(/\/$/, "");

const root = ref(null);
const threads = ref([]); // [{ id, name, body, created_at, replies: [...] }]
const page = ref(0);
const totalPages = ref(1);
const totalAll = ref(0);
const loading = ref(false);
const loaded = ref(false);
const failed = ref(false);
const replyOpen = ref(null); // id of the comment / reply whose reply box is open

const bn = (v) => String(v ?? "").replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const initial = (name) => Array.from((name || "").trim())[0] || "?";
const when = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleString("bn-BD", {
    day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka",
  });
};

async function fetchPage(p) {
  if (loading.value) return;
  loading.value = true;
  failed.value = false;
  try {
    const res = await fetch(`${API}/articles/${encodeURIComponent(props.slug)}/comments?page=${p}`);
    if (!res.ok) throw new Error(String(res.status));
    const d = await res.json();
    // a comment posted by this visitor may also come back from the server: skip duplicates
    const seen = new Set(threads.value.map((t) => t.id));
    threads.value.push(...d.comments.filter((t) => !seen.has(t.id)));
    page.value = d.page;
    totalPages.value = d.total_pages;
    totalAll.value = d.total_all;
    loaded.value = true;
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

function onPosted(c) {
  threads.value.unshift({ ...c, replies: [] });
  totalAll.value += 1;
  loaded.value = true;
}

function onReplyPosted(c) {
  // the server always files a reply under its top-level comment (c.parent_id)
  const t = threads.value.find((x) => x.id === c.parent_id);
  if (t) t.replies.push(c);
  totalAll.value += 1;
  replyOpen.value = null;
}

const toggleReply = (id) => { replyOpen.value = replyOpen.value === id ? null : id; };

// Load comments only when the section nears the screen (the feed can hold many stories)
let io = null;
onMounted(() => {
  io = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        io.disconnect();
        fetchPage(1);
      }
    },
    { rootMargin: "300px 0px" }
  );
  io.observe(root.value);
});
onBeforeUnmount(() => io?.disconnect());
</script>

<template>
  <section ref="root" class="comments" aria-label="মন্তব্য">
    <h2 class="heading">মন্তব্য<span v-if="loaded" class="total"> ({{ bn(totalAll) }})</span></h2>

    <CommentForm :slug="slug" @posted="onPosted" />

    <p v-if="loading && !threads.length" class="state" role="status">মন্তব্য লোড হচ্ছে ...</p>
    <p v-else-if="failed" class="state">
      মন্তব্য লোড করা যায়নি।
      <button type="button" class="link" @click="fetchPage(page + 1)">আবার চেষ্টা করুন</button>
    </p>
    <p v-else-if="loaded && !threads.length" class="state">এখনও কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন।</p>

    <ul v-if="threads.length" class="list">
      <li v-for="t in threads" :key="t.id" class="thread">
        <article class="c">
          <div class="avatar" aria-hidden="true">{{ initial(t.name) }}</div>
          <div class="c-main">
            <header class="c-head">
              <strong class="who">{{ t.name }}</strong>
              <time :datetime="t.created_at">{{ when(t.created_at) }}</time>
            </header>
            <p class="text">{{ t.body }}</p>
            <button type="button" class="link" @click="toggleReply(t.id)">উত্তর দিন</button>
            <CommentForm
              v-if="replyOpen === t.id"
              :slug="slug" :parent-id="t.id" :replying-to="t.name"
              @posted="onReplyPosted" @cancel="replyOpen = null"
            />
          </div>
        </article>

        <!-- replies: one level only, every reply sits under its top-level comment -->
        <ul v-if="t.replies.length" class="replies">
          <li v-for="r in t.replies" :key="r.id">
            <article class="c is-reply">
              <div class="avatar" aria-hidden="true">{{ initial(r.name) }}</div>
              <div class="c-main">
                <header class="c-head">
                  <strong class="who">{{ r.name }}</strong>
                  <time :datetime="r.created_at">{{ when(r.created_at) }}</time>
                </header>
                <p class="text"><span v-if="r.reply_to" class="to">↪ {{ r.reply_to }}</span>{{ r.body }}</p>
                <button type="button" class="link" @click="toggleReply(r.id)">উত্তর দিন</button>
                <CommentForm
                  v-if="replyOpen === r.id"
                  :slug="slug" :parent-id="r.id" :replying-to="r.name"
                  @posted="onReplyPosted" @cancel="replyOpen = null"
                />
              </div>
            </article>
          </li>
        </ul>
      </li>
    </ul>

    <div v-if="loaded && page < totalPages" class="more">
      <button type="button" class="more-btn" :disabled="loading" @click="fetchPage(page + 1)">
        {{ loading ? "লোড হচ্ছে ..." : "আরও মন্তব্য দেখুন" }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.comments { margin: 1.75rem 0 1.25rem; padding-top: 1.125rem; border-top: 4px double #222; }
.heading { font-family: 'Noto Serif Bengali', serif; font-size: 1.375rem; color: #1b1b1b; margin: 0 0 1rem; }
.total { color: #006a4e; }

.state { text-align: center; color: #666; padding: 1.25rem 0; font-size: 0.9375rem; margin: 0; }

.list { list-style: none; margin: 1.25rem 0 0; padding: 0; }
.thread { padding: 1.125rem 0; border-bottom: 1px solid #d8d8d8; }
.thread:first-child { border-top: 1px solid #d8d8d8; }

.c { display: flex; gap: 0.75rem; }
.c-main { flex: 1; min-width: 0; }
.avatar {
  flex: none; width: 2.5rem; height: 2.5rem; border-radius: 50%; background: #006a4e; color: #fff;
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.0625rem;
}
.is-reply .avatar { width: 2rem; height: 2rem; font-size: 0.9375rem; background: #555; }

.c-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.25rem 0.75rem; }
.who { color: #1b1b1b; font-size: 0.9375rem; }
.c-head time { font-size: 0.75rem; color: #888; }

/* comments are plain text (never v-html), so visitors can't inject markup */
.text { margin: 0.25rem 0 0.375rem; font-size: 1rem; line-height: 1.8; color: #2b2b2b; white-space: pre-wrap; overflow-wrap: anywhere; }
.to { color: #006a4e; font-weight: 600; margin-right: 0.5rem; }

.link {
  font: inherit; font-size: 0.8125rem; font-weight: 600; color: #006a4e; background: none; border: 0; padding: 0; cursor: pointer;
}
.link:hover { color: #f21b3f; }
.link:focus-visible { outline: 2px solid #f21b3f; outline-offset: 2px; }

.replies {
  list-style: none; margin: 0.875rem 0 0 1.25rem; padding: 0 0 0 1.25rem; border-left: 2px solid #006a4e;
  display: flex; flex-direction: column; gap: 1rem;
}

.more { text-align: center; padding-top: 1.125rem; }
.more-btn {
  font: inherit; font-size: 0.875rem; font-weight: 600; color: #222; background: #f3f4f3;
  border: 1px solid #d9dcda; border-radius: 50px; padding: 0.5rem 1.375rem; cursor: pointer; transition: all 0.3s;
}
.more-btn:hover:not(:disabled) { background: #006a4e; border-color: #006a4e; color: #fff; }
.more-btn:disabled { opacity: 0.6; cursor: default; }
.more-btn:focus-visible { outline: 2px solid #f21b3f; outline-offset: 2px; }

@media (max-width: 600px) {
  .avatar { width: 2.125rem; height: 2.125rem; font-size: 0.9375rem; }
  .is-reply .avatar { width: 1.75rem; height: 1.75rem; font-size: 0.8125rem; }
  .replies { margin-left: 0.5rem; padding-left: 0.75rem; }
}
</style>