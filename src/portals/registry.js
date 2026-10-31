// Registri portal: SATU tempat yang menjawab "akun ini boleh masuk ke portal mana".
// Dipakai oleh AuthLogin (tujuan setelah login), SidebarItems (menu), dan
// ProtectedRoute (guard). Menambah portal baru = menambah satu entri di PORTALS.
// File ini sengaja hanya berisi data dan fungsi ringan (tanpa impor menu/ikon)
// supaya halaman login tidak ikut membawa bundel menu.
//
// Cermin backend: abseninaja_backend/src/persona/katalog.js. Kode persona dan awalan rute
// portal harus sama dengan katalog itu.
//
// Dua sumber persona pegawai, dengan urutan:
//   1. user.daftarPersona : dari server (respons login dan GET /api/v1/konteks), selalu mutakhir.
//                           `null`/tidak ada = belum diketahui. Array kosong = diketahui, tidak punya.
//   2. user.personas / isKepalaJurusan / isGuruMapel : klaim token (hanya kode lama) untuk sesi lama
//                           atau saat server belum bisa ditanya.

export const PERSONA = Object.freeze({
  KEPALA_JURUSAN: 'kepala_jurusan',
  GURU_MAPEL: 'guru_mapel',
  KEPALA_SEKOLAH: 'kepala_sekolah',
  WAKA_KURIKULUM: 'waka_kurikulum',
  GURU_BK: 'guru_bk',
});

// Sesi lama (token terbit sebelum klaim `personas` ada) hanya membawa boolean.
const LEGACY_PERSONA_FLAG = {
  [PERSONA.KEPALA_JURUSAN]: 'isKepalaJurusan',
  [PERSONA.GURU_MAPEL]: 'isGuruMapel',
};

/**
 * Merapikan daftar persona dari server. Mengembalikan null bila masukan bukan array
 * (artinya "belum diketahui", supaya jatuh ke klaim token), dan membuang entri tanpa kode.
 */
export const normalisasiDaftarPersona = (daftar) => {
  if (!Array.isArray(daftar)) return null;
  return daftar
    .filter((p) => p && typeof p.kode === 'string' && p.kode)
    .map((p) => ({
      kode: p.kode,
      label: p.label || p.kode,
      portal: p.portal || null,
      tahun_ajaran_id: p.tahun_ajaran_id ?? null,
    }));
};

export const hasPersona = (user, persona) => {
  if (!user) return false;
  if (Array.isArray(user.daftarPersona)) {
    return user.daftarPersona.some((p) => p.kode === persona);
  }
  if (Array.isArray(user.personas)) return user.personas.includes(persona);
  const flag = LEGACY_PERSONA_FLAG[persona];
  return flag ? Boolean(user[flag]) : false;
};

const isPegawaiDengan = (persona) => (user) =>
  user?.role === 'pegawai' && hasPersona(user, persona);

// priority: semakin besar semakin diutamakan sebagai tujuan awal setelah login.
// Hanya menentukan halaman pertama dan urutan grup menu; BUKAN pagar akses.
// Aturan urutan: peran yang lebih berwenang atau lebih khusus mengalahkan yang umum.
// Yang bisa bersaing hanya persona pegawai (satu akun pegawai bisa merangkap), urutannya:
//   kepala sekolah > kepala jurusan > waka kurikulum > guru BK > guru mapel.
// Super admin, admin sekolah, admin mitra industri, dan admin kantin adalah akun tersendiri
// yang tidak digabung dengan peran pegawai, jadi angkanya tidak pernah beradu.
export const PORTALS = [
  {
    key: 'super-admin',
    label: 'Super Admin',
    path: '/dashboard/super-admin',
    priority: 100,
    isAllowed: (user) => user?.role === 'super admin',
  },
  {
    key: 'admin-sekolah',
    label: 'Admin Sekolah',
    path: '/dashboard/admin-sekolah',
    priority: 90,
    isAllowed: (user) => user?.role === 'admin sekolah',
  },
  {
    key: 'kepala-sekolah',
    label: 'Kepala Sekolah',
    path: '/dashboard/kepala-sekolah',
    priority: 85,
    isAllowed: isPegawaiDengan(PERSONA.KEPALA_SEKOLAH),
  },
  {
    key: 'kepala-jurusan',
    label: 'Kepala Jurusan',
    path: '/dashboard/kepala-jurusan',
    priority: 80,
    isAllowed: isPegawaiDengan(PERSONA.KEPALA_JURUSAN),
  },
  {
    key: 'waka-kurikulum',
    label: 'Waka Kurikulum',
    path: '/dashboard/waka-kurikulum',
    priority: 75,
    isAllowed: isPegawaiDengan(PERSONA.WAKA_KURIKULUM),
  },
  {
    key: 'guru-bk',
    label: 'Guru BK',
    path: '/dashboard/guru-bk',
    priority: 72,
    isAllowed: isPegawaiDengan(PERSONA.GURU_BK),
  },
  {
    key: 'guru',
    label: 'Guru',
    path: '/dashboard/guru-sekolah',
    priority: 70,
    isAllowed: isPegawaiDengan(PERSONA.GURU_MAPEL),
  },
  {
    key: 'admin-mitra-industri',
    label: 'Admin Mitra Industri',
    path: '/dashboard/admin-mitra-industri',
    priority: 60,
    isAllowed: (user) => user?.role === 'admin mitra industri',
  },
  {
    key: 'admin-kantin',
    label: 'Admin Kantin',
    path: '/dashboard/admin-kantin',
    priority: 55,
    // Pihak luar dengan tipe akun sendiri (bukan persona pegawai).
    isAllowed: (user) => user?.role === 'admin kantin',
  },
];

export const getUserPortals = (user) =>
  PORTALS.filter((portal) => portal.isAllowed(user)).sort((a, b) => b.priority - a.priority);

export const getDefaultPortal = (user) => getUserPortals(user)[0] || null;

export const canAccessPortal = (user, key) =>
  getUserPortals(user).some((portal) => portal.key === key);
