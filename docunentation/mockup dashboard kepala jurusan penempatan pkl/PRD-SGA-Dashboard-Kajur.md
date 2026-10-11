# PRD — SGA Dashboard Kepala Jurusan (Web)

**Produk:** Skill Gap Advisor (SGA) — Prakersa
**Modul:** Dashboard Monitoring Kepala Jurusan
**Versi:** 1.0
**Audiens dokumen:** Frontend Developer
**Status desain:** Final visual (mengacu ke mockup `Screenshot_2026-09-01_at_01_44_59.png`)

---

## 1. Tujuan & Konteks

Dashboard ini adalah layar utama bagi **Kepala Jurusan / Guru PKL** untuk memantau kesiapan kerja siswa dalam dua dimensi: **Behavior Score** (kedisiplinan, kehadiran, keterlambatan) dan **Skor Kompetensi** (nilai praktikum/mapel produktif).

Output utama layar:
1. Ringkasan populasi siswa dalam 5 angka (KPI).
2. Segmentasi siswa ke dalam 4 kuadran risiko.
3. Daftar siswa yang butuh tindakan segera (Early Warning).

**Prinsip build:** hasil akhir harus **identik secara visual** dengan mockup. Tidak ada improvisasi warna, radius, spacing, atau ikon tanpa konfirmasi ke UI/UX (Arsil).

---

## 2. Ruang Lingkup

### In scope (v1.0)
- Header aplikasi + identitas user + badge EWS.
- Tab filter kelas.
- 5 kartu KPI.
- Panel "Profile Data Siswa" (mode kuadran/list).
- Panel "Early Warning".
- State: loading (skeleton), empty, error.
- Responsive desktop → tablet → mobile.

### Out of scope (v1.0)
- Halaman detail siswa (drill-down) — hanya siapkan handler `onStudentClick`.
- Mode chart (scatter plot) — tombol toggle **dibuat dan terlihat**, tapi cukup `disabled` + tooltip "Segera hadir" sampai spesifikasi chart turun.
- Input data behavior/kompetensi.
- Export PDF/Excel.
- Autentikasi (asumsikan user sudah login, data user datang dari session).

---

## 3. Design Tokens

Buat sebagai CSS variables / Tailwind theme extension. **Jangan hardcode hex di komponen.**

### 3.1 Warna

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-primary` | `#6366F1` | Tab aktif, progress bar Total Siswa, avatar user |
| `--color-primary-hover` | `#4F46E5` | Hover tab/tombol |
| `--color-primary-soft` | `#EEF2FF` | Background toggle aktif (soft) |
| `--color-success` | `#22C55E` | Siap Penuh |
| `--color-success-bg` | `#F0FDF4` | Background kuadran Siap Penuh |
| `--color-warning` | `#F97316` | Risiko Behavior |
| `--color-warning-bg` | `#FFF7ED` | Background kuadran Risiko Behavior + note EWS |
| `--color-warning-text` | `#B45309` | Teks badge "7 EWS Aktif" |
| `--color-info` | `#3B82F6` | Risiko Kompetensi |
| `--color-info-bg` | `#EFF6FF` | Background kuadran Risiko Kompetensi + note EWS |
| `--color-danger` | `#EF4444` | Risiko Ganda |
| `--color-danger-strong` | `#DC2626` | Badge count Early Warning |
| `--color-danger-bg` | `#FEF2F2` | Background kuadran Risiko Ganda + note EWS |
| `--color-page-bg` | `#F4F5F7` | Background halaman |
| `--color-surface` | `#FFFFFF` | Kartu, header, panel |
| `--color-border` | `#E9EAEE` | Border kartu, divider |
| `--color-border-dashed` | `#CBD5E1` | Garis pemisah kuadran (dashed) |
| `--color-text-primary` | `#0F172A` | Judul, angka KPI, nama |
| `--color-text-secondary` | `#64748B` | Subjudul, label kelas |
| `--color-text-muted` | `#94A3B8` | Tab non-aktif, caption |
| `--color-track` | `#EDEEF2` | Track progress bar KPI |

**Aturan turunan warna risiko.** Setiap kategori punya trio `main / bg / onMain`. Simpan sebagai map agar komponen cukup menerima `variant`:

```ts
const RISK_THEME = {
  siap_penuh:        { main: '#22C55E', bg: '#F0FDF4', onMain: '#FFFFFF' },
  risiko_behavior:   { main: '#F97316', bg: '#FFF7ED', onMain: '#FFFFFF' },
  risiko_kompetensi: { main: '#3B82F6', bg: '#EFF6FF', onMain: '#FFFFFF' },
  risiko_ganda:      { main: '#EF4444', bg: '#FEF2F2', onMain: '#FFFFFF' },
} as const;
```

### 3.2 Tipografi

Font family: **Poppins** (fallback: `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`). Load weight 400, 500, 600, 700 saja.

| Style | Size / Line-height | Weight | Letter-spacing |
|---|---|---|---|
| `h1` — Judul app | 32 / 40 | 700 | -0.01em |
| `subtitle-app` | 15 / 22 | 400 | 0 |
| `h2` — Judul panel | 22 / 30 | 700 | -0.01em |
| `panel-caption` | 13 / 20 | 400 | 0 |
| `kpi-label` | 12 / 16 | 600 | 0.06em, UPPERCASE |
| `kpi-value` | 34 / 40 | 700 | -0.02em |
| `tab-label` | 15 / 20 | 500 | 0 |
| `chip-label` | 13 / 18 | 500 | 0 |
| `legend-label` | 11 / 16 | 600 | 0.05em, UPPERCASE |
| `quadrant-title` | 17 / 24 | 700 | 0 |
| `user-name` | 14 / 20 | 700 | 0.02em, UPPERCASE |
| `user-role` | 13 / 18 | 400 | 0 |
| `ews-name` | 15 / 22 | 600 | 0 |
| `ews-class` | 13 / 18 | 400 | 0 |
| `ews-note` | 13 / 20 | 400 | 0 |

### 3.3 Spacing, Radius, Shadow

- **Spacing scale:** 4px base → `4, 8, 12, 16, 20, 24, 32, 40`.
- **Radius:** `--radius-card: 16px`, `--radius-panel-inner: 14px`, `--radius-tab: 12px`, `--radius-pill: 999px`, `--radius-badge: 8px`.
- **Shadow kartu:** `0 1px 2px rgba(16,24,40,0.04), 0 4px 12px rgba(16,24,40,0.05)`.
- **Shadow header:** `0 1px 0 rgba(16,24,40,0.04)`.
- **Border kartu:** `1px solid var(--color-border)`.

---

## 4. Layout & Grid

```
┌──────────────────────────────────────────────────────────┐
│ AppHeader (full width, bg putih, padding 24px 32px)      │
├──────────────────────────────────────────────────────────┤ ← bg halaman #F4F5F7
│  ClassTabs                                    (mt 24)    │
│  KpiRow — 5 kolom, gap 20                     (mt 24)    │
│  MainGrid — gap 24                            (mt 24)    │
│  ┌───────────────────────────┬────────────────────────┐  │
│  │ Panel Profile Data Siswa  │ Panel Early Warning    │  │
│  │        (1fr)              │      (380px fixed)     │  │
│  └───────────────────────────┴────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

- Container max-width: **1440px**, `margin: 0 auto`.
- Padding horizontal konten: **32px** (desktop).
- `MainGrid`: `grid-template-columns: minmax(0, 1fr) 380px`.
- Tinggi panel kiri dan kanan **tidak dipaksa sama**; panel kanan `align-self: start`.

---

## 5. Spesifikasi Komponen

### 5.1 `<AppHeader />`

**Anatomi:** flex row, `justify-content: space-between`, `align-items: center`.

**Kiri:**
- `h1`: "Skill Gap Advisor".
- Subtitle: `{namaSekolah} · TA {tahunAjaran} · Semester {semester}` — separator titik tengah `·` dengan spasi di kiri-kanan.

**Kanan (flex row, gap 20):**
- `<EwsBadge count={7} />`
- `<UserChip />`

**Props:**
```ts
interface AppHeaderProps {
  schoolName: string;
  academicYear: string;   // "2025/2026"
  semester: string;       // "Genap"
  ewsCount: number;
  user: { name: string; role: string; avatarUrl?: string };
}
```

---

### 5.2 `<EwsBadge />`

- Pill: bg `--color-warning-bg`, teks `--color-warning-text`, radius pill, padding `8px 14px`.
- Isi: ikon segitiga peringatan (16px, stroke 1.5) + teks `{count} EWS Aktif`, font 13/500.
- **Tidak clickable di v1.0.** Siapkan prop `onClick?` opsional.
- Jika `count === 0`: badge disembunyikan sepenuhnya.

---

### 5.3 `<UserChip />`

- Avatar: lingkaran 44px, bg `--color-primary`, ikon user putih di tengah. Jika `avatarUrl` ada → tampilkan gambar dengan `object-fit: cover`.
- Teks kanan (stack, gap 2): nama (style `user-name`), role (style `user-role`, warna secondary).
- Tidak ada dropdown di v1.0.

---

### 5.4 `<ClassTabs />`

- Container: bg putih, radius `--radius-card`, padding 8px, border `--color-border`, `display: inline-flex`, gap 4.
- Tab item: padding `12px 24px`, radius `--radius-tab`, style `tab-label`.
  - **Aktif:** bg `--color-primary`, teks putih, weight 600.
  - **Non-aktif:** bg transparan, teks `--color-text-muted`.
  - **Hover (non-aktif):** bg `#F8F9FB`, teks `--color-text-secondary`.
  - **Focus-visible:** outline 2px `--color-primary`, offset 2px.
- Transisi: `background-color 150ms ease, color 150ms ease`.

**Props:**
```ts
interface ClassTabsProps {
  items: { id: string; label: string }[]; // item pertama selalu { id: 'all', label: 'Semua Kelas' }
  activeId: string;
  onChange: (id: string) => void;
}
```

**Behavior:** klik tab → memicu refetch data KPI + kuadran + EWS untuk kelas terpilih. Selama fetch, tampilkan skeleton (lihat §7). Tab yang aktif **tidak** ikut disabled saat loading, tapi tab lain di-`aria-disabled` agar tidak antre request.

**Overflow:** jika jumlah kelas > 6, container jadi horizontal scroll dengan `scrollbar-width: none` dan fade gradient di ujung kanan.

---

### 5.5 `<KpiCard />` dan `<KpiRow />`

**`KpiRow`:** `grid-template-columns: repeat(5, minmax(0, 1fr))`, gap 20.

**`KpiCard` anatomi (top → bottom, gap 12):**
1. Label uppercase (style `kpi-label`, warna `--color-text-secondary`).
2. Angka (style `kpi-value`, warna `--color-text-primary`). Format ribuan **tanpa** separator sesuai mockup (`1427`, bukan `1.427`) — konfirmasi ke PO jika ingin diubah, tapi build sesuai mockup dulu.
3. Progress bar: tinggi 6px, radius pill, track `--color-track`, fill warna sesuai variant.

**Aturan lebar fill progress bar** (ini yang sering salah — baca teliti):
- Card **Total Siswa**: fill selalu **100%**.
- Card lain: `fill% = (value / totalSiswa) * 100`, dengan **minimum 8%** agar bar tidak tampak kosong saat nilainya kecil (contoh: 7 dari 1427 = 0.49% → render 8%).
- Nilai `0` → fill 0% (bar kosong, tetap tampil track).

**Props:**
```ts
interface KpiCardProps {
  label: string;
  value: number;
  total: number;                     // untuk hitung rasio bar
  variant: 'primary' | 'success' | 'warning' | 'info' | 'danger';
  isTotal?: boolean;                 // true → bar 100%
}
```

**Padding card:** `24px`. **Card:** bg surface, radius card, border, shadow kartu.

---

### 5.6 `<PanelCard />` (wrapper reusable)

Digunakan oleh Profile Data Siswa dan Early Warning.
- bg surface, radius card, border, shadow kartu, padding `28px`.
- Slot: `title`, `caption`, `headerRight`, `children`.

---

### 5.7 `<QuadrantMatrix />` — Panel "Profile Data Siswa"

#### Header panel
- Baris 1: `h2` "Profile Data Siswa" (kiri) + `<QuadrantLegend />` (kanan).
- Baris 2: caption `Behavior Score × Skor Kompetensi · Threshold: {threshold}` (kiri) + label "Filter" + `<ViewToggle />` (kanan).
- `threshold` datang dari API, **jangan hardcode 70**.

#### `<QuadrantLegend />`
4 item horizontal, gap 20. Tiap item: dot 8px (radius pill, warna `main` kategori) + label uppercase (style `legend-label`, warna `--color-text-secondary`).
Urutan: SIAP PENUH → RISIKO BEHAVIOR → RISIKO KOMPETENSI → RISIKO GANDA.

#### `<ViewToggle />`
- Container: bg `#F4F5F7`, radius 12px, padding 4px, inline-flex gap 4.
- 2 tombol ikon 36×36, radius 8px:
  - `list` (ikon 3 garis horizontal) — **aktif default**, bg `--color-primary`, ikon putih.
  - `chart` (ikon gelombang/activity) — non-aktif, ikon `--color-text-muted`.
- Di v1.0 tombol `chart` **disabled** + `title="Segera hadir"`. Tetap render agar layout final.

#### Grid kuadran
- Wrapper: `display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto;` — **tanpa gap**.
- Pemisah visual pakai **border dashed 1px** warna `--color-border-dashed`:
  - Kolom kiri: `border-right: 1px dashed`.
  - Baris atas: `border-bottom: 1px dashed`.
- Radius: sudut luar wrapper 14px, `overflow: hidden` agar background sel terpotong rapi.
- Tiap sel: padding `24px`, `min-height: 320px`.

**Posisi sel (WAJIB persis):**

| | Kolom kiri | Kolom kanan |
|---|---|---|
| **Baris atas** | Risiko Behavior (`warning`) | Siap Penuh (`success`) |
| **Baris bawah** | Risiko Ganda (`danger`) | Risiko Kompetensi (`info`) |

#### `<QuadrantCell />`
- bg = `RISK_THEME[variant].bg`.
- Judul (style `quadrant-title`, warna `--color-text-primary`), margin-bottom 20.
- Isi: `<StudentChipGrid />`.
- **Layout chip per sel:**
  - Risiko Behavior & Siap Penuh: `grid-template-columns: repeat(2, minmax(0, 1fr))`, gap 12.
  - Risiko Ganda & Risiko Kompetensi: `grid-template-columns: minmax(0, max-content)` (1 kolom), gap 12.
  - Alasan: mengikuti mockup persis. Jadikan prop `columns: 1 | 2` supaya bisa diubah tanpa menyentuh isi komponen.

#### `<StudentChip />`
- Pill: bg `RISK_THEME[variant].main`, teks putih, radius pill, padding `6px 14px 6px 6px`, inline-flex, gap 8, `width: max-content`.
- Avatar: lingkaran 24px, bg putih, ikon user 14px warna `main` (opacity ~0.7).
- Nama: style `chip-label`, warna putih, `white-space: nowrap`, `text-overflow: ellipsis`, `max-width: 160px`.
- **Hover:** `transform: translateY(-1px)`, shadow `0 4px 10px rgba(0,0,0,0.12)`, cursor pointer.
- **Klik:** panggil `onStudentClick(studentId)` — v1.0 cukup `console.log` / no-op yang aman.
- **Tooltip on hover:** tampilkan `Behavior: {behaviorScore} · Kompetensi: {competencyScore}`. Gunakan tooltip native (`title`) jika belum ada komponen tooltip.

#### `<QuadrantPagination />`
- Muncul **hanya jika** jumlah siswa di sel melebihi `pageSize`.
- Posisi: bottom sel, flex row `justify-content: space-between`, margin-top 20.
- 2 tombol ikon panah (← →), 32×32, radius pill, bg transparan, ikon warna `main` kategori.
- **Disabled state:** opacity 0.35, `cursor: not-allowed`, `pointer-events: none`.
- `pageSize` default: **12** untuk sel 2-kolom, **7** untuk sel 1-kolom. Jadikan prop.
- Pagination bersifat **client-side** terhadap array yang dikirim API untuk kelas terpilih.

> ⚠️ **Catatan kapasitas — baca sebelum coding.** Mockup menampilkan ±30 chip untuk 1427 siswa. Dengan data asli, sel "Siap Penuh" bisa berisi ratusan nama. Implementasikan `pageSize` + pagination **dari awal**, dan tampilkan counter `{n} siswa` di kanan judul tiap sel (style `panel-caption`). Tanpa ini komponen akan pecah di hari pertama integrasi.

---

### 5.8 `<EarlyWarningPanel />`

#### Header
- Baris flex: `h2` "Early Warning" + ikon segitiga peringatan 18px (warna `--color-danger`) di kanan judul, lalu `spacer`, lalu badge count.
- Badge count: kotak radius 8px, bg `--color-danger-strong`, teks putih 13/700, padding `4px 10px`, min-width 28px, center.
- Caption di bawah judul: "Butuh perhatian segera" (style `panel-caption`, warna secondary).
- Divider `1px solid --color-border`, margin `20px 0`.

#### `<EarlyWarningItem />`
Anatomi vertikal, gap 8:
1. Baris atas: dot 8px (warna sesuai `riskType`) + nama (style `ews-name`).
2. Baris kelas: teks kelas (style `ews-class`, warna secondary), indent sejajar nama (padding-left 16px).
3. Note box: bg = `RISK_THEME[riskType].bg`, radius 10px, padding `12px 14px`, teks style `ews-note` warna `--color-text-primary`, indent sejajar nama.

- Antar item: divider `1px solid --color-border`, padding vertikal 18px. Item terakhir tanpa divider bawah.
- Hover item: bg `#FAFBFC`, radius 10px, cursor pointer → `onStudentClick(studentId)`.
- Panel scrollable jika item > 6: `max-height: 640px; overflow-y: auto;` dengan scrollbar tipis (`width: 6px`, thumb `#D9DCE3`, radius pill).

---

## 6. Kontrak Data (API)

Frontend membangun terhadap kontrak ini. Jika backend belum siap, buat file `mocks/dashboard.json` dengan isi persis di bawah agar tampilan sama dengan mockup.

**Endpoint:** `GET /api/v1/dashboard?classId={all|kelas-x-a|...}`

### 6.1 TypeScript types

```ts
type RiskType = 'siap_penuh' | 'risiko_behavior' | 'risiko_kompetensi' | 'risiko_ganda';

interface StudentSummary {
  id: string;
  name: string;
  className: string;
  behaviorScore: number;     // 0-100
  competencyScore: number;   // 0-100
  riskType: RiskType;
}

interface EarlyWarningEntry {
  studentId: string;
  name: string;
  className: string;
  riskType: RiskType;
  reason: string;            // kalimat siap tampil dari backend
  severity: 'low' | 'medium' | 'high';
  detectedAt: string;        // ISO 8601
}

interface DashboardResponse {
  meta: {
    schoolName: string;
    academicYear: string;
    semester: string;
    threshold: number;
    updatedAt: string;
  };
  user: { name: string; role: string; avatarUrl: string | null };
  classes: { id: string; label: string }[];
  kpi: {
    totalSiswa: number;
    siapPenuh: number;
    risikoBehavior: number;
    risikoKompetensi: number;
    risikoGanda: number;
    belumTerklasifikasi: number;   // lihat catatan §11
  };
  quadrants: Record<RiskType, StudentSummary[]>;
  earlyWarnings: EarlyWarningEntry[];
}
```

### 6.2 Mock JSON (sesuai mockup)

```json
{
  "meta": {
    "schoolName": "SMK Sultan Hasanuddin",
    "academicYear": "2025/2026",
    "semester": "Genap",
    "threshold": 70,
    "updatedAt": "2026-09-01T01:44:59+08:00"
  },
  "user": { "name": "EGI ARDIANSYAH, S.Pd", "role": "Kepala Jurusan TKJ", "avatarUrl": null },
  "classes": [
    { "id": "all", "label": "Semua Kelas" },
    { "id": "x-a", "label": "Kelas X A" },
    { "id": "x-b", "label": "Kelas X B" },
    { "id": "ix-a", "label": "Kelas IX A" }
  ],
  "kpi": {
    "totalSiswa": 1427,
    "siapPenuh": 62,
    "risikoBehavior": 7,
    "risikoKompetensi": 7,
    "risikoGanda": 4,
    "belumTerklasifikasi": 1347
  },
  "quadrants": {
    "risiko_behavior": [
      "Galih Nugroho", "Ardiano Susatyo", "Hamdan Rizki", "Kevin Sanjaya",
      "Zauhari Mufti S", "Arbi Wijaya Eksa", "Fahri Maulana"
    ],
    "siap_penuh": [
      "Muhammad Farel", "Arkananta Putra", "Rizky Ramadhan", "Bintang Ramadhan",
      "Alif Pratama", "Rizky Saputra", "Satria Pratama", "Fathir Dirgantara",
      "Daffa Maulana", "Andika Wijaya", "Farel Aditya", "Dimas Setiawan"
    ],
    "risiko_ganda": ["Praditya Yoga", "Arjuna Wira", "Arya Mahardika", "Naufal Azmi"],
    "risiko_kompetensi": [
      "Satria Baskara", "Aditya Wibowo", "Bagas Pramudya", "Danendra Perkasa",
      "Galang Ananta", "Rendra Kencana", "Yuda Pratama"
    ]
  },
  "earlyWarnings": [
    { "name": "Farhan Dwiputra", "className": "Kelas X", "riskType": "risiko_behavior", "reason": "Absensi turun 3 minggu berturut-turut" },
    { "name": "Ahmad Rifai", "className": "Kelas IX", "riskType": "risiko_behavior", "reason": "Pola kehadiran tidak konsisten" },
    { "name": "Arfan Khalif", "className": "Kelas X", "riskType": "risiko_kompetensi", "reason": "Nilai praktikum Membuat Pola di bawah threshold" },
    { "name": "Reski Bustamin", "className": "Kelas X", "riskType": "risiko_ganda", "reason": "Keterlambatan meningkat signifikan" },
    { "name": "Faris Al-Ghazali", "className": "Kelas X", "riskType": "risiko_ganda", "reason": "Behavior dan kompetensi di bawah threshold" }
  ]
}
```

> Catatan: di mockup, array `quadrants` disederhanakan jadi nama. Di implementasi nyata isinya objek `StudentSummary` lengkap. Mock di atas harus dikonversi ke bentuk objek saat dipakai.

### 6.3 Aturan penentuan kuadran (untuk validasi FE, logika utama tetap di backend)

Dengan `t = threshold`:
- `behavior >= t && competency >= t` → `siap_penuh`
- `behavior < t && competency >= t` → `risiko_behavior`
- `behavior >= t && competency < t` → `risiko_kompetensi`
- `behavior < t && competency < t` → `risiko_ganda`

Frontend **tidak menghitung ulang** kuadran. Gunakan `riskType` dari API. Aturan ini hanya untuk membuat mock data yang konsisten.

---

## 7. State Handling

### Loading
Skeleton, bukan spinner. Struktur skeleton harus menahan layout (no CLS):
- KPI: 5 kotak abu `#EDEEF2` tinggi 118px, radius card, animasi shimmer 1.4s.
- Kuadran: 4 sel dengan 6 pill abu (lebar acak 90–150px).
- Early Warning: 4 blok item abu.

### Empty
- **Sel kuadran kosong:** teks tengah "Tidak ada siswa di kategori ini" (13px, warna muted, opacity 0.8). Sel tetap punya `min-height`.
- **Early Warning kosong:** ikon centang lingkaran hijau 40px + "Tidak ada peringatan aktif" + caption "Semua siswa dalam kondisi terpantau". Badge count disembunyikan.

### Error
- Panel diganti kotak error: ikon warning + "Gagal memuat data" + tombol "Coba Lagi" (outline, radius pill) yang memicu refetch.
- Error di satu panel **tidak boleh** merobohkan panel lain. Bungkus tiap panel dalam error boundary sendiri.

### Data overflow
- Nama > 20 karakter → truncate + ellipsis + `title` attribute berisi nama penuh.
- Angka KPI ≥ 10000 → tetap render, kecilkan font ke 30px otomatis via container query / clamp.

---

## 8. Responsive

| Breakpoint | Perilaku |
|---|---|
| `≥ 1280px` (desktop, target utama) | Sesuai mockup. MainGrid 1fr + 380px. KPI 5 kolom. |
| `1024–1279px` | MainGrid 1fr + 340px. KPI tetap 5 kolom, font `kpi-value` → 28px. Padding halaman 24px. |
| `768–1023px` (tablet) | MainGrid jadi 1 kolom (Early Warning pindah ke bawah, full width, `max-height` dilepas). KPI jadi 3 kolom (baris 2 berisi 2 card). Kuadran tetap 2×2. |
| `< 768px` (mobile) | Padding 16px. KPI 2 kolom, scroll horizontal untuk tabs. Kuadran jadi **1 kolom** (4 sel bertumpuk, urutan: Risiko Ganda → Risiko Behavior → Risiko Kompetensi → Siap Penuh — yang paling kritis di atas). Chip 1 kolom penuh. Header: nama user disembunyikan, sisakan avatar + badge EWS. |

Pemisah dashed pada mobile berubah jadi `border-bottom` antar sel, hilangkan `border-right`.

---

## 9. Aksesibilitas

- Tabs: `role="tablist"` / `role="tab"` + `aria-selected` + navigasi keyboard panah kiri/kanan.
- KPI card: `<article>` dengan `aria-label="{label}: {value} siswa"`.
- Chip siswa: `<button>` semantik, bukan `<div>`. `aria-label="{nama}, {kategori}"`.
- Warna **tidak boleh** jadi satu-satunya penanda kategori — nama kuadran dan label legend sudah memenuhi ini; jangan hapus.
- Kontras teks putih di atas `#F97316` = 3.0:1 → **gagal WCAG AA untuk teks normal**. Solusi: naikkan chip label ke weight 600 dan size 13px (large-ish) **atau** gelapkan `--color-warning` chip ke `#EA580C`. Diskusikan dengan Arsil; default build: gunakan `#EA580C` untuk background chip Risiko Behavior, warna legend/KPI tetap `#F97316`.
- Semua elemen interaktif punya `:focus-visible` ring 2px `--color-primary`.
- `prefers-reduced-motion`: matikan shimmer skeleton dan transform hover.

---

## 10. Acceptance Criteria

Fitur dianggap selesai jika **semua** poin ini terpenuhi:

1. Halaman identik dengan mockup pada viewport 1440×1400 (diff visual ≤ 2px pada elemen utama).
2. Klik tab kelas mengganti data KPI, kuadran, dan Early Warning; tab aktif berubah warna; skeleton muncul selama fetch.
3. Progress bar KPI mengikuti aturan §5.5 termasuk minimum 8%.
4. Posisi 4 kuadran persis seperti tabel di §5.7.
5. Pagination muncul otomatis ketika jumlah siswa melebihi `pageSize`, dan tombol disabled di ujung halaman.
6. Threshold di caption berasal dari API, terbukti dengan mengubah nilai di mock → teks berubah.
7. Semua state (loading/empty/error) bisa didemokan lewat mock flag.
8. Responsive di 3 breakpoint tanpa horizontal scroll dan tanpa elemen tumpang tindih.
9. Lighthouse Accessibility ≥ 90.
10. Tidak ada hex warna hardcoded di file komponen (hanya di file token).

---

## 11. Open Questions — WAJIB dijawab PO sebelum integrasi backend

Frontend **tidak boleh menebak** jawaban ini. Kalau ditebak, komponen akan dibongkar ulang.

1. **Selisih 1347 siswa.** `62 + 7 + 7 + 4 = 80`, sementara Total Siswa = 1427. Sisa 1347 masuk kategori apa? Jika "belum ada data", apakah perlu KPI ke-6 "Belum Terklasifikasi" atau Total Siswa diganti jadi "Siswa Terpantau"? Dashboard tidak boleh menampilkan angka yang tidak berjumlah.
2. **"Kelas IX A" di SMK.** SMK tidak punya kelas IX (itu jenjang SMP/MTs). Apakah ini data dummy yang salah, atau SGA memang menyasar MTs/SMP juga? Ini terlihat dalam 5 detik oleh juri maupun sekolah pilot.
3. **Threshold 70 — siapa yang menentukan?** Global, per jurusan, atau per mata pelajaran? Kalau Kajur bisa mengubahnya, butuh UI settings yang belum ada di desain.
4. **Sumber `reason` di Early Warning.** Kalimat seperti "Absensi turun 3 minggu berturut-turut" — apakah dihasilkan rule engine di backend (FE tinggal render) atau FE yang menyusun kalimat dari data mentah? Asumsi PRD ini: **backend mengirim kalimat jadi**.
5. **Aksi setelah peringatan.** Panel bilang "Butuh perhatian segera", tapi tidak ada tombol tindakan apa pun. Apa yang harus dilakukan Kajur setelah membaca? (Tandai ditindaklanjuti? Catat pembinaan? Kirim ke wali kelas?) Tanpa ini, layar hanya laporan, bukan "advisor".
6. **Mode chart** pada `ViewToggle` — apa isinya? Scatter plot Behavior × Kompetensi dengan garis threshold? Butuh desain terpisah.
7. **Hak akses.** Nama siswa berisiko tampil terbuka. Siapa saja yang boleh melihat layar ini? Perlukah masking nama untuk role tertentu?

---

## 12. Catatan Implementasi

- **Stack disarankan:** React + TypeScript + Tailwind CSS (extend theme dengan token §3) + TanStack Query untuk fetching/caching per `classId`.
- **Struktur folder:**
```
src/
  features/dashboard/
    api/            useDashboard.ts, types.ts
    components/
      AppHeader/    AppHeader.tsx, EwsBadge.tsx, UserChip.tsx
      ClassTabs/
      Kpi/          KpiRow.tsx, KpiCard.tsx
      Quadrant/     QuadrantMatrix.tsx, QuadrantCell.tsx, StudentChip.tsx,
                    QuadrantLegend.tsx, ViewToggle.tsx, QuadrantPagination.tsx
      EarlyWarning/ EarlyWarningPanel.tsx, EarlyWarningItem.tsx
      states/       PanelSkeleton.tsx, PanelEmpty.tsx, PanelError.tsx
    constants/      riskTheme.ts
    DashboardPage.tsx
  styles/tokens.css
```
- **Ikon:** gunakan `lucide-react` — `AlertTriangle`, `User`, `List`, `Activity`, `ArrowLeft`, `ArrowRight`, `CheckCircle2`.
- Caching: `staleTime` 60 detik per `classId`; prefetch tab lain saat idle.
- Semua komponen presentational harus bisa di-render dari props saja (tanpa fetch internal) supaya bisa masuk Storybook dan diuji visual.

---

*Dokumen ini spesifik untuk replikasi visual mockup v1.0. Perubahan desain harus melalui revisi PRD, bukan keputusan sepihak di kode.*
