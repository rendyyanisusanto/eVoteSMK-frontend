<template>
  <div class="container">
    <!-- Admin Navigation -->
    <nav class="admin-nav">
      <ul>
        <li><router-link to="/admin">Dashboard</router-link></li>
        <li><router-link to="/admin/candidates" class="active">Kandidat</router-link></li>
        <li><router-link to="/admin/voting-codes">Kode Voting</router-link></li>
        <li><router-link to="/admin/results">Hasil</router-link></li>
        <li><a href="#" @click.prevent="logout" style="color: #ff6b6b;">Logout</a></li>
      </ul>
    </nav>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <h1 style="color: #667eea;">Manajemen Kandidat</h1>
        <button @click="showAddForm = true" class="btn btn-primary">
          + Tambah Kandidat
        </button>
      </div>

      <!-- Add/Edit Candidate Form -->
      <div v-if="showAddForm || editingCandidate" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h3 style="margin-bottom: 20px;">
          {{ editingCandidate ? 'Edit Kandidat' : 'Tambah Kandidat Baru' }}
        </h3>
        
        <div v-if="formError" class="alert alert-error">
          {{ formError }}
        </div>
        
        <form @submit.prevent="submitForm" enctype="multipart/form-data">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
              <label class="form-label">Nama Lengkap:</label>
              <input 
                type="text" 
                v-model="form.nama" 
                class="form-control" 
                placeholder="Masukkan nama lengkap"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="form-label">Kelas:</label>
              <input 
                type="text" 
                v-model="form.kelas" 
                class="form-control" 
                placeholder="Contoh: XII IPA 1"
                required
              >
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Foto Kandidat:</label>
            <input 
              type="file" 
              @change="handleFileChange" 
              class="form-control" 
              accept="image/*"
            >
            <small style="color: #666; font-size: 12px;">
              Format: JPG, PNG, maksimal 5MB
            </small>
          </div>
          
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn btn-success" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : (editingCandidate ? 'Update' : 'Simpan') }}
            </button>
            <button type="button" @click="cancelForm" class="btn" style="background: #f8f9fa; color: #666;">
              Batal
            </button>
          </div>
        </form>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <!-- Candidates List -->
      <div v-if="loading" class="loading">
        Memuat kandidat...
      </div>
      
      <div v-else-if="candidates.length === 0" style="text-align: center; padding: 40px; color: #666;">
        <div style="font-size: 48px; margin-bottom: 15px;">📝</div>
        <h3>Belum Ada Kandidat</h3>
        <p>Tambahkan kandidat pertama dengan mengklik tombol "Tambah Kandidat"</p>
      </div>
      
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nama</th>
              <th>Kelas</th>
              <th>Tanggal Ditambahkan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="candidate in candidates" :key="candidate.id">
              <td>
                <img 
                  :src="getImageUrl(candidate.foto)" 
                  :alt="candidate.nama"
                  style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;"
                  @error="handleImageError"
                >
              </td>
              <td><strong>{{ candidate.nama }}</strong></td>
              <td>{{ candidate.kelas }}</td>
              <td>{{ formatDate(candidate.created_at) }}</td>
              <td>
                <button @click="editCandidate(candidate)" class="btn" style="background: #17a2b8; color: white; margin-right: 5px; padding: 5px 10px; font-size: 12px;">
                  Edit
                </button>
                <button @click="deleteCandidate(candidate.id)" class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" :disabled="deleting === candidate.id">
                  {{ deleting === candidate.id ? 'Hapus...' : 'Hapus' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'AdminCandidates',
  data() {
    return {
      candidates: [],
      loading: true,
      showAddForm: false,
      editingCandidate: null,
      submitting: false,
      deleting: null,
      formError: null,
      successMessage: null,
      form: {
        nama: '',
        kelas: '',
        foto: null
      }
    }
  },
  async mounted() {
    await this.loadCandidates()
  },
  methods: {
    async loadCandidates() {
      try {
        const response = await api.getCandidates()
        this.candidates = response.data
      } catch (error) {
        console.error('Error loading candidates:', error)
      } finally {
        this.loading = false
      }
    },
    
    handleFileChange(event) {
      this.form.foto = event.target.files[0]
    },
    
    async submitForm() {
      if (!this.form.nama || !this.form.kelas) {
        this.formError = 'Nama dan kelas harus diisi'
        return
      }
      
      this.submitting = true
      this.formError = null
      
      try {
        const formData = new FormData()
        formData.append('nama', this.form.nama)
        formData.append('kelas', this.form.kelas)
        if (this.form.foto) {
          formData.append('foto', this.form.foto)
        }
        
        if (this.editingCandidate) {
          await api.updateCandidate(this.editingCandidate.id, formData)
          this.successMessage = 'Kandidat berhasil diupdate'
        } else {
          await api.addCandidate(formData)
          this.successMessage = 'Kandidat berhasil ditambahkan'
        }
        
        await this.loadCandidates()
        this.cancelForm()
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = null
        }, 3000)
        
      } catch (error) {
        if (error.response?.data?.error) {
          this.formError = error.response.data.error
        } else {
          this.formError = 'Gagal menyimpan kandidat'
        }
      } finally {
        this.submitting = false
      }
    },
    
    editCandidate(candidate) {
      this.editingCandidate = candidate
      this.form.nama = candidate.nama
      this.form.kelas = candidate.kelas
      this.form.foto = null
      this.showAddForm = false
      this.formError = null
    },
    
    async deleteCandidate(id) {
      if (!confirm('Yakin ingin menghapus kandidat ini?')) return
      
      this.deleting = id
      
      try {
        await api.deleteCandidate(id)
        this.successMessage = 'Kandidat berhasil dihapus'
        await this.loadCandidates()
        
        setTimeout(() => {
          this.successMessage = null
        }, 3000)
        
      } catch (error) {
        alert('Gagal menghapus kandidat')
      } finally {
        this.deleting = null
      }
    },
    
    cancelForm() {
      this.showAddForm = false
      this.editingCandidate = null
      this.form = { nama: '', kelas: '', foto: null }
      this.formError = null
    },
    
    logout() {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      this.$router.push('/admin/login')
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('id-ID')
    },
    
    getImageUrl(foto) {
      if (foto) {
        return `http://localhost:3001/uploads/${foto}`
      }
      return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNmOGY5ZmEiLz48dGV4dCB4PSIyNSIgeT0iMjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtZmFtaWx5PSJBcmlhbCI+Tm8gUGhvdG88L3RleHQ+PC9zdmc+'
    },
    
    handleImageError(event) {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNmOGY5ZmEiLz48dGV4dCB4PSIyNSIgeT0iMjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtZmFtaWx5PSJBcmlhbCI+Tm8gUGhvdG88L3RleHQ+PC9zdmc+'
    }
  }
}
</script>