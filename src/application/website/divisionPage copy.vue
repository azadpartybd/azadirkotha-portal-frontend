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
    name: 'Dhaka',
    districts: [
      {
        id: 1,
        name: 'Dhaka',
        areas: [
          { id: 1, name: 'Dhaka-1 (Tejgaon)', seats: 1, voters: 245000 },
          { id: 2, name: 'Dhaka-2 (Mohammadpur)', seats: 1, voters: 289000 },
          { id: 3, name: 'Dhaka-3 (Dhanmondi)', seats: 1, voters: 198000 },
          { id: 4, name: 'Dhaka-4 (Mirpur)', seats: 1, voters: 312000 },
          { id: 5, name: 'Dhaka-5 (Gulshan)', seats: 1, voters: 156000 },
          { id: 6, name: 'Dhaka-6 (Uttara)', seats: 1, voters: 267000 },
          { id: 7, name: 'Dhaka-7 (Old Dhaka)', seats: 1, voters: 198000 },
          { id: 8, name: 'Dhaka-8 (Motijheel)', seats: 1, voters: 178000 },
        ]
      },
      {
        id: 2,
        name: 'Gazipur',
        areas: [
          { id: 9, name: 'Gazipur-1 (Gazipur Sadar)', seats: 1, voters: 234000 },
          { id: 10, name: 'Gazipur-2 (Kaliakair)', seats: 1, voters: 189000 },
          { id: 11, name: 'Gazipur-3 (Kapasia)', seats: 1, voters: 167000 },
          { id: 12, name: 'Gazipur-4 (Sreepur)', seats: 1, voters: 201000 },
        ]
      },
      {
        id: 3,
        name: 'Narayanganj',
        areas: [
          { id: 13, name: 'Narayanganj-1 (Narayanganj Sadar)', seats: 1, voters: 256000 },
          { id: 14, name: 'Narayanganj-2 (Rupganj)', seats: 1, voters: 178000 },
          { id: 15, name: 'Narayanganj-3 (Araihazar)', seats: 1, voters: 145000 },
          { id: 16, name: 'Narayanganj-4 (Bandar)', seats: 1, voters: 198000 },
        ]
      },
      {
        id: 4,
        name: 'Tangail',
        areas: [
          { id: 17, name: 'Tangail-1 (Tangail Sadar)', seats: 1, voters: 223000 },
          { id: 18, name: 'Tangail-2 (Basail)', seats: 1, voters: 167000 },
          { id: 19, name: 'Tangail-3 (Madhupur)', seats: 1, voters: 189000 },
          { id: 20, name: 'Tangail-4 (Kalihati)', seats: 1, voters: 156000 },
        ]
      },
      {
        id: 5,
        name: 'Manikganj',
        areas: [
          { id: 21, name: 'Manikganj-1 (Manikganj Sadar)', seats: 1, voters: 189000 },
          { id: 22, name: 'Manikganj-2 (Singair)', seats: 1, voters: 145000 },
          { id: 23, name: 'Manikganj-3 (Ghior)', seats: 1, voters: 134000 },
        ]
      },
      {
        id: 6,
        name: 'Munshiganj',
        areas: [
          { id: 24, name: 'Munshiganj-1 (Munshiganj Sadar)', seats: 1, voters: 167000 },
          { id: 25, name: 'Munshiganj-2 (Sreenagar)', seats: 1, voters: 134000 },
          { id: 26, name: 'Munshiganj-3 (Lohajang)', seats: 1, voters: 123000 },
        ]
      },
      {
        id: 7,
        name: 'Narsingdi',
        areas: [
          { id: 27, name: 'Narsingdi-1 (Narsingdi Sadar)', seats: 1, voters: 198000 },
          { id: 28, name: 'Narsingdi-2 (Shibpur)', seats: 1, voters: 156000 },
          { id: 29, name: 'Narsingdi-3 (Raipura)', seats: 1, voters: 145000 },
        ]
      },
      {
        id: 8,
        name: 'Kishoreganj',
        areas: [
          { id: 30, name: 'Kishoreganj-1 (Kishoreganj Sadar)', seats: 1, voters: 212000 },
          { id: 31, name: 'Kishoreganj-2 (Bajitpur)', seats: 1, voters: 178000 },
          { id: 32, name: 'Kishoreganj-3 (Bhairab)', seats: 1, voters: 189000 },
          { id: 33, name: 'Kishoreganj-4 (Kuliarchar)', seats: 1, voters: 156000 },
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
  return new Intl.NumberFormat('en-IN').format(num);
};
</script>

<template>
  <div class="election-area-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb">
          <router-link to="/">Home</router-link>
          <span class="separator">›</span>
          <router-link to="/election-areas">Election Areas</router-link>
          <span class="separator">›</span>
          <span class="current">{{ currentDivision?.name }} Division</span>
        </div>
        <h1>{{ currentDivision?.name }} Division</h1>
        <p class="subtitle">Explore districts and election constituencies in {{ currentDivision?.name }} Division</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container">
      <div class="content-grid">
        <!-- Districts List -->
        <div class="districts-section">
          <div class="section-header">
            <h2>Districts</h2>
            <span class="count">{{ currentDivision?.districts.length }} districts</span>
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
                    {{ district.areas.length }} constituencies
                  </span>
                  <span class="stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    {{ formatNumber(getTotalVoters(district)) }} voters
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
              <h2>{{ selectedDistrict.name }} Constituencies</h2>
              <span class="count">{{ selectedDistrict.areas.length }} areas</span>
            </div>

            <div class="areas-list">
              <div
                v-for="area in selectedDistrict.areas"
                :key="area.id"
                class="area-card"
              >
                <div class="area-header">
                  <div class="area-badge">{{ area.name.split('(')[0].trim() }}</div>
                  <div class="area-seats">{{ area.seats }} Seat{{ area.seats > 1 ? 's' : '' }}</div>
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
                    <span>{{ formatNumber(area.voters) }} voters</span>
                  </div>
                  <button @click="details" class="view-details-btn">View Details</button>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- Empty State -->
        <div v-if="!selectedDistrict" class="empty-state">
          <div class="empty-icon">📍</div>
          <h3>Select a District</h3>
          <p>Click on any district to view its election constituencies and voting information</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.election-area-page {
  font-family: 'Inter', sans-serif;
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
  background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
  color: white;
  padding: 40px 0;
  margin-bottom: 40px;
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
  border-color: #c62828;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(198, 40, 40, 0.1);
}

.district-card.active {
  background: #fff;
  border-color: #c62828;
  box-shadow: 0 4px 12px rgba(198, 40, 40, 0.15);
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
  color: #999;
}

.district-arrow {
  color: #c62828;
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
  border-color: #c62828;
  box-shadow: 0 4px 12px rgba(198, 40, 40, 0.1);
}

.area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.area-badge {
  background: #c62828;
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
  color: #999;
}

.view-details-btn {
  background: none;
  border: 1px solid #c62828;
  color: #c62828;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.view-details-btn:hover {
  background: #c62828;
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