```vue
<script setup>
import { ref } from 'vue';

const activeTab = ref('overview');

// Mock data for constituency
const constituencyData = ref({
  id: 1,
  name: 'Dhaka-1',
  fullName: 'Tejgaon Constituency',
  district: 'Dhaka',
  division: 'Dhaka',
  totalVoters: 245000,
  
  // Previous elected members
  previousMembers: [
    { year: 2018, name: 'Abdul Rahman Khan', party: 'Awami League', votes: 125000, percentage: 68.5 },
    { year: 2014, name: 'Fatima Begum', party: 'BNP', votes: 98000, percentage: 62.3 },
    { year: 2008, name: 'Abdul Rahman Khan', party: 'Awami League', votes: 110000, percentage: 71.2 }
  ],
  
  // Demography
  demography: {
    totalPopulation: 312000,
    urbanRural: { urban: 95, rural: 5 },
    religiousComposition: { muslim: 88, hindu: 10, others: 2 },
    ageGroups: {
      '18-30': 35,
      '31-45': 30,
      '46-60': 25,
      '60+': 10
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
      winner: 'Abdul Rahman Khan',
      conflicts: 'Minor scuffles reported at 3 polling stations',
      incidents: 2,
      fairness: 'Generally peaceful'
    },
    {
      year: 2014,
      voterTurnout: 68.2,
      totalVotes: 157300,
      winner: 'Fatima Begum',
      conflicts: 'No major incidents',
      incidents: 0,
      fairness: 'Free and fair'
    }
  ],
  
  // Nominated candidates for 2025
  candidates: [
    {
      id: 1,
      name: 'Dr. Mohammad Hasan',
      party: 'Awami League',
      symbol: 'Boat',
      
      // Bio
      bio: {
        age: 48,
        birthplace: 'Dhaka',
        about: 'Dr. Mohammad Hasan is a seasoned politician and public health expert with over 20 years of experience in community development and governance.',
        education: [
          'MBBS from Dhaka Medical College (1998)',
          'MPH from Johns Hopkins University, USA (2003)',
          'PhD in Public Policy from LSE, UK (2008)'
        ],
        profession: 'Medical Doctor and Public Health Consultant',
        financialStatus: {
          assets: 'BDT 8.5 Crore',
          liabilities: 'BDT 1.2 Crore',
          income: 'BDT 45 Lakh per year',
          sources: 'Medical practice, consultancy, agricultural land'
        }
      },
      
      // Political career
      politicalCareer: {
        ideology: 'Progressive, pro-development, secular nationalist',
        partyJoined: 2005,
        positions: [
          'Member of Parliament (2008-2013)',
          'Health Committee Chairman (2009-2012)',
          'District Awami League General Secretary (2015-2020)'
        ],
        majorParticipations: [
          '2008 General Election - Won with 71% votes',
          '2014 General Election - Lost by narrow margin',
          'Led vaccination campaigns across 15 districts (2010-2012)',
          'Spearheaded rural health infrastructure project'
        ]
      },
      
      // Social activities
      socialActivities: [
        'Founded "Swasthyo Seva" - Free health clinic serving 500+ patients monthly',
        'Established scholarship program for underprivileged students (200 beneficiaries)',
        'Organized blood donation camps - collected 10,000+ units',
        'COVID-19 relief work - distributed food to 5,000 families',
        'Youth sports development program in 12 schools'
      ],
      
      // Legal records
      legalRecords: {
        criminalCases: 0,
        pendingCases: 1,
        details: [
          {
            type: 'Civil',
            year: 2019,
            status: 'Pending',
            description: 'Land dispute case with neighbor - under arbitration'
          }
        ],
        cleared: [
          {
            type: 'Defamation',
            year: 2016,
            status: 'Acquitted',
            description: 'Political defamation case - cleared by High Court'
          }
        ]
      }
    },
    {
      id: 2,
      name: 'Advocate Nasrin Ahmed',
      party: 'BNP',
      symbol: 'Sheaf of Paddy',
      
      bio: {
        age: 42,
        birthplace: 'Comilla',
        about: 'Nasrin Ahmed is a prominent lawyer and human rights activist known for her work in defending marginalized communities and advocating for democratic reforms.',
        education: [
          'LLB from Dhaka University (2002)',
          'LLM from University of London (2005)',
          'Bar-at-Law from Lincoln\'s Inn, UK (2006)'
        ],
        profession: 'Advocate, Supreme Court of Bangladesh',
        financialStatus: {
          assets: 'BDT 6.2 Crore',
          liabilities: 'BDT 80 Lakh',
          income: 'BDT 38 Lakh per year',
          sources: 'Legal practice, real estate, family business'
        }
      },
      
      politicalCareer: {
        ideology: 'Democratic, nationalist, pro-business reforms',
        partyJoined: 2010,
        positions: [
          'BNP Women\'s Wing Vice President (2015-present)',
          'Legal Affairs Committee Member (2012-present)',
          'Youth Wing Advisor (2011-2014)'
        ],
        majorParticipations: [
          '2014 General Election - Second place with 38% votes',
          'Led democracy movement protests (2013-2014)',
          'Participated in constitutional reform advocacy',
          'Organized legal aid camps in rural areas'
        ]
      },
      
      socialActivities: [
        'Provides pro-bono legal services to domestic violence victims',
        'Runs skill development center for women (150+ graduates)',
        'Founder of "Nagorik Adhikar" - civil rights advocacy group',
        'Organizes legal awareness programs in schools',
        'Disaster relief coordinator during floods (2019, 2020)'
      ],
      
      legalRecords: {
        criminalCases: 0,
        pendingCases: 0,
        details: [],
        cleared: [
          {
            type: 'Political',
            year: 2015,
            status: 'Acquitted',
            description: 'Charged during political protests - cleared of all charges'
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
  return new Intl.NumberFormat('en-IN').format(num);
};
</script>

<template>
  <div class="constituency-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb">
          <router-link to="/">Home</router-link>
          <span class="separator">›</span>
          <router-link to="/election-areas">Election Areas</router-link>
          <span class="separator">›</span>
          <router-link :to="`/areas/${constituencyData.division.toLowerCase()}`">{{ constituencyData.division }}</router-link>
          <span class="separator">›</span>
          <span class="current">{{ constituencyData.name }}</span>
        </div>
        <h1>{{ constituencyData.name }} - {{ constituencyData.fullName }}</h1>
        <div class="header-meta">
          <span class="meta-item">{{ constituencyData.district }} District</span>
          <span class="separator">•</span>
          <span class="meta-item">{{ formatNumber(constituencyData.totalVoters) }} Registered Voters</span>
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
            Constituency Info
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'candidates' }"
            @click="activeTab = 'candidates'"
          >
            Candidates 2025
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
            <h2>Previous Elected Members</h2>
            <div class="timeline">
              <div 
                v-for="member in constituencyData.previousMembers" 
                :key="member.year"
                class="timeline-item"
              >
                <div class="timeline-year">{{ member.year }}</div>
                <div class="timeline-content">
                  <h3>{{ member.name }}</h3>
                  <p class="party">{{ member.party }}</p>
                  <div class="stats">
                    <span class="stat">{{ formatNumber(member.votes) }} votes</span>
                    <span class="stat">{{ member.percentage }}% share</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Demography -->
          <div class="info-card">
            <h2>Demographics & Political Flavor</h2>
            <div class="demo-stats">
              <div class="demo-item">
                <h4>Population</h4>
                <p class="demo-value">{{ formatNumber(constituencyData.demography.totalPopulation) }}</p>
              </div>
              <div class="demo-item">
                <h4>Urban/Rural Split</h4>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: constituencyData.demography.urbanRural.urban + '%' }"></div>
                </div>
                <p class="demo-label">{{ constituencyData.demography.urbanRural.urban }}% Urban</p>
              </div>
              <div class="demo-item">
                <h4>Political Leaning</h4>
                <div class="leaning-bars">
                  <div class="leaning-bar">
                    <span class="leaning-label">Progressive</span>
                    <div class="bar blue" :style="{ width: constituencyData.demography.politicalLeanings.progressive + '%' }">
                      <span>{{ constituencyData.demography.politicalLeanings.progressive }}%</span>
                    </div>
                  </div>
                  <div class="leaning-bar">
                    <span class="leaning-label">Conservative</span>
                    <div class="bar red" :style="{ width: constituencyData.demography.politicalLeanings.conservative + '%' }">
                      <span>{{ constituencyData.demography.politicalLeanings.conservative }}%</span>
                    </div>
                  </div>
                  <div class="leaning-bar">
                    <span class="leaning-label">Moderate</span>
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
            <h2>Past Election Records</h2>
            <div class="election-records">
              <div 
                v-for="election in constituencyData.electionHistory" 
                :key="election.year"
                class="election-card"
              >
                <div class="election-header">
                  <h3>{{ election.year }} Election</h3>
                  <span class="winner-badge">Winner: {{ election.winner }}</span>
                </div>
                <div class="election-stats">
                  <div class="stat-box">
                    <span class="stat-label">Voter Turnout</span>
                    <span class="stat-value">{{ election.voterTurnout }}%</span>
                  </div>
                  <div class="stat-box">
                    <span class="stat-label">Total Votes</span>
                    <span class="stat-value">{{ formatNumber(election.totalVotes) }}</span>
                  </div>
                  <div class="stat-box">
                    <span class="stat-label">Incidents</span>
                    <span class="stat-value">{{ election.incidents }}</span>
                  </div>
                  <div class="stat-box">
                    <span class="stat-label">Assessment</span>
                    <span class="stat-value">{{ election.fairness }}</span>
                  </div>
                </div>
                <div class="conflicts" v-if="election.conflicts">
                  <strong>Conflicts:</strong> {{ election.conflicts }}
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
            <h2>Nominated Candidates</h2>
            <div class="candidate-list">
              <div 
                v-for="candidate in constituencyData.candidates"
                :key="candidate.id"
                class="candidate-item"
                :class="{ active: selectedCandidate.id === candidate.id }"
                @click="selectCandidate(candidate)"
              >
                <div class="candidate-avatar">{{ candidate.name.split(' ')[0][0] }}{{ candidate.name.split(' ')[1][0] }}</div>
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
              <h2>Biography</h2>
              <div class="bio-section">
                <h3>About</h3>
                <p>{{ selectedCandidate.bio.about }}</p>
              </div>
              <div class="bio-section">
                <h3>Education</h3>
                <ul class="education-list">
                  <li v-for="(edu, idx) in selectedCandidate.bio.education" :key="idx">{{ edu }}</li>
                </ul>
              </div>
              <div class="bio-section">
                <h3>Profession</h3>
                <p>{{ selectedCandidate.bio.profession }}</p>
              </div>
              <div class="bio-section">
                <h3>Financial Status</h3>
                <div class="financial-grid">
                  <div class="financial-item">
                    <span class="label">Assets:</span>
                    <span class="value">{{ selectedCandidate.bio.financialStatus.assets }}</span>
                  </div>
                  <div class="financial-item">
                    <span class="label">Liabilities:</span>
                    <span class="value">{{ selectedCandidate.bio.financialStatus.liabilities }}</span>
                  </div>
                  <div class="financial-item">
                    <span class="label">Annual Income:</span>
                    <span class="value">{{ selectedCandidate.bio.financialStatus.income }}</span>
                  </div>
                  <div class="financial-item">
                    <span class="label">Sources:</span>
                    <span class="value">{{ selectedCandidate.bio.financialStatus.sources }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Political Career -->
            <div class="detail-card">
              <h2>Political Career</h2>
              <div class="political-section">
                <h3>Political Ideology</h3>
                <p class="ideology">{{ selectedCandidate.politicalCareer.ideology }}</p>
              </div>
              <div class="political-section">
                <h3>Party Membership</h3>
                <p>Joined {{ selectedCandidate.party }} in {{ selectedCandidate.politicalCareer.partyJoined }}</p>
              </div>
              <div class="political-section">
                <h3>Positions Held</h3>
                <ul class="positions-list">
                  <li v-for="(position, idx) in selectedCandidate.politicalCareer.positions" :key="idx">
                    {{ position }}
                  </li>
                </ul>
              </div>
              <div class="political-section">
                <h3>Major Political Participations</h3>
                <ul class="participations-list">
                  <li v-for="(participation, idx) in selectedCandidate.politicalCareer.majorParticipations" :key="idx">
                    {{ participation }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Social Activities -->
            <div class="detail-card">
              <h2>Social Activities</h2>
              <ul class="social-list">
                <li v-for="(activity, idx) in selectedCandidate.socialActivities" :key="idx">
                  {{ activity }}
                </li>
              </ul>
            </div>

            <!-- Legal Records -->
            <div class="detail-card">
              <h2>Legal Records</h2>
              <div class="legal-summary">
                <div class="legal-stat">
                  <span class="stat-number">{{ selectedCandidate.legalRecords.criminalCases }}</span>
                  <span class="stat-label">Criminal Cases</span>
                </div>
                <div class="legal-stat">
                  <span class="stat-number">{{ selectedCandidate.legalRecords.pendingCases }}</span>
                  <span class="stat-label">Pending Cases</span>
                </div>
              </div>
              
              <div v-if="selectedCandidate.legalRecords.details.length > 0" class="legal-details">
                <h3>Pending Cases</h3>
                <div v-for="(record, idx) in selectedCandidate.legalRecords.details" :key="idx" class="legal-case pending">
                  <div class="case-header">
                    <span class="case-type">{{ record.type }}</span>
                    <span class="case-year">{{ record.year }}</span>
                  </div>
                  <p>{{ record.description }}</p>
                  <span class="case-status">Status: {{ record.status }}</span>
                </div>
              </div>

              <div v-if="selectedCandidate.legalRecords.cleared.length > 0" class="legal-details">
                <h3>Cleared Cases</h3>
                <div v-for="(record, idx) in selectedCandidate.legalRecords.cleared" :key="idx" class="legal-case cleared">
                  <div class="case-header">
                    <span class="case-type">{{ record.type }}</span>
                    <span class="case-year">{{ record.year }}</span>
                  </div>
                  <p>{{ record.description }}</p>
                  <span class="case-status">Status: {{ record.status }}</span>
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.constituency-page {
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
  padding: 30px 0;
  margin-bottom: 0;
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
}

.tab:hover {
  color: #c62828;
}

.tab.active {
  color: #c62828;
  border-bottom-color: #c62828;
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
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
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
  color: #c62828;
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
  background: #c62828;
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
.bar.red { background: #f44336; }
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
  border-left: 4px solid #c62828;
}

.election-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.election-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin: 0;
}

.winner-badge {
  background: #c62828;
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
  top: 120px;
}

.candidate-selector h2 {
  font-size: 18px;
  font-weight: 700;
  color: #222;
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
  border-color: #c62828;
}

.candidate-item.active {
  background: #fff;
  border-color: #c62828;
  box-shadow: 0 2px 8px rgba(198, 40, 40, 0.1);
}

.candidate-avatar {
  width: 48px;
  height: 48px;
  background: #c62828;
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
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.bio-section {
  margin-bottom: 20px;
}

.bio-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0 0 8px 0;
}

.bio-section p {
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
  padding: 8px 0;
  position: relative;
  padding-left: 20px;
}

.education-list li:before,
.positions-list li:before,
.participations-list li:before,
.social-list li:before {
  content: '•';
  position: absolute;
  left: 0;
  color: #c62828;
  font-size: 16px;
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

.political-section {
  margin-bottom: 20px;
}

.political-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0 0 8px 0;
}

.ideology {
  font-size: 14px;
  color: #444;
  font-style: italic;
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

.stat-label {
  font-size: 13px;
  color: #666;
}

.legal-details {
  margin-bottom: 20px;
}

.legal-details h3 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0 0 12px 0;
}

.legal-case {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
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
  }

  .election-stats {
    grid-template-columns: repeat(2, 1fr);
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

  .election-stats {
    grid-template-columns: 1fr;
  }
}
</style>