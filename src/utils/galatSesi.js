// Membedakan 401 "sesi tidak berlaku" dari 401 "aturan bisnis" (sandi lama salah di form ganti sandi). Hanya yang
// pertama boleh mengeluarkan pengguna; yang kedua harus tampil sebagai pesan di form, bukan melempar pengguna ke
// halaman masuk. Dibatasi pada URL ganti sandi DAN kodenya, supaya kode yang sama di endpoint lain tidak menahan
// pengguna dengan sesi yang sudah mati. Dipisah dari axiosInstance supaya bisa diuji tanpa store.
// (ganti-sandi-awal tanpa sesi sama sekali, sudah dikecualikan lewat daftar endpoint publik di axiosInstance.)

const URL_GANTI_SANDI = '/api/v1/auth/ganti-sandi';

export const adalahGalat401Bisnis = (error) => {
  if (error?.response?.status !== 401) return false;
  const url = String(error?.config?.url ?? '');
  // akhiran persis: '/auth/ganti-sandi' tidak mencocokkan '/auth/ganti-sandi-awal' maupun jalur lain berawalan sama
  const jalur = url.split('?')[0];
  return jalur.endsWith(URL_GANTI_SANDI) && error.response.data?.kode === 'SANDI_LAMA_SALAH';
};
