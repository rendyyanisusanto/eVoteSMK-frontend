<template>
  <div class="container">
    <div class="card">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #667eea; margin-bottom: 10px;">E-Voting OSIS</h1>
        <p style="color: #666; font-size: 18px;">Sistem Pemilihan Ketua OSIS Online</p>
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
        
        <!-- Link Admin di pojok kanan bawah -->
        <div style="position: fixed; bottom: 20px; right: 20px;">
          <router-link to="/admin/login" style="color: #666; text-decoration: none; font-size: 12px;">
            Admin
          </router-link>
        </div>
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
              :src="getCandidateImageUrl(candidate.foto)" 
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
          <button @click="resetVoting" class="btn btn-primary">
            Vote Lagi dengan Kode Baru
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import { getImageUrl, getDefaultAvatar } from '@/utils/url'

export default {
  name: 'Home',
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
        // Validasi kode voting terlebih dahulu
        await api.validateVotingCode(this.votingCode.toUpperCase())
        
        // Jika kode valid, load candidates
        const response = await api.getCandidates()
        this.candidates = response.data
        this.step = 2
      } catch (error) {
        if (error.response?.data?.error) {
          this.error = error.response.data.error
        } else {
          this.error = 'Gagal memvalidasi kode voting. Silakan coba lagi.'
        }
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
    
    resetVoting() {
      this.step = 1
      this.votingCode = ''
      this.candidates = []
      this.selectedCandidate = null
      this.votedCandidate = ''
      this.error = null
    },
    
    getCandidateImageUrl(foto) {
      return getImageUrl(foto) || getDefaultAvatar()
    },
    
    handleImageError(event) {
      event.target.src = getDefaultAvatar()
    }
  }
}
</script>