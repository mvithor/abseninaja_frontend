// Alamat dan kunci cache fitur status pegawai (admin sekolah). Satu tempat supaya daftar, dialog, dan halaman
// Pegawai Nonaktif / Perlu Pengganti saling meng-invalidate cache yang sama.

export const URL_PEGAWAI = '/api/v1/admin-sekolah/pegawai';

export const KUNCI = Object.freeze({
  nonaktif: 'pegawaiNonaktif',
  perluPengganti: 'pegawaiPerluPengganti',
  tanggungJawab: 'pegawaiTanggungJawab',
  guru: 'pegawaiGuru',
  staf: 'pegawaiStaf',
  // Dropdown pilihan pegawai. DUA endpoint berbeda (guru saja vs semua pegawai), jadi dua kunci; sebelumnya keduanya
  // memakai 'pegawaiOptions' sehingga hasil yang satu bisa tampil di dropdown yang lain.
  dropdownGuru: 'dropdownGuru',
  dropdownPegawai: 'dropdownPegawai',
});

// Semua cache yang berubah ketika status seorang pegawai berubah.
export const KUNCI_TERDAMPAK = Object.freeze([
  KUNCI.nonaktif, KUNCI.perluPengganti, KUNCI.guru, KUNCI.staf, KUNCI.dropdownGuru, KUNCI.dropdownPegawai,
]);

export const urlPegawai = (id, aksi) => `${URL_PEGAWAI}/${id}/${aksi}`;
