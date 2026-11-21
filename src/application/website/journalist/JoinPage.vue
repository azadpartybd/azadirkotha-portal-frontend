<script setup>
import { reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { api, errorMessage } from "./journalistApi";
import "./journalist.css";

const router = useRouter();
// opens in a new tab, so the applicant keeps what they typed
const termsHref = computed(() => router.resolve("/journalist/terms-conditions").href);

const form = reactive({
  name: "", phone: "", email: "", username: "", password: "", confirm: "",
  nid_number: "", occupation: "", current_platform: "", platform_phone: "", about: "", agree: false,
});
const files = reactive({ photo: null, nid_copy: null, resume: null });
const photoPreview = ref("");
const sending = ref(false);
const progress = ref(0);
const error = ref("");
const done = ref(false);
const top = ref(null);

const RULES = {
  photo: { label: "ছবি", mb: 3, ext: /\.(jpe?g|png|webp)$/i },
  nid_copy: { label: "NID-এর কপি", mb: 5, ext: /\.(jpe?g|png|pdf)$/i },
  resume: { label: "রেজুমে (CV)", mb: 5, ext: /\.(pdf|docx?)$/i },
};

const toAscii = (s) => s.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));

function onFile(kind, e) {
  const file = e.target.files?.[0] || null;
  const rule = RULES[kind];
  error.value = "";
  if (file && !rule.ext.test(file.name)) {
    error.value = `${rule.label}: ফাইলের ধরন সঠিক নয়।`;
    e.target.value = "";
    files[kind] = null;
    return;
  }
  if (file && file.size > rule.mb * 1024 * 1024) {
    error.value = `${rule.label}: ফাইল সর্বোচ্চ ${rule.mb} এমবি হতে পারবে।`;
    e.target.value = "";
    files[kind] = null;
    return;
  }
  files[kind] = file;
  if (kind === "photo") {
    if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
    photoPreview.value = file ? URL.createObjectURL(file) : "";
  }
}

function validate() {
  if (form.name.trim().length < 2) return "আপনার পূর্ণ নাম লিখুন।";
  if (!/^[0-9০-৯+\-\s()/,]{6,40}$/.test(form.phone.trim())) return "সঠিক মোবাইল নম্বর দিন।";
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "সঠিক ইমেইল ঠিকানা দিন।";
  if (!/^[A-Za-z0-9_.-]{3,30}$/.test(form.username.trim())) return "ইউজারনেম ৩–৩০ অক্ষরের হতে হবে (ইংরেজি অক্ষর, সংখ্যা, _ . -)।";
  if (form.password.length < 8) return "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।";
  if (form.password !== form.confirm) return "পাসওয়ার্ড দুটি মিলছে না।";
  if (!/^(\d{10}|\d{13}|\d{17})$/.test(toAscii(form.nid_number.replace(/\s/g, "")))) return "সঠিক NID নম্বর দিন (১০, ১৩ বা ১৭ সংখ্যা)।";
  if (form.occupation.trim().length < 2) return "আপনার পেশা লিখুন।";
  if (form.about.trim().length < 20) return "নিজের সম্পর্কে অন্তত ২০ অক্ষর লিখুন।";
  if (!files.photo) return "আপনার ছবি আপলোড করুন।";
  if (!files.nid_copy) return "NID-এর কপি আপলোড করুন।";
  if (!files.resume) return "রেজুমে (CV) আপলোড করুন।";
  if (!form.agree) return "চালিয়ে যেতে নীতিমালা ও শর্তাবলীতে সম্মতি দিন।";
  return "";
}

async function submit() {
  error.value = validate();
  if (error.value) {
    top.value?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  const fd = new FormData();
  ["name", "phone", "email", "username", "password", "nid_number", "occupation", "current_platform", "platform_phone", "about"].forEach((k) =>
    fd.append(k, k === "password" ? form[k] : String(form[k]).trim())
  );
  fd.append("photo", files.photo);
  fd.append("nid_copy", files.nid_copy);
  fd.append("resume", files.resume);

  sending.value = true;
  progress.value = 0;
  try {
    await api.post("/journalists/apply", fd, {
      onUploadProgress: (e) => { if (e.total) progress.value = Math.round((e.loaded / e.total) * 100); },
    });
    done.value = true;
    window.scrollTo({ top: 0 });
  } catch (e) {
    error.value = errorMessage(e);
    top.value?.scrollIntoView({ behavior: "smooth", block: "center" });
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <div class="jn-page">
    <header class="jn-hero">
      <span class="jn-kicker">সাংবাদিক নিবন্ধন</span>
      <h1>আমাদের সাথে সাংবাদিক হিসেবে যুক্ত হোন</h1>
      <p class="jn-lead">
        আবেদন জমা দিন। আমাদের টিম আপনার তথ্য যাচাই করে অনুমোদন দিলে আপনি লগইন করে নিজের ড্যাশবোর্ড থেকে লেখা জমা ও পরিচালনা করতে পারবেন।
      </p>
    </header>

    <div v-if="done" class="jn-card jn-center">
      <h2 class="jn-title">আবেদন জমা হয়েছে ✔</h2>
      <p>ধন্যবাদ! আপনার আবেদনটি যাচাইয়ের জন্য পাঠানো হয়েছে। অনুমোদন হলে আপনার দেওয়া ইউজারনেম ও পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।</p>
      <p><router-link to="/" class="jn-btn green">হোম পেজে ফিরে যান</router-link></p>
    </div>

    <form v-else @submit.prevent="submit" novalidate>
      <div ref="top"></div>
      <p v-if="error" class="jn-alert error" role="alert">{{ error }}</p>

      <section class="jn-card">
        <h2 class="jn-title">ব্যক্তিগত তথ্য</h2>
        <div class="jn-grid">
          <div class="jn-field">
            <label for="name">পূর্ণ নাম <span class="req">*</span></label>
            <input id="name" v-model="form.name" class="jn-input" autocomplete="name" />
          </div>
          <div class="jn-field">
            <label for="nid">জাতীয় পরিচয়পত্র (NID) নম্বর <span class="req">*</span></label>
            <input id="nid" v-model="form.nid_number" class="jn-input" inputmode="numeric" />
            <p class="jn-hint">১০, ১৩ বা ১৭ সংখ্যা</p>
          </div>
          <div class="jn-field">
            <label for="phone">মোবাইল নম্বর <span class="req">*</span></label>
            <input id="phone" v-model="form.phone" class="jn-input" inputmode="tel" autocomplete="tel" />
          </div>
          <div class="jn-field">
            <label for="email">ইমেইল <span class="req">*</span></label>
            <input id="email" v-model="form.email" type="email" class="jn-input" autocomplete="email" />
          </div>
        </div>
      </section>

      <section class="jn-card">
        <h2 class="jn-title">পেশাগত তথ্য</h2>
        <div class="jn-grid">
          <div class="jn-field">
            <label for="occupation">বর্তমান পেশা <span class="req">*</span></label>
            <input id="occupation" v-model="form.occupation" class="jn-input" placeholder="যেমন: প্রতিবেদক, ফ্রিল্যান্স লেখক, শিক্ষার্থী" />
          </div>
          <div class="jn-field">
            <label for="platform">বর্তমানে অন্য কোনো সংবাদ মাধ্যমে থাকলে তার নাম</label>
            <input id="platform" v-model="form.current_platform" class="jn-input" />
          </div>
          <div class="jn-field">
            <label for="pphone">ওই প্রতিষ্ঠানের ফোন নম্বর</label>
            <input id="pphone" v-model="form.platform_phone" class="jn-input" inputmode="tel" />
          </div>
          <div class="jn-field full">
            <label for="about">নিজের সম্পর্কে লিখুন <span class="req">*</span></label>
            <textarea id="about" v-model="form.about" class="jn-textarea" maxlength="1000" placeholder="আপনার অভিজ্ঞতা, আগ্রহের বিষয় এবং কেন আমাদের সাথে কাজ করতে চান"></textarea>
            <p class="jn-hint">{{ form.about.length }} / ১০০০</p>
          </div>
        </div>
      </section>

      <section class="jn-card">
        <h2 class="jn-title">কাগজপত্র</h2>
        <div class="jn-grid">
          <div class="jn-field">
            <label for="photo">আপনার ছবি <span class="req">*</span></label>
            <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" class="jn-input" @change="onFile('photo', $event)" />
            <p class="jn-hint">JPG, PNG বা WEBP, সর্বোচ্চ ৩ এমবি</p>
            <img v-if="photoPreview" :src="photoPreview" alt="" style="width:96px;height:96px;object-fit:cover;border-radius:50%;margin-top:8px" />
          </div>
          <div class="jn-field">
            <label for="nid_copy">NID-এর কপি <span class="req">*</span></label>
            <input id="nid_copy" type="file" accept="image/jpeg,image/png,application/pdf" class="jn-input" @change="onFile('nid_copy', $event)" />
            <p class="jn-hint">ছবি (JPG/PNG) বা PDF, সর্বোচ্চ ৫ এমবি</p>
          </div>
          <div class="jn-field full">
            <label for="resume">রেজুমে (CV) <span class="req">*</span></label>
            <input id="resume" type="file" accept=".pdf,.doc,.docx,application/pdf" class="jn-input" @change="onFile('resume', $event)" />
            <p class="jn-hint">PDF বা Word ফাইল, সর্বোচ্চ ৫ এমবি</p>
          </div>
        </div>
      </section>

      <section class="jn-card">
        <h2 class="jn-title">লগইন তথ্য</h2>
        <div class="jn-grid">
          <div class="jn-field">
            <label for="username">ইউজারনেম <span class="req">*</span></label>
            <input id="username" v-model="form.username" class="jn-input" autocomplete="username" />
            <p class="jn-hint">ইংরেজি অক্ষর, সংখ্যা, _ . - (৩–৩০ অক্ষর)</p>
          </div>
          <div></div>
          <div class="jn-field">
            <label for="password">পাসওয়ার্ড <span class="req">*</span></label>
            <input id="password" v-model="form.password" type="password" class="jn-input" autocomplete="new-password" />
          </div>
          <div class="jn-field">
            <label for="confirm">পাসওয়ার্ড আবার লিখুন <span class="req">*</span></label>
            <input id="confirm" v-model="form.confirm" type="password" class="jn-input" autocomplete="new-password" />
          </div>
        </div>
        <p class="jn-hint">অনুমোদন না হওয়া পর্যন্ত এই অ্যাকাউন্টে লগইন করা যাবে না।</p>
      </section>

      <label style="display:flex;gap:10px;align-items:flex-start;margin-bottom:18px;font-size:14px;line-height:1.7">
        <input v-model="form.agree" type="checkbox" style="margin-top:6px" />
        <span>
          আমি নিশ্চিত করছি যে দেওয়া সব তথ্য সঠিক। আমার NID ও অন্যান্য কাগজপত্র শুধু যাচাইয়ের কাজে ব্যবহৃত হবে এবং প্রকাশ করা হবে না।
          আমি
          <a :href="termsHref" target="_blank" rel="noopener" class="jn-link">নীতিমালা ও শর্তাবলী</a>
          পড়েছি এবং মেনে চলতে সম্মত।
        </span>
      </label>

      <button type="submit" class="jn-btn" :disabled="sending">
        {{ sending ? (progress < 100 ? `আপলোড হচ্ছে ${progress}%` : "জমা হচ্ছে ...") : "আবেদন জমা দিন" }}
      </button>
      <span class="jn-muted" style="margin-left:14px">ইতিমধ্যে অনুমোদিত? <router-link to="/journalist/login" class="jn-link">লগইন করুন</router-link></span>
    </form>
  </div>
</template>