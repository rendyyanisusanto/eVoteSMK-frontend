<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-icon">🗳️</div>
        <h1 class="hero-title">eVoteSMK</h1>
        <h2 class="hero-subtitle">Pemilihan Ketua OSIS</h2>
        <p class="hero-description">
          Sistem voting elektronik untuk memilih ketua OSIS dengan mudah, aman, dan transparan
        </p>
        
        <div class="hero-actions">
          <router-link to="/vote" class="btn btn-primary btn-large">
            🗳️ Mulai Voting
          </router-link>
          <router-link to="/results" class="btn btn-outline btn-large">
            📊 Lihat Hasil
          </router-link>
        </div>

        <!-- Voting Status -->
        <div v-if="votingStats" class="voting-status">
          <div class="stat-item">
            <span class="stat-number">{{ votingStats.totalVotes || 0 }}</span>
            <span class="stat-label">Total Suara</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">{{ votingStats.totalCandidates || 0 }}</span>
            <span class="stat-label">Kandidat</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">{{ participationRate }}%</span>
            <span class="stat-label">Partisipasi</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Candidates Preview Section -->
    <section class="candidates-preview">
      <div class="container">
        <h3 class="section-title">Kandidat Ketua OSIS</h3>
        <p class="section-subtitle">Kenali para kandidat sebelum Anda memberikan suara</p>
        
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Memuat data kandidat...</p>
        </div>

        <div v-else-if="candidates.length > 0" class="candidates-grid">
          <div 
            v-for="candidate in candidates" 
            :key="candidate.id"
            class="candidate-preview-card"
          >
            <div class="candidate-image-container">
              <img 
                :src="candidate.foto ? getImageUrl(candidate.foto) : getPlaceholderImage()" 
                :alt="candidate.nama"
                class="candidate-image"
                @error="handleImageError"
              >
            </div>
            <div class="candidate-info">
              <h4 class="candidate-name">{{ candidate.nama }}</h4>
              <p class="candidate-class">{{ candidate.kelas }}</p>
              <p v-if="candidate.visi" class="candidate-visi">{{ truncateText(candidate.visi, 100) }}</p>
            </div>
          </div>
        </div>

        <div v-else class="no-candidates">
          <div class="no-candidates-icon">👥</div>
          <p>Belum ada kandidat yang terdaftar</p>
        </div>
      </div>
    </section>

    <!-- How to Vote Section -->
    <section class="how-to-vote">
      <div class="container">
        <h3 class="section-title">Cara Voting</h3>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <h4>Dapatkan Kode</h4>
            <p>Dapatkan kode voting unik dari panitia atau admin sekolah</p>
          </div>
          <div class="step-card">
            <div class="step-number">2</div>
            <h4>Masukkan Kode</h4>
            <p>Klik "Mulai Voting" dan masukkan kode voting Anda</p>
          </div>
          <div class="step-card">
            <div class="step-number">3</div>
            <h4>Pilih Kandidat</h4>
            <p>Pilih kandidat ketua OSIS favorit Anda</p>
          </div>
          <div class="step-card">
            <div class="step-number">4</div>
            <h4>Konfirmasi</h4>
            <p>Konfirmasi pilihan Anda dan selesai!</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h3 class="section-title">Mengapa eVoteSMK?</h3>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h4>Aman & Terpercaya</h4>
            <p>Sistem keamanan berlapis dengan kode voting unik untuk setiap pemilih</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h4>Cepat & Mudah</h4>
            <p>Proses voting yang sederhana dan dapat diselesaikan dalam hitungan menit</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h4>Transparan</h4>
            <p>Hasil voting dapat dilihat secara real-time dan transparan</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h4>Responsive</h4>
            <p>Dapat diakses dari berbagai perangkat: komputer, tablet, atau smartphone</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <h4>eVoteSMK</h4>
            <p>Sistem E-Voting SMK</p>
          </div>
          <div class="footer-links">
            <router-link to="/admin/login" class="admin-link">Admin Login</router-link>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 eVoteSMK. Dikembangkan untuk SMK.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'Home',
  data() {
    return {
      candidates: [],
      votingStats: null,
      loading: true
    }
  },
  computed: {
    participationRate() {
      if (!this.votingStats || !this.votingStats.totalCodes) return 0
      return Math.round((this.votingStats.totalVotes / this.votingStats.totalCodes) * 100)
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        // Load candidates
        const candidatesResponse = await api.getCandidates()
        this.candidates = candidatesResponse.data

        // Load voting statistics (if available)
        try {
          const statsResponse = await api.getPublicResults()
          this.votingStats = {
            totalVotes: statsResponse.data.totalVotes || 0,
            totalCandidates: this.candidates.length,
            totalCodes: statsResponse.data.totalCodes || null
          }
        } catch (error) {
          // Stats might not be available, that's okay
          this.votingStats = {
            totalVotes: 0,
            totalCandidates: this.candidates.length,
            totalCodes: null
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
        this.candidates = []
        this.votingStats = {
          totalVotes: 0,
          totalCandidates: 0,
          totalCodes: null
        }
      } finally {
        this.loading = false
      }
    },

    getImageUrl(filename) {
      return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}/uploads/${filename}`
    },

    getPlaceholderImage() {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f8f9fa"/%3E%3Ctext x="100" y="105" text-anchor="middle" fill="%23666" font-size="16" font-family="Arial"%3ENo Photo%3C/text%3E%3C/svg%3E'
    },

    handleImageError(event) {
      event.target.src = this.getPlaceholderImage()
    },

    truncateText(text, maxLength) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Hero Section */
.hero {
  padding: 80px 20px;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.hero-icon {
  font-size: 80px;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 20px;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.8;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.btn {
  padding: 15px 30px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-large {
  padding: 18px 36px;
  font-size: 1.2rem;
}

.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.btn-outline {
  background: transparent;
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* Voting Status */
.voting-status {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  background: rgba(255, 255, 255, 0.1);
  padding: 25px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 600px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

/* Sections */
section {
  padding: 80px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 15px;
  color: #333;
  font-weight: 700;
}

.section-subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 50px;
}

/* Candidates Preview */
.candidates-preview {
  background: white;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.candidate-preview-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.candidate-preview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.candidate-image-container {
  height: 200px;
  overflow: hidden;
}

.candidate-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.candidate-info {
  padding: 20px;
}

.candidate-name {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.candidate-class {
  color: #667eea;
  font-weight: 500;
  margin-bottom: 10px;
}

.candidate-visi {
  color: #666;
  line-height: 1.5;
  font-size: 0.95rem;
}

.no-candidates {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-candidates-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

/* How to Vote */
.how-to-vote {
  background: #f8f9fa;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.step-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.step-card:hover {
  transform: translateY(-5px);
}

.step-number {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 20px;
}

.step-card h4 {
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}

.step-card p {
  color: #666;
  line-height: 1.6;
}

/* Features */
.features {
  background: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature-card h4 {
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* Footer */
.footer {
  background: #2c3e50;
  color: white;
  padding: 40px 20px 20px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 20px;
}

.footer-logo h4 {
  margin-bottom: 5px;
  font-size: 1.5rem;
}

.footer-logo p {
  opacity: 0.8;
  margin: 0;
}

.admin-link {
  color: #bdc3c7;
  text-decoration: none;
  padding: 8px 16px;
  border: 1px solid #bdc3c7;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.admin-link:hover {
  color: white;
  border-color: white;
  background: rgba(255, 255, 255, 0.1);
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #34495e;
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .voting-status {
    flex-direction: column;
    gap: 20px;
  }
  
  .stat-divider {
    width: 40px;
    height: 1px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .candidates-grid,
  .steps-grid,
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 60px 15px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .btn-large {
    padding: 15px 25px;
    font-size: 1rem;
  }
  
  section {
    padding: 60px 15px;
  }
}
</style>