<script setup>
import { ref } from "vue";

// Mock data
const topHeadline = ref({
  title: "নির্বাচন ২০২৫: জনগণের কণ্ঠস্বর আগের চেয়ে জোরালো",
  image: "https://picsum.photos/900/400?random=1",
  summary: "নির্বাচন ২০২৫ এর জন্য প্রস্তুতি নিচ্ছে জাতি, দেশজুড়ে প্রতিশ্রুতি, বিতর্ক এবং জনআন্দোলনে উত্তপ্ত হয়ে উঠছে প্রচারণা।",
});

const breakingNews = ref([
  "সুপ্রিম কোর্ট নির্বাচনী আবেদন পর্যালোচনা করবে",
  "রাজধানীতে বড় সমাবেশে হাজার হাজার মানুষের ঢল",
  "নতুন ইশতেহারে অর্থনৈতিক সংস্কারের প্রতিশ্রুতি",
  "এই প্রচারণায় যুব অংশগ্রহণ রেকর্ড উচ্চতায়",
]);

const featuredStories = ref([
  {
    title: "প্রার্থীরা গ্রামীণ এলাকায় ডিজিটাল বিপ্লবের প্রতিশ্রুতি দিলেন",
    image: "https://picsum.photos/300/200?random=2",
  },
  {
    title: "২০২৫ নির্বাচনে নারীরা প্রচার ট্রেইলে নেতৃত্ব দিচ্ছেন",
    image: "https://picsum.photos/300/200?random=3",
  },
  {
    title: "নির্বাচন পর্যবেক্ষণে আন্তর্জাতিক পর্যবেক্ষক এসেছেন",
    image: "https://picsum.photos/300/200?random=4",
  },
]);

const sideStories = ref([
  "সামাজিক মাধ্যম কীভাবে প্রচারণা পুনর্গঠন করছে",
  "তরুণ ভোটাররা জলবায়ু পদক্ষেপ দাবি করছে",
  "স্থানীয় নেতারা তৃণমূল চ্যালেঞ্জ সম্পর্কে বলছেন",
  "মতামত: গণতন্ত্র কি সমৃদ্ধ নাকি ক্ষয়িষ্ণু?",
]);

const campaigns = ref([
  {
    title: "বিরোধী নেতা দেশব্যাপী সফর ঘোষণা করলেন",
    image: "https://picsum.photos/280/180?random=5",
    date: "৫ জানুয়ারি, ২০২৫"
  },
  {
    title: "ক্ষমতাসীন দল অর্থনৈতিক রোডম্যাপ উন্মোচন করল",
    image: "https://picsum.photos/280/180?random=6",
    date: "৪ জানুয়ারি, ২০২৫"
  },
  {
    title: "স্বতন্ত্র প্রার্থীরা গতি পাচ্ছেন",
    image: "https://picsum.photos/280/180?random=7",
    date: "৩ জানুয়ারি, ২০২৫"
  },
  {
    title: "বিতর্কে নীতিগত পার্থক্য উঠে এসেছে",
    image: "https://picsum.photos/280/180?random=8",
    date: "২ জানুয়ারি, ২০২৫"
  },
]);

const incidents = ref([
  {
    title: "প্রচার সমাবেশে ছোটখাটো ধস্তাধস্তির খবর",
    image: "https://picsum.photos/280/180?random=9",
    date: "৫ জানুয়ারি, ২০২৫"
  },
  {
    title: "নির্বাচন কমিশন অভিযোগ তদন্ত করছে",
    image: "https://picsum.photos/280/180?random=10",
    date: "৪ জানুয়ারি, ২০২৫"
  },
  {
    title: "সংবেদনশীল এলাকায় নিরাপত্তা বাড়ানো হয়েছে",
    image: "https://picsum.photos/280/180?random=11",
    date: "৩ জানুয়ারি, ২০২৫"
  },
  {
    title: "ভোটার নিবন্ধনের শেষ তারিখ বাড়ানো হয়েছে",
    image: "https://picsum.photos/280/180?random=12",
    date: "২ জানুয়ারি, ২০২৫"
  },
]);

const upcomingEvents = ref([
  {
    title: "১৫ জানুয়ারি রাষ্ট্রপতি বিতর্ক নির্ধারিত",
    image: "https://picsum.photos/280/180?random=13",
    date: "১৫ জানুয়ারি, ২০২৫"
  },
  {
    title: "গ্রামীণ জেলায় টাউন হল সভা",
    image: "https://picsum.photos/280/180?random=14",
    date: "১২ জানুয়ারি, ২০২৫"
  },
  {
    title: "রাজনৈতিক অংশগ্রহণে যুব ফোরাম",
    image: "https://picsum.photos/280/180?random=15",
    date: "১০ জানুয়ারি, ২০২৫"
  },
  {
    title: "রাজধানী শহরে চূড়ান্ত প্রচার সমাবেশ",
    image: "https://picsum.photos/280/180?random=16",
    date: "৮ জানুয়ারি, ২০২৫"
  },
]);

const predictions = ref([
  {
    title: "মূল নির্বাচনী এলাকায় ঘনিষ্ঠ প্রতিযোগিতা দেখাচ্ছে জরিপ",
    image: "https://picsum.photos/280/180?random=17",
    date: "৫ জানুয়ারি, ২০২৫"
  },
  {
    title: "বিশ্লেষকরা উচ্চ ভোটার উপস্থিতির পূর্বাভাস দিচ্ছেন",
    image: "https://picsum.photos/280/180?random=18",
    date: "৪ জানুয়ারি, ২০২৫"
  },
  {
    title: "অর্থনৈতিক সমস্যা ভোটারদের শীর্ষ উদ্বেগ",
    image: "https://picsum.photos/280/180?random=19",
    date: "৩ জানুয়ারি, ২০২৫"
  },
  {
    title: "ভোটদানের ধরনে আঞ্চলিক বৈচিত্র্য",
    image: "https://picsum.photos/280/180?random=20",
    date: "২ জানুয়ারি, ২০২৫"
  },
]);
</script>

<template>
  <div class="newspaper-body">
    <!-- Breaking News -->
    <div class="breaking-bar">
      <span class="label">জরুরি:</span>
      <marquee class="ticker">
        <span v-for="(item, i) in breakingNews" :key="i">
          {{ item }} &nbsp;&nbsp; • &nbsp;&nbsp;
        </span>
      </marquee>
    </div>

    <!-- Hero Section -->
    <div class="hero">
      <img :src="topHeadline.image" alt="headline" class="hero-img" />
      <div class="hero-text">
        <h1>{{ topHeadline.title }}</h1>
        <p>{{ topHeadline.summary }}</p>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="news-grid">
      <!-- Featured Stories -->
      <div class="featured">
        <h2>বৈশিষ্ট্যযুক্ত সংবাদ</h2>
        <div class="featured-grid">
          <div v-for="(story, i) in featuredStories" :key="i" class="story-card">
            <img :src="story.image" alt="" />
            <h3>{{ story.title }}</h3>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="sidebar">
        <h2>ফোকাসে</h2>
        <ul>
          <li v-for="(item, i) in sideStories" :key="i">{{ item }}</li>
        </ul>
      </aside>
    </div>

    <!-- Category Sections -->
    <div class="category-section">
      <div class="category-header">
        <h2>প্রচারণা</h2>
        <a href="#" class="see-more">আরও দেখুন →</a>
      </div>
      <div class="category-grid">
        <div v-for="(news, i) in campaigns" :key="i" class="news-card">
          <img :src="news.image" alt="" />
          <div class="news-content">
            <span class="news-date">{{ news.date }}</span>
            <h3>{{ news.title }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="category-section">
      <div class="category-header">
        <h2>ঘটনা</h2>
        <a href="#" class="see-more">আরও দেখুন →</a>
      </div>
      <div class="category-grid">
        <div v-for="(news, i) in incidents" :key="i" class="news-card">
          <img :src="news.image" alt="" />
          <div class="news-content">
            <span class="news-date">{{ news.date }}</span>
            <h3>{{ news.title }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="category-section">
      <div class="category-header">
        <h2>আসন্ন ইভেন্ট</h2>
        <a href="#" class="see-more">আরও দেখুন →</a>
      </div>
      <div class="category-grid">
        <div v-for="(news, i) in upcomingEvents" :key="i" class="news-card">
          <img :src="news.image" alt="" />
          <div class="news-content">
            <span class="news-date">{{ news.date }}</span>
            <h3>{{ news.title }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="category-section">
      <div class="category-header">
        <h2>পূর্বাভাস</h2>
        <a href="#" class="see-more">আরও দেখুন →</a>
      </div>
      <div class="category-grid">
        <div v-for="(news, i) in predictions" :key="i" class="news-card">
          <img :src="news.image" alt="" />
          <div class="news-content">
            <span class="news-date">{{ news.date }}</span>
            <h3>{{ news.title }}</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700&display=swap');

.newspaper-body {
  font-family: 'Noto Sans Bengali', 'SolaimanLipi', sans-serif;
  padding: 20px 40px;
  background: #fafafa;
  color: #222;
}

/* Breaking News Bar */
.breaking-bar {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #006a4e 0%, #005a42 100%);
  color: white;
  padding: 8px 16px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 106, 78, 0.2);
}
.breaking-bar .label {
  font-weight: bold;
  margin-right: 12px;
  font-size: 15px;
}
.ticker {
  font-size: 14px;
  white-space: nowrap;
}

/* Hero Section */
.hero {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}
.hero-img {
  flex: 2;
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.hero-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.hero-text h1 {
  font-family: 'Noto Serif Bengali', serif;
  font-size: 32px;
  line-height: 1.4;
  margin-bottom: 12px;
  color: #006a4e;
}
.hero-text p {
  font-size: 16px;
  color: #555;
  line-height: 1.6;
}

/* Main Grid */
.news-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 50px;
}
.featured h2, .sidebar h2 {
  font-family: 'Noto Serif Bengali', serif;
  font-size: 22px;
  margin-bottom: 16px;
  color: #006a4e;
  padding-bottom: 8px;
  border-bottom: 3px solid #f21b3f;
}
.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}
.story-card img {
  width: 100%;
  border-radius: 8px;
  transition: transform 0.3s;
}
.story-card:hover img {
  transform: scale(1.02);
}
.story-card h3 {
  font-size: 15px;
  margin-top: 10px;
  line-height: 1.4;
  font-weight: 600;
}

/* Sidebar */
.sidebar ul {
  list-style: none;
  padding: 0;
}
.sidebar li {
  font-size: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: color 0.3s, padding-left 0.3s;
}
.sidebar li:hover {
  color: #f21b3f;
  padding-left: 8px;
}

/* Category Sections */
.category-section {
  margin-bottom: 50px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 3px solid #f21b3f;
}

.category-header h2 {
  font-family: 'Noto Serif Bengali', serif;
  font-size: 24px;
  margin: 0;
  color: #006a4e;
}

.see-more {
  font-size: 14px;
  color: #f21b3f;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.see-more:hover {
  color: #d1173a;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.news-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  border-top: 3px solid transparent;
}

.news-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 106, 78, 0.15);
  border-top-color: #006a4e;
}

.news-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.news-content {
  padding: 14px;
}

.news-date {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 8px;
}

.news-card h3 {
  font-size: 15px;
  line-height: 1.4;
  font-weight: 600;
  margin: 0;
  color: #222;
}

@media (max-width: 1200px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
  .hero {
    flex-direction: column;
  }
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .newspaper-body {
    padding: 15px 20px;
  }
  .category-grid {
    grid-template-columns: 1fr;
  }
}
</style>