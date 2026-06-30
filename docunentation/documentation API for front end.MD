# Dokumentasi API — Manajemen Alumni
**Untuk:** Tim Frontend  
**Versi API:** v1  
**Base URL:** `http://<domain>/api/v1/admin-sekolah`  
**Tanggal:** 2026-06-27  
**Status:** Production-ready

---

## Daftar Isi

1. [Autentikasi](#1-autentikasi)
2. [Ringkasan Endpoint](#2-ringkasan-endpoint)
3. [POST /kelas/:id/kelulusan — Proses Kelulusan Kelas](#3-post-kelasidkelulusan)
4. [GET /alumni — Daftar Alumni](#4-get-alumni)
5. [GET /alumni/:id/export — Export PDF Alumni](#5-get-alumniidexport)
6. [Struktur Data Alumni](#6-struktur-data-alumni)
7. [Contoh Implementasi (Axios)](#7-contoh-implementasi-axios)
8. [Penanganan Error](#8-penanganan-error)
9. [Alur UI yang Disarankan](#9-alur-ui-yang-disarankan)
10. [Aturan Bisnis Penting](#10-aturan-bisnis-penting)

---

## 1. Autentikasi

Seluruh endpoint dalam modul ini memerlukan autentikasi JWT dengan role **`admin sekolah`**.

### Headers Wajib

```
Authorization: Bearer <access_token>
x-sekolah-id: <sekolah_id>
Content-Type: application/json
```

> **Catatan:** Header `x-sekolah-id` digunakan untuk validasi multi-tenancy. Pastikan nilai `sekolah_id` sesuai dengan sekolah yang dikelola admin yang sedang login. Gunakan nilai `sekolah_id` dari response login atau profil admin.

---

## 2. Ringkasan Endpoint

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/kelas/:id/kelulusan` | Menandai seluruh siswa di satu kelas sebagai alumni (lulus) |
| `GET` | `/alumni` | Mengambil daftar alumni dengan pagination, search, dan filter |
| `GET` | `/alumni/:id/export` | Mengunduh dokumen PDF data lengkap satu alumni |

---

## 3. POST /kelas/:id/kelulusan

**Deskripsi:** Menandai seluruh siswa aktif dalam satu kelas sebagai alumni (lulus). Operasi ini bersifat **permanen dan tidak dapat dibatalkan**. Setelah proses ini:
- Status seluruh siswa di kelas berubah dari `aktif` → `alumni`
- Akun siswa (User) dinonaktifkan (`is_activated = false`)
- Relasi siswa ke kelas (`kelas_id`) dihapus (menjadi `NULL`)
- Kelas tetap ada dan dapat langsung digunakan kembali untuk siswa baru

### Request

```
POST /api/v1/admin-sekolah/kelas/:id/kelulusan
```

#### Path Parameter

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `id` | integer | Ya | ID kelas yang akan ditandai lulus |

#### Request Body

Tidak ada request body. Endpoint ini hanya membutuhkan `id` kelas pada path parameter.

#### Contoh Request

```http
POST /api/v1/admin-sekolah/kelas/5/kelulusan
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-sekolah-id: 11
Content-Type: application/json
```

### Response

#### Sukses — 200 OK

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

#### Field Response

| Field | Tipe | Keterangan |
|-------|------|------------|
| `status` | string | `"success"` jika berhasil |
| `msg` | string | Pesan konfirmasi yang dapat ditampilkan ke user |
| `data.nama_kelas` | string | Nama kelas yang telah diluluskan |
| `data.jumlah_siswa_lulus` | integer | Jumlah siswa yang berhasil diluluskan |
| `data.tahun_lulus` | integer | Tahun kelulusan (tahun kalender saat request dikirim) |

#### Error Response

| HTTP Status | Kondisi | `msg` |
|-------------|---------|-------|
| `400` | Kelas tidak memiliki siswa aktif (sudah pernah diluluskan) | `"Kelas ini tidak memiliki siswa aktif untuk diluluskan"` |
| `400` | ID kelas bukan angka valid | `"ID kelas tidak valid"` |
| `404` | Kelas tidak ditemukan atau bukan milik sekolah ini | `"Kelas tidak ditemukan"` |
| `401` | Token tidak valid atau expired | `"Unauthorized"` |
| `403` | Role tidak sesuai | `"Forbidden"` |
| `500` | Kegagalan transaksi database | `"Terjadi kesalahan saat memproses kelulusan. Silakan coba lagi."` |

---

## 4. GET /alumni

**Deskripsi:** Mengambil daftar alumni milik sekolah. Mendukung server-side pagination, pencarian nama, filter tahun lulus, dan pengurutan.

### Request

```
GET /api/v1/admin-sekolah/alumni
```

#### Query Parameters

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `page` | integer | `1` | Nomor halaman (dimulai dari 1) |
| `limit` | integer \| `"all"` | `10` | Jumlah item per halaman. Gunakan `all` untuk mengambil semua data tanpa paginasi |
| `q` | string | `""` | Pencarian nama alumni (case-insensitive, partial match). Kosongkan untuk semua |
| `tahun_lulus` | integer | `""` | Filter berdasarkan tahun lulus. Kosongkan untuk semua tahun |
| `sort_order` | `asc` \| `desc` | `desc` | Urutan berdasarkan tahun lulus. `desc` = tahun terbaru duluan |

#### Contoh Request

```http
# Halaman pertama, 10 data per halaman
GET /api/v1/admin-sekolah/alumni?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-sekolah-id: 11

# Cari alumni bernama "Budi"
GET /api/v1/admin-sekolah/alumni?q=Budi&page=1&limit=10

# Filter alumni tahun 2025, urutkan terlama dulu
GET /api/v1/admin-sekolah/alumni?tahun_lulus=2025&sort_order=asc&page=1&limit=20

# Ambil semua alumni tanpa paginasi (untuk kebutuhan ekspor list)
GET /api/v1/admin-sekolah/alumni?limit=all
```

### Response

#### Sukses — 200 OK

```json
{
  "status": "success",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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
          "hubungan": "Ibu",
          "nomor_telepon": "08123456789",
          "is_wali_utama": true,
          "User": {
            "name": "Siti Rahayu"
          }
        },
        {
          "hubungan": "Ayah",
          "nomor_telepon": "08198765432",
          "is_wali_utama": false,
          "User": {
            "name": "Bapak Rahayu"
          }
        }
      ]
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "nis": "2024002",
      "tahun_lulus": 2026,
      "User": {
        "name": "Dewi Lestari"
      },
      "Kelas": {
        "nama_kelas": "XII IPS 2"
      },
      "WaliSiswa": []
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

#### Struktur Field `data[]`

| Field | Tipe | Bisa Null | Keterangan |
|-------|------|-----------|------------|
| `id` | string (UUID) | Tidak | ID unik alumni (UUID v4) — gunakan ini untuk endpoint export |
| `nis` | string | Tidak | Nomor Induk Siswa |
| `tahun_lulus` | integer | Tidak | Tahun kelulusan |
| `User.name` | string | Tidak | Nama lengkap alumni |
| `Kelas.nama_kelas` | string | Ya (`null` jika data kelas terhapus) | Nama kelas terakhir saat lulus |
| `WaliSiswa[]` | array | Tidak (bisa kosong `[]`) | Daftar wali siswa. Bisa lebih dari satu |
| `WaliSiswa[].hubungan` | string | Ya | Hubungan wali dengan siswa, contoh: `"Ibu"`, `"Ayah"`, `"Wali"` |
| `WaliSiswa[].nomor_telepon` | string | Ya | Nomor HP wali |
| `WaliSiswa[].is_wali_utama` | boolean | Tidak | `true` jika ini adalah wali utama |
| `WaliSiswa[].User.name` | string | Ya | Nama akun wali siswa |

#### Struktur Field `meta`

| Field | Tipe | Keterangan |
|-------|------|------------|
| `total` | integer | Total seluruh alumni yang sesuai filter |
| `page` | integer | Halaman saat ini |
| `limit` | integer \| `"all"` | Jumlah item per halaman |
| `totalPages` | integer | Total jumlah halaman |

> **Tip pagination:** Saat `limit=all`, nilai `meta.page` = `1`, `meta.totalPages` = `1`, dan `meta.limit` = `"all"`.

#### Error Response

| HTTP Status | Kondisi | `msg` |
|-------------|---------|-------|
| `400` | Parameter pagination tidak valid | `"Parameter pagination tidak valid"` |
| `401` | Token tidak valid atau expired | `"Unauthorized"` |
| `403` | Role tidak sesuai | `"Forbidden"` |
| `500` | Query database gagal | `"Terjadi kesalahan saat memuat data alumni"` |

---

## 5. GET /alumni/:id/export

**Deskripsi:** Menghasilkan dan mengunduh dokumen PDF berisi data lengkap satu alumni beserta seluruh data wali siswa. Dokumen ini dapat digunakan siswa sebagai bukti kelulusan atau arsip di sekolah baru.

### Request

```
GET /api/v1/admin-sekolah/alumni/:id/export
```

#### Path Parameter

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `id` | string (UUID v4) | Ya | ID alumni yang akan diekspor. Ambil dari field `id` pada response GET /alumni |

#### Contoh Request

```http
GET /api/v1/admin-sekolah/alumni/a1b2c3d4-e5f6-7890-abcd-ef1234567890/export
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-sekolah-id: 11
```

### Response

#### Sukses — 200 OK

Response bukan JSON melainkan file biner PDF.

```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="data_alumni_Budi_Santoso.pdf"
```

Body berisi raw PDF binary (blob).

**Isi dokumen PDF:**
- Nama sekolah (header)
- Judul: "Dokumen Data Alumni"
- Garis pemisah
- **Data Siswa:** Nama Lengkap, NIS, Kelas Terakhir, Tahun Lulus
- Garis pemisah
- **Data Wali Siswa:** Nama wali, Hubungan, Nomor Telepon (untuk setiap wali)
- **Footer:** Tanggal cetak, tempat tanda tangan Kepala Sekolah

#### Cara Menangani Response PDF di Frontend

**Menggunakan Axios:**
```javascript
// Wajib set responseType: 'blob'
const response = await axios.get(
  `/api/v1/admin-sekolah/alumni/${alumniId}/export`,
  {
    headers: { Authorization: `Bearer ${token}`, 'x-sekolah-id': sekolahId },
    responseType: 'blob',
  }
);

// Buat URL object untuk download
const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', `data_alumni.pdf`);
document.body.appendChild(link);
link.click();
link.remove();
window.URL.revokeObjectURL(url);
```

**Membuka PDF di tab baru:**
```javascript
// Untuk preview di browser
const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
window.open(url, '_blank');
```

#### Error Response

| HTTP Status | Kondisi | `msg` |
|-------------|---------|-------|
| `400` | `id` bukan UUID v4 yang valid | `"ID tidak valid"` |
| `404` | Alumni tidak ditemukan atau bukan milik sekolah ini | `"Data alumni tidak ditemukan"` |
| `401` | Token tidak valid atau expired | `"Unauthorized"` |
| `403` | Role tidak sesuai | `"Forbidden"` |
| `500` | Gagal generate PDF | `"Gagal menghasilkan dokumen PDF. Silakan coba lagi."` |

> **Perhatian:** Untuk error response (4xx/5xx), server mengembalikan JSON biasa, **bukan PDF**. Pastikan frontend menangani kasus ini — lihat contoh implementasi pada [Bagian 7](#7-contoh-implementasi-axios).

---

## 6. Struktur Data Alumni

### Gambaran Lengkap Objek Alumni

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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
      "hubungan": "Ibu",
      "nomor_telepon": "08123456789",
      "is_wali_utama": true,
      "User": {
        "name": "Siti Rahayu"
      }
    }
  ]
}
```

### Catatan Penting untuk Frontend

- **`id`** adalah UUID v4 (bukan integer). Gunakan field ini sebagai parameter untuk endpoint export.
- **`Kelas`** diambil dari `kelas_terakhir_id` (snapshot kelas saat kelulusan), bukan `kelas_id` (yang sudah `null`). Frontend cukup akses `alumni.Kelas?.nama_kelas`.
- **`WaliSiswa`** adalah array. Siswa bisa tidak memiliki wali (`[]`), satu wali, atau lebih dari satu. Selalu render dengan `Array.isArray()` dan map.
- **`User.name`** adalah nama alumni, bukan field `nama` langsung di objek root.

### Cara Mengakses Field

```javascript
// Nama alumni
const namaAlumni = alumni.User?.name ?? '-';

// Kelas terakhir
const kelasTermakhir = alumni.Kelas?.nama_kelas ?? '-';

// Wali utama
const waliUtama = alumni.WaliSiswa?.find(w => w.is_wali_utama);
const namaWaliUtama = waliUtama?.User?.name ?? '-';

// Semua nomor telepon wali
const telpWali = alumni.WaliSiswa?.map(w => w.nomor_telepon).join(', ') ?? '-';
```

---

## 7. Contoh Implementasi (Axios)

### Setup Instance Axios

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + '/api/v1/admin-sekolah',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const sekolahId = localStorage.getItem('sekolah_id');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (sekolahId) config.headers['x-sekolah-id'] = sekolahId;
  return config;
});

export default api;
```

---

### 7.1 Proses Kelulusan Kelas

```javascript
// services/alumniService.js

/**
 * Menandai seluruh siswa di kelas sebagai alumni.
 * @param {number} kelasId - ID kelas
 * @returns {Promise<{ nama_kelas: string, jumlah_siswa_lulus: number, tahun_lulus: number }>}
 */
export const prosesKelulusan = async (kelasId) => {
  try {
    const response = await api.post(`/kelas/${kelasId}/kelulusan`);
    return { success: true, data: response.data };
  } catch (error) {
    const msg = error.response?.data?.msg ?? 'Terjadi kesalahan. Silakan coba lagi.';
    return { success: false, msg };
  }
};
```

**Contoh penggunaan di komponen:**

```javascript
const handleKelulusan = async (kelasId, namaKelas) => {
  const confirm = window.confirm(
    `Apakah Anda yakin ingin meluluskan seluruh siswa di kelas ${namaKelas}?\n` +
    'Tindakan ini tidak dapat dibatalkan.'
  );
  if (!confirm) return;

  setLoading(true);
  const result = await prosesKelulusan(kelasId);
  setLoading(false);

  if (result.success) {
    const { data } = result.data;
    alert(`Berhasil! ${data.jumlah_siswa_lulus} siswa dari kelas ${data.nama_kelas} telah diluluskan (Tahun ${data.tahun_lulus}).`);
    // Refresh daftar kelas atau navigasi ke halaman alumni
  } else {
    alert(`Gagal: ${result.msg}`);
  }
};
```

---

### 7.2 Mengambil Daftar Alumni

```javascript
/**
 * Mengambil daftar alumni dengan filter dan pagination.
 * @param {object} params
 * @param {number} [params.page=1]
 * @param {number|'all'} [params.limit=10]
 * @param {string} [params.q='']
 * @param {number|''} [params.tahun_lulus='']
 * @param {'asc'|'desc'} [params.sort_order='desc']
 */
export const getAlumni = async (params = {}) => {
  const {
    page = 1,
    limit = 10,
    q = '',
    tahun_lulus = '',
    sort_order = 'desc',
  } = params;

  try {
    const response = await api.get('/alumni', {
      params: { page, limit, q, tahun_lulus, sort_order },
    });
    return { success: true, ...response.data };
  } catch (error) {
    const msg = error.response?.data?.msg ?? 'Gagal memuat data alumni.';
    return { success: false, msg, data: [], meta: null };
  }
};
```

**Contoh penggunaan di komponen (React):**

```javascript
const [alumniList, setAlumniList] = useState([]);
const [meta, setMeta] = useState(null);
const [loading, setLoading] = useState(false);
const [search, setSearch] = useState('');
const [tahunFilter, setTahunFilter] = useState('');
const [page, setPage] = useState(1);

const fetchAlumni = async () => {
  setLoading(true);
  const result = await getAlumni({
    page,
    limit: 10,
    q: search,
    tahun_lulus: tahunFilter,
  });
  setLoading(false);

  if (result.success) {
    setAlumniList(result.data);
    setMeta(result.meta);
  } else {
    console.error(result.msg);
  }
};

useEffect(() => {
  fetchAlumni();
}, [page, search, tahunFilter]);

// Render
return (
  <div>
    <input
      placeholder="Cari nama alumni..."
      value={search}
      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
    />
    <select onChange={(e) => { setTahunFilter(e.target.value); setPage(1); }}>
      <option value="">Semua Tahun</option>
      <option value="2026">2026</option>
      <option value="2025">2025</option>
    </select>

    {loading ? (
      <p>Memuat...</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>NIS</th>
            <th>Kelas Terakhir</th>
            <th>Tahun Lulus</th>
            <th>Wali Utama</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {alumniList.map((alumni, idx) => {
            const waliUtama = alumni.WaliSiswa?.find(w => w.is_wali_utama);
            return (
              <tr key={alumni.id}>
                <td>{(page - 1) * 10 + idx + 1}</td>
                <td>{alumni.User?.name ?? '-'}</td>
                <td>{alumni.nis}</td>
                <td>{alumni.Kelas?.nama_kelas ?? '-'}</td>
                <td>{alumni.tahun_lulus}</td>
                <td>{waliUtama?.User?.name ?? '-'}</td>
                <td>
                  <button onClick={() => exportAlumniPDF(alumni.id, alumni.User?.name)}>
                    Download PDF
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}

    {/* Pagination */}
    {meta && (
      <div>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</button>
        <span>Halaman {meta.page} dari {meta.totalPages} (Total: {meta.total})</span>
        <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Berikutnya</button>
      </div>
    )}
  </div>
);
```

---

### 7.3 Export PDF Alumni

```javascript
/**
 * Mengunduh dokumen PDF data alumni.
 * @param {string} alumniId - UUID alumni (dari field `id` pada response GET /alumni)
 * @param {string} [namaAlumni] - Nama untuk filename lokal (opsional)
 */
export const exportAlumniPDF = async (alumniId, namaAlumni = 'alumni') => {
  try {
    const response = await api.get(`/alumni/${alumniId}/export`, {
      responseType: 'blob', // WAJIB untuk file biner
    });

    // Cek apakah response adalah error JSON yang terbungkus blob
    if (response.data.type === 'application/json') {
      const text = await response.data.text();
      const json = JSON.parse(text);
      throw new Error(json.msg ?? 'Terjadi kesalahan');
    }

    // Trigger download
    const fileName = `data_alumni_${namaAlumni.replace(/\s+/g, '_')}.pdf`;
    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: 'application/pdf' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    // Handle error dari axios (4xx/5xx) — response berupa blob JSON
    if (error.response?.data instanceof Blob) {
      const text = await error.response.data.text();
      const json = JSON.parse(text);
      return { success: false, msg: json.msg ?? 'Gagal mengunduh PDF.' };
    }
    return { success: false, msg: error.message ?? 'Gagal mengunduh PDF.' };
  }
};
```

---

## 8. Penanganan Error

### Pola Umum Error Response (JSON)

Semua error mengembalikan format berikut:

```json
{
  "msg": "Deskripsi error dalam Bahasa Indonesia"
}
```

> **Pengecualian:** Endpoint export PDF (`/alumni/:id/export`) mengembalikan file PDF saat sukses, tetapi tetap mengembalikan JSON dengan field `msg` saat terjadi error.

### Tabel Kode Status HTTP

| HTTP Status | Arti | Penyebab Umum |
|-------------|------|---------------|
| `200` | Sukses | Request berhasil diproses |
| `400` | Bad Request | Parameter tidak valid (ID bukan UUID, kelas sudah kosong, dll.) |
| `401` | Unauthorized | Token tidak ada, salah, atau sudah expired |
| `403` | Forbidden | Role user bukan `admin sekolah` |
| `404` | Not Found | Data yang dicari tidak ada atau bukan milik sekolah ini |
| `500` | Internal Server Error | Kesalahan server, tampilkan pesan generic ke user |

### Rekomendasi Penanganan di Frontend

```javascript
// Interceptor global untuk error autentikasi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — redirect ke halaman login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 9. Alur UI yang Disarankan

### 9.1 Alur Proses Kelulusan

```
Halaman Manajemen Kelas
  └─ Tombol "Tandai Lulus" di samping nama kelas
       └─ Dialog konfirmasi: "Luluskan seluruh siswa kelas [X]? Tindakan tidak dapat dibatalkan."
            ├─ [Batal] → tutup dialog
            └─ [Ya, Luluskan] → POST /kelas/:id/kelulusan
                 ├─ Sukses (200) → Tampilkan notifikasi sukses + refresh halaman / redirect ke /alumni
                 └─ Gagal (400/404/500) → Tampilkan pesan error dari field `msg`
```

**Kondisi tombol "Tandai Lulus":**
- Tampilkan tombol hanya jika kelas memiliki siswa aktif (`jumlah_siswa > 0`)
- Sembunyikan atau disable tombol jika `jumlah_siswa === 0` (kelas sudah kosong / sudah diluluskan)

### 9.2 Alur Halaman Daftar Alumni

```
Halaman Alumni
  ├─ Input search (nama)
  ├─ Dropdown filter tahun lulus
  ├─ Tabel hasil (dengan pagination)
  │    └─ Per baris: Nama | NIS | Kelas | Tahun Lulus | Wali Utama | [Download PDF]
  └─ Pagination (Sebelumnya / Halaman X dari Y / Berikutnya)
```

**Rekomendasi UX:**
- Terapkan **debounce 400–500ms** pada input search agar tidak spam request setiap ketukan
- Reset `page` ke `1` setiap kali search atau filter berubah
- Saat PDF sedang diunduh, tampilkan loading state (disable tombol, tampilkan spinner) hingga proses selesai

### 9.3 State Loading & Error

```javascript
// Contoh state management sederhana
const [state, setState] = useState({
  loading: false,
  error: null,
  data: [],
  meta: null,
});

// Saat fetch data
setState(s => ({ ...s, loading: true, error: null }));
const result = await getAlumni(params);
if (result.success) {
  setState({ loading: false, error: null, data: result.data, meta: result.meta });
} else {
  setState(s => ({ ...s, loading: false, error: result.msg }));
}

// Render
if (state.loading) return <Spinner />;
if (state.error) return <ErrorMessage message={state.error} />;
```

---

## 10. Aturan Bisnis Penting

Beberapa aturan bisnis backend yang perlu diketahui frontend untuk membangun UI yang konsisten:

| # | Aturan |
|---|--------|
| B-01 | **Kelulusan hanya sekali per kelas.** Setelah kelas tidak memiliki siswa aktif, endpoint akan mengembalikan error `400`. Tombol "Tandai Lulus" sebaiknya di-disable jika `jumlah_siswa = 0`. |
| B-02 | **Alumni bersifat read-only.** Tidak ada endpoint untuk mengembalikan status alumni ke aktif. Jangan tampilkan tombol edit status pada halaman alumni. |
| B-03 | **Alumni tidak muncul di daftar siswa aktif.** Endpoint `GET /siswa` hanya mengembalikan siswa dengan `status = 'aktif'`. Jika ingin melihat alumni, gunakan endpoint `GET /alumni`. |
| B-04 | **Akun siswa alumni tidak bisa login.** Setelah diluluskan, akun mobile siswa dinonaktifkan secara otomatis. |
| B-05 | **Data wali siswa tetap tersedia.** Wali siswa tidak dinonaktifkan saat siswa lulus. Data wali tetap muncul lengkap di endpoint `GET /alumni`. |
| B-06 | **Kelas tidak terhapus setelah kelulusan.** Record kelas tetap ada dan bisa langsung digunakan untuk siswa baru (naik kelas / tahun ajaran baru). Kelas hanya menjadi kosong (`jumlah_siswa = 0`). |
| B-07 | **Multi-tenancy ketat.** Alumni yang dikembalikan oleh API selalu dibatasi pada sekolah yang sesuai dengan token admin. Frontend tidak perlu mengirim filter `sekolah_id` secara eksplisit selain via header `x-sekolah-id`. |
| B-08 | **Tahun lulus otomatis.** Backend mengisi `tahun_lulus` secara otomatis berdasarkan tahun kalender saat request dikirim. Frontend tidak perlu mengirim tahun lulus pada request kelulusan. |

---

## Catatan Versi

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-06-27 | Rilis pertama: endpoint kelulusan, daftar alumni, dan export PDF |

---

*Untuk pertanyaan teknis, hubungi tim backend atau buka issue di repository.*
