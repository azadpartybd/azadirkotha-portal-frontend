// Category config + fake API for the category page.
// Replace fetchFeatured / fetchCategoryNews with real API calls later.

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const categories = {
  desh: {
    title: "দেশজুড়ে",
    description: "আট বিভাগ ও ৬৪ জেলার সর্বশেষ খবর, এক জায়গায়।",
    subLabel: "বিভাগ অনুযায়ী খবর",
    subs: [
      { slug: "dhaka", title: "ঢাকা" }, { slug: "chattogram", title: "চট্টগ্রাম" },
      { slug: "sylhet", title: "সিলেট" }, { slug: "rajshahi", title: "রাজশাহী" },
      { slug: "barishal", title: "বরিশাল" }, { slug: "khulna", title: "খুলনা" },
      { slug: "rangpur", title: "রংপুর" }, { slug: "mymensingh", title: "ময়মনসিংহ" },
    ],
  },
  politics: {
    title: "রাজনীতি",
    description: "দল, সরকার ও নির্বাচনের ভেতরের খবর ও বিশ্লেষণ।",
    subLabel: "বিষয় অনুযায়ী খবর",
    subs: [
      { slug: "election", title: "নির্বাচন" }, { slug: "government", title: "সরকার" },
      { slug: "parties", title: "রাজনৈতিক দল" },
    ],
  },
  economy: {
    title: "অর্থনীতি",
    description: "বাজার, বাজেট ও কর্মসংস্থান: অর্থনীতির প্রতিটি গুরুত্বপূর্ণ খবর।",
    subLabel: "বিষয় অনুযায়ী খবর",
    subs: [
      { slug: "market", title: "বাজার" }, { slug: "policy", title: "নীতি" }, { slug: "jobs", title: "চাকরি" },
    ],
  },
  sports: { title: "খেলাধুলা", description: "মাঠের লড়াই, ফলাফল ও খেলোয়াড়দের গল্প।", subLabel: "", subs: [] },
  entertainment: { title: "বিনোদন", description: "সিনেমা, গান, নাটক ও তারকাদের খবর।", subLabel: "", subs: [] },
  opinion: { title: "মতামত", description: "বিশিষ্টজনের কলাম, বিশ্লেষণ ও পাঠকের ভাবনা।", subLabel: "", subs: [] },
};

export const getCategory = (slug) => categories[slug] ?? null;

const titles = [
  "প্রার্থীরা গ্রামীণ এলাকায় ডিজিটাল বিপ্লবের প্রতিশ্রুতি দিলেন",
  "২০২৫ নির্বাচনে নারীরা প্রচার ট্রেইলে নেতৃত্ব দিচ্ছেন",
  "নির্বাচন পর্যবেক্ষণে আন্তর্জাতিক পর্যবেক্ষক এসেছেন",
  "সামাজিক মাধ্যম কীভাবে প্রচারণা পুনর্গঠন করছে",
  "তরুণ ভোটাররা জলবায়ু পদক্ষেপ দাবি করছে",
  "স্থানীয় নেতারা তৃণমূল চ্যালেঞ্জ সম্পর্কে বলছেন",
  "ভোটকেন্দ্রে প্রযুক্তি ব্যবহারে নতুন নির্দেশনা",
  "প্রবাসী ভোটারদের অংশগ্রহণ নিয়ে আলোচনা",
  "নির্বাচনী ব্যয়ের সীমা কঠোরভাবে মানার তাগিদ",
  "সংবেদনশীল এলাকায় নিরাপত্তা বাড়ানো হয়েছে",
  "ভোটার নিবন্ধনের শেষ তারিখ বাড়ানো হয়েছে",
  "প্রচার সমাবেশে ছোটখাটো ধস্তাধস্তির খবর",
  "নির্বাচন কমিশন অভিযোগ তদন্ত করছে",
  "মূল নির্বাচনী এলাকায় ঘনিষ্ঠ প্রতিযোগিতা দেখাচ্ছে জরিপ",
  "বিশ্লেষকরা উচ্চ ভোটার উপস্থিতির পূর্বাভাস দিচ্ছেন",
  "অর্থনৈতিক সমস্যা ভোটারদের শীর্ষ উদ্বেগ",
  "ভোটদানের ধরনে আঞ্চলিক বৈচিত্র্য",
  "প্রথমবার ভোটারদের জন্য তথ্যমেলা অনুষ্ঠিত",
  "প্রতিশ্রুতির রাজনীতি ও বাস্তবতা নিয়ে গোলটেবিল",
  "দুর্গম এলাকায় ভোটগ্রহণ সামগ্রী পাঠানো শুরু",
  "প্রার্থীদের হলফনামা যাচাইয়ের কাজ শুরু",
  "ভোটের আগে জোট গঠনে নতুন সমীকরণ",
  "নির্বাচনী কর্মকর্তাদের প্রশিক্ষণ কর্মশালা",
  "দলগুলোর সঙ্গে নির্বাচন কমিশনের সংলাপ",
];

const details = [
  "নির্বাচনকে সামনে রেখে দেশজুড়ে রাজনৈতিক তৎপরতা বাড়ছে। বিভিন্ন জেলায় প্রার্থীরা গণসংযোগ চালাচ্ছেন, আর ভোটাররা জানতে চাইছেন কার কাছে তাদের সমস্যার সমাধান আছে। বিশ্লেষকদের মতে, এবারের প্রচারণা আগের যেকোনো সময়ের চেয়ে বেশি তথ্যনির্ভর ও অংশগ্রহণমূলক হয়ে উঠছে এবং সাধারণ মানুষের প্রত্যাশাও এবার অনেক বেশি স্পষ্ট।",
  "স্থানীয় প্রশাসনের কর্মকর্তারা জানিয়েছেন, ভোটকেন্দ্রগুলোতে নিরাপত্তা ও সুযোগ-সুবিধা নিশ্চিত করতে একাধিক সমন্বয় সভা হয়েছে। বিশেষ করে সংবেদনশীল এলাকাগুলোতে বাড়তি নজরদারির পরিকল্পনা করা হয়েছে। একই সঙ্গে ভোটারদের সচেতন করতে বিভিন্ন এলাকায় তথ্যমেলা ও মতবিনিময় সভার আয়োজন করা হচ্ছে।",
];

const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const dateFor = (i) =>
  new Date(Date.UTC(2025, 0, 5) - i * 8 * 3600 * 1000).toLocaleDateString("bn-BD", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });

function make(slug, subSlug, i) {
  const cat = categories[slug];
  const sub = cat.subs.find((s) => s.slug === subSlug);
  const seed = hash(slug + (subSlug || ""));
  const base = titles[(seed + i * 5) % titles.length];
  // in "all" view, tag each story with one of the sub-categories; inside a sub, always use that one
  const label = sub ? sub.title : cat.subs.length ? cat.subs[i % cat.subs.length].title : "";
  return {
    id: `${slug}-${subSlug || "all"}-${i}`,
    title: label ? `${label}: ${base}` : base,
    date: dateFor(i),
    image: `https://picsum.photos/400/260?random=${300 + (seed % 40) + i}`,
    to: `/news/${(i % 7) + 1}`,
  };
}

export async function fetchFeatured(slug) {
  await wait(200);
  return [0, 1].map((i) => ({
    ...make(slug, "", i),
    image: `https://picsum.photos/700/420?random=${900 + hash(slug) % 30 + i}`,
    caption: i === 0 ? "প্রচারণার একটি দৃশ্য, ছবি: নিজস্ব প্রতিবেদক" : "জনসভায় উপস্থিত মানুষের ভিড়, ছবি: স্টাফ ফটোগ্রাফার",
    summary: details[i % details.length],
  }));
}

// Pagination: returns { items, total }
export async function fetchCategoryNews({ slug, sub = "", offset = 0, limit = 20 }) {
  await wait(600);
  const total = sub ? 45 : 100;
  const items = [];
  for (let i = offset; i < Math.min(offset + limit, total); i++) items.push(make(slug, sub, i + 2)); // +2: skip the two featured
  return { items, total };
}