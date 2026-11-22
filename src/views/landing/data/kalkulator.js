// Teks dan data halaman Kalkulator Digitalisasi (`/kalkulator`). Disalin apa
// adanya dari desain kanvas (Kalkulator.dc.html dan Kalkulator-Seluler.dc.html;
// pertanyaan, pilihan, ambang, dan saran dari blok script `class Component`).
// Teks dua versi berbentuk { web, mobile }. Tanda bintang pada judul (*kata*) =
// kata berwarna aksen (di latar gelap: kuning). Rumus dan fungsi skor ada di
// lib/kalkulator.js (murni, ada tesnya); berkas ini hanya data.
//
// Halaman digerbang oleh ALAT_DIRILIS (lib/gerbang.js) dan tidak boleh tampil di
// produksi sebelum tim menetapkan versi sebenarnya.
//
// DUMMY wajib diganti sebelum main:
//  - ketujuh pertanyaan (SOAL), ketiga pilihan jawaban (OPSI), dan ambang tingkat
//    35 dan 70 (AMBANG): CONTOH dari desain, belum ditetapkan tim
//  - tiga nama tingkat dan tiga teks saran (TINGKAT)
//  - klaim "Skor menunjukkan tahap digitalisasi sekolah" dan "Saran modul yang
//    paling relevan" (BERIKUTNYA): hasil contoh belum merupakan penilaian resmi
//  - "Waktu pengisian sekitar 2 menit": perkiraan desain, belum diukur
//
// Teks tingkat dan saran sengaja tanpa angka dan tanpa klaim hasil (tes di
// lib/kalkulator.test.js menjaga ini).
import { IconChartLine, IconCheck, IconHeadphones, IconPlayerPlay, IconSparkles, IconStack2 } from '@tabler/icons-react';
import { terbilang } from '../lib/kalkulator.js';

// DUMMY wajib diganti sebelum main
export const SOAL = [
  'Bagaimana penerimaan murid baru dikelola di sekolah Anda?',
  'Bagaimana absensi murid dan guru dicatat?',
  'Bagaimana jadwal pelajaran disusun dan dibagikan?',
  'Bagaimana tagihan SPP dan pembayaran dicatat?',
  'Bagaimana nilai dan rapor murid dikelola?',
  'Bagaimana kabar sekolah disampaikan ke wali murid?',
  'Bagaimana laporan untuk kepala sekolah disiapkan?',
];

export const JUMLAH_SOAL = SOAL.length;

// Nilai harus 0 sampai NILAI_MAKS (lib/kalkulator.js).
// DUMMY wajib diganti sebelum main
export const OPSI = [
  { label: 'Belum ada', nilai: 0 },
  { label: 'Sebagian', nilai: 1 },
  { label: 'Sudah berjalan', nilai: 2 },
];

// Batas bawah inklusif tiap tingkat, dalam persen.
// DUMMY wajib diganti sebelum main
export const AMBANG = { berkembang: 35, terintegrasi: 70 };

// DUMMY wajib diganti sebelum main
export const TINGKAT = {
  awal: {
    label: 'Tahap awal',
    saran: 'Mulai dari satu proses yang paling memakan waktu, misalnya absensi.',
  },
  berkembang: {
    label: 'Berkembang',
    saran: 'Sebagian proses sudah digital. Hubungkan yang tersisa agar data tidak terpisah.',
  },
  terintegrasi: {
    label: 'Terintegrasi',
    saran: 'Sebagian besar proses sudah digital. Fokus pada analitik dan komunikasi.',
  },
};

export const META = {
  title: 'Kalkulator Digitalisasi | Absenin Aja',
  description: `Jawab ${terbilang(JUMLAH_SOAL)} pertanyaan singkat untuk mendapatkan skor dan saran.`,
};

export const HERO = {
  eyebrow: 'Alat bantu · Kalkulator Digitalisasi',
  judul: 'Sudah seberapa *digital sekolah Anda?*',
  sub: {
    web: `Jawab ${terbilang(JUMLAH_SOAL)} pertanyaan singkat untuk mendapatkan skor dan saran.`,
    mobile: `Jawab ${terbilang(JUMLAH_SOAL)} soal, dapatkan skor dan saran.`,
  },
  fakta: [
    { ikon: IconCheck, label: `${JUMLAH_SOAL} pertanyaan` },
    { ikon: IconChartLine, label: 'Skor kesiapan' },
    { ikon: IconSparkles, label: 'Saran langkah' },
    { ikon: IconHeadphones, label: 'Bahas bersama tim' },
  ],
};

export const INTRO = {
  paragraf: {
    web: 'Alat ini membantu memetakan sejauh mana proses sekolah sudah digital, dari penerimaan murid sampai laporan ke kepala sekolah.',
    mobile: 'Petakan seberapa digital proses sekolah.',
  },
  butir: [
    { teks: `${JUMLAH_SOAL} pertanyaan tentang kondisi sekolah` },
    // DUMMY wajib diganti sebelum main (perkiraan waktu belum diukur)
    { teks: 'Waktu pengisian sekitar 2 menit', verifikasi: 'Verifikasi perkiraan waktu pengisian' },
    { teks: 'Skor dan saran langsung tampil di akhir' },
  ],
  aksi: 'Mulai Cek Skor',
  // Rumus dan ambang contoh (penanda desain; tampil hanya bila penanda dinyalakan).
  verifikasi: 'Verifikasi rumus dan ambang skor (contoh)',
};

// Teks kuis. `nomor` dan `total` diisi saat dirender.
export const KUIS = {
  labelPertanyaan: (nomor, total) => `Pertanyaan ${nomor} dari ${total}`,
  labelKemajuan: 'Kemajuan pengisian',
  kembali: 'Kembali',
};

export const HASIL = {
  satuan: 'dari 100',
  aksiDemo: { label: 'Jadwalkan Demo', rute: 'demo' },
  ulangi: 'Ulangi',
  // Teks yang diumumkan pembaca layar saat hasil tampil. Nama tingkat tidak ikut:
  // sudah dibacakan lewat fokus ke judul hasil.
  pengumuman: (persen) => `Skor Anda ${persen} dari 100.`,
  // DUMMY wajib diganti sebelum main
  verifikasi: 'Verifikasi rumus, ambang, dan teks saran (contoh)',
};

export const JAMINAN = ['Gratis', 'Tanpa daftar', 'Hasil langsung'];

export const BERIKUTNYA = {
  id: 'judul-langkah-berikutnya',
  eyebrow: 'Sesudah skor',
  judul: 'Apa yang bisa *dilakukan berikutnya*',
  butir: [
    {
      ikon: IconChartLine,
      judul: 'Baca skor',
      deskripsi: {
        web: 'Skor menunjukkan tahap digitalisasi sekolah.',
        mobile: 'Skor tahap digitalisasi sekolah.',
      },
      // DUMMY wajib diganti sebelum main
      verifikasi: 'Verifikasi klaim skor',
    },
    {
      ikon: IconStack2,
      judul: 'Pilih modul',
      deskripsi: 'Saran modul yang paling relevan.',
      // DUMMY wajib diganti sebelum main
      verifikasi: 'Verifikasi klaim saran modul',
    },
    {
      ikon: IconPlayerPlay,
      judul: 'Jadwalkan demo',
      deskripsi: 'Bahas hasilnya bersama tim.',
    },
  ],
};

export const CTA = {
  judul: 'Mau membahas hasilnya?',
  sub: {
    web: 'Jadwalkan demo dan kita bahas langkah berikutnya.',
    mobile: 'Jadwalkan demo, bahas langkah berikutnya.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Fitur', rute: 'fitur' },
};
