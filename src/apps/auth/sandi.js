// Logika murni ganti sandi (tanpa React), supaya bisa diuji dengan node:test.
// Aturan mencerminkan abseninaja_backend/src/helpers/sandi.js (periksaSandiBaru); server tetap yang memutuskan, ini
// hanya menghemat satu putaran jaringan untuk kesalahan yang jelas. Kalimat tanpa kata "Anda".

export const BATAS_SANDI = Object.freeze({ MIN: 8, MAKS_BYTE: 72 });

export const PETUNJUK_SANDI = `Minimal ${BATAS_SANDI.MIN} karakter, memuat huruf dan angka.`;

const panjangByte = (teks) => new TextEncoder().encode(teks).length;

/** Pesan galat untuk sandi pilihan pengguna, atau '' bila sah. */
export const cekSandiBaru = (sandi) => {
  if (typeof sandi !== 'string' || sandi === '') return 'Sandi baru wajib diisi.';
  if (sandi.length < BATAS_SANDI.MIN) return `Sandi baru minimal ${BATAS_SANDI.MIN} karakter.`;
  if (panjangByte(sandi) > BATAS_SANDI.MAKS_BYTE) return 'Sandi baru terlalu panjang.';
  if (!/\p{L}/u.test(sandi) || !/\d/.test(sandi)) return 'Sandi baru harus memuat huruf dan angka.';
  if (new Set(sandi).size === 1) return 'Sandi baru tidak boleh satu karakter yang diulang.';
  return '';
};

const cekKonfirmasi = (sandiBaru, konfirmasi) =>
  sandiBaru === konfirmasi ? '' : 'Konfirmasi sandi tidak sama dengan sandi baru.';

/** Ganti sandi awal (login pertama guru mandiri): sandi baru + konfirmasi. */
export const validasiGantiAwal = ({ sandiBaru, konfirmasi }) =>
  cekSandiBaru(sandiBaru) || cekKonfirmasi(sandiBaru, konfirmasi);

/** Ganti sandi biasa (sudah masuk): sandi lama + sandi baru + konfirmasi. */
export const validasiGantiBiasa = ({ sandiLama, sandiBaru, konfirmasi }) => {
  if (!sandiLama) return 'Sandi lama wajib diisi.';
  return cekSandiBaru(sandiBaru) || cekKonfirmasi(sandiBaru, konfirmasi)
    || (sandiBaru === sandiLama ? 'Sandi baru tidak boleh sama dengan sandi lama.' : '');
};

export const bangunPayloadGantiAwal = ({ tiket, sandiBaru }) => ({ tiket, sandi_baru: sandiBaru });
export const bangunPayloadGantiBiasa = ({ sandiLama, sandiBaru }) => ({ sandi_lama: sandiLama, sandi_baru: sandiBaru });

// Kode galat server dipetakan ke kalimat klien (teks server milik BE dan dapat berubah). Kode tak dikenal jatuh ke
// msg server, lalu ke pesan umum. SANDI_TIDAK_MEMENUHI_SYARAT memakai msg server karena memuat aturan yang tepat.
export const PESAN_SANDI = Object.freeze({
  UMUM: 'Terjadi kesalahan saat mengganti sandi. Silakan coba lagi.',
  TIKET_TIDAK_VALID: 'Waktu penggantian sandi habis atau tiket sudah dipakai. Silakan masuk lagi.',
  TERLALU_BANYAK_PERCOBAAN: 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
  SANDI_LAMA_SALAH: 'Sandi lama salah.',
  SANDI_SAMA: 'Sandi baru tidak boleh sama dengan sandi sebelumnya.',
  SANDI_BERUBAH: 'Sandi baru saja diubah. Muat ulang halaman lalu coba lagi.',
  AKUN_NONAKTIF: 'Akun ini dinonaktifkan. Hubungi pengelola layanan.',
  SUKSES_AWAL: 'Sandi berhasil diganti. Silakan masuk dengan sandi baru.',
  SUKSES_BIASA: 'Sandi berhasil diganti.',
});

const KODE_PAKAI_MSG_SERVER = new Set(['SANDI_TIDAK_MEMENUHI_SYARAT']);

/** Tiket yang tidak berlaku lagi: form harus kembali ke login karena mengulang tidak akan berhasil. */
export const tiketTidakBerlaku = (error) => error?.response?.data?.kode === 'TIKET_TIDAK_VALID';

export function pesanDariGalatSandi(error) {
  const data = error?.response?.data;
  const kode = data?.kode;
  const adaPesan = typeof data?.msg === 'string' && data.msg.trim();
  if (typeof kode === 'string') {
    if (KODE_PAKAI_MSG_SERVER.has(kode) && adaPesan) return data.msg;
    if (Object.prototype.hasOwnProperty.call(PESAN_SANDI, kode) && !kode.startsWith('SUKSES') && kode !== 'UMUM') {
      return PESAN_SANDI[kode];
    }
  }
  return adaPesan ? data.msg : PESAN_SANDI.UMUM;
}
