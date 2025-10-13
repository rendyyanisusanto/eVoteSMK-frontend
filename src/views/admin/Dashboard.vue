<template>
  <div class="container">
    <!-- Admin Navigation -->
    <nav class="admin-nav">
      <ul>
        <li><router-link to="/admin" :class="{ active: $route.path === '/admin' }">Dashboard</router-link></li>
        <li><router-link to="/admin/candidates" :class="{ active: $route.path === '/admin/candidates' }">Kandidat</router-link></li>
        <li><router-link to="/admin/voting-codes" :class="{ active: $route.path === '/admin/voting-codes' }">Kode Voting</router-link></li>
        <li><router-link to="/admin/results" :class="{ active: $route.path === '/admin/results' }">Hasil</router-link></li>
        <li><a href="#" @click.prevent="logout" style="color: #ff6b6b;">Logout</a></li>
      </ul>
    </nav>

    <div class="card">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #667eea;">Dashboard Admin</h1>
        <p style="color: #666;">Selamat datang, {{ adminUser?.username }}</p>
      </div>

      <div v-if="loading" class="loading">
        Memuat data...
      </div>

      <div v-else style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
        <!-- Total Candidates -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">👥</div>
          <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">{{ stats.totalCandidates }}</div>
          <div style="font-size: 16px; opacity: 0.9;">Total Kandidat</div>
        </div>

        <!-- Total Votes -->
        <div style="background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%); color: white; padding: 30px; border-radius: 12px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">🗳️</div>
          <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">{{ stats.totalVotes }}</div>
          <div style="font-size: 16px; opacity: 0.9;">Total Suara</div>
        </div>

        <!-- Available Codes -->
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 12px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">🎫</div>
          <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">{{ stats.availableCodes }}</div>
          <div style="font-size: 16px; opacity: 0.9;">Kode Tersedia</div>
        </div>

        <!-- Used Codes -->
        <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: white; padding: 30px; border-radius: 12px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
          <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">{{ stats.usedCodes }}</div>
          <div style="font-size: 16px; opacity: 0.9;">Kode Terpakai</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="margin-top: 40px;">
        <h3 style="margin-bottom: 20px; color: #667eea;">Aksi Cepat</h3>
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          <router-link to="/admin/candidates" class="btn btn-primary">
            + Tambah Kandidat
          </router-link>
          <router-link to="/admin/voting-codes" class="btn btn-success">
            🎫 Generate Kode Voting
          </router-link>
          <router-link to="/admin/results" class="btn" style="background: #17a2b8; color: white;">
            📊 Lihat Hasil
          </router-link>
        </div>
      </div>

      <!-- Recent Activity -->
      <div v-if="recentVotes.length > 0" style="margin-top: 40px;">
        <h3 style="margin-bottom: 20px; color: #667eea;">Aktivitas Terbaru</h3>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px;">
          <div v-for="vote in recentVotes" :key="vote.id" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e1e8ed;">
            <div>
              <strong>{{ vote.candidate_name }}</strong> mendapat suara
              <span style="color: #666; font-size: 14px; margin-left: 10px;">
                {{ formatDate(vote.created_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      loading: true,
      adminUser: null,
      stats: {
        totalCandidates: 0,
        totalVotes: 0,
        availableCodes: 0,
        usedCodes: 0
      },
      recentVotes: []
    }
  },
  async mounted() {
    this.adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')
    await this.loadDashboardData()
  },
  methods: {
    async loadDashboardData() {
      try {
        // Load candidates and results to calculate stats
        const [candidatesRes, resultsRes, codesRes] = await Promise.all([
          api.getCandidates(),
          api.getResults(),
          api.getVotingCodes()
        ])

        this.stats.totalCandidates = candidatesRes.data.length
        this.stats.totalVotes = resultsRes.data.reduce((sum, candidate) => sum + candidate.vote_count, 0)
        
        const codes = codesRes.data
        this.stats.availableCodes = codes.filter(code => !code.is_used).length
        this.stats.usedCodes = codes.filter(code => code.is_used).length

        // Get recent votes (simulate from results data)
        this.recentVotes = resultsRes.data
          .filter(candidate => candidate.vote_count > 0)
          .map(candidate => ({
            id: candidate.id,
            candidate_name: candidate.nama,
            created_at: new Date().toISOString() // In real app, this would come from votes table
          }))
          .slice(0, 5)

      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        this.loading = false
      }
    },
    
    logout() {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      this.$router.push('/admin/login')
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleString('id-ID')
    }
  }
}
</script>