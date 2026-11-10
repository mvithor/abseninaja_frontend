// Logika murni kategori pegawai (tanpa React). Kategori bawaan (Guru, Staf) ditandai kode_sistem oleh server dan
// dikunci: nama tidak bisa diubah dan kategori tidak bisa dihapus (server menolak 403 KATEGORI_BAWAAN). Tombol
// dikunci di klien supaya admin tidak menekan aksi yang pasti ditolak; server tetap yang memutuskan.

export const adalahKategoriBawaan = (kategori) =>
  typeof kategori?.kode_sistem === 'string' && kategori.kode_sistem !== '';

export const PESAN_KATEGORI_BAWAAN = 'Kategori bawaan tidak dapat diubah atau dihapus.';

export const judulAksiKategori = (kategori, aksi) => {
  if (adalahKategoriBawaan(kategori)) return PESAN_KATEGORI_BAWAAN;
  return aksi === 'hapus' ? 'Hapus' : 'Edit';
};
