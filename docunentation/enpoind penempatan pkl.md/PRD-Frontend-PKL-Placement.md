# Dokumentasi Integrasi Frontend — PKL Placement Engine (MVP)

**Untuk:** Tim Frontend
**Status backend:** ✅ Kode selesai & tervalidasi (fixture §6.5 hijau). ⚠️ Migrasi DB perlu dijalankan sebelum endpoint hidup (lihat §10).
**Basis:** `PRD-Backend-MVP-PKL-Placement-Engine.md` + `REKONSILIASI-PKL-Placement.md`
**Tanggal:** 2 September 2026

Enam endpoint untuk seluruh alur penempatan PKL: kelola industri, dashboard kelas, rekomendasi Top-3, buat & batalkan penempatan.

---

## 1. Prinsip Wajib (baca dulu)

1. **Semua endpoint butuh login Kepala Jurusan.** `Authorization: Bearer <accessToken>`. Gate menu dengan `isKepalaJurusan === true` (Kajur tetap role `pegawai`).
2. **Angka badge/counter pakai `count`/`total` dari server, bukan `array.length`.**
3. **Urutan sudah final dari server.** Jangan sortir ulang daftar siswa di FE.
4. **Kriteria bisa "tidak tersedia".** Saat `available:false`, render baris sebagai teks "Data belum tersedia" — JANGAN gambar bar (akan jadi `width:NaN%`). Ini kesepakatan §6.3 PRD.
5. **Alur penempatan pakai token.** Ambil rekomendasi → dapat `recommendationToken` → kirim token itu saat `POST /placements`. Token kedaluwarsa 30 menit.

Base path semua endpoint: `/api/v1/kepala-jurusan/placement`

---

## 2. Autentikasi

Sama seperti modul lain. Login `POST /api/v1/login` (`email`, `password`, `deviceId`) → simpan `accessToken`. Sertakan `Authorization: Bearer <token>` di semua request di bawah. `sekolahId`/`jurusan_id` diambil server dari token — FE tidak mengirimnya.

---

## 3. `GET /industries` — Daftar Mitra Industri

Halaman kelola industri.

```
GET /api/v1/kepala-jurusan/placement/industries?aktif=true&q=solusi
```

| Query | Opsional | Nilai |
|---|---|---|
| `aktif` | ya | `true` / `false` |
| `q` | ya | cari pada nama industri |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "i-uuid-1",
      "nama_industri": "PT. Solusi Jaringan",
      "bidang": "Jaringan & Infrastruktur",
      "kota": "Makassar",
      "alamat_industri": "Jl. ...",
      "kapasitas_per_periode": 5,
      "status_aktif": true,
      "kemauan_membimbing_teknis": true,
      "kedisiplinan_input": 4,
      "supervisor_input": 5,
      "mentoring_input": 4,
      "evaluator_aktif": true,
      "nama_kontak": "Budi", "telepon_kontak": "08xx", "email_kontak": null,
      "sumber_data": "onboarding",
      "latitude": null, "longitude": null,
      "created_at": "...", "updated_at": "..."
    }
  ]
}
```

Hanya industri milik jurusan Kajur yang dikembalikan (scoping otomatis).

---

## 4. `POST /industries` — Onboarding Industri (Lapis 1)

Form onboarding + **3 slider 1–5** + toggle evaluator. Wajib ada di MVP.

**Request:**
```json
{
  "nama_industri": "PT. Solusi Jaringan",
  "bidang": "Jaringan & Infrastruktur",
  "kota": "Makassar",
  "alamat_industri": "Jl. Perintis No. 1",
  "kapasitas_per_periode": 5,
  "tanggal_mulai_kemitraan": "2026-07-01",
  "nama_kontak": "Budi Santoso",
  "telepon_kontak": "08123456789",
  "email_kontak": "hrd@solusi.co.id",
  "kemauan_membimbing_teknis": true,
  "kedisiplinan_input": 4,
  "supervisor_input": 5,
  "mentoring_input": 4,
  "evaluator_aktif": true,
  "sumber_data": "onboarding"
}
```

| Field | Wajib | Aturan |
|---|---|---|
| `nama_industri`, `alamat_industri`, `nama_kontak`, `telepon_kontak` | ✅ | string |
| `kapasitas_per_periode` | ✅ | integer ≥ 1 |
| `tanggal_mulai_kemitraan` | ✅ | date `YYYY-MM-DD` |
| `kemauan_membimbing_teknis` | ✅ | boolean |
| `kedisiplinan_input`, `supervisor_input`, `mentoring_input` | opsional | **integer 1–5** (boleh `null` = belum dinilai) |
| `evaluator_aktif` | opsional | boolean (default `false`) |
| `bidang`, `kota`, `email_kontak`, `sumber_data`, `latitude`, `longitude` | opsional | — |

**Response `201`:** `{ "data": { ...industri } }`
**Error `409`:** nama industri duplikat di jurusan → `{ "msg": "Industri dengan nama ini sudah ada..." }`

> **Kenapa slider penting:** ketiga slider adalah **sumber skor** kriteria kedisiplinan/supervisor/mentoring (nilai = input × 20). Tanpa slider, kriteria itu "tidak tersedia" dan bobotnya dinormalisasi ke kriteria lain.

---

## 5. `PATCH /industries/{id}` — Update Industri

Body sama seperti POST, **semua field opsional** (minimal 1). Contoh ubah slider saja:
```json
{ "kedisiplinan_input": 5, "evaluator_aktif": false }
```
**Response `200`:** `{ "data": { ...industri } }` · **`404`** bila bukan jurusan Kajur.

---

## 6. `GET /classes/{classId}/dashboard` — Dashboard Kelas

Mengisi sidebar + progress + filter chip + daftar siswa dalam satu panggilan.

```
GET /api/v1/kepala-jurusan/placement/classes/37/dashboard
```

**Response `200`:**
```json
{
  "class": { "id": 37, "name": "XI TKJ 1", "studentCount": 12 },
  "period": { "id": "sem-uuid", "name": "PKL genap" },
  "progress": { "placed": 3, "total": 12, "pending": 9 },
  "riskSummary": [
    { "code": "RG", "label": "Risiko Ganda",      "count": 1, "placed": 0, "priority": true },
    { "code": "RB", "label": "Risiko Behavior",   "count": 4, "placed": 1, "priority": false },
    { "code": "RK", "label": "Risiko Kompetensi", "count": 2, "placed": 0, "priority": false },
    { "code": "SP", "label": "Siap Penuh",        "count": 5, "placed": 2, "priority": false }
  ],
  "students": [
    {
      "id": "s-uuid-1", "name": "Hamdan Rizki", "fotoUrl": null,
      "quadrant": "RB", "behaviorScore": 62, "competencyScore": 74,
      "ewsActive": true, "ewsReason": "Tren penurunan behavior score 4 minggu",
      "placement": null
    },
    {
      "id": "s-uuid-4", "name": "Joko Santoso", "fotoUrl": null,
      "quadrant": "RB", "behaviorScore": 58, "competencyScore": 71,
      "ewsActive": false, "ewsReason": null,
      "placement": {
        "id": "p-uuid", "industryId": "i-uuid", "industryName": "PT. Solusi Jaringan",
        "decisionPath": "REKOMENDASI", "recommendationRank": 1, "decidedAt": "2026-08-21T04:12:00Z"
      }
    }
  ]
}
```



| Field | Keterangan |
|---|---|
| `progress` | `placed` = jml penempatan aktif, `total` = jml siswa kelas, `pending` = sisa |
| `riskSummary[]` | Per kuadran: `count`, `placed`, `priority` (`true` hanya untuk RG). Kode: `SP/RB/RK/RG` |
| `students[].quadrant` | `SP/RB/RK/RG` atau **`null`** (belum terklasifikasi) |
| `students[].behaviorScore/competencyScore` | angka, bisa `null` bila data belum cukup |
| `students[].ewsActive` | `true` bila behavior turun ≥8 poin dalam 4 periode terakhir |
| `students[].placement` | `null` bila belum ditempatkan; objek bila sudah |

**Urutan `students` sudah final dari server:** grup **RG → RB → RK → SP** (yang `null` paling akhir); dalam grup, yang **belum** ditempatkan di atas, lalu skor terendah dulu. **Jangan sortir ulang.**

**Error `403`:** `{ "msg": "Kelas ini bukan bagian dari jurusan Anda." }`

---

## 7. `GET /students/{studentId}/recommendations` — Rekomendasi Top-3

Dipanggil saat Kajur membuka panel penempatan seorang siswa.

```
GET /api/v1/kepala-jurusan/placement/students/s-uuid-1/recommendations
```

**Response `200` (siswa layak):**
```json
{
  "eligible": true,
  "quadrant": "RB",
  "quadrantLabel": "Risiko Behavior",
  "behaviorScore": 62,
  "competencyScore": 74,
  "semesterAjaranId": "sem-uuid",
  "recommendations": [
    {
      "rank": 1,
      "industryId": "i-uuid-1",
      "industryName": "PT. Solusi Jaringan",
      "bidang": "Jaringan", "kota": "Makassar",
      "slotsAvailable": 3,
      "distanceKm": null,
      "matchScore": 90,
      "skorDasar": 85,
      "confidence": { "level": "TINGGI", "persen": 100 },
      "reasons": [
        "Kedisiplinan tinggi (4/5) — faktor bobot terbesar untuk Risiko Behavior",
        "Supervisor berpengalaman (5/5) — pembimbing terstruktur tersedia",
        "Track record: 62% siswa profil serupa berhasil — memadai"
      ],
      "criteria": [
        { "key": "kedisiplinan", "value": 80,  "available": true,  "weight": 0.40, "weightNormalized": 0.40 },
        { "key": "supervisor",   "value": 100, "available": true,  "weight": 0.30, "weightNormalized": 0.30 },
        { "key": "mentoring",    "value": 80,  "available": true,  "weight": 0.10, "weightNormalized": 0.10 },
        { "key": "skkni",        "value": 83,  "available": true,  "weight": 0.10, "weightNormalized": 0.10 },
        { "key": "trackRecord",  "value": 62,  "available": true,  "weight": 0.10, "weightNormalized": 0.10 }
      ]
    }
  ],
  "recommendationToken": "eyJhbGciOi..."
}
```

**Response `200` (siswa belum layak dinilai):**
```json
{ "eligible": false, "quadrant": null, "msg": "Profil siswa belum lengkap — rekomendasi butuh profil dua sisi.", "recommendations": [] }
```

**Aturan render (WAJIB):**
- Selalu render **5 baris kriteria** dari `criteria[]`. Bila `available:false`, tampilkan "Data belum tersedia" **tanpa bar** (`value` akan `null`).
- Bar panjangnya dari `value` (0–100). Label bobot dari `weightNormalized` (bobot setelah normalisasi kriteria yang tersedia).
- `matchScore` = angka besar di kartu. `skorDasar` = sebelum bonus evaluator (+5 bila `evaluator_aktif`).
- `confidence` **hanya informasi** — server TIDAK memakainya untuk mengurutkan (deviasi resmi §2). Boleh ditampilkan sebagai badge, boleh diabaikan.
- Urutan `recommendations` sudah final: `matchScore` DESC. Jangan sortir ulang.
- **Simpan `recommendationToken`** — dibutuhkan di §8. Berlaku 30 menit; bila kedaluwarsa, ambil ulang rekomendasi.

**Error:** `409` tidak ada semester aktif · `404` siswa bukan wewenang.

---

## 8. `POST /placements` — Tetapkan Penempatan

```
POST /api/v1/kepala-jurusan/placement/placements
```

**Request (terima rekomendasi):**
```json
{
  "studentId": "s-uuid-1",
  "industryId": "i-uuid-1",
  "decisionPath": "terima_rekomendasi",
  "recommendationRank": 1,
  "recommendationToken": "eyJhbGciOi..."
}
```

**Request (override manual — pilih di luar Top-3):**
```json
{
  "studentId": "s-uuid-1",
  "industryId": "i-uuid-9",
  "decisionPath": "override_manual",
  "overrideReason": "Dekat rumah siswa, orang tua meminta",
  "recommendationToken": "eyJhbGciOi..."
}
```

| Field | Wajib | Catatan |
|---|---|---|
| `studentId`, `industryId` | ✅ | UUID |
| `recommendationToken` | ✅ | dari §7 |
| `decisionPath` | opsional | `terima_rekomendasi` (default) / `override_manual` |
| `recommendationRank` | opsional | rank kartu yang dipilih |
| `overrideReason` | ✅ jika `override_manual` | teks alasan |

**Response `201`:**
```json
{
  "placement": { "id": "p-uuid", "studentId": "s-uuid-1", "industryId": "i-uuid-1",
    "decisionPath": "terima_rekomendasi", "recommendationRank": 1, "matchScore": 90, "status": "aktif" },
  "slotsAvailable": 2,
  "progress": { "placedInJurusan": 8 }
}
```
> `slotsAvailable` & `progress` dikembalikan agar FE update UI tanpa refetch penuh.

**Error (semua membawa `code` + `msg`):**

| HTTP | `code` | Arti / aksi FE |
|---|---|---|
| `409` | `SLOT_UNAVAILABLE` | Slot penuh (keburu terisi). Refresh rekomendasi |
| `409` | `STUDENT_ALREADY_PLACED` | Siswa sudah punya penempatan aktif periode ini |
| `409` | `STALE_RECOMMENDATION` | Token kedaluwarsa/tidak cocok. Ambil ulang rekomendasi |
| `400` | `OVERRIDE_REASON_REQUIRED` | `overrideReason` wajib untuk override manual |
| `400` | `STALE_RECOMMENDATION` | Industri di luar Top-3 tanpa override manual |
| `403` | — | Bukan Kepala Jurusan (guard) |

---

## 9. `DELETE /placements/{id}` — Batalkan Penempatan

Soft-cancel. **Tidak ada hard delete.** Slot otomatis kembali.

```
DELETE /api/v1/kepala-jurusan/placement/placements/p-uuid
Body: { "reason": "Industri menutup kuota mendadak" }
```

| Field | Wajib |
|---|---|
| `reason` | ✅ |

**Response `200`:**
```json
{ "placementId": "p-uuid", "status": "dibatalkan", "slotsAvailable": 3 }
```
**Error:** `400 CANCEL_REASON_REQUIRED` · `404 PLACEMENT_NOT_FOUND` · `409 ALREADY_CANCELLED`.

---

## 10. Alur UI Lengkap (rangkuman)

```
1. Kelola Industri:  GET /industries → POST/PATCH /industries (isi 3 slider)
2. Buka kelas:       GET /classes/{id}/dashboard → render sidebar+progress+chips+siswa
3. Klik siswa:       GET /students/{id}/recommendations → render Top-3 (+simpan token)
4. Pilih industri:   POST /placements (kirim token) → update slot & progress dari response
5. Batalkan:         DELETE /placements/{id} (kirim reason) → slot kembali
```

Kartu KPI/badge → dari `progress` & `riskSummary[].count`. Titik kuadran → `students[].quadrant` + skor. EWS badge → `students[].ewsActive`.

---

## 11. Catatan Penting untuk FE

- **Track record & confidence bisa "TINGGI/RENDAH" atau kriteria `trackRecord` tidak tersedia** sampai ada ≥3 riwayat penempatan per kuadran per industri (data seed/histori). Sampai itu ada, kriteria `trackRecord.available=false` — render "Data belum tersedia".
- **`distanceKm` selalu `null`** di MVP (koordinat sekolah belum diintegrasikan). Jangan tampilkan jarak dulu.
- **`confidence` dikirim tapi tidak memengaruhi urutan.** Aman ditampilkan/diabaikan.
- **`quadrant: null`** pada siswa = belum terklasifikasi (data belum cukup) — tidak masuk 4 chip, tampilkan di grup terpisah/akhir.
- Semua tulisan `reasons` **deterministik** — input sama menghasilkan kalimat sama.

---

## 12. Prasyarat Backend Sebelum Endpoint Hidup

⚠️ Endpoint baru aktif setelah **migrasi dijalankan** di server:
```
npx sequelize-cli db:migrate
```
Migrasi menambah kolom `mitra_industri` (slider), lifecycle `riwayat_penempatan_pkl`, dan 3 tabel baru (`scoring_weights` + seed bobot v1, `audit_logs`, `industry_derived_metrics`).

Untuk demo bermakna, seed juga (opsional, di luar kode ini): ≥3 riwayat penempatan per industri per kuadran (agar `trackRecord` tersedia) dan ≥4 periode `behavior_score_bulanan` (agar EWS bisa hidup).

---

*Kontrak dapat menyesuaikan bila tim mengubah 8 keputusan di `REKONSILIASI-PKL-Placement.md §4` (mis. matriks bobot RK/RG/SP). Perubahan bentuk response akan dikomunikasikan sebelum deploy.*
