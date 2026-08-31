# PRD — PKL Placement Engine

**Modul:** Penempatan PKL (Praktik Kerja Lapangan)
**Versi dokumen:** 1.0
**Audience:** Frontend Engineer
**Status:** Draft untuk implementasi
**Sumber kebenaran visual:** `Screenshot_2026-08-30_at_22_32_01.png`

> Catatan untuk FE: dokumen ini menurunkan spesifikasi dari satu screenshot statis. Semua angka warna, spacing, dan radius adalah **hasil estimasi** dan harus diverifikasi ulang ke file desain asli (Figma) sebelum di-hardcode ke token. Yang **tidak boleh** diubah tanpa diskusi: struktur hierarki, urutan informasi, formula skor (Bagian 6), dan state machine penempatan (Bagian 7).

---

## 1. Ringkasan Produk

PKL Placement Engine adalah alat bantu keputusan untuk Kepala Jurusan dalam menempatkan siswa kelas XI ke industri mitra PKL. Sistem **tidak** menempatkan siswa secara otomatis. Sistem menghitung dan mengurutkan rekomendasi industri berdasarkan profil risiko masing-masing siswa, lalu menyerahkan keputusan final ke manusia.

**Prinsip produk yang harus terlihat di UI:**

1. **Human-in-the-loop.** Setiap layar harus mempertahankan disclaimer: *"Sistem merekomendasikan · Keputusan final ada pada Kepala Jurusan."*
2. **Transparansi skor.** Setiap rekomendasi wajib menampilkan komponen pembentuk skornya (bobot × nilai kriteria), bukan hanya angka akhir. Skor tanpa rincian dianggap bug.
3. **Prioritas berbasis risiko.** Siswa dengan risiko lebih tinggi muncul lebih dulu dan mendapat pembobotan kriteria yang berbeda.

**Tujuan utama:** mengurangi kegagalan/putus PKL dengan mencocokkan siswa berisiko ke industri yang punya kapasitas pembinaan yang sesuai.

---

## 2. Persona & Hak Akses

| Peran | Akses | Keterangan |
|---|---|---|
| Kepala Jurusan | Full (lihat + tetapkan + batalkan penempatan) | Pemilik keputusan. Ditampilkan di header kanan atas. |
| Guru Pembimbing / Wali Kelas | Read-only (asumsi) | **Perlu konfirmasi PO.** Desain saat ini hanya menggambarkan peran Kepala Jurusan. |

Header kanan atas menampilkan: avatar, nama lengkap + gelar (`EGI ARDIANSYAH, S.Pd`), dan jabatan (`Kepala Jurusan TKJ`).

---

## 3. Ruang Lingkup

### In-scope (rilis ini)
- Halaman Penempatan PKL untuk satu kelas.
- Sidebar daftar siswa, dikelompokkan dan diurutkan berdasarkan kategori risiko.
- Panel detail siswa terpilih + bobot prioritas matching.
- Kartu rekomendasi industri Top 3 dengan rincian skor.
- Aksi "Pilih Industri Ini" (menetapkan penempatan).
- Indikator progres penempatan kelas.

### Out-of-scope (rilis ini, kecuali diminta)
- CRUD data industri mitra.
- CRUD data siswa dan skor behavior/kompetensi.
- Bulk/auto placement seluruh kelas sekali klik.
- Ekspor PDF/Excel hasil penempatan.
- Notifikasi ke siswa/orang tua.

---

## 4. Design System / Token

### 4.1 Warna

```css
:root {
  /* Surface */
  --bg-page:            #F3F2FB;  /* lavender sangat muda */
  --bg-card:            #FFFFFF;
  --bg-subtle:          #F8FAFC;  /* strip "Skor dasar" */
  --bg-topbar:          #FFFFFF;

  /* Brand / Primary (indigo-violet) */
  --primary-700:        #4C3FCF;
  --primary-600:        #6357E0;  /* aksen utama, rank badge, bar kriteria */
  --primary-400:        #8B80F0;
  --primary-100:        #EDEBFE;  /* fill kartu siswa terpilih */
  --primary-050:        #F5F3FF;

  /* Teks */
  --text-strong:        #1E2233;  /* judul, nama */
  --text-body:          #334155;
  --text-muted:         #64748B;  /* metadata, subtitle */
  --text-faint:         #94A3B8;  /* disclaimer, caption */

  /* Semantic — kategori risiko */
  --risk-full:          #16A34A;  /* Siap Penuh (hijau) */
  --risk-full-bg:       #F0FDF4;
  --risk-full-border:   #BBF7D0;

  --risk-behavior:      #F59E0B;  /* Risiko Behavior (amber) */
  --risk-behavior-bg:   #FFFBEB;
  --risk-behavior-border:#FDE68A;

  --risk-competency:    #3B82F6;  /* Risiko Kompetensi (biru) */
  --risk-competency-bg: #EFF6FF;
  --risk-competency-border:#BFDBFE;

  --risk-double:        #EF4444;  /* Risiko Ganda (merah) */
  --risk-double-bg:     #FEF2F2;
  --risk-double-border: #FECACA;

  /* Lain-lain */
  --success:            #16A34A;  /* match score, checklist alasan */
  --border:             #E2E8F0;
  --border-strong:      #CBD5E1;
  --track:              #EDF0F7;  /* track progress bar kriteria */
}
```

**Aturan keras:** kategori risiko tidak boleh dibedakan **hanya** dengan warna. Setiap entitas berisiko wajib membawa badge teks (`RG` / `RB` / `RK` / `SP`) seperti pada desain. Ini bukan preferensi, ini syarat aksesibilitas.

### 4.2 Tipografi

Font keluarga geometric sans. Kandidat: **Plus Jakarta Sans** (prioritas 1) atau **Poppins** (prioritas 2). Konfirmasi ke desainer.

| Token | Ukuran / Line-height | Weight | Pemakaian |
|---|---|---|---|
| `display` | 28 / 36 | 700 | "PKL Placement Engine" |
| `h2` | 20 / 28 | 700 | Nama siswa di panel detail, nama industri |
| `score` | 32 / 36 | 800 | Angka match score (90%) |
| `progress-num` | 22 / 28 | 700 | "3/12" |
| `body` | 14 / 20 | 400–500 | Teks umum |
| `body-strong` | 14 / 20 | 600 | Nama siswa di sidebar, label kriteria dominan |
| `caption` | 12 / 16 | 400–500 | Metadata, "B:62 · K:74" |
| `overline` | 11 / 16, letter-spacing 0.08em, uppercase | 600 | "REKOMENDASI INDUSTRI — TOP 3", "BOBOT DISESUAIKAN…" |
| `badge` | 10–11 / 14 | 700 | RG, RB, RK, SP, EWS, DOMINAN |

### 4.3 Spacing, radius, shadow

- Skala spacing: 4, 8, 12, 16, 20, 24, 32.
- Radius: kartu utama `16px`; kartu industri & kartu siswa `12px`; chip/badge `999px` (pill); progress bar `999px`; kotak alasan `10px`.
- Shadow kartu utama: `0 1px 3px rgba(16,24,40,.06), 0 8px 24px rgba(16,24,40,.04)`.
- Kartu di dalam kartu (kartu industri): **tanpa shadow**, gunakan `1px solid var(--border)`.

---

## 5. Struktur Layout

```
┌─ Topbar (sticky, h=64, bg putih, border-bottom) ────────────────────────┐
│  Breadcrumb kiri                             Profil user kanan          │
└─────────────────────────────────────────────────────────────────────────┘
┌─ Page Card (max-width 1240px, margin auto, padding 24–32, radius 16) ───┐
│  Judul halaman            |            Widget Progress Penempatan       │
│  Baris filter chips risiko          |    Disclaimer sistem (kanan)       │
│  ┌──────────────┐  ┌──────────────────────────────────────────────────┐ │
│  │ Sidebar      │  │ Panel Detail (flex: 1)                           │ │
│  │ width 300px  │  │  - Header siswa terpilih                         │ │
│  │ (fixed)      │  │  - Kotak bobot prioritas                         │ │
│  │              │  │  - Label "REKOMENDASI INDUSTRI — TOP 3"          │ │
│  │              │  │  - Kartu industri #1 / #2 / #3                   │ │
│  └──────────────┘  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

- Gap antar dua kolom: `20px`.
- Sidebar: `flex: 0 0 300px`. Panel detail: `flex: 1 1 auto; min-width: 0`.
- Sidebar dan panel detail **scroll independen** pada viewport ≥1024px. Sidebar diberi `position: sticky; top: 88px; max-height: calc(100vh - 112px); overflow-y: auto;` dengan scrollbar tipis.

---

## 6. Spesifikasi Komponen

Penamaan komponen di bawah ini bebas diubah selama strukturnya sama.

### 6.1 `<Topbar />`

- Kiri: breadcrumb `Kelas X A / Penempatan PKL`. Segmen pertama berwarna `--primary-600` dan **clickable** (kembali ke daftar kelas). Separator `/` warna `--text-faint`. Segmen terakhir `--text-strong`, tidak clickable.
- Kanan: avatar bulat 40px (bg `--primary-100`, ikon user `--primary-600`), nama `body-strong`, jabatan `caption` warna `--text-muted`.
- Sticky di atas, `z-index: 50`, `border-bottom: 1px solid var(--border)`.

> ⚠️ **Inkonsistensi desain:** breadcrumb menulis "Kelas X A" sementara daftar siswa menulis "XI TKJ". Tunggu keputusan PO; jangan tebak. Sementara, ambil label kelas dari satu sumber saja: `class.name` dari API.

### 6.2 `<ProgressPenempatan />`

Kotak di kanan atas, `border: 1px solid var(--border)`, radius 12, padding 12–16, lebar ~200px.

| Elemen | Isi | Style |
|---|---|---|
| Label | "Progress Penempatan" | `caption`, `--text-muted`, rata kanan |
| Angka | `{placed}/{total}` → "3/12" | `progress-num`, `--text-strong`, rata kanan |
| Bar | fill = `placed/total × 100%` | tinggi 6px, track `--track`, fill `--risk-full`, radius pill |
| Footer | `✓ {placed} Sudah Ditempatkan · {pending} Pending` | `caption`; angka pertama hijau, "Pending" amber |

Animasi lebar bar: `width 400ms cubic-bezier(.4,0,.2,1)`. Harus update **optimistis** setelah penempatan berhasil, tanpa reload halaman.

### 6.3 `<RiskFilterChips />`

Empat chip horizontal, urutan tetap: Siap Penuh → Risiko Behavior → Risiko Kompetensi → Risiko Ganda.

- Anatomi chip: `[dot 6px] [count] [label]`, contoh: `● 5 Siap Penuh`.
- Style: pill, `padding: 6px 12px`, `border: 1px solid {risk-border}`, `background: {risk-bg}`, teks `{risk-color}`, `caption` weight 600.
- **State default: semua nonaktif (tidak ada filter aktif) = seluruh siswa tampil.**
- Perilaku: chip berfungsi sebagai **toggle filter multi-select**. Saat aktif, tambahkan `box-shadow: 0 0 0 2px {risk-color}22` dan naikkan weight border ke warna solid.
- Angka pada chip = jumlah siswa pada kategori tersebut di kelas ini (bukan hasil filter).
- Jika filter menghasilkan 0 siswa, tampilkan empty state di sidebar (lihat 8.3).

### 6.4 `<SystemDisclaimer />`

Teks di kanan baris filter: `ⓘ Sistem merekomendasikan · Keputusan final ada pada Kepala Jurusan`.
`caption`, `--text-faint`. **Tidak boleh dihilangkan pada breakpoint manapun.** Pada mobile dipindah ke bawah judul halaman, bukan dihapus.

### 6.5 `<StudentSidebar />`

Judul: `SISWA — {kelas} ({n} SISWA)` dengan style `overline`, `--text-faint`.

#### 6.5.1 `<RiskGroupHeader />`
Baris berwarna sesuai kategori, radius 8, padding `8px 12px`, `background: {risk-bg}`, `border: 1px solid {risk-border}`.

Isi: `● {Nama Kategori}` di kiri (+ badge `PRIORITAS UTAMA` khusus Risiko Ganda), `{placed}/{total} ditempatkan` di kanan (`caption`, `--text-muted`).

**Urutan grup wajib (dari atas):** Risiko Ganda → Risiko Behavior → Risiko Kompetensi → Siap Penuh. Urutan ini merefleksikan prioritas penanganan; jangan diurutkan alfabetis. Di dalam grup, urutkan ascending berdasarkan `behaviorScore + competencyScore` (yang paling butuh perhatian di atas). Siswa yang sudah ditempatkan tetap di grupnya, tapi **selalu didorong ke posisi terakhir dalam grup**.

#### 6.5.2 `<StudentCard />`

Kartu putih, radius 12, `border: 1px solid var(--border)`, padding `10px 12px`, margin-bottom 8.

| Baris | Isi | Style |
|---|---|---|
| 1 kiri | Nama siswa + badge `EWS` (opsional) | `body-strong`, `--text-strong` |
| 1 kanan | Badge kategori: `RG` / `RB` / `RK` / `SP` | pill kecil, bg `{risk-bg}`, teks `{risk-color}` |
| 2 kiri | `B:{behavior} · K:{competency}` | `caption`, `--text-muted` |
| 2 (jika ditempatkan) | `✓ {nama industri}` | `caption`, `--risk-full` |
| 2 kanan (jika ditempatkan) | `✓ Ditempatkan` | `caption`, `--risk-full` |

**State kartu siswa (wajib keempatnya diimplementasikan):**

| State | Visual |
|---|---|
| `default` | border `--border`, bg putih |
| `hover` | border `--border-strong`, `cursor: pointer`, translate-y `-1px`, transition 150ms |
| `selected` | border `2px solid var(--primary-600)`, bg `--primary-100`, nama jadi weight 700 |
| `placed` | border `1px solid var(--risk-full-border)`, bg `--risk-full-bg`, menampilkan nama industri + label "✓ Ditempatkan" |
| `selected + placed` | border primary menang; latar tetap hijau muda |
| `focus-visible` | `outline: 2px solid var(--primary-600); outline-offset: 2px` |

Kartu siswa adalah elemen interaktif → gunakan `<button>` atau `role="button"` + `tabIndex=0` + handler `Enter`/`Space`. Navigasi panah atas/bawah antar kartu adalah nilai tambah (nice-to-have).

Badge `EWS` (Early Warning System): pill amber, teks `EWS`, weight 700, uppercase. Muncul hanya jika `student.ewsActive === true`.

### 6.6 `<StudentDetailHeader />`

Kartu di atas panel kanan. `border: 1px solid {risk-border-siswa}` (amber untuk Risiko Behavior), radius 12, padding 16.

- Baris 1: nama siswa (`h2`) + badge `⚠ EWS AKTIF` (amber).
- Baris 2: `{kelas} · B:{behavior} · K:{competency}` — `caption`, `--text-muted`.
- Baris 3: **alasan EWS** dalam warna kategori, contoh: `Tren penurunan behavior score 4 minggu`. Teks ini datang dari API (`student.ewsReason`), bukan hardcode.
- Kanan: pill kategori risiko besar, `● Risiko Behavior`, `border: 1px solid {risk-color}`, teks `{risk-color}`, padding `8px 14px`.

Jika `ewsActive === false`: sembunyikan badge dan baris 3; border kartu tetap mengikuti warna kategori risiko.

### 6.7 `<MatchingWeights />`

Kotak `border: 1px solid var(--border)`, radius 10, padding 12.

- Label: `Prioritas matching untuk {Nama Kategori Risiko}:` — `caption` weight 600.
- Chip bobot berjajar: `Kedisiplinan 40% ★`, `Supervisor 30% ★`, `Mentoring 10%`, `SKKNI 10%`, `Track Record 10%`.
- Chip **dominan** (bertanda ★): bg `--risk-behavior-bg`, border `--risk-behavior-border`, teks amber gelap, weight 700.
- Chip non-dominan: bg `#F8FAFC`, border `--border`, teks `--text-muted`.
- Aturan ★: tampilkan pada kriteria dengan bobot ≥ 25%. Kalkulasi di FE dari array bobot, jangan hardcode per kategori.

**Interaksi:** untuk rilis ini komponen ini **read-only**. Bobot ditentukan server berdasarkan kategori risiko siswa. Editable weights adalah kandidat rilis berikutnya (lihat Bagian 12).

### 6.8 `<IndustryRecommendationCard />`

Komponen terpenting. Diulang tepat 3 kali (Top 3). Kartu putih, `border: 1px solid var(--border)`, radius 12, padding 16, gap antar kartu 16.

**A. Header kartu**
- Kiri: badge rank `#1` (`--primary-600`, weight 800) + nama industri (`h2`).
- Baris di bawahnya: `{bidang} · {kota} · {jarak} km · {slot} slot tersedia` — `caption`, `--text-muted`.
- Kanan: `{matchScore}%` dengan style `score` warna `--success`, di bawahnya caption `match score` warna `--text-faint`.

**B. Strip skor dasar**
Strip full-width, bg `--bg-subtle`, radius 8, padding `6px 10px`:
`Skor dasar: {baseScore}` + `▲ +{evaluatorBonus} evaluator aktif` (segitiga dan angka warna hijau).
Jika `evaluatorBonus === 0`, sembunyikan bagian bonus, jangan tampilkan "+0".

**C. Label pembobotan**
`— BOBOT DISESUAIKAN PROFIL {KATEGORI RISIKO}` dengan style `overline`, warna `--primary-600`.

**D. Baris kriteria (`<CriteriaRow />`) — diulang 5 kali**

Struktur satu baris:
```
[bar aksen 3px kiri (hanya jika dominan)] Label  [chip DOMINAN]  ....  [chip bobot 40%] [nilai 80]
[───────── progress bar, tinggi 4px ─────────────────────────────────]
```
- Label: `body`, weight 600 jika dominan (dan warna `--primary-700`), weight 400 jika tidak.
- Chip `DOMINAN`: pill kecil, bg `--primary-050`, teks `--primary-600`, `badge` style. Muncul untuk kriteria dengan bobot ≥ 25%.
- Chip bobot: `caption`, `--text-muted`, bg `#F1F5F9`, radius 6, padding `2px 6px`.
- Nilai: `body-strong`, `--text-strong`, rata kanan, lebar kolom tetap 28px agar angka 2 dan 3 digit tetap sejajar.
- Progress bar: track `--track`, fill `--primary-600` (gunakan `--primary-400` untuk kriteria non-dominan agar hierarki terbaca), `width: {nilai}%`, radius pill, tinggi 4px.

Lima kriteria dengan urutan tetap: **Kedisiplinan → Pengalaman Supervisor → Kemauan Membimbing Teknis → Relevansi Unit SKKNI → Track Record (Profil Ini)**. Urutan dari API, jangan diurutkan ulang di FE.

**E. Kotak alasan (`<ReasoningBox />`)**
Bg `--risk-full-bg`, border `1px solid var(--risk-full-border)`, radius 10, padding 12.
Berisi 2–4 baris, masing-masing diawali `✓` hijau, teks `caption`/`body` warna `--text-body`. Konten murni dari API (`reasons: string[]`). Jangan menyusun kalimat alasan di FE.

**F. Footer meta**
`{n} angkatan, {m} siswa` + separator `·` + `● Aktif mengisi evaluasi` (dot hijau). Field opsional seperti `narasumber riset` disisipkan sebagai tag tambahan sebelum status evaluasi.

**G. CTA `Pilih Industri Ini`**
Tombol full-width, tinggi 44px, radius 10, `border: 1.5px solid var(--primary-600)`, teks `--primary-600` weight 700, bg transparan.
- `hover`: bg `--primary-050`.
- `active`: bg `--primary-100`.
- `loading`: teks diganti spinner + "Menempatkan…", tombol disabled.
- `disabled` (slot habis / siswa sudah ditempatkan): border & teks `--border-strong`, `cursor: not-allowed`, tooltip alasan.
- Jika industri ini **sudah** dipilih untuk siswa aktif: ubah menjadi tombol solid hijau `✓ Ditempatkan di sini` + link teks kecil `Batalkan penempatan`.

---

## 7. Logika Perhitungan Skor

Perhitungan dilakukan di **backend**. FE hanya menampilkan. Namun FE wajib memahami formula agar bisa mendeteksi data tidak konsisten dan menulis unit test tampilan.

```
baseScore   = round( Σ (bobot_i × nilai_i) )        untuk i = 1..5, Σ bobot_i = 1.00
matchScore  = min( 100, baseScore + evaluatorBonus )
```

Verifikasi terhadap data pada desain:

| Industri | Perhitungan | baseScore | +bonus | matchScore |
|---|---|---|---|---|
| PT. Solusi Jaringan Makassar | .4(80)+.3(100)+.1(80)+.1(83)+.1(62) = 84.5 | 85 | 5 | **90%** ✓ |
| CV. Teknindo Makassar | .4(100)+.3(80)+.1(60)+.1(50)+.1(80) = 83.0 | 83 | 5 | **88%** ✓ |
| Rama Komputer | .4(100)+.3(80)+.1(60)+.1(33)+.1(85) = 81.8 | 82 | 5 | **87%** ✓ |

**Aturan tampilan:**
1. Pembulatan half-up ke bilangan bulat. Tidak ada desimal di UI.
2. `matchScore` di-cap pada 100. Nilai 103 adalah bug tampilan yang harus dicegah di FE juga, bukan hanya di BE.
3. FE menambahkan **assertion di development mode**: jika `|Σ(bobot × nilai) − baseScore| > 1`, tampilkan warning di console. Ini menyelamatkan Anda dari data BE yang diam-diam salah.
4. Warna `matchScore`: ≥85 hijau (`--success`), 70–84 amber, <70 abu (`--text-muted`). Konfirmasi threshold ke PO.

---

## 8. Alur Interaksi & State Machine

### 8.1 Alur utama
1. Halaman dimuat → sistem otomatis memilih **siswa prioritas tertinggi yang belum ditempatkan** (grup Risiko Ganda paling atas). Panel kanan langsung terisi. Tidak boleh ada layar kosong saat pertama masuk.
2. Kepala Jurusan mengklik kartu siswa lain → panel kanan memuat ulang (skeleton, bukan blank).
3. Membaca Top 3 rekomendasi + rincian bobot.
4. Klik `Pilih Industri Ini` → **modal konfirmasi** muncul (lihat 8.2).
5. Konfirmasi → API call → sukses:
   - kartu siswa di sidebar berubah ke state `placed` dan bergeser ke bawah grup,
   - counter grup `1/4 → 2/4` bertambah,
   - widget progress `3/12 → 4/12` bertambah,
   - toast sukses muncul,
   - fokus otomatis pindah ke siswa berikutnya yang belum ditempatkan.

### 8.2 Modal konfirmasi (tidak ada di screenshot, tetap wajib dibuat)
Penempatan mengubah data dan menghabiskan slot industri. Aksi ini **tidak boleh** satu klik.

Isi modal: nama siswa, nama industri, match score, sisa slot setelah penempatan, tombol `Batal` dan `Tetapkan Penempatan`.

### 8.3 Aturan slot
- `slot tersedia` berkurang 1 setiap penempatan berhasil. FE harus refetch atau update cache setelah penempatan agar siswa berikutnya tidak melihat slot basi.
- Jika `slot === 0`: kartu industri tetap tampil (untuk transparansi) tetapi CTA disabled dengan label `Slot penuh`. Kartu diberi opacity 0.7.
- **Race condition:** jika BE menolak karena slot sudah habis diambil user lain, tampilkan error toast spesifik dan refetch rekomendasi, jangan tampilkan error generic.

### 8.4 Pembatalan penempatan
Harus ada. Tanpa ini, satu salah klik jadi permanen. Aksi `Batalkan penempatan` mengembalikan siswa ke state `unplaced` dan mengembalikan slot industri. Wajib pakai modal konfirmasi juga.

### 8.5 Penempatan manual di luar rekomendasi
Pada desain, siswa `Joko Santoso` ditempatkan di "Guru Komputer" dan `Eka Saputra` di "AIC / Indigo Telkom" — keduanya tidak ada di daftar Top 3 manapun. Artinya **harus ada jalur penempatan manual** (pilih industri dari daftar lengkap, di luar rekomendasi). Alur ini belum digambar. Untuk rilis ini, tambahkan link teks di bawah kartu #3: `Tempatkan ke industri lain…` yang membuka modal pencarian industri.

---

## 9. State UI Wajib

| State | Perilaku |
|---|---|
| **Loading awal** | Skeleton: sidebar 6 kartu abu, panel kanan 1 header + 3 kartu skeleton. Bukan spinner tengah layar. |
| **Loading panel** (ganti siswa) | Sidebar tetap interaktif; hanya panel kanan yang skeleton. |
| **Empty — filter tanpa hasil** | Ilustrasi kecil + "Tidak ada siswa pada filter ini" + tombol `Reset filter`. |
| **Empty — tidak ada rekomendasi** | "Belum ada industri mitra yang cocok dengan profil siswa ini" + saran aksi (`Tempatkan manual` / `Tambah mitra industri`). Jangan tampilkan kartu kosong. |
| **Rekomendasi < 3** | Tampilkan apa adanya (1 atau 2 kartu). Judul berubah jadi `REKOMENDASI INDUSTRI — TOP {n}`. Jangan render placeholder. |
| **Error fetch** | Kartu error inline dengan tombol `Coba lagi`. Tidak menghapus data yang sudah tampil. |
| **Semua siswa sudah ditempatkan** | Widget progress jadi hijau penuh + banner "Penempatan kelas ini selesai (12/12)". |
| **Offline / gagal simpan** | Rollback update optimistis + toast error, state kembali ke sebelum aksi. |

---

## 10. Data Contract (usulan)

Sepakati ini dengan BE sebelum mulai coding. Jangan mulai dari mock yang bentuknya beda dari API final.

### `GET /api/classes/{classId}/placement`
```json
{
  "class": { "id": "c-xi-tkj-1", "name": "XI TKJ", "studentCount": 12 },
  "progress": { "placed": 3, "total": 12, "pending": 9 },
  "riskSummary": [
    { "code": "SP", "label": "Siap Penuh",        "count": 5, "placed": 2 },
    { "code": "RB", "label": "Risiko Behavior",   "count": 4, "placed": 1 },
    { "code": "RK", "label": "Risiko Kompetensi", "count": 2, "placed": 0 },
    { "code": "RG", "label": "Risiko Ganda",      "count": 1, "placed": 0, "priority": true }
  ],
  "students": [
    {
      "id": "s-001",
      "name": "Hamdan Rizki",
      "riskCode": "RB",
      "behaviorScore": 62,
      "competencyScore": 74,
      "ewsActive": true,
      "ewsReason": "Tren penurunan behavior score 4 minggu",
      "placement": null
    },
    {
      "id": "s-004",
      "name": "Joko Santoso",
      "riskCode": "RB",
      "behaviorScore": 58,
      "competencyScore": 71,
      "ewsActive": false,
      "ewsReason": null,
      "placement": {
        "industryId": "i-090",
        "industryName": "Guru Komputer",
        "placedAt": "2026-08-21T04:12:00Z",
        "placedBy": "Egi Ardiansyah",
        "source": "manual"
      }
    }
  ]
}
```

### `GET /api/students/{studentId}/recommendations`
```json
{
  "student": { "id": "s-001", "name": "Hamdan Rizki", "riskCode": "RB", "riskLabel": "Risiko Behavior" },
  "weightProfile": {
    "label": "Prioritas matching untuk Risiko Behavior",
    "criteria": [
      { "key": "kedisiplinan",  "label": "Kedisiplinan",              "weight": 0.40 },
      { "key": "supervisor",    "label": "Pengalaman Supervisor",     "weight": 0.30 },
      { "key": "mentoring",     "label": "Kemauan Membimbing Teknis", "weight": 0.10 },
      { "key": "skkni",         "label": "Relevansi Unit SKKNI",      "weight": 0.10 },
      { "key": "trackRecord",   "label": "Track Record (Profil Ini)", "weight": 0.10 }
    ]
  },
  "recommendations": [
    {
      "rank": 1,
      "industryId": "i-011",
      "name": "PT. Solusi Jaringan Makassar",
      "field": "Teknologi Jaringan",
      "city": "Makassar",
      "distanceKm": 3,
      "slotsAvailable": 2,
      "baseScore": 85,
      "evaluatorBonus": 5,
      "matchScore": 90,
      "criteriaScores": [
        { "key": "kedisiplinan", "value": 80,  "weight": 0.40, "dominant": true },
        { "key": "supervisor",   "value": 100, "weight": 0.30, "dominant": true },
        { "key": "mentoring",    "value": 80,  "weight": 0.10, "dominant": false },
        { "key": "skkni",        "value": 83,  "weight": 0.10, "dominant": false },
        { "key": "trackRecord",  "value": 62,  "weight": 0.10, "dominant": false }
      ],
      "reasons": [
        "Kedisiplinan tinggi (4/5) — faktor bobot terbesar untuk Risiko Behavior",
        "Supervisor berpengalaman (5/5) — pembimbing terstruktur tersedia",
        "Track record: 62% siswa profil serupa berhasil — memadai"
      ],
      "meta": { "cohorts": 2, "studentsHosted": 9, "tags": [], "evaluationActive": true }
    }
  ]
}
```

### `POST /api/placements`
```json
{ "studentId": "s-001", "industryId": "i-011", "source": "recommendation", "rank": 1 }
```
Respons sukses mengembalikan objek `placement` + `progress` + `slotsAvailable` terbaru, agar FE tidak perlu refetch penuh.

### `DELETE /api/placements/{placementId}`

**Kode error yang harus ditangani FE secara spesifik:** `SLOT_UNAVAILABLE`, `STUDENT_ALREADY_PLACED`, `FORBIDDEN_ROLE`.

---

## 11. Responsif

Desain ini lahir sebagai layout desktop lebar (~1240px). Perlakuan breakpoint:

| Breakpoint | Perilaku |
|---|---|
| ≥1280px | Sesuai desain. Sidebar 300px sticky. |
| 1024–1279px | Sidebar 260px. Font `display` turun ke 24px. Metadata industri boleh wrap 2 baris. |
| 768–1023px | Kolom menjadi vertikal (stack). Sidebar menjadi daftar horizontal scrollable **atau** panel `Pilih Siswa` yang bisa dilipat. Widget progress pindah ke bawah judul, full-width. |
| <768px | Pola master-detail: layar 1 = daftar siswa, ketuk siswa → layar 2 = rekomendasi dengan tombol back. Kartu kriteria tetap menampilkan bar + angka; jangan sembunyikan rincian skor. Transparansi skor adalah inti produk. |

Elemen yang **tidak boleh** hilang di breakpoint manapun: badge kategori risiko, angka match score, rincian 5 kriteria, disclaimer sistem.

---

## 12. Aksesibilitas (target WCAG 2.1 AA)

1. Rasio kontras teks normal ≥ 4.5:1. Periksa terutama `--text-faint` (#94A3B8) di atas putih — nilainya ~2.8:1, **gagal**. Untuk teks disclaimer, gunakan minimal `#64748B`.
2. Semua informasi berwarna diulang dalam teks (badge RG/RB/RK/SP). Sudah benar di desain, pertahankan.
3. Progress bar kriteria: `role="progressbar"` + `aria-valuenow` + `aria-label="{label} {nilai} dari 100"`.
4. Kartu siswa: elemen fokusable, `aria-selected` pada kartu aktif, `aria-current="true"`.
5. Perubahan panel setelah memilih siswa diumumkan via `aria-live="polite"`: "Menampilkan rekomendasi untuk Hamdan Rizki".
6. Modal konfirmasi: focus trap, tutup dengan `Esc`, fokus kembali ke tombol pemicu.
7. Target sentuh minimum 44×44px pada mobile.
8. Hormati `prefers-reduced-motion` untuk animasi bar.

---

## 13. Acceptance Criteria (checklist QA)

- [ ] Angka `matchScore` = `baseScore + evaluatorBonus`, di-cap di 100.
- [ ] Lebar setiap progress bar kriteria = `nilai%` dari track, akurat ±1px.
- [ ] Urutan grup risiko: Ganda → Behavior → Kompetensi → Siap Penuh.
- [ ] Chip `DOMINAN` dan `★` muncul tepat pada kriteria berbobot ≥25%, dihitung dari data.
- [ ] Kartu siswa memiliki 4 state visual yang berbeda dan terlihat jelas.
- [ ] Siswa yang sudah ditempatkan menampilkan nama industri + "✓ Ditempatkan".
- [ ] Penempatan memicu modal konfirmasi; tidak ada penempatan satu klik.
- [ ] Setelah penempatan: counter grup, widget progress, dan sisa slot ter-update tanpa reload.
- [ ] Penempatan dapat dibatalkan dan slot kembali.
- [ ] Filter chip multi-select berfungsi dan punya empty state.
- [ ] Disclaimer "Keputusan final ada pada Kepala Jurusan" tampil di semua breakpoint.
- [ ] Tidak ada teks alasan (`reasons`) yang disusun di frontend.
- [ ] Semua state loading/empty/error terimplementasi.
- [ ] Navigasi keyboard penuh dari topbar → filter → daftar siswa → kartu industri → CTA.
- [ ] Lighthouse Accessibility ≥ 90.

---

## 14. Non-Functional

- Waktu render panel rekomendasi setelah klik siswa < 300ms (dengan cache) atau < 1.2s (fetch baru).
- Data rekomendasi di-cache per `studentId` selama sesi; invalidasi setelah ada penempatan baru pada kelas yang sama.
- Bundle: hindari library chart untuk bar kriteria. Itu hanya `div` dengan `width` persen. Menambah 40KB untuk lima garis lurus adalah keputusan buruk.
- Tidak ada kalkulasi skor di frontend selain assertion development.

---

## 15. Pertanyaan Terbuka & Risiko Desain

Bagian ini harus dijawab PO/desainer **sebelum** FE mulai. Jika dilewati, ini akan jadi rework.

| # | Isu | Dampak jika tidak dijawab |
|---|---|---|
| 1 | Breadcrumb "Kelas X A" vs daftar "XI TKJ" — mana yang benar? | Label kelas salah di seluruh halaman. |
| 2 | `+5 evaluator aktif` identik di ketiga industri. Konstanta atau hasil hitung? | FE salah asumsi; skor bisa salah tampil. |
| 3 | Empat siswa Risiko Behavior kemungkinan besar menerima Top 3 yang sama, sementara slot terbatas (2–3). Bagaimana sistem mencegah rebutan slot? | Rekomendasi terlihat pintar tapi tidak bisa dieksekusi untuk siswa ke-3 dan ke-4. Ini cacat logika produk, bukan cacat UI. |
| 4 | Alur penempatan manual (kasus Joko Santoso & Eka Saputra) belum didesain. | Fitur tidak bisa dipakai untuk ±25% kasus nyata. |
| 5 | Apakah bobot kriteria dapat diubah Kepala Jurusan? Ikon ★ menyiratkan interaktif. | Salah ekspektasi user; komponen perlu dibangun ulang. |
| 6 | Tidak ada modal konfirmasi, undo, atau riwayat perubahan dalam desain. | Kesalahan penempatan bersifat permanen. |
| 7 | Threshold warna match score (hijau/amber/merah) belum ditentukan. | Angka 62% dan 90% terlihat sama pentingnya. |
| 8 | "Track record 62% — memadai": siapa yang menetapkan bahwa 62% memadai? | Kredibilitas rekomendasi runtuh saat diuji penguji/pengguna. |
| 9 | Belum ada desain mobile, padahal Kepala Jurusan kemungkinan mengakses via HP. | Fitur tidak terpakai di lapangan. |
| 10 | Belum ada audit trail (siapa menempatkan, kapan, atas dasar skor berapa). | Tidak bisa dipertanggungjawabkan saat diaudit sekolah/penguji. |

---

**Aturan penutup untuk FE:** jika ada konflik antara dokumen ini dan screenshot, screenshot menang untuk urusan visual, dokumen ini menang untuk urusan logika dan state. Jika keduanya diam, tanyakan — jangan menebak.
