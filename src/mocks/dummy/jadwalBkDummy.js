// Mock jadwal konseling BK. Kontrak: docunentation/dashboard bk/PRD-Frontend-Pengaduan-Jadwal-BK.md.
// Waktu disimpan sebagai tanggal + jam "dinding" di zona waktu sekolah (sama seperti jurnal & deadline).
// Satu BK tidak boleh punya dua sesi `terjadwal` yang beririsan waktunya.

import { BK_ID_ANGGOTA, BK_ID_KOORDINATOR } from './akunDummy';
import { anggotaLogin, BK, KELAS, kelasDalamLingkup, mulberry32, namaBk, SISWA, TIDAK_AKTIF } from './bkDummy';
import { ymdJakarta } from './dbDummy';
import { gagal, ok } from './dokumenDummy';

const STORAGE_KEY = 'abseninaja_dummy_bk_jadwal_v1';
const HARI_MS = 24 * 60 * 60 * 1000;

const STATUS = { terjadwal: 'Terjadwal', selesai: 'Selesai', dibatalkan: 'Dibatalkan', tidak_hadir: 'Tidak Hadir' };
const LAYANAN = {
  konseling_individu: 'Konseling Individu', konseling_kelompok: 'Konseling Kelompok', panggilan_ortu: 'Panggilan Orang Tua',
  home_visit: 'Kunjungan Rumah', mediasi: 'Mediasi', konsultasi: 'Konsultasi Guru/Wali Kelas', referal: 'Alih Tangan Kasus',
};
const TOPIK = ['Evaluasi kesepakatan kehadiran', 'Konseling belajar', 'Tindak lanjut mediasi', 'Konseling karier PKL', 'Pendampingan pribadi', 'Pertemuan dengan wali'];
const LOKASI = ['Ruang BK 1', 'Ruang BK 2', 'Ruang Konseling Kelompok'];

const seed = () => {
  const rnd = mulberry32(7300);
  const now = Date.now();
  const daftar = [];
  for (let hari = -10; hari <= 14; hari += 1) {
    const tanggal = ymdJakarta(new Date(now + hari * HARI_MS));
    const dow = new Date(`${tanggal}T12:00:00+07:00`).getUTCDay();
    if (dow === 0 || dow === 6) continue;
    [BK_ID_KOORDINATOR, BK_ID_ANGGOTA].forEach((bkId) => {
      const tingkat = bkId === BK_ID_KOORDINATOR ? 'X' : 'XI';
      const kandidat = SISWA.filter((s) => KELAS.find((k) => k.id === s.kelas_id)?.tingkat === tingkat);
      const jumlah = hari === 0 ? 2 : rnd() < 0.55 ? 1 : 0;
      const jamTerpakai = new Set();
      for (let i = 0; i < jumlah; i += 1) {
        let jam = 8 + Math.floor(rnd() * 6);
        while (jamTerpakai.has(jam)) jam += 1;
        jamTerpakai.add(jam);
        const layanan = rnd() < 0.75 ? 'konseling_individu' : 'konseling_kelompok';
        const utama = kandidat[Math.floor(rnd() * kandidat.length)];
        const siswa = layanan === 'konseling_kelompok'
          ? [utama, ...kandidat.filter((s) => s.kelas_id === utama.kelas_id && s.id !== utama.id).slice(0, 2)]
          : [utama];
        const lalu = hari < 0;
        daftar.push({
          id: `00000000-0000-4000-b000-${String(daftar.length + 1).padStart(12, '0')}`,
          tanggal,
          jam_mulai: `${String(jam).padStart(2, '0')}:00`,
          jam_selesai: `${String(jam).padStart(2, '0')}:45`,
          siswa_ids: siswa.map((s) => s.id),
          jenis_layanan: layanan,
          topik: TOPIK[Math.floor(rnd() * TOPIK.length)],
          lokasi: layanan === 'konseling_kelompok' ? LOKASI[2] : LOKASI[bkId === BK_ID_KOORDINATOR ? 0 : 1],
          catatan: null,
          status: lalu ? (rnd() < 0.75 ? 'selesai' : rnd() < 0.5 ? 'tidak_hadir' : 'dibatalkan') : 'terjadwal',
          alasan_batal: null,
          bk_id: bkId,
          jurnal_id: null,
        });
      }
    });
  }
  daftar.filter((j) => j.status === 'dibatalkan').forEach((j) => { j.alasan_batal = 'Siswa mengikuti lomba di luar sekolah'; });
  return daftar;
};

let cache = null;
const ambilJadwal = () => {
  if (cache) return cache;
  try {
    const simpanan = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(simpanan)) {
      cache = simpanan;
      return cache;
    }
  } catch {
    // seed ulang
  }
  cache = seed();
  simpan();
  return cache;
};
const simpan = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
export const resetJadwalBk = () => {
  localStorage.removeItem(STORAGE_KEY);
  cache = null;
};

const ringkasSiswa = (id) => {
  const s = SISWA.find((x) => x.id === id);
  return s ? { id: s.id, nama: s.nama, nis: s.nis, kelas: { id: s.kelas_id, nama: KELAS.find((k) => k.id === s.kelas_id)?.nama } } : null;
};

const bentuk = (j, akun) => ({
  id: j.id,
  tanggal: j.tanggal,
  jam_mulai: j.jam_mulai,
  jam_selesai: j.jam_selesai,
  siswa: j.siswa_ids.map(ringkasSiswa).filter(Boolean),
  jenis_layanan: { kode: j.jenis_layanan, label: LAYANAN[j.jenis_layanan] },
  topik: j.topik,
  lokasi: j.lokasi,
  catatan: j.catatan,
  status: { kode: j.status, label: STATUS[j.status] },
  alasan_batal: j.alasan_batal,
  bk: { id: j.bk_id, nama: namaBk(j.bk_id) },
  bisa_ubah: j.bk_id === akun?.bkId,
  jurnal_id: j.jurnal_id,
});

const beririsan = (a, b) => a.tanggal === b.tanggal && a.jam_mulai < b.jam_selesai && b.jam_mulai < a.jam_selesai;

const validasi = (body) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body?.tanggal || '')) return 'Tanggal tidak valid';
  if (!/^\d{2}:\d{2}$/.test(body?.jam_mulai || '') || !/^\d{2}:\d{2}$/.test(body?.jam_selesai || '')) return 'Jam mulai dan selesai wajib diisi';
  if (body.jam_selesai <= body.jam_mulai) return 'Jam selesai harus setelah jam mulai';
  if (!Array.isArray(body?.siswa_ids) || body.siswa_ids.length === 0) return 'Pilih minimal satu siswa';
  if (!LAYANAN[body?.jenis_layanan]) return 'Jenis layanan tidak valid';
  if (String(body?.topik || '').trim().length < 3) return 'Topik minimal 3 karakter';
  return '';
};

const cekBentrok = (calon, bkId, kecualiId) => {
  const bentrok = ambilJadwal().find((j) => j.bk_id === bkId && j.id !== kecualiId && j.status === 'terjadwal' && beririsan(j, calon));
  return bentrok ? gagal(409, `Bentrok dengan jadwal ${bentrok.jam_mulai}–${bentrok.jam_selesai} (${bentrok.topik})`) : null;
};

/** Dipakai jurnal untuk memvalidasi `jadwal_id` sebelum catatan disimpan. */
export const adaJadwalMilik = (jadwalId, akun) => ambilJadwal().some((x) => x.id === jadwalId && x.bk_id === akun?.bkId);

/** Dipakai jurnal: sesi yang hasilnya dicatat otomatis menjadi "selesai" dan tertaut ke catatan. */
export const tautkanJurnalKeJadwal = (jadwalId, jurnalId, akun) => {
  const j = ambilJadwal().find((x) => x.id === jadwalId && x.bk_id === akun?.bkId);
  if (!j) return false;
  j.status = 'selesai';
  j.jurnal_id = jurnalId;
  simpan();
  return true;
};

export const handlerJadwalBk = [
  ['GET', new RegExp(`^${BK}/jadwal$`), ({ akun, params }) => {
    const saya = anggotaLogin(akun);
    if (!saya?.aktif) return TIDAK_AKTIF;
    let rows = ambilJadwal();
    rows = saya.is_koordinator && params.lingkup === 'semua' ? rows : rows.filter((j) => j.bk_id === saya.id);
    if (params.tanggal_mulai) rows = rows.filter((j) => j.tanggal >= params.tanggal_mulai);
    if (params.tanggal_selesai) rows = rows.filter((j) => j.tanggal <= params.tanggal_selesai);
    if (params.status) rows = rows.filter((j) => j.status === params.status);
    if (params.siswa_id) rows = rows.filter((j) => j.siswa_ids.includes(params.siswa_id));
    rows = [...rows].sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.jam_mulai.localeCompare(b.jam_mulai));
    return ok({ data: rows.map((j) => bentuk(j, akun)), meta: { total: rows.length } });
  }],

  ['GET', new RegExp(`^${BK}/jadwal/([^/]+)$`), ({ akun, match }) => {
    const saya = anggotaLogin(akun);
    const j = ambilJadwal().find((x) => x.id === match[1] && (x.bk_id === saya?.id || saya?.is_koordinator));
    return j ? ok({ data: bentuk(j, akun) }) : gagal(404, 'Jadwal tidak ditemukan');
  }],

  ['POST', new RegExp(`^${BK}/jadwal$`), ({ akun, body }) => {
    const saya = anggotaLogin(akun);
    if (!saya?.aktif) return TIDAK_AKTIF;
    const galat = validasi(body);
    if (galat) return gagal(422, galat);
    if (body.tanggal < ymdJakarta(new Date())) return gagal(422, 'Jadwal baru tidak boleh di tanggal yang sudah lewat');
    const lingkup = kelasDalamLingkup(akun, { lingkup: 'semua' });
    if (body.siswa_ids.some((id) => !lingkup.has(SISWA.find((s) => s.id === id)?.kelas_id))) {
      return gagal(403, 'Ada siswa di luar kelas tanggung jawab Anda');
    }
    const bentrok = cekBentrok(body, saya.id, null);
    if (bentrok) return bentrok;
    const baru = {
      id: `00000000-0000-4000-b000-${String(Date.now() % 1e12).padStart(12, '0')}`,
      tanggal: body.tanggal, jam_mulai: body.jam_mulai, jam_selesai: body.jam_selesai, siswa_ids: body.siswa_ids,
      jenis_layanan: body.jenis_layanan, topik: String(body.topik).trim(), lokasi: body.lokasi?.trim() || null,
      catatan: body.catatan?.trim() || null, status: 'terjadwal', alasan_batal: null, bk_id: saya.id, jurnal_id: null,
    };
    ambilJadwal().push(baru);
    simpan();
    return ok({ msg: 'Jadwal konseling dibuat', data: bentuk(baru, akun) }, 201);
  }],

  ['PATCH', new RegExp(`^${BK}/jadwal/([^/]+)$`), ({ akun, match, body }) => {
    const j = ambilJadwal().find((x) => x.id === match[1]);
    if (!j) return gagal(404, 'Jadwal tidak ditemukan');
    if (j.bk_id !== akun?.bkId) return gagal(403, 'Hanya BK pemilik jadwal yang dapat mengubahnya');

    // Ubah status saja (selesai / tidak hadir / dibatalkan / terjadwal kembali)
    if (body?.status && Object.keys(body).every((k) => ['status', 'alasan_batal'].includes(k))) {
      if (!STATUS[body.status]) return gagal(422, 'Status tidak valid');
      if (body.status === 'dibatalkan' && String(body.alasan_batal || '').trim().length < 5) {
        return gagal(422, 'Alasan pembatalan wajib diisi (minimal 5 karakter)');
      }
      if (body.status === 'terjadwal') {
        const bentrok = cekBentrok(j, j.bk_id, j.id);
        if (bentrok) return bentrok;
      }
      j.status = body.status;
      j.alasan_batal = body.status === 'dibatalkan' ? body.alasan_batal.trim() : null;
      simpan();
      return ok({ msg: `Jadwal ditandai ${STATUS[j.status].toLowerCase()}`, data: bentuk(j, akun) });
    }

    // Ubah isi / jadwal ulang
    if (j.status !== 'terjadwal') return gagal(409, 'Hanya jadwal berstatus Terjadwal yang dapat diubah');
    const calon = { ...j, ...body };
    const galat = validasi(calon);
    if (galat) return gagal(422, galat);
    const bentrok = cekBentrok(calon, j.bk_id, j.id);
    if (bentrok) return bentrok;
    Object.assign(j, {
      tanggal: calon.tanggal, jam_mulai: calon.jam_mulai, jam_selesai: calon.jam_selesai, siswa_ids: calon.siswa_ids,
      jenis_layanan: calon.jenis_layanan, topik: String(calon.topik).trim(), lokasi: calon.lokasi?.trim() || null, catatan: calon.catatan?.trim() || null,
    });
    simpan();
    return ok({ msg: 'Jadwal konseling diperbarui', data: bentuk(j, akun) });
  }],
];
