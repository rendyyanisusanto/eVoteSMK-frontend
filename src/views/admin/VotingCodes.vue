<template>
  <div class="container">
    <!-- Admin Navigation -->
    <nav class="admin-nav">
      <ul>
        <li><router-link to="/admin">Dashboard</router-link></li>
        <li><router-link to="/admin/candidates">Kandidat</router-link></li>
        <li><router-link to="/admin/voting-codes" class="active">Kode Voting</router-link></li>
        <li><router-link to="/admin/results">Hasil</router-link></li>
        <li><a href="#" @click.prevent="logout" style="color: #ff6b6b;">Logout</a></li>
      </ul>
    </nav>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <h1 style="color: #667eea;">Manajemen Kode Voting</h1>
        <div style="display: flex; gap: 10px;">
          <button @click="exportToExcel" class="btn btn-success" :disabled="votingCodes.length === 0">
            📊 Export Excel
          </button>
          <button @click="confirmReset" class="btn btn-danger" :disabled="votingCodes.length === 0 || resetting">
            {{ resetting ? '🔄 Resetting...' : '🗑️ Reset Semua Kode' }}
          </button>
        </div>
      </div>

      <!-- Generate Codes Form -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h3 style="margin-bottom: 20px;">Generate Kode Voting Baru</h3>
        
        <div v-if="formError" class="alert alert-error">
          {{ formError }}
        </div>
        
        <div v-if="generatedCodes.length > 0" class="alert alert-success">
          <strong>{{ generatedCodes.length }} kode berhasil digenerate!</strong>
          <div style="margin-top: 10px;">
            <strong>Kode-kode baru:</strong>
            <div style="background: white; padding: 10px; border-radius: 4px; margin-top: 5px; font-family: monospace;">
              {{ generatedCodes.join(', ') }}
            </div>
          </div>
        </div>
        
        <form @submit.prevent="generateCodes" style="display: flex; gap: 15px; align-items: end;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Jumlah Kode:</label>
            <input 
              type="number" 
              v-model.number="codeCount" 
              class="form-control" 
              placeholder="10"
              min="1"
              max="1000"
              required
              style="width: 150px;"
            >
          </div>
          
          <button type="submit" class="btn btn-success" :disabled="generating">
            {{ generating ? 'Generating...' : '🎫 Generate Kode' }}
          </button>
        </form>
      </div>

      <!-- Statistics -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold;">{{ stats.total }}</div>
          <div>Total Kode</div>
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold;">{{ stats.available }}</div>
          <div>Tersedia</div>
        </div>
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold;">{{ stats.used }}</div>
          <div>Terpakai</div>
        </div>
      </div>

      <!-- Filter -->
      <div style="margin-bottom: 20px;">
        <label class="form-label">Filter Status:</label>
        <select v-model="filter" class="form-control" style="width: 200px; display: inline-block;">
          <option value="all">Semua Kode</option>
          <option value="available">Tersedia</option>
          <option value="used">Terpakai</option>
        </select>
      </div>

      <!-- Voting Codes List -->
      <div v-if="loading" class="loading">
        Memuat kode voting...
      </div>
      
      <div v-else-if="filteredCodes.length === 0" style="text-align: center; padding: 40px; color: #666;">
        <div style="font-size: 48px; margin-bottom: 15px;">🎫</div>
        <h3>{{ filter === 'all' ? 'Belum Ada Kode Voting' : 'Tidak Ada Kode dengan Status Ini' }}</h3>
        <p v-if="filter === 'all'">Generate kode voting pertama dengan form di atas</p>
      </div>
      
      <div v-else>
        <div style="margin-bottom: 15px; color: #666;">
          Menampilkan {{ filteredCodes.length }} dari {{ votingCodes.length }} kode
        </div>
        
        <table class="table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Status</th>
              <th>Dibuat</th>
              <th>Digunakan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="code in paginatedCodes" :key="code.id">
              <td>
                <span style="font-family: monospace; font-weight: bold; font-size: 16px; padding: 4px 8px; background: #f8f9fa; border-radius: 4px;">
                  {{ code.kode }}
                </span>
              </td>
              <td>
                <span v-if="code.is_used" style="background: #dc3545; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  TERPAKAI
                </span>
                <span v-else style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  TERSEDIA
                </span>
              </td>
              <td>{{ formatDate(code.created_at) }}</td>
              <td>{{ code.used_at ? formatDate(code.used_at) : '-' }}</td>
              <td>
                <button 
                  v-if="code.is_used" 
                  @click="resetIndividualCode(code)" 
                  class="btn btn-warning" 
                  style="padding: 4px 8px; font-size: 12px;"
                  :disabled="resettingCode === code.id"
                >
                  {{ resettingCode === code.id ? '⏳' : '🔄 Reset' }}
                </button>
                <span v-else style="color: #666; font-size: 12px;">-</span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Pagination -->
        <div v-if="totalPages > 1" style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="btn"
            style="background: #f8f9fa; color: #666; padding: 8px 12px;"
          >
            ← Sebelumnya
          </button>
          
          <span style="padding: 8px 12px; background: #667eea; color: white; border-radius: 4px;">
            {{ currentPage }} / {{ totalPages }}
          </span>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="btn"
            style="background: #f8f9fa; color: #666; padding: 8px 12px;"
          >
            Selanjutnya →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'AdminVotingCodes',
  data() {
    return {
      votingCodes: [],
      loading: true,
      generating: false,
      resetting: false,
      resettingCode: null, // ID kode yang sedang direset
      formError: null,
      generatedCodes: [],
      codeCount: 10,
      filter: 'all',
      currentPage: 1,
      itemsPerPage: 20
    }
  },
  computed: {
    stats() {
      return {
        total: this.votingCodes.length,
        available: this.votingCodes.filter(code => !code.is_used).length,
        used: this.votingCodes.filter(code => code.is_used).length
      }
    },
    
    filteredCodes() {
      if (this.filter === 'available') {
        return this.votingCodes.filter(code => !code.is_used)
      } else if (this.filter === 'used') {
        return this.votingCodes.filter(code => code.is_used)
      }
      return this.votingCodes
    },
    
    totalPages() {
      return Math.ceil(this.filteredCodes.length / this.itemsPerPage)
    },
    
    paginatedCodes() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredCodes.slice(start, end)
    }
  },
  watch: {
    filter() {
      this.currentPage = 1
    }
  },
  async mounted() {
    await this.loadVotingCodes()
  },
  methods: {
    async loadVotingCodes() {
      try {
        const response = await api.getVotingCodes()
        this.votingCodes = response.data
      } catch (error) {
        console.error('Error loading voting codes:', error)
      } finally {
        this.loading = false
      }
    },
    
    async generateCodes() {
      if (!this.codeCount || this.codeCount < 1 || this.codeCount > 1000) {
        this.formError = 'Jumlah kode harus antara 1-1000'
        return
      }
      
      this.generating = true
      this.formError = null
      this.generatedCodes = []
      
      try {
        const response = await api.generateVotingCodes(this.codeCount)
        this.generatedCodes = response.data.codes
        await this.loadVotingCodes()
        
        // Clear generated codes after 10 seconds
        setTimeout(() => {
          this.generatedCodes = []
        }, 10000)
        
      } catch (error) {
        if (error.response?.data?.error) {
          this.formError = error.response.data.error
        } else {
          this.formError = 'Gagal generate kode voting'
        }
      } finally {
        this.generating = false
      }
    },
    
    confirmReset() {
      if (confirm('PERINGATAN: Ini akan menghapus SEMUA kode voting dan data voting yang ada. Aksi ini tidak dapat dibatalkan. Yakin ingin melanjutkan?')) {
        this.resetAllCodes()
      }
    },
    
    async resetAllCodes() {
      this.resetting = true
      this.formError = null
      
      try {
        const response = await api.resetVotingCodes()
        alert(response.data.message)
        await this.loadVotingCodes()
      } catch (error) {
        if (error.response?.data?.error) {
          this.formError = error.response.data.error
        } else {
          this.formError = 'Gagal reset kode voting'
        }
      } finally {
        this.resetting = false
      }
    },
    
    async resetIndividualCode(code) {
      if (!confirm(`Yakin ingin mereset kode "${code.kode}"? Vote yang menggunakan kode ini akan dihapus.`)) {
        return
      }
      
      this.resettingCode = code.id
      this.formError = null
      
      try {
        const response = await api.resetIndividualCode(code.id)
        alert(response.data.message)
        await this.loadVotingCodes()
      } catch (error) {
        if (error.response?.data?.error) {
          alert('Error: ' + error.response.data.error)
        } else {
          alert('Gagal reset kode voting')
        }
      } finally {
        this.resettingCode = null
      }
    },
    
    exportToExcel() {
      if (this.votingCodes.length === 0) {
        alert('Tidak ada kode untuk di-export')
        return
      }
      
      // Prepare data for Excel export
      const excelData = [
        ['No', 'Kode Voting', 'Status', 'Tanggal Dibuat', 'Tanggal Digunakan'],
        ...this.votingCodes.map((code, index) => [
          index + 1,
          code.kode,
          code.is_used ? 'TERPAKAI' : 'TERSEDIA',
          this.formatDateExcel(code.created_at),
          code.used_at ? this.formatDateExcel(code.used_at) : '-'
        ])
      ]
      
      // Convert to CSV format (Excel can open CSV)
      const csvContent = excelData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n')
      
      // Add BOM for proper UTF-8 handling in Excel
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      })
      
      // Create download link
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `kode-voting-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    
    logout() {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      this.$router.push('/admin/login')
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatDateExcel(dateString) {
      return new Date(dateString).toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>