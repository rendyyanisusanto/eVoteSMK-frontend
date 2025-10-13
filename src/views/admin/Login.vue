<template>
  <div class="container">
    <div class="card">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #667eea; margin-bottom: 10px;">Admin Login</h1>
        <p style="color: #666;">Masuk ke Dashboard Admin</p>
      </div>
      
      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>
      
      <form @submit.prevent="login" style="max-width: 400px; margin: 0 auto;">
        <div class="form-group">
          <label class="form-label">Username:</label>
          <input 
            type="text" 
            v-model="username" 
            class="form-control" 
            placeholder="Masukkan username"
            required
          >
        </div>
        
        <div class="form-group">
          <label class="form-label">Password:</label>
          <input 
            type="password" 
            v-model="password" 
            class="form-control" 
            placeholder="Masukkan password"
            required
          >
        </div>
        
        <div style="text-align: center;">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Memproses...' : 'Login' }}
          </button>
        </div>
      </form>
      
      <div style="text-align: center; margin-top: 30px;">
        <router-link to="/" style="color: #666; text-decoration: none;">
          ← Kembali ke Beranda
        </router-link>
      </div>
      
      <!-- Default credentials info -->
      <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
        <h4 style="color: #667eea; margin-bottom: 10px;">Info Default Login:</h4>
        <p style="margin: 5px 0;"><strong>Username:</strong> admin</p>
        <p style="margin: 5px 0;"><strong>Password:</strong> admin123</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'AdminLogin',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: null
    }
  },
  mounted() {
    // Redirect if already logged in
    if (localStorage.getItem('adminToken')) {
      this.$router.push('/admin')
    }
  },
  methods: {
    async login() {
      if (!this.username || !this.password) {
        this.error = 'Username dan password harus diisi'
        return
      }
      
      this.loading = true
      this.error = null
      
      try {
        const response = await api.adminLogin(this.username, this.password)
        localStorage.setItem('adminToken', response.data.token)
        localStorage.setItem('adminUser', JSON.stringify(response.data.admin))
        this.$router.push('/admin')
      } catch (error) {
        if (error.response?.data?.error) {
          this.error = error.response.data.error
        } else {
          this.error = 'Gagal login. Silakan coba lagi.'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>