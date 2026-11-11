// Akun dummy untuk mencoba portal Waka Kurikulum & Guru sebelum backend tersedia.
// HANYA aktif di mode development (lihat pasangMockDummy.js). Token di bawah tidak ditandatangani:
// cukup untuk jwtDecode di FE, tidak akan pernah diterima backend asli.

export const PASSWORD_DUMMY = 'dummy123';

// guru_id akun guru dummy = salah satu guru di data seed (dbDummy.js), supaya datanya nyambung
// dengan yang dilihat Waka.
// Sama dengan backend: id guru = pegawai.id (INTEGER), bukan UUID.
export const GURU_ID_DUMMY = 100;

// Dua akun Guru BK: koordinator (boleh mengatur Tim BK & melihat semua kelas) dan anggota.
export const BK_ID_KOORDINATOR = '00000000-0000-4000-8000-000000000201';
export const BK_ID_ANGGOTA = '00000000-0000-4000-8000-000000000202';

export const AKUN_DUMMY = [
  {
    email: 'waka@dummy.abseninaja.id',
    password: PASSWORD_DUMMY,
    label: 'Waka Kurikulum',
    userId: '00000000-0000-4000-8000-000000000001',
    name: 'Drs. Waka Kurikulum (Dummy)',
    persona: [{ kode: 'waka_kurikulum', label: 'Waka Kurikulum', portal: 'waka-kurikulum' }],
  },
  {
    email: 'guru@dummy.abseninaja.id',
    password: PASSWORD_DUMMY,
    label: 'Guru Mapel',
    userId: GURU_ID_DUMMY,
    guruId: GURU_ID_DUMMY,
    name: 'Siti Rahmawati, S.Pd. (Dummy)',
    persona: [{ kode: 'guru_mapel', label: 'Guru Mapel', portal: 'guru' }],
  },
  {
    email: 'bk@dummy.abseninaja.id',
    password: PASSWORD_DUMMY,
    label: 'Guru BK (Koordinator)',
    userId: BK_ID_KOORDINATOR,
    bkId: BK_ID_KOORDINATOR,
    name: 'Rahmat Hidayat, S.Pd. (Dummy)',
    persona: [{ kode: 'guru_bk', label: 'Guru BK', portal: 'guru-bk' }],
  },
  {
    email: 'bk2@dummy.abseninaja.id',
    password: PASSWORD_DUMMY,
    label: 'Guru BK (Anggota) + Guru Mapel',
    userId: BK_ID_ANGGOTA,
    bkId: BK_ID_ANGGOTA,
    name: 'Lina Marlina, M.Psi. (Dummy)',
    // Merangkap Guru Mapel: untuk mencoba skenario akun BK dinonaktifkan koordinator
    // (portal BK hilang, login diarahkan ke dashboard Guru Mapel).
    persona: [
      { kode: 'guru_bk', label: 'Guru BK', portal: 'guru-bk' },
      { kode: 'guru_mapel', label: 'Guru Mapel', portal: 'guru' },
    ],
  },
];

export const cariAkunDummy = (email) =>
  AKUN_DUMMY.find((a) => a.email === String(email || '').trim().toLowerCase()) || null;

const base64Url = (obj) =>
  btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

const DELAPAN_JAM = 8 * 60 * 60;

export const buatTokenDummy = (akun, deviceId) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    dummy: true,
    userId: akun.userId,
    guruId: akun.guruId || null,
    name: akun.name,
    email: akun.email,
    role: 'pegawai',
    personas: akun.persona.map((p) => p.kode),
    isKepalaJurusan: false,
    isGuruMapel: akun.persona.some((p) => p.kode === 'guru_mapel'),
    timezone_sekolah: 'Asia/Jakarta',
    deviceId: deviceId || null,
    iat: now,
    exp: now + DELAPAN_JAM,
  };
  return `${base64Url({ alg: 'none', typ: 'JWT' })}.${base64Url(payload)}.dummy`;
};

/** Payload token bila token ini token dummy, selain itu null. */
export const bacaTokenDummy = (token) => {
  if (!token || !token.endsWith('.dummy')) return null;
  try {
    const bagian = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(bagian));
    return payload?.dummy ? payload : null;
  } catch {
    return null;
  }
};
