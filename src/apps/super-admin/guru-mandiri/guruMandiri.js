// Logika murni halaman Guru Mandiri super admin (tanpa React), supaya bisa diuji dengan node:test.
// Aturan mencerminkan abseninaja_backend/src/controller/super-admin/guru-mandiri/guru-mandiri-controller.js; server
// tetap yang memutuskan. Kalimat tanpa kata "Anda".

export const URL_GURU_MANDIRI = '/api/v1/super-admin/guru-mandiri';
export const KUNCI_GURU_MANDIRI = 'guruMandiri';

export const BATAS = Object.freeze({
  NAMA_MIN: 3, NAMA_MAX: 100, SEKOLAH_MIN: 3, SEKOLAH_MAX: 255, EMAIL_MAX: 255,
});

// Nilai sama dengan BENTUK_SAH dan TIMEZONE_SAH di layanan-guru-mandiri.js.
export const BENTUK_PENDIDIKAN = Object.freeze(['SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'SMK', 'MAK']);
export const ZONA_WAKTU = Object.freeze([
  { kode: 'Asia/Jakarta', label: 'WIB (Asia/Jakarta)' },
  { kode: 'Asia/Makassar', label: 'WITA (Asia/Makassar)' },
  { kode: 'Asia/Jayapura', label: 'WIT (Asia/Jayapura)' },
]);

export const OPSI_STATUS = Object.freeze([
  { nilai: '', label: 'Semua status' },
  { nilai: 'aktif', label: 'Aktif' },
  { nilai: 'nonaktif', label: 'Nonaktif' },
]);

export const UKURAN_HALAMAN = Object.freeze([10, 25, 50, 100]);

const EMAIL_POLA = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

// Nama sekolah opsional: kosong berarti server memakai "LAD Mandiri <nama>".
const cekSekolah = (sekolah) => {
  const s = String(sekolah ?? '').trim();
  if (!s) return '';
  if (s.length < BATAS.SEKOLAH_MIN) return `Nama sekolah minimal ${BATAS.SEKOLAH_MIN} karakter.`;
  if (s.length > BATAS.SEKOLAH_MAX) return `Nama sekolah maksimal ${BATAS.SEKOLAH_MAX} karakter.`;
  return '';
};

const cekPilihan = ({ bentuk, zona }) => {
  if (bentuk && !BENTUK_PENDIDIKAN.includes(bentuk)) return 'Bentuk pendidikan tidak valid.';
  if (!ZONA_WAKTU.some((z) => z.kode === zona)) return 'Zona waktu tidak valid.';
  return '';
};

export const validasiBuat = ({ nama, email, namaSekolah, bentuk, zona }) =>
  cekNama(nama) || cekEmail(email) || cekSekolah(namaSekolah) || cekPilihan({ bentuk, zona });

export const bangunPayloadBuat = ({ nama, email, namaSekolah, bentuk, zona }) => {
  const payload = {
    nama: String(nama).trim(),
    email: String(email).trim().toLowerCase(),
    timezone_sekolah: zona,
  };
  const sekolah = String(namaSekolah ?? '').trim();
  if (sekolah) payload.nama_sekolah = sekolah;
  if (bentuk) payload.bentuk_pendidikan_kode = bentuk;
  return payload;
};

// Ubah: hanya nama guru dan nama sekolah. Email tidak bisa diubah; salah email berarti buat akun baru.
export const validasiUbah = ({ nama, namaSekolah }) => {
  const pesan = cekNama(nama);
  if (pesan) return pesan;
  const s = String(namaSekolah ?? '').trim();
  if (!s) return 'Nama sekolah wajib diisi.';
  return cekSekolah(s);
};

/** Hanya bidang yang berubah yang dikirim (server menolak badan tanpa perubahan). Kosong = tidak ada perubahan. */
export const bangunPayloadUbah = (awal, { nama, namaSekolah }) => {
  const payload = {};
  if (String(nama).trim() !== String(awal?.nama ?? '')) payload.nama = String(nama).trim();
  if (String(namaSekolah).trim() !== String(awal?.nama_sekolah ?? '')) payload.nama_sekolah = String(namaSekolah).trim();
  return payload;
};

export const metaStatusGuruMandiri = (guru) => {
  if (guru?.status === 'nonaktif') return { label: 'Nonaktif', bg: '#E0E0E0', color: '#424242' };
  if (guru?.wajib_ganti_sandi) return { label: 'Belum ganti sandi', bg: '#F48C06', color: '#fff' };
  return { label: 'Aktif', bg: '#34C759', color: '#fff' };
};

/** Sandi awal dari respons buat/reset, atau '' bila tidak ada. Hanya string tak kosong yang dianggap sandi. */
export const ambilSandiAwal = (respons) => {
  const sandi = respons?.data?.sandi_awal;
  return typeof sandi === 'string' ? sandi : '';
};

export const teksDialogAksi = (aksi, guru) => {
  const nama = guru?.nama || 'guru ini';
  if (aksi === 'aktifkan') {
    return { judul: `Aktifkan ${nama}?`, isi: 'Akun dapat masuk lagi dengan sandi terakhirnya.', tombol: 'Aktifkan' };
  }
  if (aksi === 'reset') {
    return {
      judul: `Reset sandi ${nama}?`,
      isi: 'Sandi awal baru dibuat dan hanya tampil sekali. Akun keluar dari semua perangkat dan wajib mengganti sandi saat masuk berikutnya.',
      tombol: 'Reset Sandi',
    };
  }
  return { judul: '', isi: '', tombol: '' };
};
