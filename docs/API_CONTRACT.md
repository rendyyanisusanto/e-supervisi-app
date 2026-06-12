# Kontrak API E-Supervisi SMK

Dokumen ini mendefinisikan standar respons dan format endpoint API yang digunakan dalam aplikasi E-Supervisi SMK. Semua respons dari backend harus mengikuti format standar ini untuk memastikan konsistensi dengan frontend.

## Base URL
\`\`\`
/api/v1
\`\`\`

## Standar Respons (Response Standard)

Frontend mengharapkan semua API merespons dengan struktur JSON standar:

### 1. Respons Standar (Single Data / Success)
\`\`\`json
{
  "success": true,
  "message": "Pesan sukses (opsional)",
  "data": { ... } // Objek data yang dikembalikan
}
\`\`\`

### 2. Respons List (Multiple Data / Array dengan Pagination)
\`\`\`json
{
  "success": true,
  "message": "Pesan sukses (opsional)",
  "data": [ ... ], // Array data
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
\`\`\`

### 3. Respons Error (Gagal)
\`\`\`json
{
  "success": false,
  "message": "Pesan error utama",
  "errors": { // Opsional, biasanya untuk validasi input (422 Unprocessable Entity)
    "field_name": ["Pesan error spesifik field 1", "Pesan error spesifik field 2"]
  }
}
\`\`\`

## Endpoint List

### Authentication
- \`POST /auth/login\`
  - Body: \`{ username, password }\`
  - Response: \`{ token, user: { id, name, role, ... } }\`
- \`GET /auth/me\`
  - Headers: \`Authorization: Bearer <token>\`
  - Response: \`{ user: { ... } }\`

### Master Data

#### Periode
- \`GET /periods\` (Query: \`search\`, \`page\`, \`limit\`)
- \`GET /periods/:id\`
- \`POST /periods\`
- \`PUT /periods/:id\`
- \`DELETE /periods/:id\`
- \`PATCH /periods/:id/activate\`

#### Mata Pelajaran
- \`GET /subjects\` (Query: \`search\`, \`page\`, \`limit\`)
- \`GET /subjects/:id\`
- \`POST /subjects\`
- \`PUT /subjects/:id\`
- \`DELETE /subjects/:id\`

#### Kelas
- \`GET /classrooms\` (Query: \`search\`, \`page\`, \`limit\`)
- \`GET /classrooms/:id\`
- \`POST /classrooms\`
- \`PUT /classrooms/:id\`
- \`DELETE /classrooms/:id\`

#### Guru
- \`GET /teachers\` (Query: \`search\`, \`page\`, \`limit\`)
- \`GET /teachers/:id\`
- \`POST /teachers\`
- \`PUT /teachers/:id\`
- \`DELETE /teachers/:id\`
- \`POST /teachers/:id/photo\` (Multipart/form-data)

#### Instrumen Supervisi
- \`GET /instruments\`
- \`GET /instruments/:id\`
- \`POST /instruments\`
- \`PUT /instruments/:id\`
- \`DELETE /instruments/:id\`
- Item Instrumen (Sub-resource)
  - \`POST /instruments/:id/items\`
  - \`PUT /instruments/:id/items/:itemId\`
  - \`DELETE /instruments/:id/items/:itemId\`

#### Rentang Nilai
- \`GET /score-ranges\`
- \`POST /score-ranges\`
- \`PUT /score-ranges/:id\`
- \`DELETE /score-ranges/:id\`

### Transaksi Supervisi

#### Jadwal & Pelaksanaan Supervisi
- \`GET /supervisions\` (Query: \`search\`, \`periodId\`, \`teacherId\`, \`status\`, dll)
- \`GET /supervisions/:id\`
- \`POST /supervisions\` (Buat jadwal)
- \`PUT /supervisions/:id\` (Update jadwal)
- \`POST /supervisions/:id/evaluate\` (Simpan nilai supervisi)
- \`DELETE /supervisions/:id\`

#### Refleksi Guru
- \`GET /reflections\`
- \`GET /reflections/:id\`
- \`GET /supervisions/:id/reflection\` (Dapatkan refleksi berdasarkan supervisi)
- \`POST /reflections\`
- \`PUT /reflections/:id\`
- \`PATCH /reflections/:id/read\` (Tandai sudah dibaca oleh kepala sekolah)

### Laporan & Dashboard

#### Dashboard
- \`GET /dashboard/summary\` (Query: \`periodId\`)

#### Rapor & Rekap
- \`GET /reports/teacher/:teacherId\` (Query: \`periodId\`)
- \`GET /reports/weakness-map\` (Query: \`periodId\`)
- \`GET /reports/supervision-recap\` (Query: \`periodId\`)

### Pengaturan

#### Profil Sekolah
- \`GET /settings/school-profile\`
- \`PUT /settings/school-profile\`
- \`POST /settings/school-profile/logo\` (Multipart/form-data)

#### Format Laporan (Kop & TTD)
- \`GET /settings/report-setting\`
- \`PUT /settings/report-setting\`
- \`POST /settings/report-setting/reset\`

#### Manajemen Pengguna
- \`GET /settings/users\`
- \`PUT /settings/users/:id/roles\`
- \`PATCH /settings/users/:id/toggle-status\`
- \`POST /settings/users/:id/reset-password\`

#### Notifikasi
- \`GET /settings/notifications\`
- \`PATCH /settings/notifications/:id/read\`
- \`POST /settings/notifications/read-all\`

#### Template WhatsApp
- \`GET /settings/wa-templates\`
- \`GET /settings/wa-templates/:id\`
- \`POST /settings/wa-templates\`
- \`PUT /settings/wa-templates/:id\`
- \`PATCH /settings/wa-templates/:id/toggle-status\`
- \`POST /settings/wa-templates/reset\`
- \`POST /settings/wa-templates/:id/test\`
- \`GET /settings/wa-logs\`
- \`POST /settings/wa-logs/:id/retry\`

## Error Handling

Aplikasi frontend (menggunakan \`httpClient\`) telah dikonfigurasi untuk secara otomatis meng-intercept error dari backend. 
- **401 Unauthorized**: Akan memicu pembersihan token dan redirect ke halaman login.
- **422 Unprocessable Entity**: Akan membaca format \`errors\` di atas dan menampilkan validasi per-field jika komponen menggunakan \`validationHelper\`.
- **Lainnya (400, 500, dll)**: Akan menampilkan toast notification dengan pesan yang dikembalikan pada property \`message\`.
