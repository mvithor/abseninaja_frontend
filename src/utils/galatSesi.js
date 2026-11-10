// Membedakan 401 "sesi tidak berlaku" dari 401 "aturan bisnis" (mis. sandi lama salah). Hanya yang pertama boleh
// mengeluarkan pengguna; yang kedua harus tampil sebagai pesan di form, bukan melempar pengguna ke halaman masuk.
// Dipisah dari axiosInstance supaya bisa diuji tanpa store.

// Kode galat 401 dari endpoint ganti sandi (BE: auth/layanan-ganti-sandi.js).
const KODE_401_BUKAN_SESI = new Set(['SANDI_LAMA_SALAH', 'TIKET_TIDAK_VALID']);

export const adalahGalat401Bisnis = (error) => {
  const kode = error?.response?.data?.kode;
  return error?.response?.status === 401 && typeof kode === 'string' && KODE_401_BUKAN_SESI.has(kode);
};
