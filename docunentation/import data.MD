# Dokumentasi Frontend — Fitur Import Excel & Manajemen Data

**Versi:** 1.0.0  
**Tanggal:** 2026-06-26  
**Base URL:** `http://localhost:4000/api/v1`  
**Ditujukan untuk:** Tim Frontend Developer

---

## Daftar Isi

1. [Autentikasi](#1-autentikasi)
2. [Alur Kerja Fitur Import](#2-alur-kerja-fitur-import)
3. [Endpoint Pendukung (Perlu Dipanggil Sebelum Import)](#3-endpoint-pendukung-perlu-dipanggil-sebelum-import)
4. [Endpoint Download Template Excel](#4-endpoint-download-template-excel)
5. [Endpoint Upload & Import Excel](#5-endpoint-upload--import-excel)
6. [Penanganan Response di Frontend](#6-penanganan-response-di-frontend)
7. [Contoh Implementasi Kode](#7-contoh-implementasi-kode)
8. [Saran UI/UX](#8-saran-uiux)
9. [Ringkasan Semua Endpoint Terkait](#9-ringkasan-semua-endpoint-terkait)

---

## 1. Autentikasi

Semua endpoint di bawah ini membutuhkan token JWT dari hasil login sebagai **admin sekolah**.

### Login

```
POST /login
```

**Request Body:**
```json
{
  "email": "admin@sekolah.com",
  "password": "password123",
  "deviceId": "browser-device-unique-id"
}
```

> `deviceId` bisa di-generate sekali saat pertama kali membuka browser, lalu simpan di `localStorage`. Contoh: `crypto.randomUUID()`.

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "role": "admin sekolah",
  "name": "Nama Admin",
  "email": "admin@sekolah.com",
  "sekolahId": 3
}
```

**Cara pakai token di setiap request:**
```js
headers: {
  "Authorization": `Bearer ${accessToken}`,
  "Content-Type": "application/json"
}
```

---

## 2. Alur Kerja Fitur Import

Berikut urutan langkah yang disarankan untuk diimplementasikan di frontend:

```
┌─────────────────────────────────────────────────────┐
│                  HALAMAN IMPORT                      │
│                                                      │
│  1. Tampilkan tombol "Download Template"             │
│     └─> Panggil GET /import/template/{tipe}          │
│                                                      │
│  2. User isi file Excel lalu upload                  │
│     └─> Panggil POST /import/{tipe}                  │
│         dengan form-data: { file: <file> }           │
│                                                      │
│  3. Tampilkan hasil:                                 │
│     ├─> Berhasil: X data berhasil diimport           │
│     └─> Gagal: tampilkan tabel detail error per baris│
└─────────────────────────────────────────────────────┘
```

**Tiga tipe import yang tersedia:**

| Tipe | Keterangan |
|---|---|
| `siswa` | Import data siswa baru |
| `wali-siswa` | Import data wali siswa (siswa harus sudah ada dulu) |
| `pegawai` | Import data guru / pegawai |

---

## 3. Endpoint Pendukung (Perlu Dipanggil Sebelum Import)

Sebelum user mengisi file Excel, frontend sebaiknya menampilkan **informasi referensi** dari sistem — nama kelas, kategori pegawai, dll. — agar user tahu nilai yang valid untuk diisi di Excel.

### 3.1 Daftar Kelas

> Dibutuhkan untuk: kolom `nama_kelas` di import **siswa**

```
GET /admin-sekolah/kelas
Authorization: Bearer <token>
```

**Response:**
```json
[
  { "id": 1, "nama_kelas": "X IPA 1", "tingkat_id": 1, "jumlah_siswa": 30 },
  { "id": 2, "nama_kelas": "X IPA 2", "tingkat_id": 1, "jumlah_siswa": 28 }
]
```

**Tampilkan di UI:** Daftar nama kelas yang valid untuk diisi di kolom `nama_kelas` pada template Excel.

---

### 3.2 Daftar Kategori Pegawai

> Dibutuhkan untuk: kolom `nama_kategori` di import **pegawai**

```
GET /admin-sekolah/kategori-pegawai
Authorization: Bearer <token>
```

**Response:**
```json
[
  { "id": 1, "nama_kategori": "Guru", "slug": "guru" },
  { "id": 2, "nama_kategori": "Staf", "slug": "staf" }
]
```

---

### 3.3 Daftar Sub-Kategori Pegawai

> Dibutuhkan untuk: kolom `nama_subkategori` di import **pegawai**

```
GET /admin-sekolah/kategori-pegawai/{kategori_id}/subkategori
Authorization: Bearer <token>
```

Contoh: `GET /admin-sekolah/kategori-pegawai/1/subkategori`

**Response:**
```json
[
  { "id": 1, "nama_subkategori": "Guru Mapel", "kategori_pegawai_id": 1 },
  { "id": 2, "nama_subkategori": "Guru BK", "kategori_pegawai_id": 1 }
]
```

---

### 3.4 Daftar Siswa (untuk referensi NIS)

> Dibutuhkan untuk: kolom `nis_siswa` di import **wali siswa**

```
GET /admin-sekolah/siswa?limit=all
Authorization: Bearer <token>
```

**Query params opsional:**
| Param | Contoh | Keterangan |
|---|---|---|
| `q` | `Ahmad` | Cari berdasarkan nama siswa |
| `kelas_id` | `1` | Filter by kelas |
| `limit` | `all` | Ambil semua data |

---

## 4. Endpoint Download Template Excel

Template Excel kosong sudah disiapkan di backend. Ketika di-download, file langsung berisi header kolom berwarna dan satu baris contoh data.

### Download Template Siswa

```
GET /admin-sekolah/import/template/siswa
Authorization: Bearer <token>
```

**Response:** File `template_import_siswa.xlsx` (download otomatis)

**Kolom di template:**

| No | Nama Kolom | Wajib | Nilai yang Diterima |
|---|---|---|---|
| 1 | `nama *` | Ya | Teks, min 3 karakter |
| 2 | `email *` | Ya | Format email valid, harus unik |
| 3 | `password *` | Ya | Min 6 karakter |
| 4 | `nis` | Tidak | Tepat 10 digit angka |
| 5 | `nama_kelas *` | Ya | Harus sama persis dengan nama kelas di sistem |
| 6 | `tempat_lahir` | Tidak | Teks bebas |
| 7 | `tanggal_lahir` | Tidak | Format `YYYY-MM-DD` (contoh: `2008-05-14`) |
| 8 | `jenis_kelamin` | Tidak | `laki-laki` atau `perempuan` |
| 9 | `alamat` | Tidak | Teks bebas |
| 10 | `nomor_telepon_siswa` | Tidak | 10–15 digit angka, tanpa tanda + atau spasi |

---

### Download Template Wali Siswa

```
GET /admin-sekolah/import/template/wali-siswa
Authorization: Bearer <token>
```

**Response:** File `template_import_wali_siswa.xlsx`

**Kolom di template:**

| No | Nama Kolom | Wajib | Nilai yang Diterima |
|---|---|---|---|
| 1 | `nama_wali *` | Ya | Teks, min 3 karakter |
| 2 | `email *` | Ya | Format email valid, harus unik |
| 3 | `password *` | Ya | Min 6 karakter |
| 4 | `nis_siswa *` | Ya | NIS siswa yang sudah terdaftar di sistem |
| 5 | `hubungan *` | Ya | `Ayah` / `Ibu` / `Kakak` / `Paman` / `Bibi` / `wali_lainnya` |
| 6 | `nomor_telepon *` | Ya | 10–15 digit angka |
| 7 | `alamat` | Tidak | Teks bebas |
| 8 | `pekerjaan` | Tidak | Teks bebas |
| 9 | `is_wali_utama *` | Ya | `ya` atau `tidak` |

> **Penting:** Import wali siswa hanya bisa dilakukan **setelah data siswa sudah diimport** karena kolom `nis_siswa` merujuk ke siswa yang sudah ada.

---

### Download Template Pegawai / Guru

```
GET /admin-sekolah/import/template/pegawai
Authorization: Bearer <token>
```

**Response:** File `template_import_pegawai.xlsx`

**Kolom di template:**

| No | Nama Kolom | Wajib | Nilai yang Diterima |
|---|---|---|---|
| 1 | `nama *` | Ya | Teks, min 3 karakter |
| 2 | `email *` | Ya | Format email valid, harus unik |
| 3 | `password *` | Ya | Min 6 karakter |
| 4 | `nip` | Tidak | 10–18 digit angka |
| 5 | `nama_kategori *` | Ya | Harus sama persis dengan nama kategori di sistem |
| 6 | `nama_subkategori` | Tidak | Harus sama persis dengan nama subkategori di sistem |
| 7 | `tempat_lahir` | Tidak | Teks bebas |
| 8 | `tanggal_lahir` | Tidak | Format `YYYY-MM-DD` |
| 9 | `alamat` | Tidak | Teks bebas |
| 10 | `nomor_telepon` | Tidak | 10–15 digit angka |

---

## 5. Endpoint Upload & Import Excel

Semua endpoint import menggunakan `multipart/form-data`. Field file harus bernama **`file`**.

> **Batasan file:** Hanya `.xlsx` / `.xls`, maksimal **5 MB**

---

### Import Siswa

```
POST /admin-sekolah/import/siswa
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form field:**
```
file: <file .xlsx>
```

---

### Import Wali Siswa

```
POST /admin-sekolah/import/wali-siswa
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form field:**
```
file: <file .xlsx>
```

---

### Import Pegawai / Guru

```
POST /admin-sekolah/import/pegawai
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form field:**
```
file: <file .xlsx>
```

---

## 6. Penanganan Response di Frontend

### Response Sukses (HTTP 200)

```json
{
  "msg": "Import selesai: 18 berhasil, 2 gagal",
  "total": 20,
  "berhasil": 18,
  "gagal": 2,
  "detail_gagal": [
    {
      "baris": 3,
      "nama": "Ahmad Fauzi",
      "alasan": ["Email sudah digunakan"]
    },
    {
      "baris": 7,
      "nama": "-",
      "alasan": ["NIS harus 10 digit angka", "Nama kelas wajib diisi"]
    }
  ]
}
```

**Logika tampilan yang disarankan:**

```
jika (berhasil > 0 && gagal === 0)
  → Tampilkan: ✅ Semua X data berhasil diimport

jika (berhasil > 0 && gagal > 0)
  → Tampilkan: ⚠️ X berhasil, Y gagal
  → Tampilkan tabel detail error (nomor baris + nama + alasan)

jika (berhasil === 0 && gagal > 0)
  → Tampilkan: ❌ Tidak ada data yang berhasil diimport
  → Tampilkan tabel detail error
```

### Response Error Sistem

| HTTP Status | Kondisi | Pesan yang ditampilkan ke user |
|---|---|---|
| `400` | File tidak diunggah | "Pilih file Excel terlebih dahulu" |
| `400` | Format file salah | "File harus berformat .xlsx atau .xls" |
| `401` | Token expired | Redirect ke halaman login |
| `403` | Role tidak sesuai | "Akses ditolak" |
| `413` | File terlalu besar | "Ukuran file maksimal 5 MB" |
| `500` | Error server | "Terjadi kesalahan, silakan coba lagi" |

---

## 7. Contoh Implementasi Kode

### Download Template (trigger download file)

```js
const downloadTemplate = async (tipe) => {
  // tipe: 'siswa' | 'wali-siswa' | 'pegawai'
  const response = await fetch(`/api/v1/admin-sekolah/import/template/${tipe}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) throw new Error('Gagal mengunduh template');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `template_import_${tipe}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
```

---

### Upload File Import

```js
const importData = async (tipe, file) => {
  // tipe: 'siswa' | 'wali-siswa' | 'pegawai'
  const formData = new FormData();
  formData.append('file', file); // nama field HARUS 'file'

  const response = await fetch(`/api/v1/admin-sekolah/import/${tipe}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
      // JANGAN set Content-Type manual — biarkan browser set otomatis untuk multipart
    },
    body: formData
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.msg || 'Terjadi kesalahan');
  }

  return result;
  // result: { msg, total, berhasil, gagal, detail_gagal: [...] }
};
```

---

### Contoh dengan Axios

```js
const importData = async (tipe, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axios.post(
    `/api/v1/admin-sekolah/import/${tipe}`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // Axios otomatis set Content-Type: multipart/form-data
      }
    }
  );

  return data;
};
```

---

### Validasi File Sebelum Upload (di sisi frontend)

```js
const validateFile = (file) => {
  const ALLOWED_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File harus berformat .xlsx atau .xls');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('Ukuran file maksimal 5 MB');
  }
};
```

---

## 8. Saran UI/UX

### Struktur Halaman yang Disarankan

```
┌────────────────────────────────────────────────────────┐
│  Import Data — [Tab: Siswa | Wali Siswa | Pegawai]     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Langkah 1: Download Template                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📥 Download Template Excel                      │  │
│  │  Isi template sesuai format, lalu upload di bawah│  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Referensi nilai yang valid:                           │
│  • Nama kelas: X IPA 1, X IPA 2, XI IPS 1 ...         │  ← untuk import siswa
│  • Kategori pegawai: Guru, Staf ...                    │  ← untuk import pegawai
│                                                        │
│  Langkah 2: Upload File                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📁 Seret file ke sini atau klik untuk memilih   │  │
│  │  Format: .xlsx / .xls  |  Maks: 5 MB             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  [  Import Data  ]                                     │
│                                                        │
├────────────────────────────────────────────────────────┤
│  Hasil Import:                                         │
│  ✅ 18 data berhasil  ⚠️ 2 data gagal                  │
│                                                        │
│  Detail Kegagalan:                                     │
│  ┌────────┬──────────────┬──────────────────────────┐  │
│  │ Baris  │ Nama         │ Alasan                   │  │
│  ├────────┼──────────────┼──────────────────────────┤  │
│  │ 3      │ Ahmad Fauzi  │ Email sudah digunakan    │  │
│  │ 7      │ -            │ NIS harus 10 digit angka │  │
│  └────────┴──────────────┴──────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Catatan Penting untuk Implementasi

1. **Jangan set `Content-Type` manual** saat upload file — biarkan browser/axios set otomatis agar `boundary` multipart terbentuk dengan benar.

2. **Loading state wajib** — proses import bisa memakan waktu beberapa detik tergantung jumlah baris. Tampilkan spinner/progress saat request berlangsung.

3. **Nomor baris di `detail_gagal`** sesuai dengan nomor baris di file Excel (baris 1 = header, baris 2 = data pertama). Tampilkan info ini ke user agar mudah diperbaiki.

4. **Urutan import yang benar:**
   - Import **siswa** terlebih dahulu
   - Baru kemudian import **wali siswa** (karena butuh NIS siswa yang sudah ada)

5. **Tampilkan referensi nilai valid** di UI sebelum user mengisi Excel:
   - Untuk import siswa: tampilkan daftar nama kelas yang tersedia
   - Untuk import pegawai: tampilkan daftar nama kategori dan subkategori

6. **Akun wali siswa** dibuat dengan status **belum aktif** — sistem otomatis kirim link aktivasi via WhatsApp. Tampilkan info ini ke admin setelah import berhasil.

---

## 9. Ringkasan Semua Endpoint Terkait

### Base URL: `http://localhost:4000/api/v1`

Semua endpoint di bawah membutuhkan:
```
Authorization: Bearer <accessToken>
```

#### Autentikasi

| Method | Endpoint | Keterangan |
|---|---|---|
| `POST` | `/login` | Login, dapatkan `accessToken` |
| `DELETE` | `/logout` | Logout, hapus token dari Redis |

#### Import Excel (Fitur Baru)

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/admin-sekolah/import/template/siswa` | Download template Excel siswa |
| `GET` | `/admin-sekolah/import/template/wali-siswa` | Download template Excel wali siswa |
| `GET` | `/admin-sekolah/import/template/pegawai` | Download template Excel pegawai |
| `POST` | `/admin-sekolah/import/siswa` | Upload & import data siswa |
| `POST` | `/admin-sekolah/import/wali-siswa` | Upload & import data wali siswa |
| `POST` | `/admin-sekolah/import/pegawai` | Upload & import data pegawai |

#### Referensi Data (untuk info di halaman import)

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/admin-sekolah/kelas` | Daftar kelas (untuk referensi `nama_kelas`) |
| `GET` | `/admin-sekolah/kategori-pegawai` | Daftar kategori pegawai (untuk referensi `nama_kategori`) |
| `GET` | `/admin-sekolah/kategori-pegawai/{id}/subkategori` | Daftar subkategori by kategori |

#### Manajemen Data (CRUD Manual, sudah ada sebelumnya)

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/admin-sekolah/siswa` | Daftar semua siswa |
| `GET` | `/admin-sekolah/siswa/:id` | Detail siswa |
| `POST` | `/admin-sekolah/siswa` | Tambah siswa satu per satu |
| `PUT` | `/admin-sekolah/siswa/:id` | Update data siswa |
| `DELETE` | `/admin-sekolah/siswa/:id` | Hapus siswa |
| `GET` | `/admin-sekolah/wali-siswa` | Daftar semua wali siswa |
| `GET` | `/admin-sekolah/wali-siswa/:id` | Detail wali siswa |
| `POST` | `/admin-sekolah/wali-siswa` | Tambah wali siswa satu per satu |
| `PUT` | `/admin-sekolah/wali-siswa/:id` | Update data wali siswa |
| `DELETE` | `/admin-sekolah/wali-siswa/:id` | Hapus wali siswa |
| `GET` | `/admin-sekolah/guru` | Daftar semua guru |
| `POST` | `/admin-sekolah/pegawai` | Tambah pegawai/guru satu per satu |
| `PUT` | `/admin-sekolah/pegawai/:id` | Update data pegawai |
| `DELETE` | `/admin-sekolah/guru/:id` | Hapus data guru |
