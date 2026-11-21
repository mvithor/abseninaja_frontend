// Teks dan daftar halaman Keamanan Data (`/bukti/keamanan-data`). Disalin apa
// adanya dari desain kanvas (Keamanan.dc.html dan Keamanan-Seluler.dc.html).
// Teks dua versi berbentuk { web, mobile }. Tanda bintang pada judul (*kata*) =
// kata berwarna aksen (di latar gelap: kuning).
//
// SELURUH ISI HALAMAN INI DUMMY dari desain (instruksi pengguna 21 Nov 2026:
// dummy dulu agar desain bersih). Halaman digerbang oleh BUKTI_DIRILIS
// (lib/gerbang.js) dan tidak boleh tampil di produksi sebelum klaim keamanan
// diverifikasi ke tim teknis dan data legalitas nyata ada. `verifikasi` (true
// atau teks label) = klaim berisiko; penandanya tampil hanya bila
// flags.tampilkanPenandaDesain menyala.
import { IconEye, IconFileText, IconLock, IconScan, IconServer, IconShieldCheck, IconStack2 } from '@tabler/icons-react';

export const META = {
  title: 'Keamanan Data | Absenin Aja',
  description: 'Setiap sekolah punya data sendiri, dan setiap peran hanya melihat yang perlu dilihat.',
};

// DUMMY wajib diganti sebelum main (klaim keamanan di judul dan subjudul).
export const HERO = {
  eyebrow: 'Bukti · Keamanan Data',
  judul: 'Data sekolah *dijaga tersendiri.*',
  sub: {
    web: 'Setiap sekolah punya data sendiri, dan setiap peran hanya melihat yang perlu dilihat.',
    mobile: 'Data terpisah, akses sesuai peran.',
  },
  verifikasi: 'Verifikasi klaim keamanan',
};

export const SOROT = {
  id: 'judul-jaminan-data',
  ikon: IconShieldCheck,
  judul: 'Data tiap sekolah terpisah',
  teks: {
    web: 'Data satu sekolah tidak terlihat oleh sekolah lain.',
    mobile: 'Data sekolah lain tidak terlihat.',
  },
  aksi: { label: 'Tanya Tim Kami', rute: 'demo' },
  // DUMMY wajib diganti sebelum main
  verifikasi: 'Verifikasi klaim keamanan',
};

export const PRINSIP = {
  id: 'judul-prinsip',
  eyebrow: 'Empat prinsip',
  judul: 'Cara kami *menjaga data*',
  butir: [
    {
      ikon: IconStack2,
      judul: 'Data tiap sekolah terpisah',
      deskripsi: {
        web: 'Data murid, pegawai, dan keuangan satu sekolah tidak tercampur dengan sekolah lain.',
        mobile: 'Data tiap sekolah tidak tercampur.',
      },
      // DUMMY wajib diganti sebelum main
      verifikasi: 'Verifikasi klaim keamanan',
    },
    {
      ikon: IconEye,
      judul: 'Akses sesuai peran',
      deskripsi: {
        web: 'Admin, guru, kepala sekolah, dan wali murid hanya melihat bagian yang menjadi tugasnya.',
        mobile: 'Peran hanya melihat bagiannya.',
      },
      // DUMMY wajib diganti sebelum main
      verifikasi: 'Verifikasi klaim keamanan',
    },
    {
      ikon: IconLock,
      judul: 'Masuk dengan akun sendiri',
      deskripsi: {
        web: 'Setiap pengguna punya akun. Aktivitas penting dapat ditelusuri ke akun tersebut.',
        mobile: 'Aktivitas penting bisa ditelusuri.',
      },
      // DUMMY wajib diganti sebelum main
      verifikasi: 'Verifikasi klaim keamanan',
    },
    {
      ikon: IconServer,
      judul: 'Cadangan dan pemulihan',
      deskripsi: {
        web: 'Data dicadangkan berkala agar dapat dipulihkan bila ada gangguan.',
        mobile: 'Dicadangkan berkala, mudah dipulihkan.',
      },
      // DUMMY wajib diganti sebelum main
      verifikasi: 'Verifikasi klaim cadangan berkala',
    },
  ],
};

// DUMMY wajib diganti sebelum main: seluruh tiga tahap adalah klaim keamanan
// yang harus dicocokkan dengan praktik teknis sebenarnya.
export const TAHAP = {
  id: 'judul-perjalanan-data',
  eyebrow: 'Perjalanan data',
  judul: 'Dari dicatat sampai *dilihat*',
  sub: {
    web: 'Tiga tahap, dan di setiap tahap ada batas siapa yang boleh mengakses.',
    mobile: 'Tiga tahap, tiap tahap ada batas akses.',
  },
  butir: [
    {
      ikon: IconScan,
      label: 'Tahap 1',
      judul: 'Dicatat',
      deskripsi: {
        web: 'Absensi dan data sekolah dicatat oleh pengguna yang berwenang.',
        mobile: 'Dicatat oleh pengguna berwenang.',
      },
      verifikasi: 'Verifikasi klaim pencatatan oleh pengguna berwenang',
    },
    {
      ikon: IconServer,
      label: 'Tahap 2',
      judul: 'Disimpan',
      deskripsi: {
        web: 'Data disimpan terpisah per sekolah dan dicadangkan secara berkala.',
        mobile: 'Disimpan terpisah, dicadangkan berkala.',
      },
      // DUMMY wajib diganti sebelum main
      verifikasi: 'Verifikasi klaim cadangan berkala',
    },
    {
      ikon: IconEye,
      label: 'Tahap 3',
      judul: 'Dilihat',
      deskripsi: {
        web: 'Hanya peran yang diberi hak yang dapat membuka data tersebut.',
        mobile: 'Hanya peran berhak yang dapat membuka.',
      },
      verifikasi: 'Verifikasi klaim akses sesuai peran',
    },
  ],
};

// Ringkasan dokumen legalitas. Kartu menaut ke halaman Legalitas (`rute`).
// DUMMY wajib diganti sebelum main: seluruh nomor dokumen di blok ini.
export const DOKUMEN = {
  id: 'judul-legalitas-ringkas',
  eyebrow: 'Legalitas',
  judul: 'Dokumen resmi *kami*',
  sub: {
    web: 'Dokumen legalitas yang dapat diperiksa oleh sekolah.',
    mobile: 'Dokumen yang dapat diperiksa sekolah.',
  },
  rute: 'legalitas',
  // DUMMY wajib diganti sebelum main. Data PT nyata (SK AHU-A123697.AH.01.30.Tahun
  // 2026, 19 September 2026) menggantikan nomor di bawah kelak; JANGAN diisi
  // sebelum dokumen dan izin tampil siap.
  butir: [
    { ikon: IconFileText, judul: 'Badan hukum', nomor: 'No. 000/2026', verifikasi: 'Verifikasi nomor badan hukum' },
    { ikon: IconFileText, judul: 'NPWP perusahaan', nomor: 'No. 000/2026', verifikasi: 'Verifikasi nomor NPWP' },
    { ikon: IconFileText, judul: 'NIB dan izin usaha', nomor: 'No. 000/2026', verifikasi: 'Verifikasi nomor NIB' },
    { ikon: IconShieldCheck, judul: 'Pendaftaran PSE', nomor: 'No. 000/2026', verifikasi: 'Verifikasi pendaftaran PSE' },
  ],
};

export const CTA = {
  judul: 'Ada pertanyaan soal data sekolah Anda?',
  sub: {
    web: 'Tim kami siap menjelaskan, termasuk saat demo.',
    mobile: 'Kami jelaskan, termasuk saat demo.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Kebijakan Privasi', rute: 'kebijakanPrivasi' },
};
