<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { api, errorMessage, isLoggedIn, bnDate, bnNum } from "./journalistApi";
import "./journalist.css";

const router = useRouter();
const TABS = [
  { key: "pending", label: "অপেক্ষমাণ" },
  { key: "approved", label: "অনুমোদিত" },
  { key: "rejected", label: "বাতিল" },
  { key: "all", label: "সব" },
];
const STATUS_LABEL = { pending: "অপেক্ষমাণ", approved: "অনুমোদিত", rejected: "বাতিল" };

const tab = ref("pending");
const page = ref(1);
const list = ref(null);
const loading = ref(true);
const error = ref("");
const notice = ref("");
const forbidden = ref(false);

const open = ref(null); // selected application (detail)
const photoUrl = ref("");
const rejecting = ref(false);
const note = ref("");
const busy = ref(false);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    list.value = (await api.get("/admin/journalist-applications", { params: { status: tab.value, page: page.value } })).data;
  } catch (e) {
    if (e?.response?.status === 403) forbidden.value = true;
    else error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}

function clearPhoto() {
  if (photoUrl.value) URL.revokeObjectURL(photoUrl.value);
  photoUrl.value = "";
}

async function select(row) {
  error.value = "";
  notice.value = "";
  rejecting.value = false;
  note.value = "";
  clearPhoto();
  try {
    open.value = (await api.get(`/admin/journalist-applications/${row.id}`)).data;
    const img = await api.get(`/admin/journalist-applications/${row.id}/files/photo`, { responseType: "blob" });
    photoUrl.value = URL.createObjectURL(img.data);
  } catch (e) {
    error.value = errorMessage(e);
  }
}

// Documents are private: fetch with the login token, then show/download the blob
async function openFile(kind) {
  const w = window.open("", "_blank"); // opened first so the popup blocker allows it
  try {
    const res = await api.get(`/admin/journalist-applications/${open.value.id}/files/${kind}`, { responseType: "blob" });
    const type = res.headers["content-type"] || res.data.type || "";
    const url = URL.createObjectURL(res.data);
    if (/^(image\/|application\/pdf)/.test(type) && w) {
      w.location = url;
    } else {
      w?.close();
      const a = document.createElement("a");
      a.href = url;
      a.download = `${kind}-${open.value.id}`;
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (e) {
    w?.close();
    error.value = errorMessage(e);
  }
}

async function approve() {
  if (!confirm(`${open.value.full_name}-কে সাংবাদিক হিসেবে অনুমোদন দেবেন?`)) return;
  busy.value = true;
  try {
    await api.post(`/admin/journalist-applications/${open.value.id}/approve`);
    notice.value = "আবেদন অনুমোদন করা হয়েছে।";
    open.value = null;
    clearPhoto();
    await load();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}

async function reject() {
  if (note.value.trim().length < 3) { error.value = "বাতিলের কারণ লিখুন।"; return; }
  busy.value = true;
  try {
    await api.post(`/admin/journalist-applications/${open.value.id}/reject`, { note: note.value });
    notice.value = "আবেদন বাতিল করা হয়েছে।";
    open.value = null;
    rejecting.value = false;
    clearPhoto();
    await load();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}

onMounted(() => {
  if (!isLoggedIn()) { router.replace("/journalist/login?next=/admin/journalist-applications"); return; }
  load();
});
onBeforeUnmount(clearPhoto);
watch(tab, () => { page.value = 1; open.value = null; load(); });
watch(page, load);
</script>

<template>
  <div class="jn-page">
    <header class="jn-hero">
      <span class="jn-kicker">অ্যাডমিন</span>
      <h1>সাংবাদিকদের আবেদন</h1>
    </header>

    <p v-if="forbidden" class="jn-alert error">এই পাতা দেখার অনুমতি আপনার নেই।</p>
    <template v-else>
      <p v-if="error" class="jn-alert error" role="alert">{{ error }}</p>
      <p v-if="notice" class="jn-alert ok">{{ notice }}</p>

      <div class="jn-toolbar">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button v-for="t in TABS" :key="t.key" class="jn-btn small" :class="tab === t.key ? 'green' : 'ghost'" @click="tab = t.key">{{ t.label }}</button>
        </div>
      </div>

      <div class="jn-card">
        <p v-if="loading" class="jn-center jn-muted">লোড হচ্ছে ...</p>
        <div v-else-if="list && list.items.length" class="jn-table-wrap">
          <table class="jn-table">
            <thead><tr><th>নাম</th><th>পেশা</th><th>বর্তমান প্রতিষ্ঠান</th><th>মোবাইল</th><th>আবেদনের তারিখ</th><th>অবস্থা</th></tr></thead>
            <tbody>
              <tr v-for="a in list.items" :key="a.id" class="click" @click="select(a)">
                <td><b>{{ a.full_name }}</b><br /><span class="jn-muted">@{{ a.username }}</span></td>
                <td>{{ a.occupation }}</td>
                <td>{{ a.current_platform || "—" }}</td>
                <td>{{ a.phone }}</td>
                <td>{{ bnDate(a.created_at) }}</td>
                <td><span class="jn-badge" :class="a.status">{{ STATUS_LABEL[a.status] || a.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="jn-center jn-muted">কোনো আবেদন নেই।</p>

        <div v-if="list && list.total_pages > 1" class="jn-pager">
          <button class="jn-btn ghost small" :disabled="page <= 1" @click="page--">← আগের</button>
          <span>{{ bnNum(page) }} / {{ bnNum(list.total_pages) }}</span>
          <button class="jn-btn ghost small" :disabled="page >= list.total_pages" @click="page++">পরের →</button>
        </div>
      </div>

      <!-- Selected application -->
      <section v-if="open" class="jn-card" aria-label="আবেদনের বিস্তারিত">
        <h2 class="jn-title">{{ open.full_name }} <span class="jn-badge" :class="open.status">{{ STATUS_LABEL[open.status] || open.status }}</span></h2>

        <div style="display:flex;gap:22px;flex-wrap:wrap">
          <img v-if="photoUrl" :src="photoUrl" alt="" style="width:130px;height:130px;object-fit:cover;border-radius:8px" />
          <dl style="flex:1;min-width:260px;margin:0;display:grid;grid-template-columns:150px 1fr;gap:8px 14px;font-size:14.5px">
            <dt class="jn-muted">ইউজারনেম</dt><dd style="margin:0">{{ open.username }}</dd>
            <dt class="jn-muted">ইমেইল</dt><dd style="margin:0">{{ open.email }}</dd>
            <dt class="jn-muted">মোবাইল</dt><dd style="margin:0">{{ open.phone }}</dd>
            <dt class="jn-muted">NID নম্বর</dt><dd style="margin:0">{{ open.nid_number }}</dd>
            <dt class="jn-muted">পেশা</dt><dd style="margin:0">{{ open.occupation }}</dd>
            <dt class="jn-muted">বর্তমান প্রতিষ্ঠান</dt><dd style="margin:0">{{ open.current_platform || "—" }}</dd>
            <dt class="jn-muted">প্রতিষ্ঠানের ফোন</dt><dd style="margin:0">{{ open.platform_phone || "—" }}</dd>
            <dt class="jn-muted">আবেদনের তারিখ</dt><dd style="margin:0">{{ bnDate(open.created_at) }}</dd>
            <template v-if="open.reviewed_at">
              <dt class="jn-muted">পর্যালোচনা</dt><dd style="margin:0">{{ bnDate(open.reviewed_at) }}</dd>
            </template>
            <template v-if="open.review_note">
              <dt class="jn-muted">বাতিলের কারণ</dt><dd style="margin:0">{{ open.review_note }}</dd>
            </template>
          </dl>
        </div>

        <h3 style="margin:20px 0 6px;font-size:15px">নিজের সম্পর্কে</h3>
        <p style="white-space:pre-line;line-height:1.8;margin:0 0 16px">{{ open.about }}</p>

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px">
          <button class="jn-btn ghost small" @click="openFile('photo')">ছবি দেখুন</button>
          <button class="jn-btn ghost small" @click="openFile('nid')">NID-এর কপি দেখুন</button>
          <button class="jn-btn ghost small" @click="openFile('resume')">রেজুমে দেখুন</button>
        </div>

        <template v-if="open.status === 'pending'">
          <div v-if="!rejecting" style="display:flex;gap:10px">
            <button class="jn-btn green" :disabled="busy" @click="approve">অনুমোদন দিন</button>
            <button class="jn-btn ghost" :disabled="busy" @click="rejecting = true">বাতিল করুন</button>
          </div>
          <div v-else>
            <label for="note" style="font-weight:600;font-size:14px">বাতিলের কারণ (আবেদনকারীকে জানানো হবে না, শুধু রেকর্ডে থাকবে)</label>
            <textarea id="note" v-model="note" class="jn-textarea" style="min-height:90px;margin:6px 0 12px" maxlength="500"></textarea>
            <button class="jn-btn" :disabled="busy" @click="reject">বাতিল নিশ্চিত করুন</button>
            <button class="jn-btn ghost" style="margin-left:10px" @click="rejecting = false">ফিরে যান</button>
          </div>
        </template>
      </section>
    </template>
  </div>
</template>