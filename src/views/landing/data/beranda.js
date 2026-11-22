// Teks dan daftar Beranda (`/`). Disalin apa adanya dari desain kanvas
// (Beranda-v3.dc.html). Teks dua versi berbentuk { web, mobile }; versi seluler
// satu baris diambil dari gen/short.py (kunci = teks web persis).
// Tanda bintang pada judul (*kata*) menandai kata berwarna aksen (renderJudul).
//
// `verifikasi: true` = angka atau klaim contoh yang belum diverifikasi.
// Ganti dengan data produksi sebelum tayang. Penandanya tampil hanya bila
// flags.tampilkanPenandaDesain menyala.
//
// Koreksi klaim F8 (naskah Fitur Lengkap v2, bagian G4): keuangan, tagihan SPP,
// ujian, WhatsApp sebagai kanal kabar wali, angka contoh (2.000+, Jan 2026, 10
// peran), dan klaim dampak ("0 jam", "di hari yang sama", "tanpa menelepon")
// dihapus atau diganti. `chip: 'segera'` = kartu berchip Segera (ChipStatus).
import {
  IconBell,
  IconCalendar,
  IconFileCheck,
  IconQrcode,
  IconShoppingBag,
  IconUserPlus,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';
import { URL_MODUL_SMK } from './urlModul.js';

export const META = {
  // Sama dengan Landing.jsx lama.
  title: 'Absenin Aja | Tata Kelola & Absensi Sekolah',
  description: 'Absensi QR, jadwal, jurnal guru, dan kabar kehadiran untuk wali murid dalam satu sistem sekolah.',
};

export const HERO = {
  eyebrow: 'Absensi dan tata kelola sekolah',
  judul: 'Dari gerbang sampai ruang kelas, *semua tercatat di satu sistem.*',
  sub: {
    web: 'Absensi QR, jadwal, jurnal guru, dan kabar kehadiran untuk wali murid dalam satu sistem.',
    mobile: 'Absensi, jadwal, dan jurnal di satu sistem.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Fitur Lengkap', rute: 'fitur' },
  // Naskah G4: "tahan sampai terverifikasi" (H-20). Klaim layanan belum terbukti, jadi
  // catatan di bawah tombol tidak ditampilkan. Isi lagi hanya setelah diverifikasi.
  catatan: null,
};

// Naskah G4: tiga butir angka contoh (2.000+ pengguna, Jan 2026, 10 peran) dihapus,
// tersisa "Web + HP". Isi ulang hanya dari kueri produksi bertanggal (H-18).
export const FAKTA = [{ nilai: 'Web *+ HP*', label: 'Admin di web, guru dan wali di aplikasi' }];

export const SEBELUM_SESUDAH = {
  eyebrow: 'Dari manual ke tersambung',
  judul: 'Pekerjaan yang dulu diulang, kini *cukup dicatat sekali*',
  sub: {
    web: 'Data dicatat di tempat asalnya, lalu dipakai ulang oleh rekap dan notifikasi.',
    mobile: 'Dicatat sekali, dipakai di semua fitur.',
  },
  sebelum: {
    tag: 'Sebelum',
    judul: 'Administrasi manual',
    verifikasi: 'Verifikasi H-25', // praktik "jurnal ditulis di buku" di sekolah sasaran
    butir: [
      'Rekap absensi dikerjakan manual',
      'Jurnal mengajar ditulis di buku',
      'Jadwal tersebar di banyak berkas',
      'Wali menelepon sekolah untuk bertanya',
    ],
  },
  sesudah: {
    tag: 'Sesudah',
    judul: 'Dengan Absenin Aja',
    butir: [
      'Absensi QR langsung masuk rekap',
      'Jurnal mengajar dicatat di sistem',
      'Jadwal sekolah di satu tempat',
      'Wali menerima kabar otomatis',
    ],
  },
};

export const FITUR = {
  id: 'fitur',
  eyebrow: 'Fitur',
  judul: 'Fitur yang berjalan membaca *data yang sama*',
  modul: [
    { ikon: IconQrcode, judul: 'Absensi QR', deskripsi: 'Kartu QR saat datang dan pulang.' },
    { ikon: IconCalendar, judul: 'Jadwal sekolah', deskripsi: 'Kelas, mapel, dan ekskul.' },
    { ikon: IconFileCheck, judul: 'Izin dan rekap', deskripsi: 'Izin tercatat, rekap siap diunduh.' },
    { ikon: IconUsers, judul: 'Data murid dan pegawai', deskripsi: 'Murid, wali, guru, staf, dan kelas.' },
    { ikon: IconWallet, judul: 'Keuangan dan SPP', chip: 'segera', deskripsi: 'Tagihan dan riwayat pembayaran.' },
    { ikon: IconUserPlus, judul: 'Murid baru', chip: 'segera', deskripsi: 'Pendaftaran lewat web.' },
    { ikon: IconBell, judul: 'Kabar wali murid', deskripsi: 'Lewat notifikasi di aplikasi wali.' },
    { ikon: IconShoppingBag, judul: 'Kantin', chip: 'segera', deskripsi: 'Saldo digital dan transaksi.' },
  ],
  analitik: {
    judul: 'Analitik pembelajaran untuk guru',
    // Bentuk rencana seperti naskah D2 (LAKSANA berchip Segera, guru mulai Januari).
    chip: 'segera',
    verifikasi: 'Verifikasi H-5',
    deskripsi: {
      web: 'Guru akan melihat penanda dari nilai dan kehadiran.',
      mobile: 'Guru akan dapat penanda, keputusan tetap di guru.',
    },
    tag: ['Impor dari Excel', 'Nilai per tujuan', 'Saran tindak lanjut'],
    aksi: { label: 'Lihat Analitik', rute: 'analitik' },
  },
};

export const UNTUK_SEKOLAH = {
  id: 'untuk-sekolah',
  eyebrow: 'Untuk sekolah',
  judul: 'Untuk sekolah umum dan *SMK*',
  kartu: [
    {
      id: 'umum',
      judul: 'Sekolah umum',
      sub: 'SD, MI, SMP, MTs, SMA, MA',
      butir: [
        'Absensi QR dan rekap otomatis',
        'Kabar kehadiran ke wali murid',
        { teks: 'Analitik pembelajaran untuk guru', chip: 'segera' },
      ],
      peran: ['Admin', 'Kepala sekolah', 'Guru', 'Guru BK', 'Wali murid'],
      aksi: { label: 'Lihat Fitur', rute: 'fitur' },
    },
    {
      id: 'smk',
      judul: 'SMK dan MAK',
      sub: 'Jurusan, kompetensi, dan PKL',
      butir: ['Semua fitur sekolah umum', 'Jurusan dan kompetensi SKKNI', 'Penempatan dan logbook PKL'],
      peran: ['Kepala jurusan', 'Mitra industri', 'Guru produktif'],
      aksi: { label: 'Buka Prakersa', href: URL_MODUL_SMK },
    },
  ],
};

export const KOMUNIKASI = {
  eyebrow: 'Komunikasi',
  judul: 'Wali murid menerima *kabar kehadiran di aplikasi*',
  sub: {
    web: 'Kabar kehadiran sampai ke wali lewat notifikasi di aplikasi.',
    mobile: 'Kabar kehadiran lewat notifikasi aplikasi.',
  },
  kanal: ['Aplikasi wali', 'Notifikasi otomatis'],
};

export const PENDAMPINGAN = {
  id: 'pendampingan',
  eyebrow: 'Pendampingan',
  judul: 'Didampingi dari *hari pertama*',
  sub: {
    web: 'Dari demo sampai tim sekolah bisa berjalan sendiri.',
    mobile: 'Dari demo sampai sekolah mandiri.',
  },
  banner: {
    judul: 'Pendampingan selama berlangganan',
    deskripsi: {
      web: 'Tim kami menemani dari penyiapan sampai dukungan harian.',
      mobile: 'Ditemani dari penyiapan sampai harian.',
    },
  },
  langkah: [
    { judul: 'Demo', deskripsi: 'Kebutuhan dipetakan' },
    { judul: 'Penyiapan data', deskripsi: 'Murid, pegawai, jadwal' },
    { judul: 'Pelatihan', deskripsi: 'Per peran' },
    { judul: 'Dukungan WhatsApp', deskripsi: 'Jam kerja sekolah', verifikasi: 'Verifikasi H-20' },
  ],
};

export const FAQ = {
  id: 'tanya-jawab',
  eyebrow: 'Pertanyaan umum',
  judul: 'Yang sering ditanyakan *sebelum memulai*',
  labelTab: 'Kelompok pertanyaan',
  kelompok: [
    {
      id: 'tentang',
      nama: 'Tentang',
      butir: [
        {
          q: 'Apa itu Absenin Aja?',
          a: 'Sistem sekolah untuk absensi QR, jadwal, jurnal guru, dan kabar kehadiran wali murid.',
        },
        {
          q: 'Bisakah dipilih per modul?',
          a: 'Fitur inti ada di setiap paket. Jurusan, PKL, dan analitik pembelajaran ditambahkan sesuai kebutuhan.',
          verifikasi: 'Verifikasi H-24',
        },
      ],
    },
    {
      id: 'keamanan',
      nama: 'Keamanan',
      butir: [
        { q: 'Siapa yang bisa melihat data murid?', a: 'Hanya peran yang berwenang. Data tiap sekolah terpisah.' },
        { q: 'Apakah data sekolah terlihat sekolah lain?', a: 'Tidak. Data setiap sekolah dipisahkan.' },
      ],
    },
    {
      id: 'biaya',
      nama: 'Biaya',
      butir: [
        { q: 'Berapa biayanya?', a: 'Disesuaikan dengan jumlah murid dan modul. Dibahas saat demo.' },
        {
          q: 'Bisakah guru memakai tanpa sekolah berlangganan?',
          a: 'Bisa. LAKSANA, analitik pembelajaran untuk guru, segera dipakai guru, juga lewat akun guru mandiri.',
          verifikasi: 'Verifikasi H-5, H-23',
        },
      ],
    },
  ],
};

export const CTA = {
  judul: 'Siap merapikan administrasi sekolah?',
  sub: {
    web: 'Jadwalkan demo. Kita mulai dari kebutuhan yang paling mendesak.',
    mobile: 'Jadwalkan demo, mulai dari yang mendesak.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Masuk ke Akun', rute: 'masuk' },
};

// Data peraga (mock). Semua angka dan nama adalah contoh, bukan data sekolah.
// DUMMY: ganti dengan data produksi bila mockup diganti tangkapan layar asli.
export const MOCK_DASBOR = {
  judul: 'Kehadiran hari ini',
  status: 'Langsung',
  statistik: [
    { angka: '642', label: 'Hadir' },
    { angka: '97%', label: 'Tingkat hadir' },
    { angka: 'Rekap', label: 'otomatis' },
  ],
  grafik: {
    judul: 'Kehadiran per hari',
    tren: '+4% pekan ini',
    // tinggi (persen), jenis: biasa | sorot | pudar
    batang: [
      { hari: 'Sen', tinggi: 58, jenis: 'biasa' },
      { hari: 'Sel', tinggi: 70, jenis: 'biasa' },
      { hari: 'Rab', tinggi: 62, jenis: 'biasa' },
      { hari: 'Kam', tinggi: 82, jenis: 'biasa' },
      { hari: 'Jum', tinggi: 96, jenis: 'sorot' },
      { hari: 'Sab', tinggi: 40, jenis: 'pudar' },
      { hari: 'Min', tinggi: 22, jenis: 'pudar' },
    ],
  },
  tersambung: { teks: 'Data murid dan kehadiran terhubung otomatis', status: 'Aktif' },
  kartuScan: { judul: 'Scan QR masuk', sub: 'XI RPL 1, 06.52' },
  kartuKabar: { judul: 'Kabar untuk wali murid', teks: 'Ananda Rizky tercatat hadir pukul 06.52.' },
};

export const MOCK_PONSEL = {
  judul: 'Absenin Aja',
  pesan: [
    { waktu: '06.52', teks: 'Ananda Rizky tercatat hadir pukul 06.52.' },
    { waktu: '15.30', teks: 'Ananda Rizky tercatat pulang pukul 15.30.' },
  ],
};
