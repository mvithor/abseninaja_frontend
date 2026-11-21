// Teks dan daftar halaman Tentang Kami (`/tentang-kami`). Disalin apa adanya dari
// desain kanvas (Tentang.dc.html dan Tentang-Seluler.dc.html). Teks dua versi
// berbentuk { web, mobile }. Tanda bintang pada judul (*kata*) = kata berwarna
// aksen (di latar gelap: kuning).
//
// `verifikasi` (true atau teks label) = klaim yang belum diverifikasi. Penandanya
// tampil hanya bila flags.tampilkanPenandaDesain menyala.
//
// SELURUH ISI HALAMAN INI DUMMY dari desain (instruksi pengguna: dummy dulu agar
// desain bersih). Halaman digerbang oleh PERUSAHAAN_DIRILIS (lib/gerbang.js) dan
// tidak boleh tampil di produksi sebelum data nyata ada.
//
// DUMMY wajib diganti sebelum main:
//  - PENDIRI: inisial "NP" (kotak inisial sebagai pengganti foto; foto belum ada),
//    dan cerita pendiri (dua paragraf)
//  - KUTIPAN: nama "Nama Pendiri" dan isi kutipan
//  - PERJALANAN: seluruh linimasa (2024, 2025, Jan 2026, 2026)
//  - HERO: "Data dijaga"; NILAI: "Amanah (data dijaga dan dipakai seperlunya)"
//  - HUBUNGI: alamat, nomor WhatsApp, dan email tidak ada di sini: diambil dari
//    data/kontak.js (ALAMAT, CONTACT, KONTAK_RESMI), yang juga dummy. Ketiganya hanya
//    tampil bila KONTAK_TAMPIL (kontak resmi, atau DEV); WhatsApp dan email baru
//    menjadi tautan bila KONTAK_RESMI true.
import { IconHeadphones, IconMapPin, IconSchool, IconShieldCheck, IconUsers } from '@tabler/icons-react';

// Teks meta (judul dan deskripsi) tidak ada di desain: judul memakai pola halaman
// lain, deskripsi = subjudul hero desain.
export const META = {
  title: 'Tentang Kami | Absenin Aja',
  description: 'Kami membangun Absenin Aja bersama guru dan sekolah yang sehari-hari memakainya.',
};

export const HERO = {
  eyebrow: 'Perusahaan · Tentang Kami',
  judul: 'Dibangun untuk *sekolah yang ingin lebih rapi.*',
  sub: {
    web: 'Kami membangun Absenin Aja bersama guru dan sekolah yang sehari-hari memakainya.',
    mobile: 'Dibangun bersama guru dan sekolah.',
  },
  fakta: [
    { ikon: IconUsers, label: 'Tim sendiri' },
    { ikon: IconSchool, label: 'Dekat dengan sekolah' },
    { ikon: IconShieldCheck, label: 'Data dijaga', verifikasi: 'Verifikasi klaim data dijaga' }, // DUMMY wajib diganti sebelum main
    { ikon: IconHeadphones, label: 'Mendampingi' },
  ],
};

export const PENDIRI = {
  id: 'judul-pendiri',
  // DUMMY wajib diganti sebelum main: kotak inisial pengganti foto pendiri (foto belum ada).
  inisial: 'NP',
  peran: 'Pendiri Absenin Aja',
  eyebrow: 'Cerita pembuat',
  judul: 'Siapa di balik *Absenin Aja*',
  // DUMMY wajib diganti sebelum main: cerita pendiri (klaim asal-usul produk).
  paragraf: [
    {
      web: 'Absenin Aja lahir dari pengalaman melihat langsung betapa banyak waktu guru habis untuk rekap manual.',
      mobile: 'Lahir dari waktu guru yang habis untuk rekap.',
    },
    {
      web: 'Kami mulai dari absensi, lalu tumbuh bersama kebutuhan sekolah: jadwal, keuangan, komunikasi, dan analitik pembelajaran.',
      mobile: 'Tumbuh bersama kebutuhan sekolah.',
    },
  ],
  verifikasi: 'Verifikasi cerita pendiri',
};

// DUMMY wajib diganti sebelum main: nama pendiri dan isi kutipan.
export const KUTIPAN = {
  teks: {
    web: 'Teknologi sekolah seharusnya meringankan pekerjaan guru, bukan menambahnya.',
    mobile: 'Teknologi sekolah harus meringankan guru.',
  },
  nama: 'Nama Pendiri',
  peran: 'Pendiri',
  verifikasi: 'Verifikasi nama dan kutipan pendiri',
};

// DUMMY wajib diganti sebelum main: seluruh linimasa (tahun dan isi). Butir berurutan
// menurut waktu; tampil sebagai daftar berurutan.
export const PERJALANAN = {
  id: 'judul-perjalanan',
  eyebrow: 'Perjalanan',
  judul: 'Dari ide ke *sekolah pertama*',
  butir: [
    {
      tahun: '2024',
      judul: 'Ide dan riset awal',
      deskripsi: {
        web: 'Kebutuhan guru dan sekolah dipetakan lewat percakapan langsung.',
        mobile: 'Kebutuhan sekolah dipetakan langsung.',
      },
      verifikasi: 'Verifikasi linimasa 2024',
    },
    {
      tahun: '2025',
      judul: 'Versi pertama dibuat',
      deskripsi: {
        web: 'Absensi QR dan jadwal sekolah mulai dibangun dan dicoba.',
        mobile: 'Absensi QR dan jadwal mulai dibangun.',
      },
      verifikasi: 'Verifikasi linimasa 2025',
    },
    {
      tahun: 'Jan 2026',
      judul: 'Mulai dipakai sekolah',
      deskripsi: {
        web: 'Sekolah mitra pertama memakai Absenin Aja setiap hari.',
        mobile: 'Sekolah mitra pertama memakainya.',
      },
      verifikasi: 'Verifikasi sekolah mitra pertama dan tanggalnya',
    },
    {
      tahun: '2026',
      judul: 'Modul terus bertambah',
      deskripsi: {
        web: 'Keuangan, komunikasi wali, dan analitik pembelajaran menyusul.',
        mobile: 'Keuangan, wali, dan analitik menyusul.',
      },
      verifikasi: 'Verifikasi rencana modul 2026',
    },
  ],
};

export const NILAI = {
  id: 'judul-nilai',
  eyebrow: 'Nilai kami',
  judul: 'Yang kami *pegang*',
  butir: [
    {
      ikon: IconShieldCheck,
      judul: 'Amanah',
      deskripsi: { web: 'Data sekolah dijaga dan dipakai seperlunya.', mobile: 'Data dijaga, dipakai seperlunya.' },
      verifikasi: 'Verifikasi klaim data dijaga', // DUMMY wajib diganti sebelum main
    },
    {
      ikon: IconUsers,
      judul: 'Bermanfaat',
      deskripsi: { web: 'Fitur dibuat dari kebutuhan nyata sekolah.', mobile: 'Fitur dari kebutuhan nyata sekolah.' },
    },
    {
      ikon: IconHeadphones,
      judul: 'Mendampingi',
      deskripsi: 'Sekolah tidak dibiarkan jalan sendiri.',
    },
  ],
};

// Blok hubungi: alamat, nomor WhatsApp, dan email dari data/kontak.js (komponen
// HubungiKami). `sub` hanya tampil bila ada butir kontak; bila tidak ada, kartu
// memakai `aksiCadangan` (label dari tombol CTA halaman ini) tanpa kalimat yang
// menjanjikan kontak.
export const HUBUNGI = {
  id: 'judul-hubungi',
  judul: 'Hubungi dan temui kami',
  sub: {
    web: 'Datang, telepon, atau tulis pesan. Kami senang berkenalan.',
    mobile: 'Datang, telepon, atau tulis pesan.',
  },
  ikonAlamat: IconMapPin,
  aksiCadangan: [
    { label: 'Jadwalkan Demo', rute: 'demo' },
    { label: 'Kerja Sama', rute: 'kerjaSama', varian: 'garis' },
  ],
  verifikasi: 'Verifikasi kontak dan alamat',
};

export const CTA = {
  judul: 'Mari berkenalan lebih dekat',
  sub: {
    web: 'Jadwalkan demo atau hubungi kami langsung.',
    mobile: 'Jadwalkan demo atau hubungi kami.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Kerja Sama', rute: 'kerjaSama' },
};
