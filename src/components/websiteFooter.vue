<script setup>
import { computed, onMounted } from "vue";
import { useSiteStore } from "@/store/site";

const site = useSiteStore();
onMounted(() => site.load());

const s = computed(() => site.settings || {});
const menus = computed(() => site.menus || {});

// 0-9 -> ০-৯
const bn = (v) => String(v ?? "").replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

const EXTERNAL = /^(https?:)?\/\/|^(mailto|tel):/i;

// Turn a menu item from the API into a router link or a plain anchor
function toLink(m) {
  const base = { id: m.id, label: m.label, newTab: !!m.new_tab };
  if (m.type === "category") {
    return { ...base, to: `${encodeURIComponent(m.slug)}` };
  }
  if (m.type === "sub_category") {
    return {
      ...base,
      to: m.category_slug
        ? `${encodeURIComponent(m.category_slug)}/${encodeURIComponent(m.slug)}`
        : `${encodeURIComponent(m.slug)}`,
    };
  }
  const url = m.url || "/";
  return EXTERNAL.test(url) ? { ...base, href: url } : { ...base, to: url };
}

const COLUMN_DEFS = [
  { key: "footer_sections", title: "বিভাগসমূহ" },
  { key: "footer_quick", title: "দ্রুত লিংক" },
  { key: "footer_about", title: "আমাদের সম্পর্কে" },
];

const linkColumns = computed(() =>
  COLUMN_DEFS
    .map((c) => ({ ...c, links: (menus.value[c.key] || []).map(toLink) }))
    .filter((c) => c.links.length > 0)
);

const phones = computed(() => [s.value.contact_phone, s.value.contact_phone_secondary].filter(Boolean));
const hasContact = computed(
  () => phones.value.length || s.value.contact_email || s.value.ads_email || s.value.office_address || s.value.map_url
);

const socials = computed(() =>
  [
    { key: "facebook", label: "Facebook", icon: "f", href: s.value.facebook_url },
    { key: "twitter", label: "Twitter", icon: "𝕏", href: s.value.twitter_url },
    { key: "instagram", label: "Instagram", icon: "📷", href: s.value.instagram_url },
    { key: "youtube", label: "YouTube", icon: "▶", href: s.value.youtube_url },
    { key: "linkedin", label: "LinkedIn", icon: "in", href: s.value.linkedin_url },
  ].filter((x) => x.href)
);

// Editor / publisher / registration: the imprint lines Bangladeshi newspapers carry.
// Each line has its own shape: [prefix] <name> [suffix]
const imprint = computed(() => {
  const out = [];
  const ed = s.value.editor_name;
  const pub = s.value.publisher_name;

  if (ed && pub && ed === pub) {
    // same person: "সম্পাদক ও প্রকাশক: Name"
    out.push({ key: "both", prefix: "সম্পাদক ও প্রকাশক:", name: ed, suffix: "" });
  } else {
    // "প্রকাশনা ও সম্পাদকীয় মন্ডলীর সভাপতি: Name"
    if (ed) out.push({ key: "editor", prefix: "প্রকাশনা ও সম্পাদকীয় মন্ডলীর সভাপতি:", name: ed, suffix: "" });
    // "Name কর্তৃক প্রকাশিত"
    if (pub) out.push({ key: "publisher", prefix: "", name: pub, suffix: " কর্তৃক প্রকাশিত" });
  }

  // "নিবন্ধন নং: ১২৩"
  if (s.value.registration_number)
    out.push({ key: "reg", prefix: "নিবন্ধন নং:", name: bn(s.value.registration_number), suffix: "" });

  return out;
});

const copyright = computed(
  () => s.value.copyright_text || `© ${bn(new Date().getFullYear())} ${s.value.site_name || ""} সর্বস্বত্ব সংরক্ষিত।`
);

const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
</script>

<template>
  <footer v-if="site.loaded" class="footer">
    <div class="inner">
      <!-- Main grid: left half = brand | right half = 2-column grid (sections, quick links, about, contact) -->
      <div class="main">
        <section class="brand">
          <router-link to="/" class="brand-link" :aria-label="s.site_name || 'হোম'">
            <span v-if="s.logo" class="logo-tile"><img :src="s.logo" :alt="s.site_name" /></span>
            <span v-if="s.site_name" class="name">{{ s.site_name }}</span>
          </router-link>

          <!-- Editor / publisher / registration, right under the logo -->
          <div v-if="imprint.length" class="imprint">
            <p v-for="i in imprint" :key="i.key">
              <template v-if="i.prefix">{{ i.prefix }} </template>
              <strong>{{ i.name }}</strong>
              <template v-if="i.suffix"> {{ i.suffix }}</template>
            </p>
          </div>

          <p v-if="s.site_slogan" class="slogan">{{ s.site_slogan }}</p>
          <p v-if="s.site_description" class="desc">{{ s.site_description }}</p>

          <div v-if="socials.length" class="social">
            <span class="social-label">আমাদের অনুসরণ করুন</span>
            <div class="social-links">
              <a
                v-for="x in socials" :key="x.key"
                :href="x.href" target="_blank" rel="noopener noreferrer" :aria-label="x.label"
              ><i class="icon">{{ x.icon }}</i></a>
            </div>
          </div>
        </section>

        <div class="right">
          <nav v-for="col in linkColumns" :key="col.key" class="links" :aria-label="col.title">
            <h4>{{ col.title }}</h4>
            <ul>
              <li v-for="l in col.links" :key="l.id">
                <a
                  v-if="l.href" :href="l.href"
                  :target="l.newTab ? '_blank' : null" :rel="l.newTab ? 'noopener noreferrer' : null"
                >{{ l.label }}</a>
                <router-link v-else :to="l.to" :target="l.newTab ? '_blank' : null">{{ l.label }}</router-link>
              </li>
            </ul>
          </nav>

          <section v-if="hasContact" class="contact">
            <h4>যোগাযোগ</h4>
            <div v-if="s.office_address" class="contact-item">
              <span class="contact-icon" aria-hidden="true">📍</span>
              <p>{{ s.office_address }}</p>
            </div>
            <div v-if="phones.length" class="contact-item">
              <span class="contact-icon" aria-hidden="true">📞</span>
              <p>
                <template v-for="(p, i) in phones" :key="p">
                  <br v-if="i > 0" />
                  <a :href="'tel:' + p">{{ bn(p) }}</a>
                </template>
              </p>
            </div>
            <div v-if="s.contact_email" class="contact-item">
              <span class="contact-icon" aria-hidden="true">📧</span>
              <p><a :href="'mailto:' + s.contact_email">{{ s.contact_email }}</a></p>
            </div>
            <div v-if="s.ads_email" class="contact-item">
              <span class="contact-icon" aria-hidden="true">📢</span>
              <p>বিজ্ঞাপন: <a :href="'mailto:' + s.ads_email">{{ s.ads_email }}</a></p>
            </div>
            <div v-if="s.map_url" class="contact-item">
              <span class="contact-icon" aria-hidden="true">🗺</span>
              <p><a :href="s.map_url" target="_blank" rel="noopener noreferrer">মানচিত্রে দেখুন</a></p>
            </div>
          </section>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="bottom">
        <p class="copyright">{{ copyright }}</p>
        <button type="button" class="to-top" @click="toTop">↑ উপরে যান</button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700&display=swap');

/* White footer. All sizes are in rem so it scales with the root font-size on big monitors.
   Borders stay in px; media-query breakpoints stay in px on purpose. */

.footer {
  background: #fff;
  color: #444;
  font-family: 'Noto Sans Bengali', 'SolaimanLipi', sans-serif;
  border-top: 4px solid #f21b3f;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.04);
  margin-top: 2.5rem;
}
.inner { max-width: 87.5rem; margin: 0 auto; }

/* Main grid: left half = brand, right half = 2-column grid of the rest */
.main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.5rem;
  padding: 3.25rem 2.5rem 2.25rem;
}
.main > * { min-width: 0; }

.right {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem 2rem;
  align-content: start;
}
.right > * { min-width: 0; }

h4 {
  color: #1b1b1b; font-family: 'Noto Serif Bengali', serif; font-size: 1.125rem; font-weight: 700;
  margin: 0 0 1.125rem; padding-bottom: 0.625rem; border-bottom: 2px solid #f21b3f; display: inline-block;
}

/* Brand */
.brand-link { display: inline-flex; align-items: center; gap: 0.875rem; text-decoration: none; margin-bottom: 0.875rem; }
.logo-tile { background: #fff; border: 1px solid #e5e5e5; border-radius: 6px; padding: 0.375rem 0.625rem; display: inline-flex; }
.logo-tile img { height: 3rem; max-width: 9.375rem; object-fit: contain; display: block; }
.name { font-family: 'Noto Serif Bengali', serif; font-size: 1.625rem; font-weight: 700; color: #006a4e; line-height: 1.3; }

/* Editor / publisher / registration under the logo */
.imprint { margin: 0 0 0.75rem; }
.imprint p { margin: 0 0 0.25rem; font-size: 0.9375rem; line-height: 1.6; color: #555; }
.imprint strong { color: #1b1b1b; font-weight: 700; }

.slogan { color: #006a4e; font-weight: 600; font-size: 0.875rem; margin: 0 0 0.5rem; }
.desc { font-size: 0.875rem; line-height: 1.8; margin: 0 0 1.375rem; color: #555; }

.social-label { display: block; font-size: 0.8125rem; color: #777; margin-bottom: 0.625rem; }
.social-links { display: flex; gap: 0.625rem; flex-wrap: wrap; }
.social-links a {
  width: 2.5rem; height: 2.5rem; background: #f1f3f2; border: 1px solid #e3e6e4; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #444; text-decoration: none; font-size: 1rem; transition: all 0.3s;
}
.social-links a:hover { background: linear-gradient(135deg, #006a4e 0%, #f21b3f 100%); border-color: transparent; color: #fff; transform: translateY(-3px); }
.social-links a:focus-visible { outline: 2px solid #f21b3f; outline-offset: 2px; }
.icon { font-style: normal; }

/* Link columns */
.links ul { list-style: none; margin: 0; padding: 0; }
.links li { margin-bottom: 0.75rem; }
.links a {
  color: #444; text-decoration: none; font-size: 0.875rem; display: inline-block;
  transition: color 0.3s, padding-left 0.3s;
}
.links a:hover { color: #f21b3f; padding-left: 0.5rem; }
.links a:focus-visible { outline: 2px solid #f21b3f; outline-offset: 2px; }

/* Contact */
.contact-item { display: flex; gap: 0.75rem; margin-bottom: 1rem; align-items: flex-start; }
.contact-icon { font-size: 1.0625rem; min-width: 1.375rem; }
.contact-item p { margin: 0; line-height: 1.6; font-size: 0.875rem; color: #444; }
.contact-item a { color: #444; text-decoration: none; transition: color 0.3s; word-break: break-word; }
.contact-item a:hover { color: #f21b3f; }

/* Bottom bar */
.bottom {
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.875rem;
  margin: 0 2.5rem; padding: 1.375rem 0; border-top: 1px solid #e5e5e5;
}
.copyright { margin: 0; color: #666; font-size: 0.875rem; }
.to-top {
  font: inherit; font-size: 0.8125rem; font-weight: 600; color: #222; background: #f3f4f3;
  border: 1px solid #d9dcda; border-radius: 50px; padding: 0.5rem 1.125rem; cursor: pointer; transition: all 0.3s;
}
.to-top:hover { background: #f21b3f; border-color: #f21b3f; color: #fff; }
.to-top:focus-visible { outline: 2px solid #f21b3f; outline-offset: 2px; }

/* Responsive */
@media (max-width: 1100px) {
  .main { grid-template-columns: 1fr; gap: 2.5rem; }
}
@media (max-width: 768px) {
  .main { padding: 2.5rem 1.25rem 1.75rem; gap: 1.875rem; }
  .right { gap: 1.875rem 1.5rem; }
  .bottom { margin: 0 1.25rem; padding: 1.25rem 0; flex-direction: column; text-align: center; }
}
@media (max-width: 480px) {
  .main { padding: 2rem 0.9375rem 1.5rem; }
  .right { grid-template-columns: 1fr; }
  .brand-link { flex-direction: column; align-items: flex-start; }
  .bottom { margin: 0 0.9375rem; }
}
</style>