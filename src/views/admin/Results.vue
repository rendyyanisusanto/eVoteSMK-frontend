<template>
  <div class="container">
    <!-- Admin Navigation -->
    <nav class="admin-nav">
      <ul>
        <li><router-link to="/admin">Dashboard</router-link></li>
        <li><router-link to="/admin/candidates">Kandidat</router-link></li>
        <li><router-link to="/admin/voting-codes">Kode Voting</router-link></li>
        <li><router-link to="/admin/results" class="active">Hasil</router-link></li>
        <li><a href="#" @click.prevent="logout" style="color: #ff6b6b;">Logout</a></li>
      </ul>
    </nav>

    <div class="card">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #667eea;">Hasil Pemilihan OSIS</h1>
        <p style="color: #666;">Rekap suara dan statistik pemilihan</p>
      </div>

      <div v-if="loading" class="loading">
        Memuat hasil pemilihan...
      </div>
      
      <div v-else>
        <!-- Summary Statistics -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold;">{{ totalVotes }}</div>
            <div>Total Suara</div>
          </div>
          <div style="background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold;">{{ results.length }}</div>
            <div>Total Kandidat</div>
          </div>
          <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold;">{{ winner?.nama || '-' }}</div>
            <div>Kandidat Terdepan</div>
          </div>
        </div>

        <!-- Winner Announcement -->
        <div v-if="winner && totalVotes > 0" style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #8B4513; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 15px;">🏆</div>
          <h2 style="margin-bottom: 10px; color: #8B4513;">PEMENANG SEMENTARA</h2>
          <h3 style="margin-bottom: 5px; color: #8B4513;">{{ winner.nama }}</h3>
          <p style="font-size: 16px; margin-bottom: 10px; color: #8B4513;">{{ winner.kelas }}</p>
          <div style="font-size: 24px; font-weight: bold; color: #8B4513;">
            {{ winner.vote_count }} suara ({{ ((winner.vote_count / totalVotes) * 100).toFixed(1) }}%)
          </div>
        </div>

        <!-- Results Table -->
        <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <table class="table">
            <thead style="background: #667eea; color: white;">
              <tr>
                <th style="color: white;">Peringkat</th>
                <th style="color: white;">Foto</th>
                <th style="color: white;">Nama Kandidat</th>
                <th style="color: white;">Kelas</th>
                <th style="color: white;">Jumlah Suara</th>
                <th style="color: white;">Persentase</th>
                <th style="color: white;">Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(candidate, index) in results" :key="candidate.id" :style="{ background: index === 0 && candidate.vote_count > 0 ? '#fff3cd' : 'white' }">
                <td>
                  <div style="display: flex; align-items: center;">
                    <span style="font-size: 24px; font-weight: bold; color: #667eea;">{{ index + 1 }}</span>
                    <span v-if="index === 0 && candidate.vote_count > 0" style="margin-left: 10px; font-size: 20px;">🥇</span>
                    <span v-else-if="index === 1 && candidate.vote_count > 0" style="margin-left: 10px; font-size: 20px;">🥈</span>
                    <span v-else-if="index === 2 && candidate.vote_count > 0" style="margin-left: 10px; font-size: 20px;">🥉</span>
                  </div>
                </td>
                <td>
                  <img 
                    :src="getImageUrl(candidate.foto)" 
                    :alt="candidate.nama"
                    style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid #f8f9fa;"
                    @error="handleImageError"
                  >
                </td>
                <td>
                  <strong style="font-size: 16px;">{{ candidate.nama }}</strong>
                </td>
                <td>{{ candidate.kelas }}</td>
                <td>
                  <span style="font-size: 18px; font-weight: bold; color: #667eea;">{{ candidate.vote_count }}</span>
                </td>
                <td>
                  <span style="font-weight: 600;">{{ totalVotes > 0 ? ((candidate.vote_count / totalVotes) * 100).toFixed(1) : 0 }}%</span>
                </td>
                <td>
                  <div style="width: 100%; background: #e9ecef; border-radius: 10px; height: 20px; position: relative; overflow: hidden;">
                    <div 
                      style="height: 100%; border-radius: 10px; transition: width 0.3s ease;"
                      :style="{
                        width: totalVotes > 0 ? (candidate.vote_count / totalVotes * 100) + '%' : '0%',
                        background: index === 0 ? 'linear-gradient(90deg, #FFD700, #FFA500)' : 'linear-gradient(90deg, #667eea, #764ba2)'
                      }"
                    ></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- No votes message -->
        <div v-if="totalVotes === 0" style="text-align: center; padding: 40px; color: #666; margin-top: 30px;">
          <div style="font-size: 48px; margin-bottom: 15px;">📊</div>
          <h3>Belum Ada Suara Masuk</h3>
          <p>Hasil akan muncul setelah ada suara yang masuk</p>
        </div>

        <!-- Export Options -->
        <div style="margin-top: 30px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <h4 style="margin-bottom: 15px; color: #667eea;">Export Hasil</h4>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button @click="exportToCSV" class="btn btn-success">
              📊 Export ke CSV
            </button>
            <button @click="printResults" class="btn btn-primary">
              🖨️ Print Hasil
            </button>
          </div>
        </div>

        <!-- Last Updated -->
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
          Terakhir diperbarui: {{ new Date().toLocaleString('id-ID') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import { getImageUrl, getDefaultAvatar } from '@/utils/url'

export default {
  name: 'AdminResults',
  data() {
    return {
      results: [],
      loading: true
    }
  },
  computed: {
    totalVotes() {
      return this.results.reduce((sum, candidate) => sum + candidate.vote_count, 0)
    },
    
    winner() {
      return this.results.length > 0 ? this.results[0] : null
    }
  },
  async mounted() {
    await this.loadResults()
    
    // Auto refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadResults()
    }, 30000)
  },
  
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },
  
  methods: {
    async loadResults() {
      try {
        const response = await api.getResults()
        this.results = response.data
      } catch (error) {
        console.error('Error loading results:', error)
      } finally {
        this.loading = false
      }
    },
    
    exportToCSV() {
      const csvData = [
        ['Peringkat', 'Nama', 'Kelas', 'Jumlah Suara', 'Persentase'],
        ...this.results.map((candidate, index) => [
          index + 1,
          candidate.nama,
          candidate.kelas,
          candidate.vote_count,
          this.totalVotes > 0 ? ((candidate.vote_count / this.totalVotes) * 100).toFixed(1) + '%' : '0%'
        ])
      ]
      
      const csvContent = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `hasil-pemilihan-osis-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    
    printResults() {
      const printWindow = window.open('', '_blank')
      const printContent = `
        <html>
          <head>
            <title>Hasil Pemilihan OSIS</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #667eea; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .winner { background-color: #fff3cd; font-weight: bold; }
              .text-center { text-align: center; }
            </style>
          </head>
          <body>
            <h1>Hasil Pemilihan Ketua OSIS</h1>
            <p class="text-center">Total Suara: ${this.totalVotes}</p>
            <table>
              <thead>
                <tr>
                  <th>Peringkat</th>
                  <th>Nama Kandidat</th>
                  <th>Kelas</th>
                  <th>Jumlah Suara</th>
                  <th>Persentase</th>
                </tr>
              </thead>
              <tbody>
                ${this.results.map((candidate, index) => `
                  <tr ${index === 0 && candidate.vote_count > 0 ? 'class="winner"' : ''}>
                    <td>${index + 1}</td>
                    <td>${candidate.nama}</td>
                    <td>${candidate.kelas}</td>
                    <td>${candidate.vote_count}</td>
                    <td>${this.totalVotes > 0 ? ((candidate.vote_count / this.totalVotes) * 100).toFixed(1) : 0}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p class="text-center">Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
          </body>
        </html>
      `
      
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    },
    
    logout() {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      this.$router.push('/admin/login')
    },
    
    getImageUrl(foto) {
      return getImageUrl(foto) || getDefaultAvatar()
    },
    
    handleImageError(event) {
      event.target.src = getDefaultAvatar()
    }
  }
}
</script>