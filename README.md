# eVoteSMK Frontend

Aplikasi frontend untuk sistem e-voting SMK yang dibangun menggunakan Vue.js 3 dan Vite. Aplikasi ini menyediakan antarmuka pengguna untuk voting elektronik dengan fitur administrasi yang lengkap.

## 🚀 Fitur

### 📊 Untuk Pengguna Umum
- **Halaman Beranda**: Tampilan utama dengan informasi voting
- **Voting**: Sistem voting dengan validasi kode voting yang aman
- **Hasil Voting**: Tampilan hasil voting secara real-time

### 🔧 Panel Admin
- **Dashboard**: Ringkasan statistik voting
- **Manajemen Kandidat**: Tambah, edit, dan hapus kandidat
- **Kode Voting**: Generate dan kelola kode voting
- **Hasil Detail**: Analisis hasil voting yang komprehensif
- **Autentikasi**: Sistem login admin yang aman

## 🛠️ Tech Stack

- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **CSS**: Vanilla CSS dengan desain modern
- **Authentication**: JWT Token

## 📦 Prerequisites

Pastikan Anda memiliki:
- Node.js (versi 16 atau lebih baru)
- npm atau yarn
- Backend API yang sudah berjalan

## 🚀 Instalasi & Setup

### 1. Clone Repository
```bash
git clone https://github.com/rendyyanisusanto/eVoteSMK-frontend.git
cd eVoteSMK-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env` di root directory:
```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 📁 Struktur Project

```
src/
├── assets/           # Asset statis (gambar, CSS global)
├── components/       # Komponen Vue yang dapat digunakan kembali
├── router/          # Konfigurasi Vue Router
├── services/        # API services dan HTTP requests
├── views/           # Halaman/view utama
│   ├── admin/       # Halaman admin
│   │   ├── Dashboard.vue
│   │   ├── Candidates.vue
│   │   ├── Login.vue
│   │   ├── Results.vue
│   │   └── VotingCodes.vue
│   ├── Home.vue
│   ├── Results.vue
│   └── Vote.vue
├── App.vue          # Komponen root
└── main.js          # Entry point aplikasi
```

## 🎯 Routing

### Public Routes
- `/` - Halaman beranda
- `/results` - Hasil voting publik

### Admin Routes (Memerlukan Autentikasi)
- `/admin/login` - Login admin
- `/admin` - Dashboard admin
- `/admin/candidates` - Manajemen kandidat
- `/admin/voting-codes` - Manajemen kode voting
- `/admin/results` - Hasil voting detail

## 🔐 Sistem Autentikasi

- Menggunakan JWT token yang disimpan di localStorage
- Auto-redirect ke login jika token expired
- Route guard untuk melindungi halaman admin

## 📡 API Integration

Aplikasi terintegrasi dengan backend melalui service layer di `src/services/api.js`:

### Public Endpoints
- `GET /api/candidates` - Daftar kandidat
- `GET /api/results` - Hasil voting publik
- `POST /api/validate-code` - Validasi kode voting
- `POST /api/vote` - Submit vote

### Admin Endpoints
- `POST /api/admin/login` - Login admin
- `GET /api/admin/results` - Hasil detail
- CRUD operations untuk kandidat dan kode voting

## 🚀 Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy ke Server

1. Build aplikasi:
```bash
npm run build
```

2. Upload folder `dist/` ke web server
3. Konfigurasi web server untuk SPA routing
4. Pastikan environment variables sudah sesuai

## 🎨 Styling

- Menggunakan CSS vanilla dengan pendekatan modular
- CSS global di `src/assets/css/global.css`
- Component-scoped CSS di setiap Vue component
- Responsive design untuk berbagai device

## 🔒 Keamanan

- Validasi input di frontend dan backend
- Token-based authentication
- Route protection untuk area admin
- Sanitasi data untuk mencegah XSS

## 🐛 Development Tips

### Hot Reload
Vite menyediakan hot reload yang cepat selama development.

### Environment Variables
Gunakan prefix `VITE_` untuk environment variables yang dapat diakses di frontend.

### API Configuration
URL API dapat dikonfigurasi melalui environment variable `VITE_API_URL`.

## 📝 Scripts

- `npm run dev` - Jalankan development server 
- `npm run build` - Build untuk production
- `npm run preview` - Preview build production

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License.

## 👥 Author

**Rendy Yani Susanto**
- GitHub: [@rendyyanisusanto](https://github.com/rendyyanisusanto)

## 🙏 Acknowledgments

- Vue.js team untuk framework yang amazing
- Vite untuk build tool yang super cepat
- Komunitas open source

---

Untuk informasi lebih lanjut atau bantuan, silakan buka issue di repository ini.
