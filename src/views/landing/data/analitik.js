// Teks dan daftar halaman Analitik Pembelajaran (`/analitik-pembelajaran`).
// Disalin apa adanya dari desain kanvas (LAD.dc.html dan LAD-Seluler.dc.html);
// bila berbeda dari copy-lad.md, teks desain yang dipakai. Teks dua versi
// berbentuk { web, mobile }. Tanda bintang pada judul (*kata*) = kata berwarna
// aksen. Teks bar pengumuman halaman ini ada di data/layout.js (PROMO_ANALITIK)
// karena bar pengumuman milik LandingLayout.
//
// `verifikasi` (true atau teks label) = klaim yang belum diverifikasi. Angka
// dalam kurung pada label merujuk ke tabel "Klaim yang perlu diverifikasi"
// (22 butir) di copy-lad.md. Penandanya tampil hanya bila
// flags.tampilkanPenandaDesain menyala.
//
// DUMMY wajib diganti sebelum main:
//  - seluruh isi peraga di data/analitikMock.js (MOCK_KELAS, MOCK_MATRIKS,
//    MOCK_TREN, MOCK_PROFIL, MOCK_SARAN): nama kelas, nama murid, angka, persen,
//    nilai, dan koordinat grafik tren. Sengaja contoh, bukan data nyata. Ganti
//    dengan tangkapan layar Kelas latihan bila tersedia (butir 6).
//  - angka contoh yang ikut tertulis di teks: "alpa 6 kali dari 15 pertemuan"
//    (P2). Jangan ditulis sebagai fakta produk: batas bawaan kode berbeda dari
//    contoh (Analisis Alur LAD, bagian 6). Angka ambang aturan sengaja tidak ada.
import {
  IconAlertCircle,
  IconBook,
  IconBriefcase,
  IconCalendar,
  IconChartLine,
  IconEye,
  IconFileCheck,
  IconFileText,
  IconHelpCircle,
  IconLayoutGrid,
  IconListNumbers,
  IconLock,
  IconMessage,
  IconShieldCheck,
  IconSparkles,
  IconStack2,
  IconUser,
  IconUserPlus,
} from '@tabler/icons-react';

export const META = {
  title: 'Analitik Pembelajaran | Absenin Aja',
  description:
    'Nilai TP, proyek, dan kehadiran satu kelas terbaca dalam satu layar. Setiap penanda disertai alasan dan buktinya, dan keputusan tetap di guru.',
};

// Id jangkar. Dipakai navigasi jangkar, tombol hero, dan CTA penutup.
export const ID = {
  caraKerja: 'cara-kerja',
  fitur: 'fitur',
  penanda: 'penanda',
  jalurAkun: 'jalur-akun',
  faq: 'faq',
};

// Navigasi jangkar di dalam halaman: rel ikon di tepi kanan layar (1280 px ke
// atas) dan tombol bulat dengan panel (di bawah itu). Label dari menu di header
// desain; `id` = id bagian di halaman (sasaran tautan hash dan scrollspy).
// `labelNav`, `labelTombol`, dan `aksi.label` pendek ditulis builder (tidak ada
// di desain, kecuali "Minta Akun" yang tombol header desain), untuk ditinjau.
export const NAV_JANGKAR = {
  labelNav: 'Di halaman ini',
  labelTombol: 'Buka daftar bagian halaman',
  tautan: [
    { label: 'Cara kerja', id: ID.caraKerja, ikon: IconListNumbers },
    { label: 'Fitur', id: ID.fitur, ikon: IconLayoutGrid },
    { label: 'Penanda', id: ID.penanda, ikon: IconAlertCircle },
    { label: 'Jalur akun', id: ID.jalurAkun, ikon: IconUserPlus },
    { label: 'FAQ', id: ID.faq, ikon: IconHelpCircle },
  ],
  aksi: { label: 'Minta Akun', rute: 'akunGuruMandiri' },
};

export const HERO = {
  eyebrow: 'Analitik Pembelajaran',
  judul: 'Lihat murid yang *perlu perhatian* sebelum nilai akhir keluar',
  sub: {
    web: 'Nilai TP, proyek, dan kehadiran satu kelas terbaca dalam satu layar. Setiap penanda disertai alasan dan buktinya, dan keputusan tetap di guru.',
    mobile: 'Penanda dini dengan alasan dan bukti',
  },
  aksiUtama: { label: 'Minta Akun Guru', rute: 'akunGuruMandiri' },
  aksiKedua: { label: 'Lihat Lima Penanda', href: `#${ID.penanda}` },
  catatan: {
    web: 'Kelas latihan hanya-baca tersedia di dalam akun.',
    mobile: 'Kelas latihan hanya-baca di akun',
  },
};

// Pita fakta. Angka 8 = delapan tab (Ringkasan, Nilai TP, Proyek, Remedial,
// Kehadiran, Perlu Perhatian, Struktur, Murid): terbukti dari aplikasi
// (Analisis Alur LAD, bagian 8), jadi tanpa penanda.
export const FAKTA = [
  {
    angka: '5',
    label: {
      web: 'Penanda dini, P1 sampai P5, dihitung dari aturan yang terbuka.',
      mobile: 'Penanda dini P1 sampai P5',
    },
  },
  {
    angka: '8',
    label: {
      web: 'Bagian data kelas, dari Ringkasan sampai Murid.',
      mobile: 'Bagian data kelas di satu tempat',
    },
  },
  {
    angka: '4',
    label: {
      web: 'Kartu ringkasan: Perlu perhatian, Pengayaan, Data belum cukup, Kelengkapan nilai TP.',
      mobile: 'Kartu ringkasan di tab Ringkasan',
    },
  },
  {
    angka: '1',
    label: {
      web: 'Satu berkas Excel menjadi satu kelas lengkap, hingga 10 berkas per impor.',
      mobile: 'Satu berkas Excel jadi satu kelas',
    },
    verifikasi: 'Batas impor (10)',
  },
];

export const SEBELUM_SESUDAH = {
  eyebrow: 'Sebelum, sesudah',
  judul: 'Dari berkas Excel yang tersebar ke satu layar per kelas',
  sub: {
    web: 'Nilai TP, proyek, dan kehadiran biasanya tersebar di beberapa berkas. Di sini ketiganya masuk ke satu kelas.',
    mobile: 'Tiga data, satu kelas, satu layar',
  },
  sebelum: {
    tag: 'Sebelum',
    judul: 'Berkas terpisah',
    butir: [
      { web: 'Nilai TP, proyek, dan kehadiran ada di berkas yang terpisah.', mobile: 'Nilai dan kehadiran terpisah' },
      {
        web: 'Murid yang mulai tertinggal baru ketahuan setelah nilai akhir keluar.',
        mobile: 'Murid tertinggal ketahuan di akhir',
      },
      { web: 'Tindak lanjut tidak tercatat di mana pun.', mobile: 'Tindak lanjut tidak tercatat' },
    ],
    // Pernyataan masalah hasil penelusuran, bukan survei guru (butir 7).
    verifikasi: 'Pernyataan masalah (7)',
  },
  sesudah: {
    tag: 'Dengan LAD',
    judul: 'Satu layar per kelas',
    butir: [
      {
        web: 'Nilai TP, proyek, dan kehadiran satu kelas ada dalam satu layar.',
        mobile: 'Satu layar untuk satu kelas',
      },
      {
        web: 'Murid yang Perlu perhatian muncul lebih awal, lengkap dengan alasan dan bukti.',
        mobile: 'Perlu perhatian muncul lebih awal',
      },
      {
        web: 'Tindak lanjut dicatat lewat Saran tindak lanjut, dengan langkah berikutnya yang jelas.',
        mobile: 'Tindak lanjut tercatat di aplikasi',
      },
    ],
    // Peta: keputusan saran tidak dapat disimpan di Kelas latihan (butir 21).
    verifikasi: 'Tindak lanjut "tercatat": cek yang tersimpan (21)',
  },
};

export const CARA_KERJA = {
  id: ID.caraKerja,
  eyebrow: 'Cara kerja',
  judul: 'Empat langkah dari nilai sampai *tindak lanjut*',
  sub: {
    web: 'Satu kelas bisa dibuat dari nol atau dari satu berkas Excel.',
    mobile: 'Dari nol atau dari satu berkas Excel',
  },
  langkah: [
    {
      judul: 'Siapkan kelas',
      deskripsi: {
        web: 'Tambah Kelas dengan nama kelas, mapel, semester, dan tahun ajaran, atau impor satu berkas Blanko Nilai menjadi satu kelas lengkap.',
        mobile: 'Tambah kelas atau impor Blanko Nilai',
      },
    },
    {
      judul: 'Isi nilai dan kehadiran',
      deskripsi: {
        web: 'Ketik nilai TP langsung atau tempel blok dari Excel. Sel kosong berarti belum dinilai, bukan nol.',
        mobile: 'Ketik atau tempel dari Excel',
      },
    },
    {
      judul: 'Baca ringkasan dan penanda',
      deskripsi: {
        web: 'Tab Ringkasan menampilkan empat kartu. Tab Perlu perhatian menampilkan matriks murid per TP, proyek, dan kehadiran dengan lima penanda.',
        mobile: 'Empat kartu dan lima penanda',
      },
    },
    {
      judul: 'Tindak lanjuti',
      deskripsi: {
        web: 'Buka rincian murid, catat remedial, lalu pakai atau ubah Saran tindak lanjut. Keputusan ada di guru.',
        mobile: 'Catat remedial dan langkah berikutnya',
      },
    },
  ],
};

// Fitur: 12 kartu dalam empat kelompok. `kelompok` merujuk id di KELOMPOK.daftar.
// Kartu 12 (Catatan keputusan) adalah keputusan editorial dari alur Saran
// tindak lanjut, bukan fitur terpisah di antarmuka (butir 21).
export const FITUR = {
  id: ID.fitur,
  eyebrow: 'Fitur',
  judul: 'Dari menyiapkan kelas sampai *mencatat tindak lanjut*',
  sub: {
    web: 'Dua belas fitur dalam empat kelompok: Siapkan, Catat, Baca, dan Tindak lanjut.',
    mobile: '12 fitur dalam 4 kelompok',
  },
  labelTab: 'Kelompok fitur',
};

export const KELOMPOK = [
  { id: 'semua', nama: 'Semua' },
  { id: 'siapkan', nama: 'Siapkan' },
  { id: 'catat', nama: 'Catat' },
  { id: 'baca', nama: 'Baca' },
  { id: 'tindak', nama: 'Tindak lanjut' },
];

export const MODUL = [
  {
    kelompok: 'siapkan',
    ikon: IconStack2,
    judul: 'Tambah Kelas',
    deskripsi: {
      web: 'Buat kelas dengan nama, mapel, semester, dan tahun ajaran. Struktur bisa disalin dari kelas lain.',
      mobile: 'Buat kelas, salin struktur bila perlu',
    },
    tag: ['Salin struktur', 'Batas dan bobot'],
  },
  {
    kelompok: 'siapkan',
    ikon: IconFileText,
    judul: 'Impor dari Blanko Nilai',
    deskripsi: {
      web: 'Satu berkas .xlsx menjadi satu kelas lengkap: lingkup materi, TP, proyek, murid, dan nilai. Maksimal 10 berkas per impor, 2 MB per berkas.',
      mobile: 'Periksa dulu, tidak menimpa kelas',
    },
    tag: ['.xlsx', 'Periksa berkas dulu', 'Semua atau tidak sama sekali'],
    verifikasi: 'Batas impor (10, 11)',
  },
  {
    kelompok: 'siapkan',
    ikon: IconLayoutGrid,
    judul: 'Struktur',
    deskripsi: {
      web: 'Lingkup materi dan TP bisa ditambah, diubah, dan diurutkan. Batas nilai dan bobot diatur per kelas.',
      mobile: 'Susun LM dan TP, atur KKTP',
    },
    tag: ['Lingkup materi', 'KKTP', 'Bobot nilai akhir'],
  },
  {
    kelompok: 'catat',
    ikon: IconFileCheck,
    judul: 'Nilai TP',
    deskripsi: {
      web: 'Isi tabel murid dan TP dengan mengetik atau menempel blok dari Excel. Sel kosong berarti belum dinilai, bukan nol.',
      mobile: 'Sel kosong berarti belum dinilai',
    },
    tag: ['Tempel dari Excel', 'Sel kosong bukan nol'],
  },
  {
    kelompok: 'catat',
    ikon: IconBriefcase,
    judul: 'Proyek',
    deskripsi: {
      web: 'Catat proyek individu atau kelompok. Pada proyek individu, nilai 0 berarti tidak dikumpulkan.',
      mobile: 'Proyek individu atau kelompok',
    },
    tag: ['Individu', 'Kelompok'],
  },
  {
    kelompok: 'catat',
    ikon: IconCalendar,
    judul: 'Kehadiran',
    deskripsi: {
      web: 'Catat H, S, I, A per pertemuan. Menu Semua hadir mengisi sel kosong, dan sel kosong tidak dihitung alpa.',
      mobile: 'Catat H, S, I, A per pertemuan',
    },
    tag: ['Per pertemuan', 'Semua hadir'],
  },
  {
    kelompok: 'baca',
    ikon: IconChartLine,
    judul: 'Ringkasan kelas',
    deskripsi: {
      web: 'Empat kartu di bagian atas, disusul Sebaran capaian per TP, rata-rata nilai per lingkup materi, dan kehadiran per lingkup materi.',
      mobile: 'Kelas terbaca dari empat kartu',
    },
    tag: ['Sebaran capaian per TP', 'Kelengkapan nilai TP', 'Tanda Terbanyak'],
  },
  {
    kelompok: 'baca',
    ikon: IconAlertCircle,
    judul: 'Perlu perhatian',
    deskripsi: {
      web: 'Matriks murid per TP, proyek, dan kehadiran dengan warna sel. Saring per penanda, urutkan menurut nomor absen, nama, atau prioritas.',
      mobile: 'Matriks murid per TP dan kehadiran',
    },
    tag: ['Lima penanda', 'Saring dan urutkan', 'Warna sel'],
  },
  {
    kelompok: 'baca',
    ikon: IconUser,
    judul: 'Profil murid',
    deskripsi: {
      web: 'Capaian per TP (Tuntas atau Belum tuntas), tren nilai per lingkup materi dibanding rata-rata kelas, proyek, kehadiran, dan riwayat remedial.',
      mobile: 'Capaian, tren, proyek, kehadiran',
    },
    tag: ['Tuntas atau Belum tuntas', 'Tren per LM', 'Riwayat remedial'],
  },
  {
    kelompok: 'tindak',
    ikon: IconBook,
    judul: 'Remedial',
    deskripsi: {
      web: 'Catat remedial per murid dan TP, dari profil murid atau tab Perlu perhatian. Nilai asli tidak berubah.',
      mobile: 'Catat remedial, nilai asli tetap',
    },
    tag: ['Nilai asli tetap', 'P1 padam bila KKTP tercapai'],
    verifikasi: 'Aturan P1 (15)',
  },
  {
    kelompok: 'tindak',
    ikon: IconSparkles,
    judul: 'Saran tindak lanjut',
    deskripsi: {
      web: 'Satu draf per penanda, disusun dari bukti kelas, dengan empat kolom isian. Panel "Mengapa saran ini muncul?" menunjukkan dasarnya.',
      mobile: 'Draf per penanda, guru memutuskan',
    },
    tag: ['Empat kolom', 'Mengapa saran ini muncul?', 'Tidak dikirim otomatis'],
    verifikasi: 'Tidak dikirim (14, 16)',
  },
  {
    kelompok: 'tindak',
    ikon: IconMessage,
    judul: 'Catatan keputusan',
    deskripsi: {
      web: 'Saran bisa dipakai, diubah, atau diabaikan dengan alasan singkat. Saran yang diabaikan bisa dibuka kembali.',
      mobile: 'Pakai, ubah, atau abaikan',
    },
    tag: ['Alasan singkat', 'Bisa dibuka kembali'],
    verifikasi: 'Fitur ke-12 (21); "dibuka kembali" belum di peta',
  },
];

// Lima penanda. `nada` memilih warna tanda (perhatian untuk P1 sampai P4,
// pengayaan untuk P5); kode dan nama selalu tertulis. Aturan kapan muncul
// ditulis tanpa angka ambang (diatur server). Aturan P1 sampai P5 TERBUKTI dari
// kode (apps/guru-lad/evaluasi/penjelasan.js; Analisis Alur LAD untuk Landing
// Page, bagian 8, 17 Nov 2026), jadi kartunya tanpa penanda. Yang tetap
// ditandai (butir 3): angka ambang yang tersirat di teks desain, yaitu "tiga
// lingkup materi" (P4) dan "lima pertemuan" (Data belum cukup). Cocokkan dengan
// aturan bernomor versi saat ini sebelum tayang.
export const PENANDA = {
  id: ID.penanda,
  eyebrow: 'Lima penanda',
  judul: 'Lima penanda, masing-masing dengan *aturan dan bukti*',
  sub: {
    web: 'Penanda adalah peringatan dini dari data kelas. Aturannya bernomor Aturan versi dan dihitung ulang setiap data berubah.',
    mobile: 'Peringatan dini, bukan diagnosis',
  },
  labelMuncul: 'Muncul bila',
  labelLihat: 'Guru melihat',
  kartu: [
    {
      kode: 'P1',
      nada: 'perhatian',
      judul: 'Kesulitan pada TP tertentu',
      muncul: {
        web: 'Ada TP yang nilainya di bawah KKTP dan belum dituntaskan lewat remedial.',
        mobile: 'Nilai TP di bawah KKTP, belum remedial',
      },
      lihat: {
        web: 'TP yang Belum tuntas beserta nilainya, dan riwayat remedial bila sudah dicatat.',
        mobile: 'TP belum tuntas dan nilainya',
      },
    },
    {
      kode: 'P2',
      nada: 'perhatian',
      judul: 'Sering alpa',
      muncul: {
        web: 'Murid alpa (tanpa keterangan) pada jumlah pertemuan tertentu, setelah cukup pertemuan tercatat. Yang dihitung jumlah alpa, bukan persentase hadir.',
        mobile: 'Alpa berulang di mapel itu',
      },
      lihat: {
        web: 'Jumlah alpa dan nomor pertemuannya, misalnya alpa 6 kali dari 15 pertemuan.', // DUMMY wajib diganti sebelum main
        mobile: 'Jumlah dan nomor pertemuan alpa',
      },
    },
    {
      kode: 'P3',
      nada: 'perhatian',
      judul: 'Proyek individu tidak dikumpulkan',
      muncul: {
        web: 'Ada proyek individu bernilai 0, yang berarti tidak dikumpulkan. Proyek kelompok tidak dipakai.',
        mobile: 'Proyek individu bernilai 0',
      },
      lihat: {
        web: 'Proyek mana yang tidak dikumpulkan, di matriks dan di status proyek individu.',
        mobile: 'Proyek yang tidak dikumpulkan',
      },
    },
    {
      kode: 'P4',
      nada: 'perhatian',
      judul: 'Capaian menurun',
      muncul: {
        web: 'Rata-rata nilai tiga lingkup materi terakhir turun berurutan, melebihi penurunan rata-rata kelas, dan nilai terakhir belum mencapai batas pengayaan.',
        mobile: 'Tren nilai per LM menurun',
      },
      lihat: {
        web: 'Garis tren nilai murid per lingkup materi, dibandingkan dengan rata-rata kelas dan garis KKTP.',
        mobile: 'Tren murid, rata-rata kelas, KKTP',
      },
      verifikasi: 'Angka "tiga LM" diatur server (3)',
    },
    {
      kode: 'P5',
      nada: 'pengayaan',
      judul: 'Capaian sangat tinggi',
      muncul: {
        web: 'Semua TP pada beberapa lingkup materi di atas batas pengayaan, tanpa TP yang belum tuntas dan tanpa proyek bernilai 0.',
        mobile: 'Capaian di atas batas pengayaan',
      },
      lihat: {
        web: 'Murid ditandai sebagai peluang pengayaan, lengkap dengan capaiannya.',
        mobile: 'Peluang pengayaan beserta capaiannya',
      },
    },
  ],
  belumCukup: {
    ikon: IconAlertCircle,
    judul: 'Data belum cukup',
    teks: {
      web: 'Murid masuk kartu ini bila data belum cukup untuk menilai sebuah penanda, misalnya belum ada lima pertemuan tercatat. Artinya belum bisa dinilai, bukan berarti aman.',
      mobile: 'Belum bisa dinilai, bukan berarti aman',
    },
    verifikasi: 'Angka "lima pertemuan" diatur server (3)',
  },
  catatan: {
    ikon: IconShieldCheck,
    teks: {
      web: 'Penanda adalah peringatan dini dari data kelas, bukan diagnosis. Keputusan tetap di guru.',
      mobile: 'Peringatan dini, bukan diagnosis',
    },
  },
};

export const KELAS_TERBACA = {
  eyebrow: 'Kelas terbaca',
  judul: 'Kelas terbaca utuh, murid terbaca *satu per satu*',
  sub: {
    web: 'Dari matriks seluruh kelas sampai garis tren satu murid, semua angka tertulis dan bisa ditelusuri.',
    mobile: 'Semua angka tertulis dan bisa ditelusuri',
  },
  butir: [
    { web: 'Matriks murid per TP, proyek, dan kehadiran dengan warna sel.', mobile: 'Matriks murid dengan warna sel' },
    {
      web: 'Garis tren per lingkup materi, dibandingkan dengan rata-rata kelas dan KKTP.',
      mobile: 'Tren dibanding kelas dan KKTP',
    },
    { web: 'Saring per penanda, urutkan menurut nomor absen, nama, atau prioritas.', mobile: 'Saring dan urutkan murid' },
  ],
};

export const PROFIL_SARAN = {
  eyebrow: 'Dari bukti ke langkah',
  judul: 'Dari penanda ke langkah berikutnya, *tercatat per murid*',
  // "tercatat per murid": peta hanya mencatat remedial; keputusan saran perlu dicek (butir 21).
  verifikasi: 'Judul "tercatat per murid" (21)',
  sub: {
    web: 'Profil murid mengumpulkan buktinya. Saran tindak lanjut menyusun draf dari bukti itu dalam empat kolom.',
    mobile: 'Bukti dulu, baru langkah',
  },
  poin: [
    {
      ikon: IconChartLine,
      judul: 'Bukti di satu tempat',
      deskripsi: {
        web: 'Capaian per TP, tren per lingkup materi, nilai proyek, kehadiran per pertemuan, dan riwayat remedial ada di profil murid.',
        mobile: 'Bukti satu murid di satu tempat',
      },
    },
    {
      ikon: IconEye,
      judul: 'Draf yang bisa ditelusuri',
      deskripsi: {
        web: 'Satu draf per penanda, disusun dari bukti kelas. Panel "Mengapa saran ini muncul?" menunjukkan dasarnya.',
        mobile: 'Draf per penanda, lengkap alasannya',
      },
    },
    {
      ikon: IconFileCheck,
      judul: 'Keputusan di guru',
      deskripsi: {
        web: 'Draf bisa dipakai, diubah, atau diabaikan dengan alasan singkat. Kolom Langkah berikutnya wajib diisi.',
        mobile: 'Dipakai, diubah, atau diabaikan',
      },
    },
  ],
};

export const JANJI = {
  eyebrow: 'Enam janji',
  judul: 'Enam janji yang bisa *diperiksa langsung* di layar',
  sub: {
    web: 'Tiap janji berikut terlihat di antarmuka, bukan hanya tertulis di halaman ini.',
    mobile: 'Semua terlihat di antarmuka',
  },
  kartu: [
    {
      ikon: IconShieldCheck,
      judul: 'Bukan diagnosis',
      deskripsi: {
        web: 'Penanda adalah peringatan dini dari data kelas. Keputusan tetap di tangan guru.',
        mobile: 'Peringatan dini, keputusan di guru',
      },
    },
    {
      ikon: IconAlertCircle,
      judul: 'Data belum cukup bukan berarti aman',
      deskripsi: {
        web: 'Murid dengan data belum cukup belum bisa dinilai. Itu tidak sama dengan aman.',
        mobile: 'Belum bisa dinilai, belum tentu aman',
      },
    },
    {
      ikon: IconEye,
      judul: 'Aturan terbuka',
      deskripsi: {
        web: 'Setiap penanda memakai Aturan versi yang bernomor. Angka bisa ditelusuri ke bukti di panel rincian murid.',
        mobile: 'Aturan bernomor, angka bisa ditelusuri',
      },
    },
    {
      ikon: IconFileText,
      judul: 'Semua angka tertulis',
      deskripsi: {
        web: 'Gambar hanya penegas, jadi tampilan tetap terbaca bila dicetak hitam putih.',
        mobile: 'Angka tertulis, terbaca hitam putih',
      },
      verifikasi: 'Uji cetak (8)',
    },
    {
      ikon: IconLock,
      judul: 'Nilai asli tidak diubah',
      deskripsi: {
        web: 'Remedial dicatat terpisah. Nilai asli murid tidak berubah.',
        mobile: 'Remedial tidak mengubah nilai asli',
      },
    },
    {
      ikon: IconFileCheck,
      judul: 'Impor semua atau tidak sama sekali',
      deskripsi: {
        web: 'Bila satu sel salah, tidak ada kelas yang dibuat. Impor tidak pernah menimpa kelas yang sudah ada.',
        mobile: 'Satu sel salah, tidak ada kelas dibuat',
      },
    },
  ],
};

// Dua jalur akun. Tombol jalur sekolah sementara memakai "Jadwalkan Demo":
// mekanisme aktivasi untuk sekolah belum punya sumber (butir 17). Jalur
// mandiri dan Profil Laporan perlu dicocokkan dengan implementasi (butir 18, 19);
// "kop laporan" hanya kop yang tersimpan, peta bagian 3 menyatakan belum ada
// keluaran laporan.
export const JALUR = {
  id: ID.jalurAkun,
  eyebrow: 'Dua jalur akun',
  judul: 'Dua jalur untuk *mulai*',
  sub: {
    web: 'Sekolah mengaktifkan LAD, atau guru mulai sendiri tanpa menunggu sekolah.',
    mobile: 'Lewat sekolah atau mulai sendiri',
  },
  sekolah: {
    label: 'Guru sekolah',
    judul: 'Sekolah mengaktifkan LAD',
    langkah: [
      { web: 'Sekolah mengaktifkan LAD.', mobile: 'Sekolah mengaktifkan LAD' },
      { web: 'Guru masuk dengan akun sekolahnya.', mobile: 'Guru masuk dengan akun sekolah' },
      {
        web: 'Lengkapi Profil Laporan: NIP guru dan nama serta NIP kepala sekolah. Bila dikosongkan, kop laporan memakai data sekolah.',
        mobile: 'Lengkapi Profil Laporan (opsional)',
      },
      { web: 'Buat kelas pertama atau impor dari Blanko Nilai.', mobile: 'Buat atau impor kelas pertama' },
    ],
    aksi: { label: 'Jadwalkan Demo', rute: 'demo' },
    verifikasi: 'Tombol (17); kop laporan tanpa keluaran laporan (19)',
  },
  mandiri: {
    label: 'Guru mandiri',
    judul: 'Guru mulai sendiri',
    langkah: [
      { web: 'Isi formulir permintaan akun.', mobile: 'Isi formulir permintaan akun' },
      {
        web: 'Tim membuat akun, dan zona waktu dipilih saat akun dibuat.',
        mobile: 'Tim membuat akun, zona waktu dipilih',
      },
      { web: 'Pada login pertama, sandi awal wajib diganti.', mobile: 'Login pertama wajib ganti sandi awal' },
      { web: 'Buat kelas pertama atau impor dari Blanko Nilai.', mobile: 'Buat atau impor kelas pertama' },
    ],
    aksi: { label: 'Minta Akun Guru Mandiri', rute: 'akunGuruMandiri' },
    verifikasi: 'Alur akun (18)',
  },
};

export const KELAS_LATIHAN = {
  eyebrow: 'Kelas latihan',
  judul: 'Coba dulu di Kelas latihan',
  teks: {
    web: 'Dua kelas contoh, Kasus A dan Kasus B, tersedia di dalam akun dan hanya bisa dibaca. Aktivitas di sana dicatat terpisah dari kelas nyata, jadi data kelas Bapak/Ibu tidak terpengaruh.',
    mobile: 'Dua kelas contoh, hanya-baca',
  },
  aksi: { label: 'Minta Akun Guru', rute: 'akunGuruMandiri' },
  verifikasi: 'Nama kelas (13, 20); "dicatat terpisah" belum di peta',
};

export const FAQ = {
  id: ID.faq,
  eyebrow: 'Pertanyaan umum',
  judul: 'Pertanyaan yang *sering muncul*',
  butir: [
    {
      q: 'Apakah penanda ini diagnosis?',
      a: 'Bukan. Penanda adalah peringatan dini berbasis aturan, bukan diagnosis dan bukan prediksi risiko, dan keputusan tetap di guru.',
    },
    {
      q: 'Apakah laporan bisa dicetak atau diunduh?',
      a: 'Tombol unduh dan cetak khusus belum tersedia di LAD. Semua angka tertulis dan gambar hanya penegas, jadi tampilan bisa dicetak hitam putih.',
      verifikasi: 'Status unduh dan cetak (8, 9)',
    },
    {
      q: 'Apakah nilai asli berubah saat remedial?',
      a: 'Tidak. Remedial dicatat per murid dan TP, nilai asli tetap, dan penanda P1 padam bila remedial terbaru mencapai KKTP.',
      verifikasi: 'Aturan P1 (15)',
    },
    {
      q: 'Bagaimana data Excel saya diperlakukan?',
      a: 'Satu berkas .xlsx menjadi satu kelas (maksimal 10 berkas per impor, 2 MB per berkas), dan berkas bisa diperiksa dulu. Bila satu sel salah, tidak ada kelas yang dibuat, dan impor tidak pernah menimpa kelas yang sudah ada.',
      verifikasi: 'Batas impor (10, 11)',
    },
    {
      q: 'Apakah saran dikirim ke wali murid atau guru lain?',
      a: 'Tidak. Sistem tidak mengirim saran ke siapa pun, dan guru yang memakai, mengubah, atau mengabaikannya.',
      verifikasi: 'Tidak dikirim (16)',
    },
    {
      q: 'Bagaimana dengan murid yang datanya belum cukup?',
      a: 'Murid itu masuk kartu Data belum cukup, artinya belum bisa dinilai dan bukan berarti aman. Daftar Yang perlu dilengkapi di tab Ringkasan menunjukkan data apa yang kurang.',
      verifikasi: 'Daftar kelengkapan (12)',
    },
  ],
};

export const CTA = {
  judul: 'Lihat satu kelas dalam satu layar',
  sub: {
    web: 'Minta akun untuk kelas sendiri, atau baca dulu cara kerjanya. Kelas latihan hanya-baca dan terpisah dari kelas nyata.',
    mobile: 'Minta akun, mulai dari Kelas latihan',
  },
  aksiUtama: { label: 'Minta Akun Guru', rute: 'akunGuruMandiri' },
  aksiKedua: { label: 'Lihat Cara Kerja', href: `#${ID.caraKerja}` },
};
