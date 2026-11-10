// Pesan di layar login. Satu tempat supaya kalimatnya konsisten dan dapat diuji.
// Prinsip: klien membaca `kode` stabil dari server, bukan teks `msg`. Teks server tidak ditampilkan mentah untuk
// kode yang dikenal, karena kalimatnya milik BE dan dapat berubah. Kalimat di sini tanpa kata "Anda": tanpa kata
// ganti, atau "Bapak/Ibu" bila subjek diperlukan.

export const PESAN_LOGIN = Object.freeze({
  SESI_BERAKHIR: 'Sesi telah berakhir. Silakan masuk lagi.',
  WAJIB_DIISI: 'Email dan password wajib diisi.',
  UMUM: 'Terjadi kesalahan. Silakan coba lagi.',
  PENGGUNA_TIDAK_VALID: 'Pengguna tidak valid.',
  SALAH_KREDENSIAL: 'Email atau password salah.',
  TERLALU_BANYAK_PERCOBAAN: 'Terlalu banyak percobaan masuk. Silakan coba lagi nanti.',
  AKUN_BELUM_AKTIVASI: 'Akun belum diaktivasi. Gunakan tautan aktivasi yang diberikan admin.',
  AKUN_NONAKTIF: 'Akun ini dinonaktifkan. Hubungi admin sekolah bila Bapak/Ibu seharusnya masih memiliki akses.',
  TANPA_AKSES: 'Akun ini belum memiliki akses ke dashboard. Hubungi admin sekolah bila Bapak/Ibu seharusnya memiliki akses.',
  // Guru mandiri tidak punya admin sekolah: yang mengelola akunnya adalah pengelola layanan.
  TANPA_AKSES_MANDIRI: 'Akun ini belum memiliki akses ke Analitik Pembelajaran. Hubungi pengelola layanan bila Bapak/Ibu seharusnya memiliki akses.',
  // Server menjawab WAJIB_GANTI_SANDI tanpa tiket (tidak seharusnya terjadi): minta masuk ulang.
  WAJIB_GANTI_SANDI: 'Sandi awal harus diganti sebelum masuk. Silakan coba masuk lagi.',
});

/** Pesan untuk akun pegawai atau guru mandiri yang token-nya terbit tetapi tidak punya portal (sisi klien). */
export const pesanTanpaPortal = (role) => {
  if (role === 'pegawai') return PESAN_LOGIN.TANPA_AKSES;
  if (role === 'guru mandiri') return PESAN_LOGIN.TANPA_AKSES_MANDIRI;
  return PESAN_LOGIN.PENGGUNA_TIDAK_VALID;
};

/** Login ditahan karena sandi awal belum diganti: server mengirim tiket sekali pakai untuk form ganti sandi. */
export const tiketGantiSandiDariGalat = (error) => {
  const data = error?.response?.data;
  if (error?.response?.status !== 403 || data?.kode !== 'WAJIB_GANTI_SANDI') return null;
  return typeof data.tiket === 'string' && data.tiket ? data.tiket : null;
};

/**
 * Pesan dari galat axios saat login. Kode yang dikenal dipetakan ke kalimat di atas. Kode tidak dikenal atau
 * hilang (server lama) jatuh ke `msg` server, lalu ke pesan umum, sehingga perilaku lama tetap berjalan.
 */
export function pesanDariGalatLogin(error) {
  const data = error?.response?.data;
  const kode = data?.kode;
  if (typeof kode === 'string' && Object.prototype.hasOwnProperty.call(PESAN_LOGIN, kode) && kode !== 'UMUM') {
    return PESAN_LOGIN[kode];
  }
  if (typeof data?.msg === 'string' && data.msg.trim()) return data.msg;
  return PESAN_LOGIN.UMUM;
}
