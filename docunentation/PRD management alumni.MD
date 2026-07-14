# PRD — Backend API: Manajemen Alumni

**Versi:** 1.0  
**Tanggal:** 2026-06-26  
**Modul:** Admin Sekolah — Manajemen Kelulusan & Alumni  
**Base URL:** `/api/v1/admin-sekolah`

---

## 1. Latar Belakang

Sekolah yang menggunakan Abseninaja perlu mengelola siklus hidup siswa secara penuh — dari pendaftaran, kehadiran aktif, hingga kelulusan. Saat ini belum ada mekanisme untuk menandai kelas sebagai lulus, memindahkan siswa ke arsip alumni, dan menyediakan dokumen kelulusan yang bisa digunakan siswa di sekolah berikutnya.

Fitur ini membangun dua kapabilitas utama:

1. **Tandai Lulus**: Admin menandai satu kelas sebagai lulus → seluruh siswa di kelas itu dinonaktifkan dan dipindahkan ke status alumni.
2. **Manajemen Alumni**: Daftar alumni yang dapat dicari, difilter, dan diekspor per siswa (beserta data wali siswa).

---

## 2. Ruang Lingkup

| Endpoint | Method | Deskripsi |
|---|---|---|
| `/kelas/:id/kelulusan` | POST | Tandai seluruh siswa di kelas sebagai lulus |
| `/alumni` | GET | Daftar alumni dengan pagination, search, filter |
| `/alumni/:id/export` | GET | Export PDF data alumni + wali siswa |

---

## 3. Model Data

### 3.1 Perubahan pada tabel `Siswa`

Tambahkan kolom berikut (atau gunakan kolom yang sudah ada):

| Kolom | Tipe | Default | Keterangan |
|---|---|---|---|
| `status` | ENUM(`aktif`, `alumni`, `nonaktif`) | `aktif` | Status siswa saat ini |
| `tahun_lulus` | INTEGER (nullable) | NULL | Tahun akademik saat ditandai lulus |
| `kelas_terakhir_id` | UUID (FK → Kelas) (nullable) | NULL | Snapshot kelas saat kelulusan; diisi saat proses kelulusan |

> **Catatan penting:** Saat siswa ditandai lulus, relasi `kelas_id` pada tabel `Siswa` harus di-NULL-kan agar siswa tidak muncul di daftar kelas aktif, tetapi `kelas_terakhir_id` harus disimpan sebagai arsip nama kelas terakhir.

### 3.2 Perubahan pada tabel `User` (akun siswa)

| Kolom | Tipe | Perubahan |
|---|---|---|
| `is_active` | BOOLEAN | Set ke `false` saat siswa ditandai lulus |

### 3.3 Response shape yang diharapkan frontend

#### Alumni object (dalam array `data`):
```json
{
  "id": "uuid-siswa",
  "nis": "2024001",
  "tahun_lulus": 2026,
  "User": {
    "name": "Budi Santoso"
  },
  "Kelas": {
    "nama_kelas": "XII IPA 1"
  },
  "WaliSiswa": [
    {
      "User": {
        "name": "Siti Rahayu"
      },
      "hubungan": "Ibu",
      "nomor_telepon": "08123456789"
    }
  ]
}
```

> `Kelas` di sini harus mengambil dari `kelas_terakhir_id` (bukan `kelas_id` yang sudah NULL).

---

## 4. Endpoint Detail

---

### 4.1 POST `/api/v1/admin-sekolah/kelas/:id/kelulusan`

**Deskripsi:** Menandai seluruh siswa dalam satu kelas sebagai lulus. Operasi ini bersifat **permanen dan tidak dapat dibatalkan**.

**Auth:** Bearer Token — hanya role `admin_sekolah`

**Path Params:**

| Param | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | ID kelas yang akan ditandai lulus |

**Request Body:** _(tidak ada)_

**Proses / Business Logic:**

1. Validasi kelas ada di database dan milik sekolah yang sama dengan token admin.
2. Ambil seluruh siswa dengan `kelas_id = :id` dan `status = 'aktif'`.
3. Validasi: jika kelas tidak memiliki siswa aktif, kembalikan error yang informatif.
4. Untuk setiap siswa secara batch (gunakan transaction):
   - Set `siswa.status = 'alumni'`
   - Set `siswa.tahun_lulus = <tahun sekarang>` (ambil dari `new Date().getFullYear()` atau dari tahun ajaran aktif jika ada)
   - Set `siswa.kelas_terakhir_id = siswa.kelas_id` (snapshot sebelum di-null-kan)
   - Set `siswa.kelas_id = NULL` (lepas dari kelas)
   - Set `user.is_active = false` untuk akun siswa yang bersangkutan
5. Semua operasi di atas harus dalam satu **database transaction** — jika ada yang gagal, seluruh operasi di-rollback.
6. Kembalikan summary hasil proses.

**Response sukses (200):**
```json
{
  "status": "success",
  "msg": "Kelas XII IPA 1 berhasil ditandai lulus. 30 siswa dipindahkan ke data alumni.",
  "data": {
    "nama_kelas": "XII IPA 1",
    "jumlah_siswa_lulus": 30,
    "tahun_lulus": 2026
  }
}
```

**Response error:**

| HTTP | Kondisi | `msg` |
|---|---|---|
| 404 | Kelas tidak ditemukan | "Kelas tidak ditemukan" |
| 403 | Kelas bukan milik sekolah admin ini | "Akses ditolak" |
| 400 | Tidak ada siswa aktif di kelas | "Kelas ini tidak memiliki siswa aktif untuk diluluskan" |
| 500 | Transaksi gagal | "Terjadi kesalahan saat memproses kelulusan. Silakan coba lagi." |

---

### 4.2 GET `/api/v1/admin-sekolah/alumni`

**Deskripsi:** Mengembalikan daftar alumni milik sekolah (siswa dengan `status = 'alumni'`), beserta data wali siswa mereka. Mendukung pagination server-side, pencarian nama, filter tahun lulus, dan pengurutan.

**Auth:** Bearer Token — role `admin_sekolah`

**Query Parameters:**

| Param | Tipe | Default | Keterangan |
|---|---|---|---|
| `page` | integer | `1` | Nomor halaman (1-based) |
| `limit` | integer | `10` | Jumlah item per halaman. Jika `all`, kembalikan semua tanpa pagination |
| `q` | string | `""` | Pencarian berdasarkan nama alumni (case-insensitive, partial match) |
| `tahun_lulus` | integer | `""` | Filter berdasarkan tahun lulus. Kosong = semua tahun |
| `sort_order` | `asc` \| `desc` | `desc` | Urutan berdasarkan `tahun_lulus`. `desc` = terbaru duluan |

**Includes yang wajib di-eager-load:**

- `User` (akun siswa) → ambil field: `name`
- `KelasTermakhir` (alias untuk relasi ke `Kelas` via `kelas_terakhir_id`) → ambil field: `nama_kelas`
- `WaliSiswa` → include nested `User` (field: `name`), dan field: `hubungan`, `nomor_telepon`

**Response sukses (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-siswa",
      "nis": "2024001",
      "tahun_lulus": 2026,
      "User": {
        "name": "Budi Santoso"
      },
      "Kelas": {
        "nama_kelas": "XII IPA 1"
      },
      "WaliSiswa": [
        {
          "User": {
            "name": "Siti Rahayu"
          },
          "hubungan": "Ibu",
          "nomor_telepon": "08123456789"
        }
      ]
    }
  ],
  "meta": {
    "total": 120,
    "page": 1,
    "limit": 10,
    "totalPages": 12
  }
}
```

> **Catatan nama field Kelas:** Frontend membaca `alumni.Kelas.nama_kelas`. Walaupun relasinya menggunakan foreign key `kelas_terakhir_id`, alias response harus tetap `Kelas` agar tidak perlu mengubah frontend.

**Response error:**

| HTTP | Kondisi | `msg` |
|---|---|---|
| 400 | `page` atau `limit` bukan angka valid | "Parameter pagination tidak valid" |
| 500 | Query gagal | "Terjadi kesalahan saat memuat data alumni" |

---

### 4.3 GET `/api/v1/admin-sekolah/alumni/:id/export`

**Deskripsi:** Menghasilkan dokumen PDF berisi data lengkap satu alumni beserta seluruh data wali siswa, yang dapat diunduh dan digunakan oleh siswa di sekolah baru yang menggunakan sistem Abseninaja.

**Auth:** Bearer Token — role `admin_sekolah`

**Path Params:**

| Param | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | ID siswa alumni yang akan diekspor |

**Content yang harus ada dalam PDF:**

1. **Header dokumen:**
   - Nama sekolah
   - Logo sekolah (jika ada)
   - Judul: "Dokumen Data Alumni"

2. **Data Siswa:**
   - Nama lengkap
   - NIS
   - Kelas terakhir
   - Tahun lulus

3. **Data Wali Siswa** (tampilkan semua wali):
   - Nama wali
   - Hubungan (Ayah / Ibu / Wali)
   - Nomor telepon
   - Apakah wali utama

4. **Footer:**
   - Tempat, tanggal cetak
   - Tanda tangan / stempel (placeholder atau nama admin yang mengunduh)
   - QR code opsional yang mengarah ke verifikasi data (jika ada fitur verifikasi)

**Response sukses:**
- HTTP 200
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="data_alumni_<nama_siswa>.pdf"`
- Body: raw PDF binary (blob)

**Response error:**

| HTTP | Kondisi | `msg` |
|---|---|---|
| 404 | Alumni tidak ditemukan | "Data alumni tidak ditemukan" |
| 403 | Alumni bukan milik sekolah admin | "Akses ditolak" |
| 400 | `id` bukan UUID valid | "ID tidak valid" |
| 500 | Gagal generate PDF | "Gagal menghasilkan dokumen PDF. Silakan coba lagi." |

---

## 5. Relasi Database

```
Siswa
  ├── kelas_id (FK → Kelas.id)           — NULL saat sudah alumni
  ├── kelas_terakhir_id (FK → Kelas.id)  — diisi saat proses kelulusan
  ├── user_id (FK → User.id)             — akun siswa
  ├── status (ENUM)                       — 'aktif' | 'alumni' | 'nonaktif'
  └── tahun_lulus (INTEGER)               — diisi saat proses kelulusan

WaliSiswa
  ├── siswa_id (FK → Siswa.id)
  ├── user_id (FK → User.id)             — akun wali
  ├── hubungan (STRING)                   — 'Ayah' | 'Ibu' | 'Wali'
  ├── nomor_telepon (STRING)
  └── is_wali_utama (BOOLEAN)
```

---

## 6. Aturan Bisnis

| # | Aturan |
|---|---|
| B-01 | Proses kelulusan hanya dapat dilakukan satu kali per kelas. Setelah kelas tidak memiliki siswa aktif (semua sudah alumni), endpoint harus menolak request dengan error 400. |
| B-02 | Data alumni bersifat read-only dari sisi siswa. Admin tidak dapat mengembalikan status alumni ke aktif melalui endpoint ini. |
| B-03 | Setelah kelulusan, siswa tidak muncul di `GET /siswa` (daftar siswa aktif) dan tidak muncul di `GET /kelas/:id/siswa`. |
| B-04 | Akun User (`is_active = false`) dari alumni tidak bisa login ke aplikasi siswa. |
| B-05 | Data wali siswa tetap terhubung ke alumni dan ikut tampil di endpoint `/alumni`. Wali tidak dinonaktifkan secara otomatis. |
| B-06 | Tahun lulus default adalah tahun kalender saat endpoint kelulusan dipanggil. Jika sistem memiliki entitas Tahun Ajaran aktif, prioritaskan tahun ajaran tersebut. |
| B-07 | Seluruh proses kelulusan harus dijalankan dalam satu database transaction. Partial success tidak diperbolehkan. |
| B-08 | Endpoint `/alumni` hanya mengembalikan data siswa milik sekolah yang sama dengan token admin yang mengirim request (multi-tenancy). |
| B-09 | **Proses kelulusan TIDAK menghapus atau menonaktifkan data Kelas.** Record kelas tetap ada dan dapat langsung digunakan kembali untuk siswa naik kelas atau tahun ajaran berikutnya. Yang dihapus hanya relasi `siswa.kelas_id` (di-NULL-kan), bukan kelasnya sendiri. Artinya setelah kelulusan, kelas menjadi kosong (jumlah_siswa = 0) dan siap diisi siswa baru. |

---

## 7. Keamanan & Validasi

- Semua endpoint wajib validasi Bearer Token dan memastikan token milik `admin_sekolah`.
- Validasi bahwa resource yang diakses (kelas, siswa) milik `sekolah_id` yang sama dengan admin.
- `id` pada path params harus divalidasi sebagai UUID v4 sebelum query ke database.
- Rate limiting disarankan untuk endpoint `/export` karena generate PDF bersifat berat.

---

## 8. Testing Checklist

- [ ] POST kelulusan dengan kelas valid → semua siswa berstatus alumni, kelas_id NULL, user nonaktif
- [ ] POST kelulusan dengan kelas yang sudah kosong → 400
- [ ] POST kelulusan dengan kelas milik sekolah lain → 403
- [ ] GET alumni dengan pagination → meta.total akurat
- [ ] GET alumni dengan `q=budi` → hanya alumni dengan nama mengandung "budi"
- [ ] GET alumni dengan `tahun_lulus=2025` → hanya alumni tahun 2025
- [ ] GET alumni → field `Kelas.nama_kelas` muncul meskipun `kelas_id` sudah NULL
- [ ] GET alumni → `WaliSiswa` muncul lengkap beserta nested `User.name`
- [ ] GET export PDF → response blob dengan Content-Disposition yang benar
- [ ] GET export alumni sekolah lain → 403
- [ ] Rollback transaction: simulasikan error di tengah batch kelulusan → tidak ada siswa yang berubah status
- [ ] POST kelulusan → record Kelas tetap ada di database dan dapat di-GET, tidak terhapus atau dinonaktifkan
- [ ] POST kelulusan → kelas menjadi kosong (`jumlah_siswa = 0`) dan bisa diisi siswa baru (naik kelas / tahun ajaran baru)
