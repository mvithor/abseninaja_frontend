import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PERSONA,
  PORTALS,
  hasPersona,
  normalisasiDaftarPersona,
  getUserPortals,
  getDefaultPortal,
  canAccessPortal,
} from './registry.js';

const daftar = (...kode) => kode.map((k) => ({ kode: k, label: k, portal: null, tahun_ajaran_id: null }));
const pegawai = (extra = {}) => ({ role: 'pegawai', ...extra });
const keys = (user) => getUserPortals(user).map((p) => p.key);

test('normalisasiDaftarPersona: bukan array berarti belum diketahui (null), bukan kosong', () => {
  assert.equal(normalisasiDaftarPersona(undefined), null);
  assert.equal(normalisasiDaftarPersona(null), null);
  assert.equal(normalisasiDaftarPersona('guru_bk'), null);
  assert.deepEqual(normalisasiDaftarPersona([]), []);
});

test('normalisasiDaftarPersona: membuang entri rusak dan melengkapi bidang', () => {
  const hasil = normalisasiDaftarPersona([
    { kode: 'guru_bk', label: 'Guru BK', portal: '/dashboard/guru-bk', tahun_ajaran_id: null },
    { label: 'tanpa kode' },
    null,
    { kode: 'waka_kurikulum', tahun_ajaran_id: 'ta-1' },
  ]);
  assert.equal(hasil.length, 2);
  assert.deepEqual(hasil[1], { kode: 'waka_kurikulum', label: 'waka_kurikulum', portal: null, tahun_ajaran_id: 'ta-1' });
});

test('hasPersona: daftarPersona dari server menjadi sumber utama', () => {
  const u = pegawai({ daftarPersona: daftar(PERSONA.GURU_BK), personas: [PERSONA.GURU_MAPEL] });
  assert.equal(hasPersona(u, PERSONA.GURU_BK), true);
  // daftar server sudah ada, jadi klaim token yang basi tidak ikut dihitung
  assert.equal(hasPersona(u, PERSONA.GURU_MAPEL), false);
});

test('hasPersona: daftar server KOSONG berarti tidak punya apa pun (bukan jatuh ke token)', () => {
  const u = pegawai({ daftarPersona: [], personas: [PERSONA.GURU_MAPEL], isGuruMapel: true });
  assert.equal(hasPersona(u, PERSONA.GURU_MAPEL), false);
});

test('hasPersona: daftarPersona null/undefined jatuh ke klaim token lalu boolean lama', () => {
  assert.equal(hasPersona(pegawai({ daftarPersona: null, personas: [PERSONA.GURU_MAPEL] }), PERSONA.GURU_MAPEL), true);
  assert.equal(hasPersona(pegawai({ personas: [PERSONA.GURU_MAPEL] }), PERSONA.GURU_MAPEL), true);
  assert.equal(hasPersona(pegawai({ isKepalaJurusan: true }), PERSONA.KEPALA_JURUSAN), true);
  assert.equal(hasPersona(pegawai({ isKepalaJurusan: true }), PERSONA.GURU_MAPEL), false);
});

test('hasPersona: persona baru tidak pernah muncul dari klaim token lama', () => {
  const u = pegawai({ personas: [PERSONA.GURU_MAPEL], isGuruMapel: true });
  assert.equal(hasPersona(u, PERSONA.KEPALA_SEKOLAH), false);
  assert.equal(hasPersona(u, PERSONA.GURU_BK), false);
  assert.equal(hasPersona(null, PERSONA.GURU_BK), false);
});

test('portal persona baru terbuka hanya untuk pegawai yang memegangnya', () => {
  assert.deepEqual(keys(pegawai({ daftarPersona: daftar(PERSONA.KEPALA_SEKOLAH) })), ['kepala-sekolah']);
  assert.deepEqual(keys(pegawai({ daftarPersona: daftar(PERSONA.WAKA_KURIKULUM) })), ['waka-kurikulum']);
  assert.deepEqual(keys(pegawai({ daftarPersona: daftar(PERSONA.GURU_BK) })), ['guru-bk']);
  // akun non pegawai tidak boleh masuk walau daftarnya (secara salah) memuat persona pegawai
  assert.deepEqual(keys({ role: 'admin sekolah', daftarPersona: daftar(PERSONA.GURU_BK) }), ['admin-sekolah']);
});

test('admin kantin berbasis tipe akun, bukan persona pegawai', () => {
  assert.deepEqual(keys({ role: 'admin kantin' }), ['admin-kantin']);
  assert.equal(getDefaultPortal({ role: 'admin kantin' }).path, '/dashboard/admin-kantin');
  assert.deepEqual(keys({ role: 'siswa' }), []);
  assert.deepEqual(keys(pegawai({ daftarPersona: daftar('admin_kantin') })), []);
});

test('urutan tujuan awal: kepala sekolah > kajur > waka > BK > guru', () => {
  const semua = pegawai({
    daftarPersona: daftar(
      PERSONA.GURU_MAPEL, PERSONA.GURU_BK, PERSONA.WAKA_KURIKULUM, PERSONA.KEPALA_JURUSAN, PERSONA.KEPALA_SEKOLAH,
    ),
  });
  assert.deepEqual(keys(semua), ['kepala-sekolah', 'kepala-jurusan', 'waka-kurikulum', 'guru-bk', 'guru']);
  assert.equal(getDefaultPortal(semua).key, 'kepala-sekolah');

  const guruBk = pegawai({ daftarPersona: daftar(PERSONA.GURU_MAPEL, PERSONA.GURU_BK) });
  assert.equal(getDefaultPortal(guruBk).key, 'guru-bk');
});

test('pegawai tanpa persona apa pun tidak punya portal', () => {
  assert.equal(getDefaultPortal(pegawai({ daftarPersona: [] })), null);
  assert.equal(getDefaultPortal(pegawai({ personas: [] })), null);
});

test('perilaku lama tidak berubah untuk sesi tanpa daftarPersona', () => {
  assert.deepEqual(keys(pegawai({ personas: [PERSONA.KEPALA_JURUSAN, PERSONA.GURU_MAPEL] })), ['kepala-jurusan', 'guru']);
  assert.deepEqual(keys({ role: 'super admin' }), ['super-admin']);
  assert.deepEqual(keys({ role: 'admin mitra industri' }), ['admin-mitra-industri']);
  assert.equal(canAccessPortal(pegawai({ isGuruMapel: true }), 'guru'), true);
  assert.equal(canAccessPortal(pegawai({ isGuruMapel: true }), 'guru-bk'), false);
});

test('katalog portal: key dan path unik, awalan rute cocok dengan dashboard/<key>', () => {
  const key = PORTALS.map((p) => p.key);
  const path = PORTALS.map((p) => p.path);
  assert.equal(new Set(key).size, key.length);
  assert.equal(new Set(path).size, path.length);
  assert.equal(new Set(PORTALS.map((p) => p.priority)).size, PORTALS.length, 'prioritas harus unik agar urutan pasti');
  // 'guru' memakai path guru-sekolah (warisan); selebihnya key sama dengan segmen path
  for (const p of PORTALS) {
    if (p.key === 'guru') continue;
    assert.equal(p.path, `/dashboard/${p.key}`);
  }
});

test('tidak ada path portal yang menjadi awalan path portal lain (ProfileMenu memakai startsWith)', () => {
  for (const a of PORTALS) {
    for (const b of PORTALS) {
      if (a !== b) assert.equal(b.path.startsWith(`${a.path}/`), false, `${b.path} berawalan ${a.path}`);
    }
  }
});
