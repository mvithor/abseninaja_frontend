// Teks dan daftar halaman Sekolah Mitra (`/bukti/sekolah-mitra`). Disalin apa
// adanya dari desain kanvas (Sekolah-Mitra.dc.html dan Sekolah-Mitra-Seluler.dc.html).
// Teks dua versi berbentuk { web, mobile }. Tanda bintang pada judul (*kata*) =
// kata berwarna aksen (di latar gelap: kuning).
//
// SELURUH ANGKA, NAMA SEKOLAH, WILAYAH, DAN PENGHARGAAN DI HALAMAN INI DUMMY dari
// desain (instruksi pengguna 21 Nov 2026: dummy dulu agar desain bersih).
// Halaman digerbang oleh BUKTI_DIRILIS (lib/gerbang.js) dan tidak boleh tampil
// di produksi sebelum daftar sekolah nyata, izin tertulis tiap sekolah untuk
// ditampilkan, dan bukti penghargaan ada. Logo sekolah TIDAK dipakai: kisi
// memakai kotak ikon peraga. `verifikasi` (true atau teks label) = klaim
// berisiko; penandanya tampil hanya bila flags.tampilkanPenandaDesain menyala.

// Satu sumber jumlah sekolah mitra. Dibaca judul hero dan statistik di berkas ini,
// ringkasan di data/dampak.js, dan banner "Dipercaya ... sekolah" di
// data/testimoni.js.
// DUMMY wajib diganti sebelum main: angka ini juga membentuk JUDUL hero
// ("120 sekolah sudah memakai."), bukan hanya statistik.
export const JUMLAH_SEKOLAH = 120;

export const META = {
  title: 'Sekolah Mitra | Absenin Aja',
  description: 'Dari sekolah negeri sampai swasta, dari kota sampai kabupaten.',
};

// DUMMY wajib diganti sebelum main: seluruh angka di `statistik`.
export const HERO = {
  eyebrow: 'Bukti · Sekolah Mitra',
  judul: `${JUMLAH_SEKOLAH} sekolah sudah memakai. *Masing-masing punya cerita.*`,
  sub: {
    web: 'Dari sekolah negeri sampai swasta, dari kota sampai kabupaten.',
    mobile: 'Negeri dan swasta, kota dan kabupaten.',
  },
  statistik: [
    { angka: `${JUMLAH_SEKOLAH}+`, label: 'Sekolah mitra aktif', verifikasi: 'Verifikasi jumlah sekolah mitra' },
    { angka: '14', label: 'Kota dan kabupaten', verifikasi: 'Verifikasi jumlah wilayah' },
    { angka: '4', label: 'Jenjang', verifikasi: 'Verifikasi jumlah jenjang' },
    { angka: '7 hari', label: 'Rata-rata penyiapan', verifikasi: 'Verifikasi lama penyiapan' },
  ],
};

// DUMMY wajib diganti sebelum main: seluruh nama sekolah dan wilayah. Tampilkan
// hanya sekolah yang sudah memberi izin tertulis.
export const DAFTAR = {
  id: 'judul-daftar-sekolah',
  eyebrow: 'Daftar sekolah',
  judul: 'Sekolah yang sudah *mempercayai* kami',
  verifikasi: 'Verifikasi daftar sekolah dan izin tampil',
  butir: [
    { nama: 'SMP Harapan Bangsa', jenjang: 'SMP', wilayah: 'Pesawaran' },
    { nama: 'MTs Nurul Ilmu', jenjang: 'MTs', wilayah: 'Pesawaran' },
    { nama: 'SMA Cendekia', jenjang: 'SMA', wilayah: 'Bandar Lampung' },
    { nama: 'SMK Karya Mandiri', jenjang: 'SMK', wilayah: 'Metro' },
    { nama: 'SMP Tunas Mandiri', jenjang: 'SMP', wilayah: 'Tanggamus' },
    { nama: 'MTs Al-Hidayah', jenjang: 'MTs', wilayah: 'Lampung Selatan' },
    { nama: 'SMA Bina Insani', jenjang: 'SMA', wilayah: 'Pringsewu' },
    { nama: 'SMP Cahaya Ilmu', jenjang: 'SMP', wilayah: 'Pesawaran' },
    { nama: 'MI Darul Falah', jenjang: 'MI', wilayah: 'Bandar Lampung' },
    { nama: 'SMK Teknologi Nusantara', jenjang: 'SMK', wilayah: 'Lampung Tengah' },
    { nama: 'SMP Bintang Timur', jenjang: 'SMP', wilayah: 'Lampung Timur' },
    { nama: 'MTs Miftahul Ulum', jenjang: 'MTs', wilayah: 'Way Kanan' },
  ],
};

// DUMMY wajib diganti sebelum main: ketiga penghargaan identik di desain. Isi
// hanya penghargaan yang punya bukti (surat atau sertifikat) dan izin menampilkan.
export const PENGHARGAAN = {
  id: 'judul-penghargaan',
  eyebrow: 'Penghargaan',
  judul: 'Pengakuan *dan penghargaan*',
  butir: [
    { judul: 'Sekolah Digital Teladan', deskripsi: 'Dinas Pendidikan, 2026', verifikasi: 'Verifikasi penghargaan dan buktinya' },
    { judul: 'Sekolah Digital Teladan', deskripsi: 'Dinas Pendidikan, 2026', verifikasi: 'Verifikasi penghargaan dan buktinya' },
    { judul: 'Sekolah Digital Teladan', deskripsi: 'Dinas Pendidikan, 2026', verifikasi: 'Verifikasi penghargaan dan buktinya' },
  ],
};

export const CTA = {
  judul: 'Sekolah Anda bisa jadi yang berikutnya',
  sub: {
    web: 'Jadwalkan demo dan lihat modul yang cocok.',
    mobile: 'Jadwalkan demo, lihat modul cocok.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Dampak', rute: 'dampak' },
};
