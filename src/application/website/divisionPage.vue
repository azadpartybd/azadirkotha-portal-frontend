<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const selectedDistrict = ref(null);

function details() {
    router.push('/area/constituency')
}

// Mock data for Dhaka Division districts and their election areas
const divisionData = {
  dhaka: {
    name: 'ঢাকা',
    districts: [
      {
        id: 1,
        name: 'ঢাকা',
        areas: [
          { id: 1, name: 'ঢাকা-১ (তেজগাঁও)', seats: 1, voters: 245000 },
          { id: 2, name: 'ঢাকা-২ (মোহাম্মদপুর)', seats: 1, voters: 289000 },
          { id: 3, name: 'ঢাকা-৩ (ধানমন্ডি)', seats: 1, voters: 198000 },
          { id: 4, name: 'ঢাকা-৪ (মিরপুর)', seats: 1, voters: 312000 },
          { id: 5, name: 'ঢাকা-৫ (গুলশান)', seats: 1, voters: 156000 },
          { id: 6, name: 'ঢাকা-৬ (উত্তরা)', seats: 1, voters: 267000 },
          { id: 7, name: 'ঢাকা-৭ (পুরান ঢাকা)', seats: 1, voters: 198000 },
          { id: 8, name: 'ঢাকা-৮ (মতিঝিল)', seats: 1, voters: 178000 },
        ]
      },
      {
        id: 2,
        name: 'গাজীপুর',
        areas: [
          { id: 9, name: 'গাজীপুর-১ (গাজীপুর সদর)', seats: 1, voters: 234000 },
          { id: 10, name: 'গাজীপুর-২ (কালিয়াকৈর)', seats: 1, voters: 189000 },
          { id: 11, name: 'গাজীপুর-৩ (কাপাসিয়া)', seats: 1, voters: 167000 },
          { id: 12, name: 'গাজীপুর-৪ (শ্রীপুর)', seats: 1, voters: 201000 },
        ]
      },
      {
        id: 3,
        name: 'নারায়ণগঞ্জ',
        areas: [
          { id: 13, name: 'নারায়ণগঞ্জ-১ (নারায়ণগঞ্জ সদর)', seats: 1, voters: 256000 },
          { id: 14, name: 'নারায়ণগঞ্জ-২ (রূপগঞ্জ)', seats: 1, voters: 178000 },
          { id: 15, name: 'নারায়ণগঞ্জ-৩ (আড়াইহাজার)', seats: 1, voters: 145000 },
          { id: 16, name: 'নারায়ণগঞ্জ-৪ (বন্দর)', seats: 1, voters: 198000 },
        ]
      },
      {
        id: 4,
        name: 'টাঙ্গাইল',
        areas: [
          { id: 17, name: 'টাঙ্গাইল-১ (টাঙ্গাইল সদর)', seats: 1, voters: 223000 },
          { id: 18, name: 'টাঙ্গাইল-২ (বাসাইল)', seats: 1, voters: 167000 },
          { id: 19, name: 'টাঙ্গাইল-৩ (মধুপুর)', seats: 1, voters: 189000 },
          { id: 20, name: 'টাঙ্গাইল-৪ (কালিহাতী)', seats: 1, voters: 156000 },
        ]
      },
      {
        id: 5,
        name: 'মানিকগঞ্জ',
        areas: [
          { id: 21, name: 'মানিকগঞ্জ-১ (মানিকগঞ্জ সদর)', seats: 1, voters: 189000 },
          { id: 22, name: 'মানিকগঞ্জ-২ (সিংগাইর)', seats: 1, voters: 145000 },
          { id: 23, name: 'মানিকগঞ্জ-৩ (ঘিওর)', seats: 1, voters: 134000 },
        ]
      },
      {
        id: 6,
        name: 'মুন্সীগঞ্জ',
        areas: [
          { id: 24, name: 'মুন্সীগঞ্জ-১ (মুন্সীগঞ্জ সদর)', seats: 1, voters: 167000 },
          { id: 25, name: 'মুন্সীগঞ্জ-২ (শ্রীনগর)', seats: 1, voters: 134000 },
          { id: 26, name: 'মুন্সীগঞ্জ-৩ (লোহাজং)', seats: 1, voters: 123000 },
        ]
      },
      {
        id: 7,
        name: 'নরসিংদী',
        areas: [
          { id: 27, name: 'নরসিংদী-১ (নরসিংদী সদর)', seats: 1, voters: 198000 },
          { id: 28, name: 'নরসিংদী-২ (শিবপুর)', seats: 1, voters: 156000 },
          { id: 29, name: 'নরসিংদী-৩ (রায়পুরা)', seats: 1, voters: 145000 },
        ]
      },
      {
        id: 8,
        name: 'কিশোরগঞ্জ',
        areas: [
          { id: 30, name: 'কিশোরগঞ্জ-১ (কিশোরগঞ্জ সদর)', seats: 1, voters: 212000 },
          { id: 31, name: 'কিশোরগঞ্জ-২ (বাজিতপুর)', seats: 1, voters: 178000 },
          { id: 32, name: 'কিশোরগঞ্জ-৩ (ভৈরব)', seats: 1, voters: 189000 },
          { id: 33, name: 'কিশোরগঞ্জ-৪ (কুলিয়ারচর)', seats: 1, voters: 156000 },
        ]
      },
    ]
  }
};

// Get current division from route
const divisionKey = computed(() => route.params.division || 'dhaka');
const currentDivision = computed(() => divisionData[divisionKey.value]);

const selectDistrict = (district) => {
  selectedDistrict.value = selectedDistrict.value?.id === district.id ? null : district;
};

const getTotalVoters = (district) => {
  return district.areas.reduce((sum, area) => sum + area.voters, 0);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('bn-BD').format(num);
};
</script>

<template>
  <div class="election-area-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb">
          <router-link to="/">হোম</router-link>
          <span class="separator">›</span>
          <router-link to="/election-areas">নির্বাচনী এলাকা</router-link>
          <span class="separator">›</span>
          <span class="current">{{ currentDivision?.name }} বিভাগ</span>
        </div>
        <h1>{{ currentDivision?.name }} বিভাগ</h1>
        <p class="subtitle">{{ currentDivision?.name }} বিভাগের জেলা এবং নির্বাচনী এলাকা অন্বেষণ করুন</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container">
      <div class="content-grid">
        <!-- Districts List -->
        <div class="districts-section">
          <div class="section-header">
            <h2>জেলাসমূহ</h2>
            <span class="count">{{ currentDivision?.districts.length }} টি জেলা</span>
          </div>

          <div class="districts-grid">
            <div
              v-for="district in currentDivision?.districts"
              :key="district.id"
              class="district-card"
              :class="{ active: selectedDistrict?.id === district.id }"
              @click="selectDistrict(district)"
            >
              <div class="district-icon">🏛️</div>
              <div class="district-info">
                <h3>{{ district.name }}</h3>
                <div class="district-stats">
                  <span class="stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {{ district.areas.length }} টি আসন
                  </span>
                  <span class="stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    {{ formatNumber(getTotalVoters(district)) }} ভোটার
                  </span>
                </div>
              </div>
              <div class="district-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Election Areas Panel -->
        <transition name="slide-fade">
          <div v-if="selectedDistrict" class="areas-section">
            <div class="section-header">
              <h2>{{ selectedDistrict.name }} আসনসমূহ</h2>
              <span class="count">{{ selectedDistrict.areas.length }} টি এলাকা</span>
            </div>

            <div class="areas-list">
              <div
                v-for="area in selectedDistrict.areas"
                :key="area.id"
                class="area-card"
              >
                <div class="area-header">
                  <div class="area-badge">{{ area.name.split('(')[0].trim() }}</div>
                  <div class="area-seats">{{ area.seats }} টি আসন</div>
                </div>
                <h4>{{ area.name.match(/\((.*?)\)/)?.[1] || area.name }}</h4>
                <div class="area-footer">
                  <div class="area-stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>{{ formatNumber(area.voters) }} ভোটার</span>
                  </div>
                  <button @click="details" class="view-details-btn">বিস্তারিত দেখুন</button>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- Empty State -->
        <div v-if="!selectedDistrict" class="empty-state">
          <div class="empty-icon">📍</div>
          <h3>একটি জেলা নির্বাচন করুন</h3>
          <p>নির্বাচনী এলাকা এবং ভোটের তথ্য দেখতে যেকোনো জেলায় ক্লিক করুন</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700&display=swap');

.election-area-page {
  font-family: 'Noto Sans Bengali', sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 60px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #006a4e 0%, #005a42 100%);
  color: white;
  padding: 40px 0;
  margin-bottom: 40px;
  box-shadow: 0 4px 12px rgba(0, 106, 78, 0.2);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.breadcrumb a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb a:hover {
  color: white;
}

.separator {
  color: rgba(255, 255, 255, 0.6);
}

.current {
  color: white;
  font-weight: 600;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  position: relative;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.count {
  background: #f0f0f0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

/* Districts Section */
.districts-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.districts-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.district-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f9f9f9;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.district-card:hover {
  background: #fff;
  border-color: #f21b3f;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(242, 27, 63, 0.1);
}

.district-card.active {
  background: #fff;
  border-color: #f21b3f;
  box-shadow: 0 4px 12px rgba(242, 27, 63, 0.15);
}

.district-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.district-info {
  flex: 1;
}

.district-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin: 0 0 8px 0;
}

.district-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.stat svg {
  color: #006a4e;
}

.district-arrow {
  color: #f21b3f;
  flex-shrink: 0;
}

/* Areas Section */
.areas-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-height: 800px;
  overflow-y: auto;
}

.areas-list {
  display: grid;
  gap: 16px;
}

.area-card {
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  transition: all 0.3s;
}

.area-card:hover {
  background: #fff;
  border-color: #006a4e;
  box-shadow: 0 4px 12px rgba(0, 106, 78, 0.1);
}

.area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.area-badge {
  background: #f21b3f;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.area-seats {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.area-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0 0 16px 0;
}

.area-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.area-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.area-stat svg {
  color: #006a4e;
}

.view-details-btn {
  background: none;
  border: 2px solid #006a4e;
  color: #006a4e;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.view-details-btn:hover {
  background: #006a4e;
  color: white;
}

/* Empty State */
.empty-state {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 60px 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 22px;
  font-weight: 600;
  color: #222;
  margin: 0 0 12px 0;
}

.empty-state p {
  font-size: 15px;
  color: #666;
  margin: 0;
  max-width: 300px;
}

/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .empty-state {
    grid-column: 1;
  }

  .areas-section {
    max-height: none;
  }
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 28px;
  }

  .district-card {
    flex-direction: column;
    text-align: center;
  }

  .district-arrow {
    display: none;
  }

  .district-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>