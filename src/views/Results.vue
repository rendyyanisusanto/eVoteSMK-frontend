<template>
  <div class="results-container">
    <!-- Header -->
    <div class="header">
      <h1 class="main-title">🏆 HASIL PEMILIHAN KETUA OSIS 🏆</h1>
      <div class="subtitle">Live Results - Pemilihan Ketua OSIS 2025</div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-screen">
      <div class="spinner"></div>
      <p>Memuat hasil pemilihan...</p>
    </div>

    <!-- Initial State - Belum proses -->
    <div v-else-if="!showResults" class="initial-screen">
      <div class="initial-content">
        <div class="initial-icon">🗳️</div>
        <h2 class="initial-title">Siap untuk Pengumuman Pemenang?</h2>
        <p class="initial-subtitle">Klik tombol di bawah untuk memproses hasil dan langsung mengumumkan pemenang</p>
        
        <button @click="processResults" class="process-btn" :disabled="processing">
          {{ processing ? '⏳ Memproses...' : '🏆 Proses & Umumkan Pemenang' }}
        </button>
        
        <div v-if="processing" class="processing-animation">
          <div class="processing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Menganalisis suara yang masuk...</p>
        </div>
      </div>
    </div>

    <!-- Results Display -->
    <div v-else-if="showResults" class="results-content">
      <!-- Stats Overview -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-number">{{ totalVotes }}</div>
          <div class="stat-label">Total Suara</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ results.length }}</div>
          <div class="stat-label">Total Kandidat</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ Math.round((totalVotes / estimatedVoters) * 100) }}%</div>
          <div class="stat-label">Partisipasi</div>
        </div>
      </div>

      <!-- Winner Announcement (jika sudah tampil) -->
      <div v-if="showWinner && winner" class="winner-announcement">
        <div class="winner-crown">👑</div>
        <h2 class="winner-title">KETUA OSIS TERPILIH</h2>
        <div class="winner-card">
          <img 
            :src="getCandidateImageUrl(winner.foto)" 
            :alt="winner.nama"
            class="winner-photo"
          >
          <div class="winner-info">
            <h3 class="winner-name">{{ winner.nama }}</h3>
            <p class="winner-class">{{ winner.kelas }}</p>
            <div class="winner-votes">
              {{ winner.vote_count }} suara ({{ ((winner.vote_count / totalVotes) * 100).toFixed(1) }}%)
            </div>
          </div>
        </div>
      </div>

      <!-- Countdown Modal -->
      <div v-if="showCountdown" class="countdown-modal">
        <div class="countdown-content">
          <h2>Pengumuman Pemenang</h2>
          <div class="countdown-number">{{ countdownTime }}</div>
          <p>Bersiaplah untuk melihat ketua OSIS yang terpilih!</p>
        </div>
      </div>

      <!-- Results Table -->
      <div class="results-table">
        <h3 class="table-title">Perolehan Suara Lengkap</h3>
        <div class="candidates-grid">
          <div 
            v-for="(candidate, index) in results" 
            :key="candidate.id"
            :class="['candidate-result', { 'winner-highlight': index === 0 && showWinner }]"
          >
            <div class="rank">
              <span class="rank-number">{{ index + 1 }}</span>
              <span v-if="index === 0 && showWinner" class="crown-small">👑</span>
            </div>
            
            <img 
              :src="getCandidateImageUrl(candidate.foto)" 
              :alt="candidate.nama"
              class="candidate-photo"
            >
            
            <div class="candidate-info">
              <h4 class="candidate-name">{{ candidate.nama }}</h4>
              <p class="candidate-class">{{ candidate.kelas }}</p>
            </div>
            
            <div class="vote-info">
              <div class="vote-count">{{ candidate.vote_count }}</div>
              <div class="vote-percentage">{{ totalVotes > 0 ? ((candidate.vote_count / totalVotes) * 100).toFixed(1) : 0 }}%</div>
            </div>
            
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{
                  width: totalVotes > 0 ? (candidate.vote_count / totalVotes * 100) + '%' : '0%',
                  background: index === 0 ? 'linear-gradient(90deg, #FFD700, #FFA500)' : 'linear-gradient(90deg, #667eea, #764ba2)'
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="controls">
        <button @click="refreshResults" class="control-btn refresh-btn" :disabled="refreshing">
          {{ refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data' }}
        </button>
        <button 
          @click="startCountdown" 
          class="control-btn winner-btn" 
          :disabled="!winner || showCountdown"
          v-if="showWinner"
        >
          🏆 Tampilkan Pemenang Lagi
        </button>
        <button @click="hideWinner" class="control-btn hide-btn" v-if="showWinner">
          👁️ Sembunyikan Pemenang
        </button>
      </div>

      <!-- Auto Refresh Indicator -->
      <div class="auto-refresh">
        <span class="refresh-dot"></span>
        Auto-refresh setiap 30 detik
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import { getImageUrl, getDefaultAvatar } from '@/utils/url'

export default {
  name: 'PublicResults',
  data() {
    return {
      results: [],
      loading: false,
      refreshing: false,
      showWinner: false,
      showCountdown: false,
      showResults: false, // Kontrol untuk menampilkan hasil
      processing: false, // Loading state untuk proses
      countdownTime: 5,
      refreshInterval: null,
      estimatedVoters: 500, // Estimasi jumlah pemilih

    }
  },
  computed: {
    totalVotes() {
      return this.results.reduce((sum, candidate) => sum + candidate.vote_count, 0)
    },
    
    winner() {
      return this.results.length > 0 && this.results[0].vote_count > 0 ? this.results[0] : null
    }
  },
  async mounted() {
    // Tidak auto load results, tunggu user klik "Proses"
  },
  
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },
  
  methods: {
    getCandidateImageUrl(foto) {
      return getImageUrl(foto) || getDefaultAvatar()
    },
    
    async processResults() {
      this.processing = true
      
      // Simulasi processing time untuk efek dramatis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      try {
        await this.loadResults()
        this.showResults = true
        this.startAutoRefresh()
        
        // Langsung mulai countdown pemenang setelah load results
        if (this.winner) {
          setTimeout(() => {
            this.startCountdown()
          }, 500) // Delay sedikit untuk transisi smooth
        }
      } catch (error) {
        console.error('Error processing results:', error)
        alert('Gagal memproses hasil. Silakan coba lagi.')
      } finally {
        this.processing = false
      }
    },
    
    async loadResults() {
      try {
        const response = await api.getPublicResults()
        this.results = response.data
      } catch (error) {
        console.error('Error loading results:', error)
      } finally {
        this.loading = false
      }
    },
    
    async refreshResults() {
      this.refreshing = true
      await this.loadResults()
      this.refreshing = false
    },
    
    startAutoRefresh() {
      this.refreshInterval = setInterval(() => {
        this.loadResults()
      }, 30000) // 30 seconds
    },
    
    startCountdown() {
      this.showCountdown = true
      this.countdownTime = 5
      
      const countdown = setInterval(() => {
        this.countdownTime--
        
        if (this.countdownTime <= 0) {
          clearInterval(countdown)
          this.showCountdown = false
          this.showWinner = true
        }
      }, 1000)
    },
    
    hideWinner() {
      this.showWinner = false
    }
  }
}
</script>

<style scoped>
.results-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-x: hidden;
}

.header {
  text-align: center;
  padding: 2rem 1rem;
  background: rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
}

.main-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  animation: pulse 2s infinite;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255,255,255,0.3);
  border-top: 5px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.initial-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 2rem;
}

.initial-content {
  text-align: center;
  max-width: 600px;
}

.initial-icon {
  font-size: 6rem;
  margin-bottom: 2rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.initial-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.initial-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.process-btn {
  padding: 1.5rem 3rem;
  font-size: 1.3rem;
  font-weight: bold;
  border: none;
  border-radius: 15px;
  background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3); }
  to { box-shadow: 0 8px 35px rgba(78, 205, 196, 0.4); }
}

.process-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(0,0,0,0.3);
}

.process-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  animation: none;
}

.processing-animation {
  margin-top: 2rem;
}

.processing-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.processing-dots span {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

.processing-dots span:nth-child(1) { animation-delay: -0.32s; }
.processing-dots span:nth-child(2) { animation-delay: -0.16s; }
.processing-dots span:nth-child(3) { animation-delay: 0s; }

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0);
    opacity: 0.5;
  } 
  40% { 
    transform: scale(1);
    opacity: 1;
  }
}

.results-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.2);
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  opacity: 0.9;
}

.winner-announcement {
  text-align: center;
  margin-bottom: 3rem;
  animation: slideInDown 1s ease-out;
}

@keyframes slideInDown {
  0% { transform: translateY(-100px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.winner-crown {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.winner-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.winner-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background: linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,165,0,0.2));
  border: 3px solid #FFD700;
  border-radius: 20px;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.winner-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #FFD700;
}

.winner-info {
  text-align: left;
}

.winner-name {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.winner-class {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.winner-votes {
  font-size: 1.5rem;
  font-weight: bold;
  color: #FFD700;
}

.countdown-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.countdown-content {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  border: 2px solid rgba(255,255,255,0.3);
}

.countdown-number {
  font-size: 6rem;
  font-weight: bold;
  margin: 2rem 0;
  animation: scaleUp 1s ease-in-out infinite;
}

@keyframes scaleUp {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.results-table {
  margin-bottom: 3rem;
}

.table-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.candidates-grid {
  display: grid;
  gap: 1.5rem;
}

.candidate-result {
  display: grid;
  grid-template-columns: auto 80px 1fr auto 200px;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.3s ease;
}

.candidate-result:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.winner-highlight {
  border: 3px solid #FFD700;
  background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.1));
}

.rank {
  text-align: center;
}

.rank-number {
  font-size: 2rem;
  font-weight: bold;
}

.crown-small {
  display: block;
  font-size: 1.5rem;
}

.candidate-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255,255,255,0.3);
}

.candidate-name {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
}

.candidate-class {
  opacity: 0.8;
}

.vote-info {
  text-align: center;
}

.vote-count {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
}

.vote-percentage {
  font-size: 1.1rem;
  opacity: 0.9;
}

.progress-bar {
  width: 200px;
  height: 12px;
  background: rgba(255,255,255,0.2);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 1s ease-in-out;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.control-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn {
  background: linear-gradient(135deg, #56ab2f, #a8e6cf);
  color: white;
}

.winner-btn {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #8B4513;
}

.hide-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auto-refresh {
  text-align: center;
  opacity: 0.7;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.refresh-dot {
  width: 8px;
  height: 8px;
  background: #4CAF50;
  border-radius: 50%;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }
  
  .candidate-result {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1rem;
  }
  
  .progress-bar {
    width: 100%;
  }
  
  .winner-card {
    flex-direction: column;
    text-align: center;
  }
  
  .controls {
    flex-direction: column;
    align-items: center;
  }
}
</style>