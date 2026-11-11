// Konfigurasi bersama modul Perangkat Ajar (portal Waka Kurikulum & Guru).
// Lihat docunentation/dashboard waka/PRD-Frontend-Perangkat-Ajar-Waka-Kurikulum.md §5.

export const WAKA_API = '/api/v1/waka-kurikulum';
export const GURU_API = '/api/v1/guru';

export const MAX_PDF_SIZE = 10 * 1024 * 1024;
export const MAX_PDF_SIZE_LABEL = '10MB';

// Batas ZIP arsip di server; di atas ini server menjawab 409 dan meminta filter dipersempit.
export const MAX_ZIP_SIZE = 500 * 1024 * 1024;

// Id guru, penugasan, mapel, dan kelas = id tabel lama (INTEGER); dokumen & deadline = UUID.
export const isIdAngka = (value) => /^[1-9]\d*$/.test(String(value ?? ''));

// Semester tidak aktif = arsip baca-saja; server menolak semua aksi tulis dengan 409.
export const PESAN_SEMESTER_ARSIP = 'Semester ini sudah diarsipkan. Data hanya bisa dilihat dan diunduh.';

/** 409 = aturan bisnis menolak; status di layar mungkin sudah usang sehingga data perlu dimuat ulang. */
export const isKonflik = (error) => error?.response?.status === 409;

export const STATUS_PERANGKAT = Object.freeze({
  BELUM_UNGGAH: 'belum_unggah',
  MENUNGGU_VALIDASI: 'menunggu_validasi',
  PERLU_REVISI: 'perlu_revisi',
  DISETUJUI: 'disetujui',
});

export const STATUS_CONFIG = {
  [STATUS_PERANGKAT.BELUM_UNGGAH]: { label: 'Belum Unggah', color: 'default' },
  [STATUS_PERANGKAT.MENUNGGU_VALIDASI]: { label: 'Menunggu Validasi', color: 'warning' },
  [STATUS_PERANGKAT.PERLU_REVISI]: { label: 'Perlu Revisi', color: 'error' },
  [STATUS_PERANGKAT.DISETUJUI]: { label: 'Disetujui', color: 'success' },
};

export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: STATUS_PERANGKAT.BELUM_UNGGAH, label: 'Belum Unggah' },
  { value: STATUS_PERANGKAT.MENUNGGU_VALIDASI, label: 'Menunggu Validasi' },
  { value: STATUS_PERANGKAT.PERLU_REVISI, label: 'Perlu Revisi' },
  { value: STATUS_PERANGKAT.DISETUJUI, label: 'Disetujui' },
  { value: 'terlambat', label: 'Terlambat' },
];

/**
 * Validasi file unggahan: wajib PDF (MIME dan ekstensi) dan tidak melebihi batas ukuran.
 * Mengembalikan pesan galat, atau string kosong bila valid.
 */
export const validasiFilePdf = (file) => {
  if (!file) return 'Pilih file PDF terlebih dahulu';
  const isPdf = file.type === 'application/pdf' && /\.pdf$/i.test(file.name || '');
  if (!isPdf) return 'File harus berformat PDF';
  if (file.size > MAX_PDF_SIZE) return `Ukuran file maksimal ${MAX_PDF_SIZE_LABEL}`;
  return '';
};

export const formatUkuranFile = (bytes) => {
  if (!Number.isFinite(bytes)) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Tanggal + jam dalam zona waktu sekolah, mis. "31 Okt 2026, 23.59". */
export const formatTanggalWaktu = (iso, timeZone = 'Asia/Jakarta') => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const isDeadlineLewat = (deadline, now = new Date()) => {
  if (!deadline) return false;
  const d = new Date(deadline);
  return !Number.isNaN(d.getTime()) && d.getTime() < now.getTime();
};

/** "3 hari lagi", "5 jam lagi", "Lewat". Untuk banner deadline guru. */
export const sisaWaktuDeadline = (deadline, now = new Date()) => {
  if (!deadline) return '';
  const selisih = new Date(deadline).getTime() - now.getTime();
  if (Number.isNaN(selisih)) return '';
  if (selisih <= 0) return 'Lewat';
  const jam = Math.floor(selisih / (60 * 60 * 1000));
  if (jam < 24) return jam < 1 ? 'Kurang dari 1 jam lagi' : `${jam} jam lagi`;
  return `${Math.floor(jam / 24)} hari lagi`;
};

/** Waka membuka kunci unggah sementara (`kunci_dibuka.sampai` belum lewat). */
export const isKunciDibuka = (dokumen, now = new Date()) =>
  Boolean(dokumen?.kunci_dibuka?.sampai) && !isDeadlineLewat(dokumen.kunci_dibuka.sampai, now);

/**
 * Menentukan apakah guru boleh mengunggah dokumen ini, beserta alasan bila tidak.
 *
 * Aturan (PRD §5.2):
 * - Unggah hanya di status belum_unggah / perlu_revisi ("setelah feedback baru bisa upload lagi").
 * - Waka bisa membuka kunci sementara per dokumen (`kunci_dibuka`) sampai batas waktu tertentu.
 * - Kunci otomatis setelah deadline untuk dokumen yang BELUM diunggah. Dokumen berstatus
 *   perlu_revisi tetap terbuka walau deadline lewat, karena feedback Waka membuka unggah ulang.
 * - Server yang berwenang lewat field `terkunci`; hitungan dari `deadline` di FE hanya cadangan
 *   bila server tidak mengirim field itu.
 */
export const statusUnggah = (dokumen, now = new Date()) => {
  const status = dokumen?.status || STATUS_PERANGKAT.BELUM_UNGGAH;

  if (status === STATUS_PERANGKAT.DISETUJUI) {
    return { bisaUnggah: false, terkunci: false, alasan: 'Sudah disetujui' };
  }
  if (status === STATUS_PERANGKAT.MENUNGGU_VALIDASI) {
    return { bisaUnggah: false, terkunci: false, alasan: 'Menunggu validasi Waka Kurikulum' };
  }

  const terkunci = typeof dokumen?.terkunci === 'boolean'
    ? dokumen.terkunci
    : status === STATUS_PERANGKAT.BELUM_UNGGAH && isDeadlineLewat(dokumen?.deadline, now) && !isKunciDibuka(dokumen, now);

  if (terkunci) {
    return { bisaUnggah: false, terkunci: true, alasan: 'Terkunci karena deadline sudah lewat. Hubungi Waka Kurikulum bila perlu dibuka.' };
  }

  return { bisaUnggah: true, terkunci: false, alasan: '' };
};

/** Pesan galat standar dari respons axios. */
export const pesanGalat = (error, fallback) => {
  const details = error?.response?.data?.errors;
  if (Array.isArray(details) && details.length > 0) return details.join(', ');
  return error?.response?.data?.msg || fallback;
};

/** "Informatika · X TKJ 1". Penugasan bisa per kelas atau per tingkat (PRD Pertanyaan Terbuka #1). */
export const labelPenugasan = (penugasan) => {
  const lingkup = penugasan?.kelas?.nama || penugasan?.tingkat?.nama || penugasan?.tingkat;
  return [penugasan?.mapel?.nama || '-', lingkup].filter(Boolean).join(' · ');
};

// Deadline dikirim sebagai tanggal + jam "dinding" (YYYY-MM-DD, HH:mm) dan ditafsirkan server
// dalam zona waktu sekolah, supaya hasilnya tidak bergantung zona waktu browser Waka.
export const formatTanggalYMD = (date) => {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/** "2026-10-31" → Date lokal 31 Okt 2026 00.00 (tanpa geser zona waktu seperti new Date("2026-10-31")). */
export const parseTanggalYMD = (ymd) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd || '');
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};

// ─── Filter verifikasi & pencarian ──────────────────────────────────────────

export const VERIFIKASI = Object.freeze({ SEMUA: '', TERVERIFIKASI: 'terverifikasi', BELUM: 'belum' });

export const VERIFIKASI_OPTIONS = [
  { value: VERIFIKASI.SEMUA, label: 'Semua' },
  { value: VERIFIKASI.TERVERIFIKASI, label: 'Terverifikasi' },
  { value: VERIFIKASI.BELUM, label: 'Belum Terverifikasi' },
];

/** Terverifikasi = sudah disetujui Waka. Selain itu (belum unggah, menunggu, revisi) = belum. */
export const cocokVerifikasi = (dokumen, verifikasi) => {
  if (verifikasi === VERIFIKASI.TERVERIFIKASI) return dokumen?.status === STATUS_PERANGKAT.DISETUJUI;
  if (verifikasi === VERIFIKASI.BELUM) return dokumen?.status !== STATUS_PERANGKAT.DISETUJUI;
  return true;
};

/**
 * Menyaring daftar penugasan (beserta dokumennya) untuk halaman detail guru & halaman guru.
 * Pencarian cocok ke mapel, kelas, atau jenis perangkat ajar. Bila mapel/kelas cocok, semua
 * dokumennya dipertahankan; bila tidak, hanya dokumen yang jenisnya cocok. Penugasan tanpa
 * dokumen tersisa dibuang.
 */
export const saringPenugasan = (penugasanList, { q = '', verifikasi = VERIFIKASI.SEMUA } = {}) => {
  const kata = q.trim().toLowerCase();
  if (!kata && !verifikasi) return penugasanList;

  return penugasanList
    .map((p) => {
      const penugasanCocok = !kata || labelPenugasan(p).toLowerCase().includes(kata);
      const dokumen = (p.dokumen || []).filter((d) => {
        const jenisCocok = penugasanCocok || (d.jenis?.label || '').toLowerCase().includes(kata);
        return jenisCocok && cocokVerifikasi(d, verifikasi);
      });
      return { ...p, dokumen };
    })
    .filter((p) => p.dokumen.length > 0);
};
