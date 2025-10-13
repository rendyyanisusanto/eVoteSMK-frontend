<template>
  <div class="container">
    <div class="card">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #667eea;">Pemilihan Ketua OSIS</h1>
        <router-link to="/" style="color: #666; text-decoration: none;">← Kembali ke Beranda</router-link>
      </div>

      <!-- Step 1: Input Voting Code -->
      <div v-if="step === 1">
        <h2 style="margin-bottom: 20px; text-align: center;">Masukkan Kode Voting</h2>
        
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>
        
        <form @submit.prevent="validateVotingCode">
          <div class="form-group">
            <label class="form-label">Kode Voting:</label>
            <input 
              type="text" 
              v-model="votingCode" 
              class="form-control" 
              placeholder="Masukkan kode voting Anda"
              required
              style="text-transform: uppercase;"
              maxlength="8"
            >
          </div>
          
          <div style="text-align: center;">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Memvalidasi...' : 'Lanjutkan' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Step 2: Select Candidate -->
      <div v-if="step === 2">
        <h2 style="margin-bottom: 20px; text-align: center;">Pilih Kandidat</h2>
        <p style="text-align: center; color: #666; margin-bottom: 30px;">
          Klik pada kandidat untuk memilih
        </p>
        
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>
        
        <div v-if="loading" class="loading">
          Memuat kandidat...
        </div>
        
        <div v-else class="candidate-grid">
          <div 
            v-for="candidate in candidates" 
            :key="candidate.id"
            :class="['candidate-card', { selected: selectedCandidate?.id === candidate.id }]"
            @click="selectCandidate(candidate)"
          >
            <img 
              :src="candidate.foto ? `http://localhost:3001/uploads/${candidate.foto}` : '/placeholder-avatar.png'" 
              :alt="candidate.nama"
              class="candidate-photo"
              @error="handleImageError"
            >
            <div class="candidate-name">{{ candidate.nama }}</div>
            <div class="candidate-class">{{ candidate.kelas }}</div>
          </div>
        </div>
        
        <div v-if="selectedCandidate" style="text-align: center; margin-top: 30px;">
          <p style="margin-bottom: 20px; font-size: 18px;">
            Anda memilih: <strong>{{ selectedCandidate.nama }}</strong> ({{ selectedCandidate.kelas }})
          </p>
          <button @click="confirmVote" class="btn btn-success" :disabled="submitting">
            {{ submitting ? 'Menyimpan...' : '✓ Konfirmasi Pilihan' }}
          </button>
          <button @click="selectedCandidate = null" class="btn" style="margin-left: 10px; background: #f8f9fa; color: #666;">
            Batal
          </button>
        </div>
      </div>

      <!-- Step 3: Success -->
      <div v-if="step === 3">
        <div style="text-align: center;">
          <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
          <h2 style="color: #28a745; margin-bottom: 15px;">Vote Berhasil!</h2>
          <p style="font-size: 18px; margin-bottom: 20px;">
            Terima kasih telah menggunakan hak suara Anda.
          </p>
          <p style="color: #666; margin-bottom: 30px;">
            Pilihan Anda: <strong>{{ votedCandidate }}</strong>
          </p>
          <router-link to="/" class="btn btn-primary">
            Kembali ke Beranda
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'Vote',
  data() {
    return {
      step: 1,
      votingCode: '',
      candidates: [],
      selectedCandidate: null,
      votedCandidate: '',
      loading: false,
      submitting: false,
      error: null
    }
  },
  methods: {
    async validateVotingCode() {
      if (!this.votingCode.trim()) {
        this.error = 'Silakan masukkan kode voting'
        return
      }
      
      this.loading = true
      this.error = null
      
      try {
        // Load candidates
        const response = await api.getCandidates()
        this.candidates = response.data
        this.step = 2
      } catch (error) {
        this.error = 'Gagal memuat data kandidat. Silakan coba lagi.'
      } finally {
        this.loading = false
      }
    },
    
    selectCandidate(candidate) {
      this.selectedCandidate = candidate
    },
    
    async confirmVote() {
      if (!this.selectedCandidate) return
      
      this.submitting = true
      this.error = null
      
      try {
        const response = await api.vote(this.votingCode.toUpperCase(), this.selectedCandidate.id)
        this.votedCandidate = response.data.candidate
        this.step = 3
      } catch (error) {
        if (error.response?.data?.error) {
          this.error = error.response.data.error
        } else {
          this.error = 'Gagal menyimpan vote. Silakan coba lagi.'
        }
      } finally {
        this.submitting = false
      }
    },
    
    handleImageError(event) {
      event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Crect width="120" height="120" fill="%23f8f9fa"/%3E%3Ctext x="60" y="65" text-anchor="middle" fill="%23666" font-size="14" font-family="Arial"%3ENo Photo%3C/text%3E%3C/svg%3E'
    }
  }
}
</script>