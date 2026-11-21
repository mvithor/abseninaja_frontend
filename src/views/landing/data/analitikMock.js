// Data contoh (DUMMY) untuk peraga tampilan produk LAD di halaman Analitik
// (mock/lad). Dipisah dari data/analitik.js supaya semua angka contoh ada di
// satu tempat dan mudah diganti.
//
// DUMMY wajib diganti sebelum main: nama kelas, nama murid, angka, persen,
// nilai, jumlah pertemuan, KKTP 75, "Aturan versi 1.1", dan koordinat grafik.
// Semuanya sengaja contoh (copy-lad.md butir 6), bukan data nyata dan bukan
// ambang produk. Ganti dengan tangkapan layar Kelas latihan bila tersedia.
// `verifikasi` tampil hanya bila flags.tampilkanPenandaDesain menyala.
//
// Konsistensi antar peraga (Murid 14 sama di matriks, profil, dan hero): TP 1.1 = 84,
// 1.2 = 86, 2.3 = 72, 3.3 = 70; nilai di bawah KKTP contoh (75) selalu punya
// penanda P1.
import { yDariNilai } from '../lib/tren';

// DUMMY wajib diganti sebelum main. Peraga hero: kartu ringkasan kelas.
// `nada` memilih warna kartu (perhatian, pengayaan, belumCukup, lengkap); tiap
// kartu selalu punya label dan angka tertulis.
export const MOCK_KELAS = {
  judul: 'VIII B · Bahasa Arab',
  konteks: 'Ganjil 2026/2027 · 30 murid · 3 lingkup materi',
  aturan: 'Aturan versi 1.1',
  kartu: [
    {
      label: 'Perlu perhatian',
      nilai: '5',
      satuan: 'dari 30 murid',
      catatan: 'Satu murid dihitung sekali menurut pola utamanya.',
      nada: 'perhatian',
    },
    { label: 'Pengayaan', nilai: '1', satuan: 'murid', catatan: 'Nilai TP di atas batas pengayaan.', nada: 'pengayaan' },
    {
      label: 'Data belum cukup',
      nilai: '0',
      satuan: 'murid',
      catatan: 'Belum bisa dinilai. Ini bukan berarti aman.',
      nada: 'belumCukup',
    },
    { label: 'Kelengkapan nilai TP', nilai: '100%', catatan: '270 dari 270 isian terisi.', nada: 'lengkap' },
  ],
  sebaranJudul: 'Sebaran capaian per TP',
  // Lebar segmen mengikuti jumlah murid (flex). `ringkas` = teks di kanan baris.
  sebaran: [
    { tp: '1.1', belum: 1, tuntas: 27, pengayaan: 2, ringkas: '1 dari 30' },
    { tp: '1.2', belum: 1, tuntas: 26, pengayaan: 3, ringkas: '1 dari 30' },
    { tp: '2.3', belum: 2, tuntas: 26, pengayaan: 2, ringkas: '2 dari 30' },
  ],
  perhatianJudul: 'Murid perlu perhatian',
  perhatian: [
    { nama: 'Murid 14', penanda: ['P2', 'P1', 'P4'], bukti: '6 alpa dari 15' },
    { nama: 'Murid 17', penanda: ['P3'], bukti: 'Proyek 0' },
    { nama: 'Murid 10', penanda: ['P1'], bukti: 'TP 1.2 = 58' },
  ],
  saranMini: {
    label: 'Saran tindak lanjut',
    teks: 'Telusuri penyebab bersama murid dan wali kelas, lalu pantau kehadiran.',
    status: 'Draf dari sistem, belum dipakai',
  },
  verifikasi: 'Data contoh (6)',
};

// DUMMY wajib diganti sebelum main. Peraga matriks murid per TP. `nada` sel:
// tuntas (putih), belum (kuning), tinggi (hijau muda); nilai selalu tertulis.
export const MOCK_MATRIKS = {
  judul: 'Matriks murid dan capaian',
  kolom: { murid: 'Murid', penanda: 'Penanda', tp: ['1.1', '1.2', '2.3', '3.3'] },
  baris: [
    { nama: 'Murid 14', penanda: 'P2 P1 P4', sel: [[84, 'tuntas'], [86, 'tuntas'], [72, 'belum'], [70, 'belum']] },
    { nama: 'Murid 17', penanda: 'P3', sel: [[88, 'tuntas'], [90, 'tinggi'], [85, 'tuntas'], [86, 'tuntas']] },
    { nama: 'Murid 10', penanda: 'P1', sel: [[86, 'tuntas'], [58, 'belum'], [84, 'tuntas'], [82, 'tuntas']] },
    { nama: 'Murid 15', penanda: 'P1 P4', sel: [[92, 'tinggi'], [90, 'tinggi'], [78, 'tuntas'], [64, 'belum']] },
  ],
};

// DUMMY wajib diganti sebelum main. Nilai rata-rata per LM contoh; tinggi titik
// dan garis dihitung dari nilai lewat satu sumbu (lib/tren.js, ruang SVG 360 x
// 150), jadi sebanding dengan angkanya. Angka tampil (84, 73,3, 68, KKTP 75)
// sama dengan desain. `kktp.nilai` = KKTP contoh, bukan batas produk.
const NILAI_MURID = [84, 73.3, 68];
const NILAI_KELAS = [81, 81, 80.7];
const X_LM = [60, 190, 320];

export const MOCK_TREN = {
  judul: 'Tren nilai rata-rata per LM',
  garisBantu: [90, 75, 60].map((n) => yDariNilai(n)),
  kktp: { y: yDariNilai(75), label: 'KKTP 75' },
  murid: [
    { nilai: '84', lm: 'LM 1' },
    { nilai: '73,3', lm: 'LM 2' },
    { nilai: '68', lm: 'LM 3' },
  ].map((p, i) => ({ ...p, x: X_LM[i], y: yDariNilai(NILAI_MURID[i]) })),
  kelas: NILAI_KELAS.map((n, i) => ({ x: X_LM[i], y: yDariNilai(n) })),
  legenda: { murid: 'Murid', kelas: 'Rata-rata kelas', kktp: 'KKTP' },
};

// DUMMY wajib diganti sebelum main. Peraga profil murid. Status tiap TP
// ("Tuntas" atau "Belum tuntas") selalu tertulis; titik warna hanya penegas.
export const MOCK_PROFIL = {
  konteks: 'No absen 14 · VIII B · Ganjil 2026/2027',
  nama: 'Murid 14',
  penanda: [
    { kode: 'P2', nama: 'Sering alpa' },
    { kode: 'P1', nama: 'Kesulitan pada TP' },
    { kode: 'P4', nama: 'Capaian menurun' },
  ],
  judulTp: 'Capaian per tujuan pembelajaran',
  tp: [
    { tp: '1.1', nilai: '84', status: 'Tuntas', nada: 'tuntas' },
    { tp: '1.2', nilai: '86', status: 'Tuntas', nada: 'tuntas' },
    { tp: '2.3', nilai: '72', status: 'Belum tuntas', nada: 'belum', bukti: 'Bukti penanda P1' },
    { tp: '3.3', nilai: '70', status: 'Belum tuntas', nada: 'belum', bukti: 'Bukti penanda P1' },
  ],
  // Nama kolom Saran: cocokkan ejaan dengan antarmuka (butir 14).
  verifikasi: 'Nama kolom saran (14)',
};

export const MOCK_SARAN = {
  judul: 'Saran tindak lanjut',
  sub: 'Satu draf untuk setiap penanda. Pilih, ubah, lalu pakai atau abaikan.',
  tab: [
    { kode: 'P2', nama: 'Sering alpa', aktif: true },
    { kode: 'P1', nama: 'Kesulitan pada TP' },
  ],
  kolom: [
    { label: 'Mulai dari koneksi', isi: 'Murid 14 tidak hadir tanpa keterangan 6 kali dari 15 pertemuan.' },
    { label: 'Ke mana tujuannya?', isi: 'Murid dapat mengikuti pembelajaran secara teratur.' },
    { label: 'Sudah sampai mana?', isi: 'Hadir 9 dari 15 pertemuan. Nilai rata-rata per LM turun.' },
    {
      label: 'Langkah berikutnya?',
      wajib: true,
      isi: 'Bicara dengan murid dan wali kelas, berikan materi susulan, lalu pantau kehadiran.',
    },
  ],
  aksi: { pakai: 'Pakai saran', abaikan: 'Abaikan saran' },
};
