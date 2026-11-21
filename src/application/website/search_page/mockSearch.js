// src/mockSearch.js
// Mock data for the search page. Replace `searchNews` with your real API call.
//
// Expected API contract:
//   GET /api/search?q=...&category=...&date=YYYY-MM-DD&offset=0&limit=12
//   -> { items: [{ id, title, summary, image, date, to, categoryTitle }], total }

export const searchCategories = [
  { slug: "politics", title: "রাজনীতি" },
  { slug: "national", title: "জাতীয়" },
  { slug: "international", title: "আন্তর্জাতিক" },
  { slug: "economy", title: "অর্থনীতি" },
  { slug: "sports", title: "খেলাধুলা" },
  { slug: "entertainment", title: "বিনোদন" },
  { slug: "opinion", title: "মতামত" },
];

const topics = [
  "নির্বাচন", "ইশতেহার", "জরিপ", "অর্থনীতি", "বাজেট", "শিক্ষা",
  "স্বাস্থ্য", "যোগাযোগ", "কৃষি", "প্রযুক্তি", "পরিবেশ", "বিনিয়োগ",
];

const ALL = Array.from({ length: 120 }, (_, i) => {
  const cat = searchCategories[i % searchCategories.length];
  const topic = topics[(i * 5) % topics.length];
  const d = new Date(2026, 9, 29);
  d.setDate(d.getDate() - (i % 45));
  return {
    id: i + 1,
    title: `${topic} নিয়ে ${cat.title} বিভাগের বিশেষ প্রতিবেদন (${(i + 1).toLocaleString("bn-BD")})`,
    summary: `${topic} সংক্রান্ত সর্বশেষ পরিস্থিতি, বিশ্লেষকদের মতামত এবং সামনের দিনের সম্ভাব্য পদক্ষেপ নিয়ে এই প্রতিবেদনে বিস্তারিত তুলে ধরা হয়েছে। সংশ্লিষ্ট পক্ষগুলোর বক্তব্য ও মাঠপর্যায়ের তথ্যও এখানে যুক্ত করা হয়েছে।`,
    image: `https://picsum.photos/seed/news${i + 1}/640/360`,
    date: d.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" }),
    to: `/news/${cat.slug}-${i + 1}`,
    category: cat.slug,
    categoryTitle: cat.title,
  };
});

export async function searchNews({ q = "", cat = "", date = null, offset = 0, limit = 12 } = {}) {
  await new Promise((r) => setTimeout(r, 350)); // fake network delay

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = ALL.filter((n) => {
    if (cat && n.category !== cat) return false;
    const hay = `${n.title} ${n.summary}`.toLowerCase();
    return terms.every((t) => hay.includes(t)); // every word must appear
  });

  // `date` (archive day) is accepted so the real API can filter by it
  void date;

  return { items: matches.slice(offset, offset + limit), total: matches.length };
}