// Logika murni halaman Admin Kantin (tanpa React), supaya bisa diuji dengan node:test.
// Aturan validasi mencerminkan abseninaja_backend/src/admin-kantin/skema.js; server tetap
// yang memutuskan, ini hanya menghemat satu putaran jaringan untuk kesalahan yang jelas.

export const BATAS = Object.freeze({
  NAMA_MIN: 3,
  NAMA_MAX: 50,
  EMAIL_MAX: 255,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 72, // bcrypt hanya membaca 72 byte pertama
});

const norm = (s) => String(s ?? '').toLowerCase();
const EMAIL_POLA = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const metaStatusKantin = (aktif) =>
  aktif
    ? { label: 'Aktif', bg: '#34C759', color: '#fff' }
    : { label: 'Nonaktif', bg: '#E0E0E0', color: '#424242' };

// Urutan dari server (terbaru dulu) dipertahankan.
export const filterAdminKantin = (daftar, kata) => {
  if (!Array.isArray(daftar)) return [];
  const q = norm(kata).trim();
  if (!q) return daftar;
  return daftar.filter((d) => [d.nama, d.email].some((v) => norm(v).includes(q)));
};

const cekNama = (nama) => {
  const n = String(nama ?? '').trim();
  if (!n) return 'Nama wajib diisi.';
  if (n.length < BATAS.NAMA_MIN) return `Nama minimal ${BATAS.NAMA_MIN} karakter.`;
  if (n.length > BATAS.NAMA_MAX) return `Nama maksimal ${BATAS.NAMA_MAX} karakter.`;
  return '';
};

const cekEmail = (email) => {
  const e = String(email ?? '').trim();
  if (!e) return 'Email wajib diisi.';
  if (e.length > BATAS.EMAIL_MAX) return `Email maksimal ${BATAS.EMAIL_MAX} karakter.`;
  if (!EMAIL_POLA.test(e)) return 'Format email tidak valid.';
  return '';
};

const cekPassword = (password) => {
  if (password.length < BATAS.PASSWORD_MIN) return `Password minimal ${BATAS.PASSWORD_MIN} karakter.`;
  if (password.length > BATAS.PASSWORD_MAX) return `Password maksimal ${BATAS.PASSWORD_MAX} karakter.`;
  return '';
};

// Tambah: semua kolom wajib. Mengembalikan pesan galat pertama, atau '' bila siap dikirim.
export const validasiBuat = ({ nama, email, password }) =>
  cekNama(nama) || cekEmail(email) || (password ? cekPassword(password) : 'Password wajib diisi.');

// Ubah: password opsional; bila diisi, harus memenuhi aturan yang sama.
export const validasiUbah = ({ nama, email, password }) =>
  cekNama(nama) || cekEmail(email) || (password ? cekPassword(password) : '');

export const bangunPayloadBuat = ({ nama, email, password }) => ({
  name: String(nama).trim(),
  email: String(email).trim().toLowerCase(),
  password,
});

// Password hanya dikirim bila diisi: mengirimnya berarti reset password dan semua sesi login dicabut.
export const bangunPayloadUbah = ({ nama, email, password }) => {
  const payload = { name: String(nama).trim(), email: String(email).trim().toLowerCase() };
  if (password) payload.password = password;
  return payload;
};

// Apakah ada perubahan dibanding data awal (password terisi dihitung sebagai perubahan).
export const adaPerubahan = (awal, sekarang) =>
  String(sekarang.nama ?? '').trim() !== String(awal?.nama ?? '') ||
  String(sekarang.email ?? '').trim().toLowerCase() !== String(awal?.email ?? '').toLowerCase() ||
  Boolean(sekarang.password);

// Respons ubah/status membawa data.sesi.gagal bila sesi lama gagal dicabut otomatis. Itu bukan
// kegagalan operasi, tetapi admin harus tahu, jadi ditampilkan sebagai peringatan (bukan sukses polos).
export const sesiGagalDicabut = (respons) => Boolean(respons?.data?.sesi?.gagal);

// Teks dialog aktif/nonaktif.
export const teksDialogStatus = (item) =>
  item?.is_aktif
    ? {
        judul: `Nonaktifkan akun ${item.nama}?`,
        isi: 'Semua sesi login akun ini diakhiri dan ia tidak bisa login sampai diaktifkan kembali. Data akun tetap tersimpan.',
        tombol: 'Nonaktifkan',
      }
    : {
        judul: `Aktifkan kembali akun ${item?.nama}?`,
        isi: 'Akun ini bisa login lagi dengan password yang berlaku.',
        tombol: 'Aktifkan',
      };
