// Mock portal Guru BK: pemetaan siswa (ekonomi, geografis, kesehatan, kendaraan, ekskul) dan
// manajemen Tim BK per tanggung jawab kelas. Kontrak: docunentation/dashboard bk/PRD-Frontend-Dashboard-BK.md.
//
// Data siswa dibangkitkan deterministik (seed tetap) sehingga sama di setiap muat ulang.
// Hanya susunan Tim BK (penugasan kelas, status aktif) yang disimpan di localStorage.
//
// Tipe id mengikuti backend: pegawai & kelas = angka; anggota Tim BK (`bk.id`) = UUID bk_anggota,
// BERBEDA dari pegawai.id; siswa = UUID.

import { BK_ID_ANGGOTA, BK_ID_KOORDINATOR } from './akunDummy';
import { uid } from './dbDummy';
import { gagal, ok } from './dokumenDummy';

export const BK = '/api/v1/guru-bk';
// v2: id anggota Tim BK terpisah dari id pegawai (angka)
const STORAGE_KEY = 'abseninaja_dummy_bk_v2';

// ─── Data dasar ──────────────────────────────────────────────────────────────

export const KELAS = [
  'X TKJ 1', 'X TKJ 2', 'X RPL 1', 'X RPL 2', 'XI TKJ 1', 'XI RPL 1', 'XI RPL 2', 'XII TKJ 1',
].map((nama, i) => ({ id: 700 + i, nama, tingkat: nama.split(' ')[0] }));

const PEGAWAI = [
  { id: 41, nama: 'Rahmat Hidayat, S.Pd.', nip: '198104112006041001', email: 'bk@dummy.abseninaja.id' },
  { id: 42, nama: 'Lina Marlina, M.Psi.', nip: '198907222015042002', email: 'bk2@dummy.abseninaja.id' },
  { id: 43, nama: 'Dian Puspita, S.Psi.', nip: null, email: 'dian.puspita@sekolah.sch.id' },
  { id: 44, nama: 'Agus Salim, S.Pd.', nip: '198512302010011004', email: 'agus.salim@sekolah.sch.id' },
  { id: 45, nama: 'Fitri Handayani, S.Pd.', nip: '199006082014032005', email: null },
];

const TIM_AWAL = [
  { id: BK_ID_KOORDINATOR, pegawai_id: 41, is_koordinator: true, aktif: true, kelas_ids: KELAS.filter((k) => k.tingkat === 'X').map((k) => k.id) },
  { id: BK_ID_ANGGOTA, pegawai_id: 42, is_koordinator: false, aktif: true, kelas_ids: KELAS.filter((k) => k.tingkat === 'XI').map((k) => k.id) },
  // XII TKJ 1 sengaja belum punya BK, supaya peringatan "kelas tanpa BK" terlihat.
];

// ─── Kategori per dimensi (urutan = urutan tampil) ───────────────────────────

const KATEGORI = {
  ekonomi: [
    { kode: 'lt1', label: '< Rp1 juta', perhatian: true },
    { kode: '1_3', label: 'Rp1–3 juta', perhatian: false },
    { kode: '3_5', label: 'Rp3–5 juta', perhatian: false },
    { kode: 'gt5', label: '> Rp5 juta', perhatian: false },
  ],
  geografis: [
    { kode: 'dekat', label: '≤ 3 km', perhatian: false },
    { kode: 'sedang', label: '3–10 km', perhatian: false },
    { kode: 'jauh', label: '> 10 km', perhatian: true },
  ],
  kesehatan: [
    { kode: 'sehat', label: 'Sehat', perhatian: false },
    { kode: 'perlu_perhatian', label: 'Perlu perhatian', perhatian: true },
    { kode: 'khusus', label: 'Kondisi khusus', perhatian: true },
  ],
  kendaraan: [
    { kode: 'jalan_kaki', label: 'Jalan kaki', perhatian: false },
    { kode: 'sepeda', label: 'Sepeda', perhatian: false },
    { kode: 'motor_sim', label: 'Motor (ber-SIM)', perhatian: false },
    { kode: 'motor_tanpa_sim', label: 'Motor tanpa SIM', perhatian: true },
    { kode: 'diantar', label: 'Diantar keluarga', perhatian: false },
    { kode: 'angkutan_umum', label: 'Angkutan umum', perhatian: false },
    { kode: 'ojek', label: 'Ojek', perhatian: false },
  ],
  ekskul: [
    { kode: 'tidak_ikut', label: 'Tidak ikut ekskul', perhatian: true },
    { kode: 'satu', label: '1 ekskul', perhatian: false },
    { kode: 'dua_plus', label: '≥ 2 ekskul', perhatian: false },
  ],
};

export const LABEL_DIMENSI = { ekonomi: 'Ekonomi', geografis: 'Geografis', kesehatan: 'Kesehatan', kendaraan: 'Kendaraan', ekskul: 'Ekstrakurikuler' };

// Data pemetaan yang belum diisi (backend: belum ada fitur pengisian). Tidak pernah jadi faktor perhatian.
const BELUM_DIISI = { kode: 'belum_diisi', label: 'Belum diisi', perhatian: false };
const labelKategori = (dimensi, kode) =>
  kode === BELUM_DIISI.kode ? BELUM_DIISI.label : KATEGORI[dimensi].find((k) => k.kode === kode)?.label || kode;

// ─── Pembangkit siswa deterministik ──────────────────────────────────────────

export const mulberry32 = (seed) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const NAMA_DEPAN = ['Andi', 'Budi', 'Citra', 'Dimas', 'Eka', 'Fajar', 'Gita', 'Hana', 'Indra', 'Joko', 'Kartika', 'Lestari', 'Maya', 'Nanda', 'Oki', 'Putri', 'Rizki', 'Sari', 'Tegar', 'Umi', 'Vina', 'Wahyu', 'Yoga', 'Zahra', 'Bayu', 'Dewi', 'Fikri', 'Intan', 'Rahma', 'Satria'];
const NAMA_BELAKANG = ['Pratama', 'Saputra', 'Lestari', 'Wulandari', 'Hidayat', 'Nugroho', 'Kurniawan', 'Permata', 'Ramadhan', 'Anggraini', 'Setiawan', 'Maharani'];
const KECAMATAN = [
  { nama: 'Kedaton', jarak: 2 }, { nama: 'Rajabasa', jarak: 4 }, { nama: 'Way Halim', jarak: 3 }, { nama: 'Sukarame', jarak: 6 },
  { nama: 'Kemiling', jarak: 8 }, { nama: 'Natar', jarak: 14 }, { nama: 'Jati Agung', jarak: 17 }, { nama: 'Tanjung Bintang', jarak: 22 },
];
const PEKERJAAN = ['Petani', 'Buruh harian', 'Pedagang', 'Wiraswasta', 'Karyawan swasta', 'PNS', 'Guru', 'Sopir', 'Nelayan', 'Tidak bekerja'];
const EKSKUL = ['Pramuka', 'PMR', 'Paskibra', 'Futsal', 'Basket', 'Rohis', 'Robotik', 'English Club', 'Seni Tari', 'Voli'];
const KONDISI_RINGAN = ['Asma', 'Maag', 'Anemia', 'Alergi debu', 'Migrain', 'Rabun jauh'];
const KONDISI_KHUSUS = ['Epilepsi', 'Gangguan pendengaran', 'Penyakit jantung bawaan', 'Diabetes tipe 1'];
const GOL_DARAH = ['A', 'B', 'AB', 'O'];

const pilih = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const berbobot = (rnd, pasangan) => {
  let r = rnd();
  for (const [nilai, bobot] of pasangan) {
    if ((r -= bobot) <= 0) return nilai;
  }
  return pasangan[pasangan.length - 1][0];
};

const bangkitkanSiswa = () => {
  const rnd = mulberry32(20261105);
  const daftar = [];
  KELAS.forEach((kelas, ki) => {
    const jumlah = 11 + (ki % 3) * 2;
    for (let i = 0; i < jumlah; i += 1) {
      const n = ki * 100 + i;
      const penghasilan = berbobot(rnd, [['lt1', 0.14], ['1_3', 0.44], ['3_5', 0.26], ['gt5', 0.16]]);
      const bantuan = penghasilan === 'lt1' ? (rnd() < 0.7 ? [pilih(rnd, ['KIP', 'PKH', 'KKS'])] : [])
        : penghasilan === '1_3' && rnd() < 0.1 ? ['KIP'] : [];
      const kec = berbobot(rnd, KECAMATAN.map((k, j) => [k, [0.2, 0.18, 0.16, 0.14, 0.12, 0.09, 0.07, 0.04][j]]));
      const jarak = Math.max(0.5, Math.round((kec.jarak + (rnd() - 0.5) * 3) * 10) / 10);
      const kesehatan = berbobot(rnd, [['sehat', 0.8], ['perlu_perhatian', 0.15], ['khusus', 0.05]]);
      const moda = berbobot(rnd, [['jalan_kaki', 0.12], ['sepeda', 0.1], ['motor', 0.16], ['diantar', 0.3], ['angkutan_umum', 0.16], ['ojek', 0.16]]);
      const punyaSim = moda === 'motor' && rnd() < (kelas.tingkat === 'XII' ? 0.7 : 0.35);
      const jumlahEkskul = berbobot(rnd, [[0, 0.1], [1, 0.6], [2, 0.3]]);
      const ekskul = [...new Set(Array.from({ length: jumlahEkskul }, () => pilih(rnd, EKSKUL)))];

      daftar.push({
        id: uid(50000 + n),
        nama: `${pilih(rnd, NAMA_DEPAN)} ${pilih(rnd, NAMA_BELAKANG)}`,
        nis: String(2026000 + n),
        jenis_kelamin: rnd() < 0.5 ? 'L' : 'P',
        kelas_id: kelas.id,
        ekonomi: {
          kategori: penghasilan,
          bantuan,
          tanggungan: 2 + Math.floor(rnd() * 5),
          pekerjaan_ayah: pilih(rnd, PEKERJAAN),
          pekerjaan_ibu: pilih(rnd, ['Ibu rumah tangga', 'Pedagang', 'Buruh harian', 'Karyawan swasta', 'Guru']),
        },
        geografis: {
          kategori: jarak <= 3 ? 'dekat' : jarak <= 10 ? 'sedang' : 'jauh',
          kecamatan: kec.nama,
          desa: `Desa ${pilih(rnd, ['Sukamaju', 'Mekarsari', 'Sidomulyo', 'Karang Anyar', 'Margodadi', 'Sumber Rejo'])}`,
          jarak_km: jarak,
          waktu_tempuh_menit: Math.round(jarak * 3 + 5 + rnd() * 10),
        },
        kesehatan: {
          kategori: kesehatan,
          kondisi: kesehatan === 'sehat' ? [] : [pilih(rnd, kesehatan === 'khusus' ? KONDISI_KHUSUS : KONDISI_RINGAN)],
          golongan_darah: pilih(rnd, GOL_DARAH),
          alergi: rnd() < 0.15 ? pilih(rnd, ['Udang', 'Kacang', 'Debu', 'Obat penisilin']) : null,
        },
        kendaraan: {
          kategori: moda === 'motor' ? (punyaSim ? 'motor_sim' : 'motor_tanpa_sim') : moda,
          punya_sim: punyaSim,
        },
        ekskul: { kategori: ekskul.length === 0 ? 'tidak_ikut' : ekskul.length === 1 ? 'satu' : 'dua_plus', daftar: ekskul },
      });
    }
  });
  // Sebagian data sengaja kosong, meniru data asli yang belum lengkap. Diterapkan setelah
  // pembangkitan supaya urutan angka acak (dan data siswa lain) tidak berubah.
  daftar.forEach((s, i) => {
    if (i % 13 === 5) Object.assign(s.ekonomi, { kategori: 'belum_diisi', bantuan: [], tanggungan: null });
    if (i % 17 === 3) s.geografis = { kategori: 'belum_diisi', kecamatan: null, desa: null, jarak_km: null, waktu_tempuh_menit: null };
    if (i % 19 === 7) s.kesehatan = { kategori: 'belum_diisi', kondisi: [], golongan_darah: null, alergi: null };
    if (i % 23 === 11) s.kendaraan = { kategori: 'belum_diisi', punya_sim: null };
    if (i % 31 === 9) s.jenis_kelamin = null;
    if (i % 37 === 14) s.nis = null;
  });
  return daftar;
};

export const SISWA = bangkitkanSiswa();

/** Alasan "perlu perhatian" per dimensi (logika server di backend asli). */
export const alasanPerhatian = (s) => {
  const alasan = [];
  if (s.ekonomi.kategori === 'lt1') alasan.push({ dimensi: 'ekonomi', alasan: 'Penghasilan ortu < Rp1 juta' });
  else if (s.ekonomi.bantuan.length) alasan.push({ dimensi: 'ekonomi', alasan: `Penerima bantuan (${s.ekonomi.bantuan.join(', ')})` });
  if (s.geografis.kategori === 'jauh') alasan.push({ dimensi: 'geografis', alasan: `Jarak ${s.geografis.jarak_km} km dari sekolah` });
  if (!['sehat', 'belum_diisi'].includes(s.kesehatan.kategori)) alasan.push({ dimensi: 'kesehatan', alasan: s.kesehatan.kondisi.join(', ') });
  if (s.kendaraan.kategori === 'motor_tanpa_sim') alasan.push({ dimensi: 'kendaraan', alasan: 'Mengendarai motor tanpa SIM' });
  if (s.ekskul.kategori === 'tidak_ikut') alasan.push({ dimensi: 'ekskul', alasan: 'Tidak mengikuti ekskul' });
  return alasan;
};

// ─── Tim BK (persisten) ──────────────────────────────────────────────────────

let timCache = null;
const ambilTim = () => {
  if (timCache) return timCache;
  try {
    const simpanan = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(simpanan)) {
      timCache = simpanan;
      return timCache;
    }
  } catch {
    // data rusak: pakai awal
  }
  timCache = structuredClone(TIM_AWAL);
  return timCache;
};
const simpanTim = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(timCache));

const bkPemegangKelas = (kelasId) => ambilTim().find((t) => t.aktif && t.kelas_ids.includes(kelasId)) || null;
export const pegawai = (id) => PEGAWAI.find((p) => p.id === id);
/** Nama BK dari `bk.id` (id anggota Tim BK, bukan id pegawai). */
export const namaBk = (bkId) => pegawai(ambilTim().find((t) => t.id === bkId)?.pegawai_id)?.nama;
const jumlahSiswaKelas = (kelasId) => SISWA.filter((s) => s.kelas_id === kelasId).length;

const bentukKelas = (k) => {
  const pemegang = bkPemegangKelas(k.id);
  return { id: k.id, nama: k.nama, tingkat: k.tingkat, jumlah_siswa: jumlahSiswaKelas(k.id), bk: pemegang ? { id: pemegang.id, nama: pegawai(pemegang.pegawai_id)?.nama } : null };
};

const bentukAnggota = (t) => {
  const kelas = KELAS.filter((k) => t.kelas_ids.includes(k.id)).map((k) => ({ id: k.id, nama: k.nama, jumlah_siswa: jumlahSiswaKelas(k.id) }));
  return {
    id: t.id,
    pegawai: pegawai(t.pegawai_id),
    is_koordinator: t.is_koordinator,
    aktif: t.aktif,
    kelas,
    jumlah_siswa: kelas.reduce((n, k) => n + k.jumlah_siswa, 0),
  };
};

export const anggotaLogin = (akun) => ambilTim().find((t) => t.id === akun?.bkId) || null;

// ─── Lingkup data ────────────────────────────────────────────────────────────

/** Kelas yang boleh dilihat: anggota hanya kelas tanggung jawabnya; koordinator boleh `lingkup=semua`. */
export const kelasDalamLingkup = (akun, params) => {
  const saya = anggotaLogin(akun);
  if (!saya || !saya.aktif) return null;
  const semua = saya.is_koordinator && params.lingkup === 'semua';
  let ids = semua ? KELAS.map((k) => k.id) : saya.kelas_ids;
  if (params.kelas_id) ids = ids.filter((id) => String(id) === String(params.kelas_id));
  return new Set(ids);
};

export const barisSiswa = (s) => ({
  id: s.id,
  nama: s.nama,
  nis: s.nis,
  jenis_kelamin: s.jenis_kelamin,
  kelas: { id: s.kelas_id, nama: KELAS.find((k) => k.id === s.kelas_id)?.nama },
  ekonomi: { kategori: s.ekonomi.kategori, label: labelKategori('ekonomi', s.ekonomi.kategori), bantuan: s.ekonomi.bantuan },
  geografis: { kategori: s.geografis.kategori, label: labelKategori('geografis', s.geografis.kategori), jarak_km: s.geografis.jarak_km, kecamatan: s.geografis.kecamatan },
  kesehatan: { kategori: s.kesehatan.kategori, label: labelKategori('kesehatan', s.kesehatan.kategori), kondisi: s.kesehatan.kondisi },
  kendaraan: { kategori: s.kendaraan.kategori, label: labelKategori('kendaraan', s.kendaraan.kategori) },
  ekskul: { kategori: s.ekskul.kategori, label: labelKategori('ekskul', s.ekskul.kategori), daftar: s.ekskul.daftar },
  perhatian: alasanPerhatian(s),
});

const siswaDalamLingkup = (akun, params) => {
  const kelasIds = kelasDalamLingkup(akun, params);
  return kelasIds ? SISWA.filter((s) => kelasIds.has(s.kelas_id)) : null;
};

export const TIDAK_AKTIF = gagal(403, 'Akun BK Anda tidak aktif atau belum terdaftar di Tim BK');

// ─── Handler ─────────────────────────────────────────────────────────────────

export const handlerBk = [
  ['GET', new RegExp(`^${BK}/konteks$`), ({ akun }) => {
    const saya = anggotaLogin(akun);
    if (!saya) return TIDAK_AKTIF;
    return ok({ data: { ...bentukAnggota(saya), pegawai: pegawai(saya.pegawai_id) } });
  }],

  ['GET', new RegExp(`^${BK}/referensi/kelas$`), () => ok({ data: KELAS.map(bentukKelas) })],

  ['GET', new RegExp(`^${BK}/pemetaan/ringkasan$`), ({ akun, params }) => {
    const siswa = siswaDalamLingkup(akun, params);
    if (!siswa) return TIDAK_AKTIF;
    const baris = siswa.map(barisSiswa);
    const hitungDimensi = (dimensi) => baris.filter((b) => b.perhatian.some((p) => p.dimensi === dimensi)).length;

    const dimensi = Object.keys(KATEGORI).map((kode) => ({
      kode,
      label: LABEL_DIMENSI[kode],
      jumlah_perhatian: hitungDimensi(kode),
      kategori: [...KATEGORI[kode], BELUM_DIISI]
        .map((k) => ({ ...k, jumlah: baris.filter((b) => b[kode].kategori === k.kode).length }))
        // `belum_diisi` hanya dikirim bila ada siswanya
        .filter((k) => k.kode !== BELUM_DIISI.kode || k.jumlah > 0),
    }));

    const kelasIds = [...new Set(siswa.map((s) => s.kelas_id))];
    const per_kelas = KELAS.filter((k) => kelasIds.includes(k.id)).map((k) => {
      const milik = baris.filter((b) => b.kelas.id === k.id);
      return { kelas: { id: k.id, nama: k.nama }, bk: bentukKelas(k).bk, jumlah_siswa: milik.length, perlu_perhatian: milik.filter((b) => b.perhatian.length).length };
    });

    return ok({
      data: {
        total_siswa: baris.length,
        total_perhatian: baris.filter((b) => b.perhatian.length).length,
        total_prioritas: baris.filter((b) => b.perhatian.length >= 2).length,
        dimensi,
        per_kelas,
        siswa_prioritas: [...baris].filter((b) => b.perhatian.length >= 2).sort((a, b) => b.perhatian.length - a.perhatian.length || a.nama.localeCompare(b.nama)).slice(0, 6),
      },
    });
  }],

  ['GET', new RegExp(`^${BK}/pemetaan/siswa$`), ({ akun, params }) => {
    const siswa = siswaDalamLingkup(akun, params);
    if (!siswa) return TIDAK_AKTIF;
    const q = String(params.q || '').trim().toLowerCase();
    let rows = siswa.map(barisSiswa);
    if (params.dimensi && params.kategori) rows = rows.filter((r) => r[params.dimensi]?.kategori === params.kategori);
    else if (params.dimensi && params.perhatian === '1') rows = rows.filter((r) => r.perhatian.some((p) => p.dimensi === params.dimensi));
    if (!params.dimensi && params.perhatian === '1') rows = rows.filter((r) => r.perhatian.length > 0);
    if (q) rows = rows.filter((r) => r.nama.toLowerCase().includes(q) || (r.nis || '').includes(q));

    if (params.sort === 'perhatian') rows.sort((a, b) => b.perhatian.length - a.perhatian.length || a.nama.localeCompare(b.nama));
    else rows.sort((a, b) => a.kelas.nama.localeCompare(b.kelas.nama) || a.nama.localeCompare(b.nama));

    const total = rows.length;
    const limit = Number(params.limit) || total || 1;
    const page = Number(params.page) || 1;
    return ok({ data: rows.slice((page - 1) * limit, page * limit), meta: { total, page, limit } });
  }],

  ['GET', new RegExp(`^${BK}/pemetaan/siswa/([^/]+)$`), ({ akun, match }) => {
    const siswa = siswaDalamLingkup(akun, { lingkup: 'semua' });
    if (!siswa) return TIDAK_AKTIF;
    const s = siswa.find((x) => x.id === match[1]);
    if (!s) return gagal(404, 'Siswa tidak ditemukan atau bukan siswa binaan Anda');
    const baris = barisSiswa(s);
    return ok({
      data: {
        ...baris,
        ekonomi: { ...baris.ekonomi, tanggungan: s.ekonomi.tanggungan, pekerjaan_ayah: s.ekonomi.pekerjaan_ayah, pekerjaan_ibu: s.ekonomi.pekerjaan_ibu },
        geografis: { ...baris.geografis, desa: s.geografis.desa, waktu_tempuh_menit: s.geografis.waktu_tempuh_menit },
        kesehatan: { ...baris.kesehatan, golongan_darah: s.kesehatan.golongan_darah, alergi: s.kesehatan.alergi },
        kendaraan: { ...baris.kendaraan, punya_sim: s.kendaraan.punya_sim },
      },
    });
  }],

  // Tim BK
  ['GET', new RegExp(`^${BK}/tim$`), () => {
    const tim = ambilTim();
    const kelasTanpaBk = KELAS.filter((k) => !bkPemegangKelas(k.id)).map((k) => ({ id: k.id, nama: k.nama, jumlah_siswa: jumlahSiswaKelas(k.id) }));
    return ok({ data: tim.map(bentukAnggota), meta: { kelas_tanpa_bk: kelasTanpaBk } });
  }],

  ['GET', new RegExp(`^${BK}/tim/kandidat$`), ({ akun }) => {
    if (!anggotaLogin(akun)?.is_koordinator) return gagal(403, 'Hanya koordinator BK yang dapat mengelola Tim BK');
    const sudah = new Set(ambilTim().map((t) => t.pegawai_id));
    return ok({ data: PEGAWAI.filter((p) => !sudah.has(p.id)) });
  }],

  ['POST', new RegExp(`^${BK}/tim$`), ({ akun, body }) => {
    const saya = anggotaLogin(akun);
    if (!saya?.is_koordinator) return gagal(403, 'Hanya koordinator BK yang dapat mengelola Tim BK');
    if (!PEGAWAI.some((p) => p.id === body?.pegawai_id)) return gagal(422, 'Pegawai tidak valid');
    if (ambilTim().some((t) => t.pegawai_id === body.pegawai_id)) return gagal(409, 'Pegawai ini sudah terdaftar di Tim BK');
    const konflik = cekKonflikKelas(body.kelas_ids ?? [], null);
    if (konflik) return konflik;
    // id anggota Tim BK = UUID baru (bk_anggota.id), bukan id pegawai
    const baru = { id: crypto.randomUUID(), pegawai_id: body.pegawai_id, is_koordinator: false, aktif: true, kelas_ids: body.kelas_ids || [] };
    ambilTim().push(baru);
    simpanTim();
    return ok({ msg: `${pegawai(baru.pegawai_id).nama} ditambahkan ke Tim BK`, data: bentukAnggota(baru) }, 201);
  }],

  ['PATCH', new RegExp(`^${BK}/tim/([^/]+)$`), ({ akun, match, body }) => {
    const saya = anggotaLogin(akun);
    if (!saya?.is_koordinator) return gagal(403, 'Hanya koordinator BK yang dapat mengelola Tim BK');
    const target = ambilTim().find((t) => t.id === match[1]);
    if (!target) return gagal(404, 'Anggota Tim BK tidak ditemukan');
    if (body?.aktif === undefined && body?.kelas_ids === undefined) return gagal(422, 'Tidak ada perubahan yang dikirim');
    if (body?.aktif !== undefined && typeof body.aktif !== 'boolean') return gagal(422, 'Status aktif tidak valid');
    if (body?.aktif === false && target.is_koordinator) return gagal(409, 'Koordinator BK tidak dapat dinonaktifkan');

    if (body?.kelas_ids !== undefined) {
      const konflik = cekKonflikKelas(body.kelas_ids, target.id);
      if (konflik) return konflik;
    }
    // Mengaktifkan kembali: kelas lamanya mungkin sudah diambil BK aktif lain.
    if (body?.aktif === true && !target.aktif) {
      const kelasAkhir = body.kelas_ids ?? target.kelas_ids;
      const diambil = kelasAkhir.map((id) => ({ id, pemegang: bkPemegangKelas(id) })).find((k) => k.pemegang && k.pemegang.id !== target.id);
      if (diambil) {
        const kelas = KELAS.find((k) => k.id === diambil.id);
        return gagal(409, `Kelas ${kelas.nama} sudah dipegang ${pegawai(diambil.pemegang.pegawai_id).nama}; atur ulang kelas sebelum mengaktifkan`);
      }
    }
    if (body?.kelas_ids !== undefined) target.kelas_ids = body.kelas_ids;
    if (typeof body?.aktif === 'boolean') target.aktif = body.aktif;
    simpanTim();

    const nama = pegawai(target.pegawai_id).nama;
    const msg = typeof body?.aktif === 'boolean' && !Array.isArray(body?.kelas_ids)
      ? `Akun BK ${nama} ${body.aktif ? 'diaktifkan' : 'dinonaktifkan'}`
      : `Kelas tanggung jawab ${nama} diperbarui`;
    return ok({ msg, data: bentukAnggota(target) });
  }],
];

/** Satu kelas hanya dipegang satu BK aktif. */
function cekKonflikKelas(kelasIds, kecualiId) {
  if (!Array.isArray(kelasIds)) return gagal(422, 'Kelas tanggung jawab tidak valid');
  for (const id of kelasIds) {
    const kelas = KELAS.find((k) => k.id === id);
    if (!kelas) return gagal(422, 'Kelas tidak valid');
    const pemegang = bkPemegangKelas(id);
    if (pemegang && pemegang.id !== kecualiId) {
      return gagal(409, `Kelas ${kelas.nama} sudah dipegang ${pegawai(pemegang.pegawai_id).nama}; lepaskan dulu dari BK tersebut`);
    }
  }
  return null;
}

export const resetBk = () => {
  localStorage.removeItem(STORAGE_KEY);
  timCache = null;
};
