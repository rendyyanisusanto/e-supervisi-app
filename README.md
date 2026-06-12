# E-Supervisi SMK — Frontend App

> Aplikasi web manajemen supervisi guru berbasis Vue 3, dibangun untuk lingkungan SMK.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Vue 3 (Composition API) |
| Build Tool | Vite |
| Language | TypeScript |
| State Management | Pinia |
| Routing | Vue Router |
| UI Library | PrimeVue v4 |
| CSS Framework | Tailwind CSS v4 |
| Icons | PrimeIcons |
| HTTP Client | Axios |
| PDF Export | jsPDF + jspdf-autotable |
| Charts | Chart.js |

---

## 🚀 Cara Menjalankan

### 1. Clone & Install

```bash
git clone https://github.com/rendyyanisusanto/e-supervisi-app.git
cd e-supervisi-app
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
```

Edit `.env` sesuaikan kebutuhan:

```env
VITE_APP_NAME=E-Supervisi SMK
VITE_API_BASE_URL=http://localhost:5000/api

# Mode operasi: "dummy" (mock data) | "api" (backend nyata)
VITE_DATA_SOURCE=api
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Aplikasi berjalan di: **http://localhost:5173**

### 4. Build Production

```bash
npm run build
```

---

## 👤 Akun Login (Mode API)

Pastikan backend sudah berjalan dan database sudah di-seed.

| Username | Password | Role |
|---|---|---|
| admin | admin123 | Admin |
| kurikulum | admin123 | Kurikulum, Penilai |
| penilai | admin123 | Penilai |
| guru | admin123 | Guru |

---

## 🔧 Mode Operasi

Aplikasi mendukung dua mode yang diatur via `VITE_DATA_SOURCE` di file `.env`:

| Mode | Nilai | Keterangan |
|---|---|---|
| **Dummy** | `dummy` | Menggunakan mock data lokal (`src/data/`), tidak butuh backend. Cocok untuk dev UI. |
| **API** | `api` | Terhubung ke backend nyata via Axios. Untuk integrasi penuh. |

---

## 📁 Struktur Folder

```
app/
├── docs/
│   └── API_CONTRACT.md     # Dokumentasi kontrak API lengkap
├── public/                 # Aset statis (favicon, dll)
└── src/
    ├── assets/             # Gambar, font, CSS global
    ├── components/
    │   └── common/         # Komponen reusable (BaseSectionCard, BaseFormDialog, dll)
    ├── constants/           # Konstanta global (roles, default values)
    ├── data/               # Mock data untuk mode dummy
    ├── mappers/            # Transformasi data antara DTO dan model view
    ├── router/             # Konfigurasi Vue Router
    ├── services/           # Lapisan akses data (dummy & API, per domain)
    ├── stores/             # Global state Pinia (memanggil service layer)
    ├── types/
    │   ├── dto/            # Request & Response DTO
    │   ├── api.ts          # Tipe standar ApiResponse
    │   └── index.ts        # Definisi entitas domain
    ├── utils/              # Utility (error handling, validasi, format)
    ├── views/              # Halaman utama (Pages per fitur)
    ├── App.vue
    └── main.ts
```

---

## 🗂️ Modul Fitur

| No | Modul | Status |
|---|---|---|
| 1 | **Authentication** | ✅ Full API |
| 2 | **Dashboard** | ✅ Full API |
| 3 | **Master Data** (Guru, Instrumen, Rentang Nilai) | ✅ Full API |
| 4 | **Periode & Mata Pelajaran** | ✅ Full API |
| 5 | **Kelas** | ✅ Full API |
| 6 | **Supervisi** (Penjadwalan, Input Nilai) | ✅ Full API |
| 7 | **Refleksi Guru** | ✅ Full API |
| 8 | **Peta Kompetensi** | ✅ Full API |
| 9 | **Laporan & Rekap** | ✅ Full API |
| 10 | **Pengaturan WA** | ✅ Full API |
| 11 | **Pengaturan Sistem** | ✅ Full API |
| 12 | **Notifikasi** | ✅ Full API |

---

## 🔗 Integrasi Backend

Pastikan backend E-Supervisi berjalan di `http://localhost:5000`.

Repo backend: [e-supervisi-backend](https://github.com/rendyyanisusanto/e-supervisi-backend)

Langkah integrasi:
1. Clone dan setup backend (lihat README backend).
2. Set `VITE_DATA_SOURCE=api` di `.env` frontend.
3. Jalankan keduanya (`npm run dev` masing-masing).
4. Login menggunakan akun default.

---

## 🧰 NPM Scripts

```bash
npm run dev          # Development server dengan hot reload
npm run build        # Build production (type-check + bundle)
npm run preview      # Preview hasil build production
```

---

## 📝 Lisensi

Proyek ini dikembangkan untuk keperluan akademis/internal SMK. Seluruh hak cipta milik pengembang.
