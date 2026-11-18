// Teks dan daftar Beranda (`/`). Disalin apa adanya dari desain kanvas
// (Beranda-v3.dc.html). Teks dua versi berbentuk { web, mobile }; versi seluler
// satu baris diambil dari gen/short.py (kunci = teks web persis).
// Tanda bintang pada judul (*kata*) menandai kata berwarna aksen (renderJudul).
//
// `verifikasi: true` = angka atau klaim contoh yang belum diverifikasi.
// Ganti dengan data produksi sebelum tayang. Penandanya tampil hanya bila
// flags.tampilkanPenandaDesain menyala.
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
import { URL_MODUL_SMK } from './nav';

export const META = {
  // Sama dengan Landing.jsx lama.
  title: 'Absenin Aja | Tata Kelola & Absensi Sekolah',
  description: 'Solusi terintegrasi untuk absensi digital dan manajemen akademik sekolah.',
};

export const HERO = {
  eyebrow: 'Absensi dan tata kelola sekolah',
  judul: 'Dari gerbang sampai ruang kelas, *semua tercatat di satu sistem.*',
  sub: {
    web: 'Absensi QR, jadwal, keuangan, dan kabar wali murid dalam satu tempat.',
    mobile: 'Absensi, jadwal, dan keuangan di satu tempat.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Fitur Lengkap', rute: 'fitur' },
  catatan: 'Demo gratis, tanpa komitmen',
};

// DUMMY: ganti dengan data produksi (angka pada tiga butir pertama adalah contoh).
export const FAKTA = [
  { nilai: '2.000*+*', label: 'Pengguna aktif', verifikasi: true }, // DUMMY: ganti dengan data produksi
  { nilai: 'Jan *2026*', label: 'Mulai dipakai sekolah', verifikasi: true }, // DUMMY: ganti dengan data produksi
  { nilai: '10 *peran*', label: 'Tampilan sendiri', verifikasi: true }, // DUMMY: ganti dengan data produksi
  { nilai: 'Web *+ HP*', label: 'Admin di web, guru dan wali di aplikasi' },
];

export const SEBELUM_SESUDAH = {
  eyebrow: 'Dari manual ke tersambung',
  judul: 'Pekerjaan yang dulu diulang, kini *cukup dicatat sekali*',
  sub: {
    web: 'Data dicatat di tempat asalnya, lalu dipakai ulang oleh rekap dan notifikasi.',
    mobile: 'Dicatat sekali, dipakai di semua modul.',
  },
  sebelum: {
    tag: 'Sebelum',
    judul: 'Administrasi manual',
    butir: [
      'Rekap absensi dikerjakan manual',
      'SPP dicatat di buku kas',
      'Jadwal tersebar di banyak berkas',
      'Wali menelepon sekolah untuk bertanya',
    ],
  },
  sesudah: {
    tag: 'Sesudah',
    judul: 'Dengan Absenin Aja',
    butir: [
      'Absensi QR langsung masuk rekap',
      'Tagihan SPP tercatat digital',
      'Jadwal sekolah di satu tempat',
      'Wali menerima kabar otomatis',
    ],
  },
};

export const FITUR = {
  id: 'fitur',
  eyebrow: 'Fitur',
  judul: 'Semua modul membaca *data yang sama*',
  modul: [
    { ikon: IconQrcode, judul: 'Absensi QR', deskripsi: 'Kartu QR saat datang dan pulang.' },
    { ikon: IconCalendar, judul: 'Jadwal sekolah', deskripsi: 'Kelas, mapel, ekskul, dan ujian.' },
    { ikon: IconFileCheck, judul: 'Izin dan rekap', deskripsi: 'Izin tercatat, rekap siap diunduh.' },
    { ikon: IconUsers, judul: 'Data murid dan pegawai', deskripsi: 'Murid, wali, guru, staf, dan kelas.' },
    { ikon: IconWallet, judul: 'Keuangan dan SPP', deskripsi: 'Tagihan dan riwayat pembayaran.' },
    { ikon: IconUserPlus, judul: 'Murid baru', deskripsi: 'Pendaftaran sampai penempatan kelas.' },
    { ikon: IconBell, judul: 'Kabar wali murid', deskripsi: 'Lewat aplikasi dan WhatsApp.' },
    { ikon: IconShoppingBag, judul: 'Kantin', status: 'Segera', deskripsi: 'Saldo digital dan transaksi.' },
  ],
  analitik: {
    judul: 'Analitik pembelajaran untuk guru',
    deskripsi: {
      web: 'Guru melihat murid yang perlu perhatian, dari nilai dan kehadiran kelas.',
      mobile: 'Lihat murid yang perlu perhatian.',
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
      butir: ['Absensi QR dan rekap otomatis', 'Kabar kehadiran ke wali murid', 'Analitik pembelajaran untuk guru'],
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
  judul: 'Wali murid tahu *di hari yang sama*',
  sub: {
    web: 'Kabar kehadiran dan tagihan sampai lewat aplikasi atau WhatsApp, tanpa menelepon satu per satu.',
    mobile: 'Kabar sampai lewat aplikasi dan WhatsApp.',
  },
  kanal: ['Aplikasi wali', 'WhatsApp', 'Templat pesan'],
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
    { judul: 'Dukungan WhatsApp', deskripsi: 'Jam kerja sekolah' },
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
          a: 'Platform sekolah untuk absensi QR, jadwal, keuangan, dan kabar wali murid dalam satu sistem.',
        },
        { q: 'Bisakah dipilih per modul?', a: 'Bisa. Sekolah mulai dari satu modul lalu menambah yang lain.' },
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
          a: 'Bisa, untuk analitik pembelajaran lewat akun guru mandiri.',
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
    { angka: '0 jam', label: 'Rekap manual' },
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
  tersambung: { teks: 'Data murid dan SPP terhubung otomatis', status: 'Aktif' },
  kartuScan: { judul: 'Scan QR masuk', sub: 'XI RPL 1, 06.52' },
  kartuKabar: { judul: 'Kabar untuk wali murid', teks: 'Ananda Rizky tercatat hadir pukul 06.52.' },
};

export const MOCK_PONSEL = {
  judul: 'Absenin Aja',
  pesan: [
    { waktu: '06.52', teks: 'Ananda Rizky tercatat hadir pukul 06.52.' },
    { waktu: '12.10', teks: 'Tagihan SPP Januari jatuh tempo tanggal 10.' },
    { waktu: '15.30', teks: 'Ananda Rizky tercatat pulang pukul 15.30.' },
  ],
};
