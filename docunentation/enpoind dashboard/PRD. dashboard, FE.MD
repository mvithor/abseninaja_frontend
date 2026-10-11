# Dokumentasi Endpoint — Dashboard Kepala Jurusan (SGA)

**Untuk:** Tim Frontend
**Status backend:** ✅ Sudah dibangun & siap dipakai (branch `dev`)
**Basis kontrak:** PRD-SGA-Backend-FINAL §5 (kontrak `DashboardResponse` mengikat)
**Tanggal dok:** 2 September 2026

Dokumen ini menjelaskan **satu endpoint tunggal** yang menyuplai seluruh halaman Dashboard Kepala Jurusan: KPI, papan kuadran (scatter), daftar kelas untuk filter, identitas user, dan (nanti) Early Warning. FE cukup memanggil **satu** endpoint ini untuk merender seluruh halaman dashboard.

---

## 1. Ringkasan Cepat

| Item | Nilai |
|---|---|
| **Method & Path** | `GET /api/v1/kepala-jurusan/dashboard` |
| **Auth** | Wajib — `Authorization: Bearer <accessToken>` |
| **Role** | Hanya `pegawai` yang berstatus **Kepala Jurusan aktif** |
| **Query param** | `kelas_id` (opsional) — `all` / `<id kelas>` |
| **Fitur sekolah** | `jurusan_kompetensi` harus aktif |
| **Response sukses** | `200` — objek `DashboardResponse` (lihat §4) |

Base URL contoh: `https://api.abseninaja.com` → endpoint penuh:
`https://api.abseninaja.com/api/v1/kepala-jurusan/dashboard`

---

## 2. Autentikasi & Alur Login

### 2.1 Dapatkan token dulu

Dashboard butuh `accessToken` dari endpoint login.

```
POST /api/v1/login
Content-Type: application/json

{
  "email": "egi.kajur@smk.sch.id",
  "password": "••••••••",
  "deviceId": "web-egi-chrome-01"
}
```

> `deviceId` **wajib**. Kirim string unik per device/browser dan simpan konsisten — token di-bind ke `deviceId` ini di server. Untuk web, cukup generate sekali (mis. simpan di `localStorage`) dan pakai terus.

Response login (potongan yang relevan):

```json
{
  "accessToken": "eyJhbGciOi...",
  "role": "pegawai",
  "name": "EGI ARDIANSYAH, S.Pd",
  "sekolahId": 12,
  "sekolahTimezone": "Asia/Makassar",
  "timezone_sekolah": "Asia/Makassar",
  "isKepalaJurusan": true
}
```

> **Penting untuk FE:** Kepala Jurusan **tetap ber-role `pegawai`**. Cara mendeteksi bahwa user ini boleh membuka Dashboard Kajur adalah field **`isKepalaJurusan: true`**, bukan `role`. Kalau `false`, jangan tampilkan menu dashboard kajur (endpoint akan balas `403`).

### 2.2 Panggil dashboard dengan token

```
GET /api/v1/kepala-jurusan/dashboard?kelas_id=all
Authorization: Bearer eyJhbGciOi...
```

Tidak perlu mengirim `sekolahId` atau `jurusan_id` — backend membacanya dari token & data Kepala Jurusan. Ini juga alasan keamanannya: Kajur **tidak bisa** mengintip jurusan/sekolah lain lewat manipulasi query.

### 2.3 Contoh pemanggilan (fetch/axios)

```js
// axios
const { data } = await axios.get('/api/v1/kepala-jurusan/dashboard', {
  params: { kelas_id: kelasId ?? 'all' },      // 'all' atau id kelas (number)
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

```js
// fetch
const res = await fetch(`/api/v1/kepala-jurusan/dashboard?kelas_id=${kelasId ?? 'all'}`, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
if (!res.ok) { /* tangani error, lihat §6 */ }
const data = await res.json();
```

---

## 3. Query Parameter

| Param | Wajib | Tipe | Nilai | Arti |
|---|---|---|---|---|
| `kelas_id` | Tidak | `string`/`number` | `all` / kosong | Semua kelas **dalam jurusan Kajur** (default) |
| `kelas_id` | Tidak | `number` | contoh `37` | Filter hanya satu kelas milik jurusan tersebut |

Catatan:
- Alias `classId` juga diterima (bernilai sama). Disarankan pakai **`kelas_id`**.
- `kelas_id` diisi angka **id kelas** (bukan nama). Ambil id-nya dari array `classes` di response (lihat §4.3).
- Jika `kelas_id` menunjuk kelas yang **bukan** milik jurusan Kajur → **`403`** (bukan 404 — sengaja, supaya keberadaan kelas jurusan lain tidak bocor).

---

## 4. Struktur Response (`200 OK`)

Contoh lengkap (nilai ilustratif):

```json
{
  "meta": {
    "schoolName": "SMK Sultan Hasanuddin",
    "academicYear": "2025/2026",
    "semester": "Genap",
    "threshold": 75,
    "ambang_behavior_baik": 70,
    "ambang_competency_baik": 75,
    "updatedAt": "2026-09-02T03:00:00.000Z"
  },
  "user": {
    "name": "EGI ARDIANSYAH, S.Pd",
    "role": "Kepala Jurusan TKJ",
    "avatarUrl": null
  },
  "classes": [
    { "id": "all", "label": "Semua Kelas" },
    { "id": 37, "label": "XI TKJ 1" },
    { "id": 38, "label": "XI TKJ 2" }
  ],
  "kpi": {
    "totalSiswa": 64,
    "siapPenuh": 41,
    "risikoBehavior": 6,
    "risikoKompetensi": 8,
    "risikoGanda": 3,
    "belumTerklasifikasi": 6,
    "breakdown": { "parsial": 4, "belumCukup": 2 }
  },
  "quadrants": {
    "siap_penuh": {
      "total": 41,
      "items": [
        {
          "siswa_id": "b7c1e2a0-1111-4d2b-9a2f-abc123",
          "nama": "Andi Saputra",
          "kelas": "XI TKJ 1",
          "foto_url": "https://.../andi.jpg",
          "behavior_score": 88.5,
          "competency_score": 91.2
        }
      ]
    },
    "risiko_behavior":   { "total": 6, "items": [ /* StudentSummary[] */ ] },
    "risiko_kompetensi": { "total": 8, "items": [ /* StudentSummary[] */ ] },
    "risiko_ganda":      { "total": 3, "items": [ /* StudentSummary[] */ ] }
  },
  "earlyWarnings": [],
  "meta_debug": { "semester_ajaran_id": "9f...uuid", "jurusan_id": "3a...uuid" }
}
```

### 4.1 `meta` — Konteks header dashboard

| Field | Tipe | Keterangan | Sumber DB |
|---|---|---|---|
| `schoolName` | `string\|null` | Nama sekolah untuk header | `sekolah.nama` |
| `academicYear` | `string\|null` | Tahun ajaran aktif, mis. `"2025/2026"` | `tahun_ajaran.tahun_ajaran` (via semester aktif) |
| `semester` | `string` | `"Ganjil"` / `"Genap"` | `semester_ajaran.semester` (di-Capitalize) |
| `threshold` | `number\|null` | Ambang tunggal (kontrak FE). **Diisi = `ambang_competency_baik`** | `konfigurasi_jurusan.ambang_competency_baik` |
| `ambang_behavior_baik` | `number\|null` | Ambang sumbu **Behavior** (garis vertikal/horizontal scatter) | `konfigurasi_jurusan.ambang_behavior_baik` |
| `ambang_competency_baik` | `number\|null` | Ambang sumbu **Competency** | `konfigurasi_jurusan.ambang_competency_baik` |
| `updatedAt` | `string (ISO8601)` | Waktu data dirakit (skor dihitung live per-request) | `now()` |

> ⚠️ **Untuk scatter 2-sumbu, JANGAN pakai `threshold`.** Sistem ini menilai siswa dengan **dua ambang berbeda**: `ambang_behavior_baik` (sumbu X/behavior) dan `ambang_competency_baik` (sumbu Y/competency). Gunakan dua field itu untuk menggambar garis pembagi kuadran. `threshold` hanya disediakan agar kompatibel dengan kontrak FE lama yang mengasumsikan satu angka.

### 4.2 `user` — Identitas Kajur

| Field | Tipe | Keterangan |
|---|---|---|
| `name` | `string\|null` | Nama Kajur (dari token) |
| `role` | `string` | Label siap-tampil, mis. `"Kepala Jurusan TKJ"` (dari `jurusan.kode_lokal`, fallback `jurusan.nama`) |
| `avatarUrl` | `null` | Belum ada sumber avatar; selalu `null` untuk saat ini |

### 4.3 `classes` — Opsi filter kelas

Array untuk mengisi dropdown filter. Elemen pertama **selalu** `{ "id": "all", "label": "Semua Kelas" }`.

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | `"all"` \| `number` | Kirim balik nilai ini sebagai `kelas_id` saat memfilter |
| `label` | `string` | Teks tampilan (nama kelas) |

### 4.4 `kpi` — Kartu angka ringkasan

| Field | Tipe | Keterangan |
|---|---|---|
| `totalSiswa` | `number` | Total siswa aktif dalam scope (jurusan / kelas terfilter) |
| `siapPenuh` | `number` | = `quadrants.siap_penuh.total` |
| `risikoBehavior` | `number` | = `quadrants.risiko_behavior.total` |
| `risikoKompetensi` | `number` | = `quadrants.risiko_kompetensi.total` |
| `risikoGanda` | `number` | = `quadrants.risiko_ganda.total` |
| `belumTerklasifikasi` | `number` | Siswa yang belum bisa ditempatkan di kuadran manapun |
| `breakdown.parsial` | `number` | Data satu sisi cukup, satu sisi belum |
| `breakdown.belumCukup` | `number` | Data kedua sisi belum cukup (mis. siswa baru) |

**Invariant yang DIJAMIN backend** (aman dijadikan asumsi di FE; jika dilanggar backend balas `500`, bukan angka ngawur):

```
totalSiswa = siapPenuh + risikoBehavior + risikoKompetensi + risikoGanda + belumTerklasifikasi
belumTerklasifikasi = breakdown.parsial + breakdown.belumCukup
```

> `breakdown` bersifat **additive** — kalau UI belum butuh, boleh diabaikan tanpa error.

### 4.5 `quadrants` — Isi papan kuadran (scatter/list)

Empat key tetap: `siap_penuh`, `risiko_behavior`, `risiko_kompetensi`, `risiko_ganda`. Masing-masing:

| Field | Tipe | Keterangan |
|---|---|---|
| `total` | `number` | **Jumlah sebenarnya** siswa di kuadran ini |
| `items` | `StudentSummary[]` | Daftar siswa, **dibatasi maksimal 100** per kuadran |

> 🔴 **Aturan penting (§5.3 PRD):** untuk angka di kartu/badge, **selalu pakai `total`**, JANGAN `items.length`. `items` bisa terpotong di 100 saat kuadran sangat ramai, sedangkan `total` selalu akurat.

**Urutan `items`:**
- `siap_penuh` → skor **tertinggi** dulu (DESC).
- `risiko_*` → **paling berisiko** dulu (behavior ASC, lalu competency ASC).

**Objek `StudentSummary`:**

| Field | Tipe | Keterangan | Sumber DB |
|---|---|---|---|
| `siswa_id` | `string (UUID)` | ID siswa — pakai ini untuk buka halaman detail | `siswa.id` |
| `nama` | `string` | Nama siswa | `users.name` (relasi siswa→user) |
| `kelas` | `string` | Nama kelas | `kelas.nama_kelas` |
| `foto_url` | `string\|null` | Foto profil | `siswa.url_profil` |
| `behavior_score` | `number\|null` | Skor behavior kumulatif (1 desimal). `null` = belum cukup data | dihitung dari `behavior_score_bulanan` |
| `competency_score` | `number\|null` | Skor competency kumulatif (1 desimal). `null` = belum cukup data | dihitung dari `competency_score_unit` |

Pemetaan koordinat scatter: **X = `behavior_score`**, **Y = `competency_score`**, garis pembagi = `meta.ambang_behavior_baik` & `meta.ambang_competency_baik`.

### 4.6 `earlyWarnings` — Panel peringatan dini

**Saat ini SELALU `[]` (array kosong).** Modul Early Warning (EWS) belum dibangun — masih menunggu validasi rule set (PRD §6, Sprint 4). Field ini sudah disertakan agar kontrak stabil; **FE boleh render panel kosong / sembunyikan** sampai backend mengisinya. Tidak akan ada perubahan bentuk field saat EWS aktif nanti (tetap array of objek).

### 4.7 `meta_debug`

Info diagnostik (`semester_ajaran_id`, `jurusan_id`). Boleh diabaikan FE; berguna saat pelaporan bug ke backend.

---

## 5. Cara Menyambungkan ke Halaman (Panduan Render)

1. **Header** → `meta.schoolName`, `meta.academicYear`, `meta.semester`, dan `user.name` + `user.role`.
2. **Dropdown filter kelas** → render dari `classes`. Saat user memilih, panggil ulang endpoint dengan `kelas_id` = `id` terpilih (`"all"` untuk semua). Seluruh response akan otomatis ter-scope ulang.
3. **Kartu KPI** → dari `kpi.*`. Badge angka selalu dari `kpi`/`total`, bukan panjang array.
4. **Scatter/papan kuadran** → gambar 4 kuadran dengan garis `meta.ambang_behavior_baik` (X) & `meta.ambang_competency_baik` (Y). Titik siswa dari `quadrants.<key>.items` (koordinat = `behavior_score`, `competency_score`).
5. **Klik titik/baris siswa** → buka detail via `siswa_id` (endpoint detail, lihat §7).
6. **Panel Early Warning** → sembunyikan/placeholder selama `earlyWarnings` kosong.

Contoh mapping quadrants ke UI:

```js
const K = data.quadrants;
renderKartu('Siap Penuh',        K.siap_penuh.total);
renderKartu('Risiko Behavior',   K.risiko_behavior.total);
renderKartu('Risiko Kompetensi', K.risiko_kompetensi.total);
renderKartu('Risiko Ganda',      K.risiko_ganda.total);

K.risiko_ganda.items.forEach(s => plotTitik(s.behavior_score, s.competency_score, s));
```

---

## 6. Respons Error

| HTTP | Kondisi | Body | Aksi FE |
|---|---|---|---|
| `401` | Tidak ada / token invalid | `{ "msg": "Akses ditolak. Silakan login kembali" }` | Redirect ke login |
| `403` | Token tidak cocok sesi (login di device lain) | `{ "msg": "Akses ditolak. Silakan login kembali" }` | Redirect ke login |
| `403` | Role bukan `pegawai` | `{ "msg": "Forbidden: Anda tidak memiliki akses yang diperlukan" }` | Sembunyikan menu |
| `403` | Fitur `jurusan_kompetensi` non-aktif | `{ "msg": "Fitur jurusan_kompetensi tidak aktif untuk sekolah ini." }` | Tampilkan state "fitur tidak aktif" |
| `403` | User bukan Kepala Jurusan aktif | `{ "msg": "Anda bukan Kepala Jurusan aktif pada tahun ajaran ini." }` | Sembunyikan menu dashboard kajur |
| `403` | `kelas_id` bukan milik jurusan Kajur | `{ "msg": "Kelas ini bukan bagian dari jurusan Anda." }` | Reset filter ke `all` |
| `404` | `sekolahId` di token tidak valid | `{ "msg": "Sekolah tidak valid atau tidak ditemukan." }` | Redirect ke login |
| `409` | Tidak ada tahun ajaran aktif | `{ "msg": "Tidak ada tahun ajaran aktif untuk sekolah ini." }` | Tampilkan info ke user |
| `500` | Invariant KPI gagal / error server | `{ "msg": "..." }` | Tampilkan "coba lagi", laporkan bug |

**Kasus khusus `200` (bukan error, tapi kosong):**

- Tidak ada semester aktif:
  ```json
  { "data": null, "msg": "Tidak ada semester aktif untuk sekolah ini." }
  ```
  Deteksi: kalau response `200` tapi **tidak ada** field `meta`/`kpi` dan ada `data: null` → tampilkan empty state.

- Jurusan belum punya siswa: struktur normal tetap dikirim, semua angka `0` dan setiap `quadrants.*.items` `[]`. FE aman merender empty state dari `kpi.totalSiswa === 0`.

> Rekomendasi FE: cek `if (data.kpi)` untuk membedakan response normal vs `data: null`.

---

## 7. Endpoint Terkait (sudah ada sebelumnya)

Dashboard ini fokus ke ringkasan. Untuk drill-down, pakai endpoint berikut (semua di bawah `/api/v1/kepala-jurusan`, guard sama: token + role `pegawai` + Kepala Jurusan):

| Kebutuhan | Endpoint |
|---|---|
| Tabel "Data Siswa" (semua siswa, termasuk yg belum terklasifikasi, + NIS) | `GET /kepala-jurusan/profile-siswa/list?kelas_id=` |
| Papan kuadran versi lama (data mentah kuadran) | `GET /kepala-jurusan/profile-siswa?kelas_id=` |
| **Detail satu siswa** (skor, tren 2 semester, rencana intervensi) | `GET /kepala-jurusan/profile-siswa/:siswa_id` |

> Untuk membuka detail dari titik/baris di dashboard, gunakan `siswa_id` dari `StudentSummary` → panggil `GET /kepala-jurusan/profile-siswa/{siswa_id}`.

---

## 8. Dari Mana Angkanya? (Ringkas alur data ke DB)

Agar FE paham konteks (bukan untuk diimplementasi ulang di FE):

```
absensi + penilaian_langsung + input guru
        │  (job agregasi)
        ▼
behavior_score_bulanan        competency_score_unit + skkni_unit
        │                                  │
        └──────────── Scoring Engine ──────┘
                          │
              Profile Generator (Gate 1 → 1.5 → 2)
                          │   pakai ambang di konfigurasi_jurusan
                          ▼
        profil_status per siswa → dikelompokkan jadi kuadran/kpi
                          ▼
          GET /api/v1/kepala-jurusan/dashboard  (endpoint ini)
```

- **Scope jurusan** ditentukan dari `kepala_jurusan` (pegawai login → jurusan_id) pada **tahun ajaran aktif**.
- **Ambang** (`ambang_behavior_baik`, `ambang_competency_baik`) diambil dari `konfigurasi_jurusan` untuk **jurusan + semester aktif**. Kalau konfigurasi belum diisi, ambang bernilai `null` — FE sebaiknya menampilkan info "konfigurasi jurusan belum diatur".
- Skor dihitung **live** setiap request (bukan cache), jadi `updatedAt` = waktu request.

---

## 9. Checklist Integrasi FE

- [ ] Simpan `accessToken` + `deviceId` dari login; kirim `Authorization: Bearer` di setiap request.
- [ ] Gate menu Dashboard Kajur dengan `isKepalaJurusan === true`.
- [ ] Render header dari `meta` + `user`.
- [ ] Isi dropdown dari `classes`; refetch saat filter berubah (`kelas_id`).
- [ ] Kartu KPI & badge kuadran dari `kpi` / `quadrants.*.total` (**bukan** `items.length`).
- [ ] Scatter pakai dua ambang (`ambang_behavior_baik`, `ambang_competency_baik`), **bukan** `threshold`.
- [ ] Tangani semua error di §6 + empty state (`data: null`, `totalSiswa: 0`).
- [ ] Panel Early Warning: placeholder selama `earlyWarnings` kosong.
- [ ] Buka detail siswa via `siswa_id` → `/kepala-jurusan/profile-siswa/{siswa_id}`.

---

*Pertanyaan atau butuh penyesuaian bentuk field? Hubungi backend (Vithor). Perubahan bentuk response akan dikomunikasikan sebelum deploy.*
