<script setup>
import { ref } from 'vue';

const activeTab = ref('overview');

// Mock data for constituency
const constituencyData = ref({
  id: 1,
  name: 'ঢাকা-১',
  fullName: 'তেজগাঁও নির্বাচনী এলাকা',
  district: 'ঢাকা',
  division: 'ঢাকা',
  totalVoters: 245000,
  
  // Previous elected members
  previousMembers: [
    { year: 2018, name: 'আবদুল রহমান খান', party: 'আওয়ামী লীগ', votes: 125000, percentage: 68.5 },
    { year: 2014, name: 'ফাতিমা বেগম', party: 'বিএনপি', votes: 98000, percentage: 62.3 },
    { year: 2008, name: 'আবদুল রহমান খান', party: 'আওয়ামী লীগ', votes: 110000, percentage: 71.2 }
  ],
  
  // Demography
  demography: {
    totalPopulation: 312000,
    urbanRural: { urban: 95, rural: 5 },
    religiousComposition: { muslim: 88, hindu: 10, others: 2 },
    ageGroups: {
      '১৮-৩০': 35,
      '৩১-৪৫': 30,
      '৪৬-৬০': 25,
      '৬০+': 10
    },
    politicalLeanings: {
      progressive: 45,
      conservative: 35,
      moderate: 20
    }
  },
  
  // Past election records
  electionHistory: [
    {
      year: 2018,
      voterTurnout: 73.5,
      totalVotes: 182500,
      winner: 'আবদুল রহমান খান',
      conflicts: '৩টি ভোটকেন্দ্রে ছোটখাটো ধস্তাধস্তির খবর পাওয়া গেছে',
      incidents: 2,
      fairness: 'সাধারণত শান্তিপূর্ণ'
    },
    {
      year: 2014,
      voterTurnout: 68.2,
      totalVotes: 157300,
      winner: 'ফাতিমা বেগম',
      conflicts: 'কোন বড় ঘটনা নেই',
      incidents: 0,
      fairness: 'অবাধ ও সুষ্ঠু'
    }
  ],
  
  // Nominated candidates for 2025
  candidates: [
    {
      id: 1,
      name: 'ডা. মোহাম্মদ হাসান',
      party: 'বাংলাদেশ জামায়াতে ইসলামী',
      symbol: 'দাঁড়িপাল্লা',
      
      // Bio
      bio: {
        age: 48,
        birthplace: 'ঢাকা',
        about: 'ডা. মোহাম্মদ হাসান একজন অভিজ্ঞ রাজনীতিবিদ এবং জনস্বাস্থ্য বিশেষজ্ঞ যিনি সমাজ উন্নয়ন এবং প্রশাসনে ২০ বছরের বেশি অভিজ্ঞতা রয়েছে।',
        education: [
          'ঢাকা মেডিকেল কলেজ থেকে এমবিবিএস (১৯৯৮)',
          'জনস হপকিন্স বিশ্ববিদ্যালয়, যুক্তরাষ্ট্র থেকে এমপিএইচ (২০০৩)',
          'লন্ডন স্কুল অফ ইকোনমিক্স, যুক্তরাজ্য থেকে পাবলিক পলিসিতে পিএইচডি (২০০৮)'
        ],
        profession: 'চিকিৎসক এবং জনস্বাস্থ্য পরামর্শদাতা',
        financialStatus: {
          assets: '৮.৫ কোটি টাকা',
          liabilities: '১.২ কোটি টাকা',
          income: 'বছরে ৪৫ লাখ টাকা',
          sources: 'চিকিৎসা পেশা, পরামর্শ, কৃষি জমি'
        }
      },
      
      // Political career
      politicalCareer: {
        ideology: 'প্রগতিশীল, উন্নয়নমুখী, ধর্মনিরপেক্ষ জাতীয়তাবাদী',
        partyJoined: 2005,
        positions: [
          'সংসদ সদস্য (২০০৮-২০১৩)',
          'স্বাস্থ্য কমিটির চেয়ারম্যান (২০০৯-২০১২)',
          'জেলা আওয়ামী লীগের সাধারণ সম্পাদক (২০১৫-২০২০)'
        ],
        majorParticipations: [
          '২০০৮ সাধারণ নির্বাচন - ৭১% ভোট নিয়ে জয়ী',
          '২০১৪ সাধারণ নির্বাচন - সংকীর্ণ ব্যবধানে পরাজিত',
          '১৫টি জেলা জুড়ে টিকাকরণ প্রচারাভিযানের নেতৃত্ব দিয়েছেন (২০১০-২০১২)',
          'গ্রামীণ স্বাস্থ্য অবকাঠামো প্রকল্পের নেতৃত্ব দিয়েছেন'
        ]
      },
      
      // Social activities
      socialActivities: [
        '"স্বাস্থ্য সেবা" প্রতিষ্ঠা করেছেন - মাসিক ৫০০+ রোগীকে বিনামূল্যে চিকিৎসা সেবা',
        'অসচ্ছল শিক্ষার্থীদের জন্য বৃত্তি কর্মসূচি প্রতিষ্ঠা (২০০ জন সুবিধাভোগী)',
        'রক্তদান ক্যাম্পের আয়োজন - ১০,০০০+ ইউনিট সংগ্রহ',
        'কোভিড-১৯ ত্রাণ কাজ - ৫,০০০ পরিবারে খাদ্য বিতরণ',
        '১২টি স্কুলে যুব ক্রীড়া উন্নয়ন কর্মসূচি'
      ],
      
      // Legal records
      legalRecords: {
        criminalCases: 0,
        pendingCases: 1,
        details: [
          {
            type: 'দেওয়ানি',
            year: 2019,
            status: 'মুলতবি',
            description: 'প্রতিবেশীর সাথে জমি বিরোধ মামলা - সালিশের অধীনে'
          }
        ],
        cleared: [
          {
            type: 'মানহানি',
            year: 2016,
            status: 'খালাস',
            description: 'রাজনৈতিক মানহানি মামলা - হাইকোর্ট কর্তৃক খালাস'
          }
        ]
      }
    }
  ]
});

const selectedCandidate = ref(constituencyData.value.candidates[0]);

const selectCandidate = (candidate) => {
  selectedCandidate.value = candidate;
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('bn-BD').format(num);
};
</script>

<template>
  <div class="constituency-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb">
          <router-link to="/">হোম</router-link>
          <span class="separator">›</span>
          <router-link to="/election-areas">নির্বাচনী এলাকা</router-link>
          <span class="separator">›</span>
          <router-link :to="`/areas/${constituencyData.division.toLowerCase()}`">{{ constituencyData.division }}</router-link>
          <span class="separator">›</span>
          <span class="current">{{ constituencyData.name }}</span>
        </div>
        <h1>{{ constituencyData.name }} - {{ constituencyData.fullName }}</h1>
        <div class="header-meta">
          <span class="meta-item">{{ constituencyData.district }} জেলা</span>
          <span class="separator">•</span>
          <span class="meta-item">{{ formatNumber(constituencyData.totalVoters) }} নিবন্ধিত ভোটার</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="container">
        <div class="tabs">
          <button 
            class="tab" 
            :class="{ active: activeTab === 'overview' }"
            @click="activeTab = 'overview'"
          >
            নির্বাচনী এলাকার তথ্য
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'candidates' }"
            @click="activeTab = 'candidates'"
          >
            ২০২৬ প্রার্থী
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="content-section">
        <div class="info-grid">
          <!-- Previous Members -->
          <div class="info-card">
            <h2>পূর্ববর্তী নির্বাচিত সদস্যগণ</h2>
            <div class="timeline">
              <div 
                v-for="member in constituencyData.previousMembers" 
                :key="member.year"
                class="timeline-item"
              >
                <div class="timeline-year">{{ formatNumber(member.year) }}</div>
                <div class="timeline-content">
                  <h3>{{ member.name }}</h3>
                  <p class="party">{{ member.party }}</p>
                  <div class="stats">
                    <span class="stat">{{ formatNumber(member.votes) }} ভোট</span>
                    <span class="stat">{{ member.percentage }}% শেয়ার</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Demography -->
          <div class="info-card">
            <h2>জনতাত্ত্বিক ও রাজনৈতিক ঝোঁক</h2>
            <div class="demo-stats">
              <div class="demo-item">
                <h4>জনসংখ্যা</h4>
                <p class="demo-value">{{ formatNumber(constituencyData.demography.totalPopulation) }}</p>
              </div>
              <div class="demo-item">
                <h4>শহর/গ্রাম বিভাজন</h4>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: constituencyData.demography.urbanRural.urban + '%' }"></div>
                </div>
                <p class="demo-label">{{ constituencyData.demography.urbanRural.urban }}% শহুরে</p>
              </div>
              <div class="demo-item">
                <h4>রাজনৈতিক ঝোঁক</h4>
                <div class="leaning-bars">
                  <div class="leaning-bar">
                    <span class="leaning-label">প্রগতিশীল</span>
                    <div class="bar blue" :style="{ width: constituencyData.demography.politicalLeanings.progressive + '%' }">
                      <span>{{ constituencyData.demography.politicalLeanings.progressive }}%</span>
                    </div>
                  </div>
                  <div class="leaning-bar">
                    <span class="leaning-label">রক্ষণশীল</span>
                    <div class="bar red" :style="{ width: constituencyData.demography.politicalLeanings.conservative + '%' }">
                      <span>{{ constituencyData.demography.politicalLeanings.conservative }}%</span>
                    </div>
                  </div>
                  <div class="leaning-bar">
                    <span class="leaning-label">মধ্যপন্থী</span>
                    <div class="bar gray" :style="{ width: constituencyData.demography.politicalLeanings.moderate + '%' }">
                      <span>{{ constituencyData.demography.politicalLeanings.moderate }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Election History -->
          <div class="info-card full-width">
            <h2>অতীত নির্বাচনের রেকর্ড</h2>
            <div class="election-records">
              <div 
                v-for="election in constituencyData.electionHistory" 
                :key="election.year"
                class="election-card"
              >
                <div class="election-header">
                  <h3>{{ formatNumber(election.year) }} নির্বাচন</h3>
                  <span class="winner-badge">বিজয়ী: {{ election.winner }}</span>
                </div>
                <div class="election-stats">
                  <div class="stat-box">
                    <span class="stat-label">ভোটার উপস্থিতি</span>
                    <span class="stat-value">{{ election.voterTurnout }}%</span>
                  </div>
                  <div class="stat-box">
                    <span class="stat-label">মোট ভোট</span>
                    <span class="stat-value">{{ formatNumber(election.totalVotes) }}</span>
                  </div>
                  <div class="stat-box">
                    <span class="stat-label">ঘটনা</span>
                    <span class="stat-value">{{ formatNumber(election.incidents) }}</span>
                  </div>
                  <div class="stat-box">
                    <span class="stat-label">মূল্যায়ন</span>
                    <span class="stat-value">{{ election.fairness }}</span>
                  </div>
                </div>
                <div class="conflicts" v-if="election.conflicts">
                  <strong>দ্বন্দ্ব:</strong> {{ election.conflicts }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Candidates Tab -->
      <div v-if="activeTab === 'candidates'" class="content-section">
        <div class="candidates-layout">
          <!-- Candidate Selector -->
          <div class="candidate-selector">
            <h2>মনোনীত প্রার্থী</h2>
            <div class="candidate-list">
              <div 
                v-for="candidate in constituencyData.candidates"
                :key="candidate.id"
                class="candidate-item"
                :class="{ active: selectedCandidate.id === candidate.id }"
                @click="selectCandidate(candidate)"
              >
                <div class="candidate-avatar">{{ candidate.name.split(' ')[1][0] }}{{ candidate.name.split(' ')[2] ? candidate.name.split(' ')[2][0] : candidate.name.split(' ')[1][1] }}</div>
                <div class="candidate-info">
                  <h3>{{ candidate.name }}</h3>
                  <p>{{ candidate.party }}</p>
                  <span class="symbol">{{ candidate.symbol }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Candidate Details -->
          <div class="candidate-details">
            <!-- Bio -->
            <div class="detail-card">
              <h2>জীবনী</h2>
              <div class="bio-section">
                <h3>সম্পর্কে</h3>
                <p>{{ selectedCandidate.bio.about }}</p>
              </div>
              <div class="bio-section">
                <h3>শিক্ষা</h3>
                <ul class="education-list">
                  <li v-for="(edu, idx) in selectedCandidate.bio.education" :key="idx">{{ edu }}</li>
                </ul>
              </div>
              <div class="bio-section">
                <h3>পেশা</h3>
                <p>{{ selectedCandidate.bio.profession }}</p>
              </div>
              <div class="bio-section">
                <h3>আর্থিক অবস্থা</h3>
                <div class="financial-grid">
                  <div class="financial-item">
                    <span class="label">সম্পদ:</span>
                    <span class="value">{{ selectedCandidate.bio.financialStatus.assets }}</span>
                  </div>
                  <div class="financial-item">
                    <span class="label">দায়:</span>
                    <span class="value">{{ selectedCandidate.bio.financialStatus.liabilities }}</span>
                  </div>
                  <div class="financial-item">
                    <span class="label">বার্ষিক আয়:</span>
                    <span class="value">{{ selectedCandidate.bio.financialStatus.income }}</span>
                  </div>
                  <div class="financial-item">
                    <span class="label">উৎস:</span>
                    <span class="value">{{ selectedCandidate.bio.financialStatus.sources }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Political Career -->
            <div class="detail-card">
              <h2>রাজনৈতিক ক্যারিয়ার</h2>
              <div class="political-section">
                <h3>রাজনৈতিক আদর্শ</h3>
                <p class="ideology">{{ selectedCandidate.politicalCareer.ideology }}</p>
              </div>
              <div class="political-section">
                <h3>দলীয় সদস্যপদ</h3>
                <p>{{ formatNumber(selectedCandidate.politicalCareer.partyJoined) }} সালে {{ selectedCandidate.party }} এ যোগদান</p>
              </div>
              <div class="political-section">
                <h3>অধিষ্ঠিত পদসমূহ</h3>
                <ul class="positions-list">
                  <li v-for="(position, idx) in selectedCandidate.politicalCareer.positions" :key="idx">
                    {{ position }}
                  </li>
                </ul>
              </div>
              <div class="political-section">
                <h3>প্রধান রাজনৈতিক অংশগ্রহণ</h3>
                <ul class="participations-list">
                  <li v-for="(participation, idx) in selectedCandidate.politicalCareer.majorParticipations" :key="idx">
                    {{ participation }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Social Activities -->
            <div class="detail-card">
              <h2>সামাজিক কার্যক্রম</h2>
              <ul class="social-list">
                <li v-for="(activity, idx) in selectedCandidate.socialActivities" :key="idx">
                  {{ activity }}
                </li>
              </ul>
            </div>

            <!-- Legal Records -->
            <div class="detail-card">
              <h2>আইনি রেকর্ড</h2>
              <div class="legal-summary">
                <div class="legal-stat">
                  <span class="stat-number">{{ formatNumber(selectedCandidate.legalRecords.criminalCases) }}</span>
                  <span class="stat-label">ফৌজদারি মামলা</span>
                </div>
                <div class="legal-stat">
                  <span class="stat-number">{{ formatNumber(selectedCandidate.legalRecords.pendingCases) }}</span>
                  <span class="stat-label">মুলতবি মামলা</span>
                </div>
              </div>
              
              <div v-if="selectedCandidate.legalRecords.details.length > 0" class="legal-details">
                <h3>মুলতবি মামলা</h3>
                <div v-for="(record, idx) in selectedCandidate.legalRecords.details" :key="idx" class="legal-case pending">
                  <div class="case-header">
                    <span class="case-type">{{ record.type }}</span>
                    <span class="case-year">{{ formatNumber(record.year) }}</span>
                  </div>
                  <p>{{ record.description }}</p>
                  <span class="case-status">অবস্থা: {{ record.status }}</span>
                </div>
              </div>

              <div v-if="selectedCandidate.legalRecords.cleared.length > 0" class="legal-details">
                <h3>খালাসকৃত মামলা</h3>
                <div v-for="(record, idx) in selectedCandidate.legalRecords.cleared" :key="idx" class="legal-case cleared">
                  <div class="case-header">
                    <span class="case-type">{{ record.type }}</span>
                    <span class="case-year">{{ formatNumber(record.year) }}</span>
                  </div>
                  <p>{{ record.description }}</p>
                  <span class="case-status">অবস্থা: {{ record.status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700&display=swap');

.constituency-page {
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
  padding: 30px 0;
  margin-bottom: 0;
  box-shadow: 0 4px 12px rgba(0, 106, 78, 0.2);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 12px;
}

.breadcrumb a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
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
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.meta-item {
  font-weight: 500;
}

/* Tabs */
.tabs-container {
  background: white;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 30px;
}

.tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 16px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 15px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Noto Sans Bengali', sans-serif;
}

.tab:hover {
  color: #f21b3f;
}

.tab.active {
  color: #f21b3f;
  border-bottom-color: #f21b3f;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.info-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-card.full-width {
  grid-column: 1 / -1;
}

.info-card h2 {
  font-family: 'Noto Serif Bengali', serif;
  font-size: 20px;
  font-weight: 700;
  color: #006a4e;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f21b3f;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.timeline-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.timeline-year {
  font-size: 18px;
  font-weight: 700;
  color: #f21b3f;
  min-width: 60px;
}

.timeline-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0 0 4px 0;
}

.party {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
}

.stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #888;
}

/* Demographics */
.demo-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-item h4 {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin: 0 0 8px 0;
}

.demo-value {
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: #006a4e;
}

.demo-label {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.leaning-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.leaning-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.leaning-label {
  min-width: 100px;
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.bar {
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.bar.blue { background: #2196F3; }
.bar.red { background: #f21b3f; }
.bar.gray { background: #9e9e9e; }

/* Election Records */
.election-records {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.election-card {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #006a4e;
}

.election-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.election-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin: 0;
}

.winner-badge {
  background: #f21b3f;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.election-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 12px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #222;
}

.conflicts {
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
  font-size: 14px;
  color: #666;
}

/* Candidates Layout */
.candidates-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 24px;
}

.candidate-selector {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.candidate-selector h2 {
  font-family: 'Noto Serif Bengali', serif;
  font-size: 18px;
  font-weight: 700;
  color: #006a4e;
  margin: 0 0 20px 0;
}

.candidate-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.candidate-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9f9f9;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.candidate-item:hover {
  background: #fff;
  border-color: #f21b3f;
}

.candidate-item.active {
  background: #fff;
  border-color: #f21b3f;
  box-shadow: 0 2px 8px rgba(242, 27, 63, 0.1);
}

.candidate-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #006a4e 0%, #f21b3f 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
}

.candidate-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0 0 4px 0;
}

.candidate-info p {
  font-size: 13px;
  color: #666;
  margin: 0 0 4px 0;
}

.symbol {
  font-size: 12px;
  color: #999;
}

/* Candidate Details */
.candidate-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.detail-card h2 {
  font-family: 'Noto Serif Bengali', serif;
  font-size: 20px;
  font-weight: 700;
  color: #006a4e;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f21b3f;
}

.bio-section, .political-section {
  margin-bottom: 20px;
}

.bio-section:last-child, .political-section:last-child {
  margin-bottom: 0;
}

.bio-section h3, .political-section h3, .legal-details h3 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0 0 8px 0;
}

.bio-section p, .political-section p {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
  margin: 0;
}

.education-list,
.positions-list,
.participations-list,
.social-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.education-list li,
.positions-list li,
.participations-list li,
.social-list li {
  font-size: 14px;
  color: #444;
  padding: 8px 0 8px 20px;
  position: relative;
  line-height: 1.5;
}

.education-list li:before,
.positions-list li:before,
.participations-list li:before,
.social-list li:before {
  content: '•';
  position: absolute;
  left: 0;
  color: #f21b3f;
  font-size: 16px;
  font-weight: bold;
}

.financial-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.financial-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.financial-item .label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.financial-item .value {
  font-size: 14px;
  color: #222;
  font-weight: 600;
}

.ideology {
  font-style: italic;
  color: #006a4e;
  font-weight: 500;
}

.legal-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.legal-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #222;
}

.legal-details {
  margin-bottom: 20px;
}

.legal-details:last-child {
  margin-bottom: 0;
}

.legal-case {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.legal-case:last-child {
  margin-bottom: 0;
}

.legal-case.pending {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
}

.legal-case.cleared {
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
}

.case-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.case-type {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.case-year {
  font-size: 14px;
  color: #666;
}

.legal-case p {
  font-size: 14px;
  color: #444;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.case-status {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .candidates-layout {
    grid-template-columns: 1fr;
  }

  .candidate-selector {
    position: static;
  }
  
  .election-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
  }

  .tabs {
    flex-direction: column;
    gap: 4px;
  }

  .tab {
    padding: 12px 16px;
    font-size: 14px;
    text-align: left;
  }

  .election-stats {
    grid-template-columns: 1fr;
  }

  .financial-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }

  .page-header {
    padding: 20px 0;
  }
}
</style>