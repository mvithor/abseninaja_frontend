// Registri portal: SATU tempat yang menjawab "akun ini boleh masuk ke portal mana".
// Dipakai oleh AuthLogin (tujuan setelah login), SidebarItems (menu), dan
// ProtectedRoute (guard). Menambah portal baru = menambah satu entri di PORTALS.
// File ini sengaja hanya berisi data dan fungsi ringan (tanpa impor menu/ikon)
// supaya halaman login tidak ikut membawa bundel menu.

export const PERSONA = Object.freeze({
  KEPALA_JURUSAN: 'kepala_jurusan',
  GURU_MAPEL: 'guru_mapel',
});

// Sesi lama (token terbit sebelum klaim `personas` ada) hanya membawa boolean.
const LEGACY_PERSONA_FLAG = {
  [PERSONA.KEPALA_JURUSAN]: 'isKepalaJurusan',
  [PERSONA.GURU_MAPEL]: 'isGuruMapel',
};

export const hasPersona = (user, persona) => {
  if (!user) return false;
  if (Array.isArray(user.personas)) return user.personas.includes(persona);
  return Boolean(user[LEGACY_PERSONA_FLAG[persona]]);
};

// priority: semakin besar semakin diutamakan sebagai tujuan awal setelah login.
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
    key: 'kepala-jurusan',
    label: 'Kepala Jurusan',
    path: '/dashboard/kepala-jurusan',
    priority: 80,
    isAllowed: (user) => user?.role === 'pegawai' && hasPersona(user, PERSONA.KEPALA_JURUSAN),
  },
  {
    key: 'guru',
    label: 'Guru',
    path: '/dashboard/guru-sekolah',
    priority: 70,
    isAllowed: (user) => user?.role === 'pegawai' && hasPersona(user, PERSONA.GURU_MAPEL),
  },
  {
    key: 'admin-mitra-industri',
    label: 'Admin Mitra Industri',
    path: '/dashboard/admin-mitra-industri',
    priority: 60,
    isAllowed: (user) => user?.role === 'admin mitra industri',
  },
];

export const getUserPortals = (user) =>
  PORTALS.filter((portal) => portal.isAllowed(user)).sort((a, b) => b.priority - a.priority);

export const getDefaultPortal = (user) => getUserPortals(user)[0] || null;

export const canAccessPortal = (user, key) =>
  getUserPortals(user).some((portal) => portal.key === key);