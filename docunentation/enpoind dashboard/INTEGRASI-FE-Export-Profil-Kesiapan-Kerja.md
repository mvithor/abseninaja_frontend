# Panduan Integrasi Frontend — Export Profil Kesiapan Kerja Siswa

| | |
|---|---|
| **Modul** | SGA (Skill Gap Advisor) — Kepala Jurusan |
| **Base path** | `/api/v1/kepala-jurusan/readiness-profile` |
| **Auth** | `Authorization: Bearer <JWT>` (role `pegawai`, harus Kepala Jurusan aktif) |
| **Status implementasi** | v1 — pratinjau JSON + export PDF tunggal (sinkron) |

> Catatan cakupan v1: rendering PDF dikerjakan **backend** dengan PDFKit dan
> di-**stream langsung** (sinkron), bukan antrean async. Belum ada bulk export,
> endpoint verifikasi publik, maupun penyimpanan arsip dokumen. FE cukup: (1)
> menarik JSON untuk pratinjau di layar, dan (2) memicu unduh PDF.

---

## 1. Ringkasan alur

```
Halaman Detail Siswa (Kajur)
   │
   │ 1. GET  /readiness-profile/{siswa_id}          → JSON (render pratinjau di layar)
   │ 2. GET  /readiness-profile/{siswa_id}/export   → binary PDF (unduh / buka tab)
   ▼
```

Tidak ada langkah polling. Export selesai dalam satu request (stream PDF).

---

## 2. Prasyarat & hak akses

- Token wajib milik **pegawai** yang terdaftar sebagai **Kepala Jurusan aktif**
  pada tahun ajaran aktif. Jika bukan, request ditolak `403` oleh middleware.
- `sekolah_id` dan `jurusan_id` **diambil dari token**, bukan dari FE. FE tidak
  perlu (dan tidak boleh) mengirim keduanya.
- Siswa di luar jurusan/sekolah Kajur akan menghasilkan `404` (bukan `403`) —
  sengaja, agar tidak membocorkan keberadaan data.

---

## 3. Endpoint

### 3.1 `GET /readiness-profile/{siswa_id}` — Pratinjau JSON

Mengambil data profil untuk dirender di layar. Tidak menghasilkan file.

**Path param**

| Nama | Tipe | Keterangan |
|---|---|---|
| `siswa_id` | UUID | ID siswa |

**Query param** (semua opsional)

| Nama | Tipe | Default | Keterangan |
|---|---|---|---|
| `trend_periods` | int | `4` | Jumlah semester pada tren, dibatasi 2–8 |
| `include_contact` | bool | `true` | `false` → no. telepon & email siswa disamarkan (`null`) |

**Response `200`**

```jsonc
{
  "data": {
    "document": {
      "document_id": null,                  // null pada pratinjau; terisi saat export PDF
      "generated_at": "2026-09-03T08:12:44.000Z",
      "threshold_behavior": 70,
      "threshold_competency": 75,
      "critical_threshold": 60,
      "document_id_prefix": "SGA/TKJ/0093890401/2026-GJL"
    },
    "school": {
      "id": 8,
      "name": "SMK Negeri 1 Contoh",
      "program": "Teknik Komputer dan Jaringan",
      "address": "Jl. Contoh No. 00",
      "email": "email@sekolah.sch.id",
      "phone": "(0xx) xxxxxxx",
      "npsn": "00000000"
    },
    "student": {
      "id": "8526fe67-...",
      "nis": "0093890401",
      "full_name": "Resky Febriani Rahmat",
      "class_name": "XII TKJ",
      "grade_level": null,
      "program": "Teknik Komputer dan Jaringan",
      "academic_year": "2026/2027",
      "semester": "GANJIL",
      "gender": "perempuan",
      "birth_place": "Kota Contoh",
      "birth_date": "2008-02-14",
      "domicile": "Kabupaten Contoh",
      "phone": "08xxxxxxxxxx",          // null bila include_contact=false
      "email": "siswa@contoh.sch.id",   // null bila include_contact=false
      "photo_url": "https://..."
    },
    "readiness": {
      "status": "SIAP_PENUH",           // SIAP_PENUH | SIAP_TEKNIS | SIAP_PERILAKU | BELUM_SIAP
      "status_label": "Siap Penuh",
      "behavior": {
        "score": 78,                    // bisa null bila data belum cukup
        "ready": true,
        "sufficient": true,             // false → riwayat terlalu pendek, skor belum dapat disimpulkan
        "threshold": 70,
        "note": null,                   // alasan bila belum cukup
        "source": "Dihitung otomatis dari presensi & perizinan, bobot lebih tinggi pada 6 bulan terakhir."
      },
      "competency": {
        "score": 86,
        "ready": true,
        "sufficient": true,
        "threshold": 75,
        "overridden": false,            // true → ada unit inti kritis yang menurunkan status
        "note": null,
        "source": "Rata-rata penilaian langsung guru produktif per unit kompetensi SKKNI."
      }
    },
    "behavior_indicators": [
      { "code": "ATTENDANCE",     "label": "Kehadiran",           "score": 95, "critical_flag": false },
      { "code": "WORK_ATTITUDE",  "label": "Sikap kerja",         "score": 87, "critical_flag": false },
      { "code": "PERMIT",         "label": "Kepatuhan perizinan", "score": 83, "critical_flag": false },
      { "code": "TASK_TIMELINESS","label": "Ketepatan tugas",     "score": 52, "critical_flag": true }
    ],
    "competency_units": [
      { "unit_code": "TIK.JK02.021.01", "unit_name": "Mengadministrasi perangkat jaringan", "kategori": "kompetensi_inti", "score": 88, "status": "MEMENUHI", "met": true }
      // diurutkan skor desc, lalu judul asc
    ],
    "competency_summary": {
      "total_units": 9,
      "units_met": 9,
      "min_score": 82,
      "max_score": 88,
      "average_score": 86
    },
    "trend": {
      "tersedia": true,                 // false → tampilkan `alasan`, sembunyikan grafik
      "periods": [
        { "academic_year": "2024/2025", "semester": "GANJIL", "label": "Ganjil 2024/2025", "behavior_score": 63, "competency_score": 85 }
        // ...
      ],
      "behavior_delta":   { "from": 63, "to": 86, "points": 23, "direction": "UP" },
      "competency_delta": { "from": 85, "to": 86, "points": 1,  "direction": "UP" }
    },
    "signatories": [
      { "role": "HEADMASTER", "role_label": "Kepala Sekolah",                "name": "Nama Kepsek", "nip": "1970...", "order": 1 },
      { "role": "DEPT_HEAD",  "role_label": "Kepala Program Keahlian TKJ",   "name": "Nama Kajur",  "nip": "1985...", "order": 2 }
    ],
    "notes": [
      "Perlu pendampingan pada indikator \"Ketepatan tugas\" (skor 52) selama masa orientasi PKL."
    ]
  },
  "meta": { "semester_ajaran_id": "…", "jurusan_id": "…" }
}
```

> **Catatan penting untuk FE**
> - Skor bisa bernilai `null` bila `sufficient=false`. Jangan render gauge kosong
>   sebagai `0`; tampilkan status "data belum cukup" beserta `note`.
> - `trend.tersedia=false` → jangan render grafik, tampilkan `trend.alasan`
>   (mis. "Data riwayat belum mencukupi.").
> - `critical_flag=true` wajib ditonjolkan (mis. badge merah "Perlu Pembinaan"),
>   berapa pun status agregatnya.
> - `document_id` pada pratinjau **selalu `null`** — id resmi baru dibuat saat export.

### 3.2 `GET /readiness-profile/{siswa_id}/export` — Unduh PDF

Menghasilkan dan men-stream PDF A4 (Profil Kesiapan Kerja). Sinkron.

**Query param** (opsional)

| Nama | Tipe | Default | Keterangan |
|---|---|---|---|
| `trend_periods` | int | `4` | Sama seperti pratinjau |
| `include_contact` | bool | `true` | `false` → kontak siswa disamarkan di dokumen |
| `disposition` | enum | `attachment` | `inline` untuk membuka di tab browser, `attachment` untuk unduh |

**Response `200`**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="Profil-Kesiapan-Kerja-{Nama-Siswa}.pdf"`
- Body: biner PDF (± 2 halaman untuk ≤ 12 unit SKKNI).

Isi dokumen: KOP sekolah, identitas siswa, status kesiapan + skor, indikator
perilaku, tabel unit kompetensi, tren skor (tabel + teks), catatan pembinaan,
QR verifikasi berisi `document_id`, blok tanda tangan Kepala Sekolah & Kepala
Program Keahlian, dan footer di setiap halaman.

---

## 4. Penanganan error

Format seragam:

```jsonc
{ "error": { "code": "PROFILE_INCOMPLETE", "message": "..." } }
```

(beberapa error middleware memakai bentuk lama `{ "msg": "..." }`.)

| HTTP | Kode | Pemicu | Saran UI |
|---|---|---|---|
| 400 | — | `siswa_id` kosong | Validasi sebelum request |
| 400 | `INVALID_PERIOD` | Tidak ada semester aktif di sekolah | Tampilkan pesan, nonaktifkan tombol export |
| 401 | — | Token tidak valid/kedaluwarsa | Redirect login |
| 403 | — | Bukan Kepala Jurusan aktif / fitur nonaktif | Sembunyikan menu |
| 404 | `STUDENT_NOT_FOUND` | Siswa bukan di jurusan/sekolah Kajur | "Siswa tidak ditemukan" |
| 409 | `SIGNATORIES_NOT_CONFIGURED` | Nama Kepala Sekolah belum diisi | Arahkan admin melengkapi data sekolah |
| 422 | `PROFILE_INCOMPLETE` | Belum ada unit SKKNI yang dinilai | Tombol export dinonaktifkan + tooltip |
| 500 | — | Kesalahan server / render gagal | Toast "Gagal membuat dokumen, coba lagi" |

> Siswa berstatus `BELUM_SIAP` **tetap boleh** diekspor — dokumen bersifat
> diagnostik, bukan sertifikat kelulusan. Jangan blokir export hanya karena status.

**Penting soal error saat export:** karena PDF di-stream, error `4xx/5xx`
dikembalikan sebagai **JSON** (bukan PDF). FE harus memeriksa `Content-Type`
respons sebelum memperlakukannya sebagai file (lihat contoh di §5.2).

---

## 5. Contoh implementasi (React / fetch)

### 5.1 Pratinjau JSON

```js
async function getReadinessProfile(siswaId, { trendPeriods = 4, includeContact = true } = {}) {
  const qs = new URLSearchParams({ trend_periods: trendPeriods, include_contact: includeContact });
  const res = await fetch(`/api/v1/kepala-jurusan/readiness-profile/${siswaId}?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || json?.msg || 'Gagal memuat profil');
  return json.data;
}
```

### 5.2 Unduh PDF (dengan penanganan error JSON)

```js
async function exportReadinessPdf(siswaId, { includeContact = true, inline = false } = {}) {
  const qs = new URLSearchParams({ include_contact: includeContact });
  if (inline) qs.set('disposition', 'inline');

  const res = await fetch(`/api/v1/kepala-jurusan/readiness-profile/${siswaId}/export?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Error dikembalikan sebagai JSON, bukan PDF.
  const ct = res.headers.get('Content-Type') || '';
  if (!res.ok || !ct.includes('application/pdf')) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.msg || 'Gagal membuat dokumen');
  }

  const blob = await res.blob();

  // Ambil nama file dari header (fallback bila tidak ada).
  const cd = res.headers.get('Content-Disposition') || '';
  const match = cd.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : 'Profil-Kesiapan-Kerja.pdf';

  const url = URL.createObjectURL(blob);
  if (inline) {
    window.open(url, '_blank');           // buka pratinjau di tab
  } else {
    const a = document.createElement('a'); // paksa unduh
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
```

> Tips: beri state loading pada tombol export karena request sinkron (± 1–3 dtk).
> Jangan pakai `<a href>` langsung ke endpoint export tanpa header Authorization —
> gunakan `fetch` + blob seperti di atas agar token terkirim.

---

## 6. Pemetaan ke komponen UI (saran)

| Bagian data | Komponen |
|---|---|
| `readiness.status` + `status_label` | Badge status besar |
| `readiness.behavior` / `competency` | Dua gauge/kartu skor + ambang + badge ready |
| `behavior_indicators[]` | Daftar indikator; sorot `critical_flag` |
| `competency_units[]` + `competency_summary` | Tabel unit + baris ringkasan |
| `trend` | Line chart (2 seri); fallback teks bila `tersedia=false` |
| `notes[]` | Blok "Catatan Pembinaan" |
| Tombol **Export PDF** | Panggil §5.2; sediakan opsi "sembunyikan kontak" (`include_contact=false`) |

---

## 7. Yang belum tersedia di v1 (jangan dibangun di FE dulu)

- Export massal per kelas (ZIP) dan progress polling.
- Endpoint verifikasi publik untuk mitra industri (QR saat ini hanya memuat
  `document_id`, belum ada halaman verifikasi).
- Riwayat/arsip dokumen terbit & pencabutan.
- Grafik dirender sebagai SVG di PDF (saat ini tren = tabel + teks).
