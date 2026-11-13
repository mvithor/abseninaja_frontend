// Mock pengaduan anonim siswa (sisi BK). Kontrak: docunentation/dashboard bk/PRD-Frontend-Pengaduan-Jadwal-BK.md.
//
// Anonimitas: data pelapor TIDAK disimpan sama sekali. Pelapor hanya memegang kode tiket untuk
// membaca balasan BK (aplikasi siswa, di luar cakupan). Tingkat kelas boleh diisi pelapor secara sukarela.
// Lingkup: koordinator melihat & menugaskan semua pengaduan; anggota hanya yang ditugaskan kepadanya.

import { BK_ID_ANGGOTA, BK_ID_KOORDINATOR } from './akunDummy';
import { anggotaLogin, BK, namaBk, TIDAK_AKTIF } from './bkDummy';
import { gagal, ok } from './dokumenDummy';

const STORAGE_KEY = 'abseninaja_dummy_bk_pengaduan_v1';
const JAM_MS = 60 * 60 * 1000;

const KATEGORI = {
  perundungan: 'Perundungan (bullying)',
  kekerasan: 'Kekerasan fisik',
  pelecehan: 'Pelecehan',
  kesehatan_mental: 'Kesehatan mental',
  keluarga: 'Masalah keluarga',
  zat_terlarang: 'Rokok / narkoba',
  lainnya: 'Lainnya',
};
const STATUS = { baru: 'Baru', ditinjau: 'Ditinjau', ditindaklanjuti: 'Ditindaklanjuti', selesai: 'Selesai', ditutup: 'Ditutup' };
const URGENSI = { darurat: 'Darurat', tinggi: 'Tinggi', normal: 'Normal' };

const SEED = [
  { jamLalu: 1, kategori: 'kesehatan_mental', urgensi: 'darurat', status: 'baru', bk: null, tingkat: 'XI', lokasi: '-', isi: 'Saya merasa sudah tidak kuat lagi dan kadang berpikir untuk menyakiti diri sendiri. Saya tidak berani cerita ke orang tua.', pesan: [] },
  { jamLalu: 5, kategori: 'perundungan', urgensi: 'tinggi', status: 'baru', bk: null, tingkat: 'X', lokasi: 'Kantin dan grup WhatsApp kelas', isi: 'Teman saya terus diejek soal fisiknya, fotonya diedit lalu disebar di grup kelas. Dia jadi sering tidak masuk.', pesan: [] },
  { jamLalu: 20, kategori: 'perundungan', urgensi: 'tinggi', status: 'ditinjau', bk: BK_ID_ANGGOTA, tingkat: 'XI', lokasi: 'Parkiran motor', isi: 'Ada kakak kelas yang sering meminta uang secara paksa di parkiran setiap pulang sekolah.', pesan: [
    { dari: 'bk', jamLalu: 18, isi: 'Terima kasih sudah melapor. Laporanmu kami tindak lanjuti. Apakah kejadian ini terjadi setiap hari?' },
    { dari: 'pelapor', jamLalu: 10, isi: 'Hampir setiap hari, biasanya hari Senin dan Kamis.' },
  ] },
  { jamLalu: 30, kategori: 'zat_terlarang', urgensi: 'normal', status: 'ditindaklanjuti', bk: BK_ID_KOORDINATOR, tingkat: 'XII', lokasi: 'Belakang musala', isi: 'Beberapa siswa merokok di belakang musala saat jam istirahat kedua.', pesan: [
    { dari: 'bk', jamLalu: 28, isi: 'Terima kasih. Kami sudah berkoordinasi dengan bagian kesiswaan untuk pengawasan area tersebut.' },
  ] },
  { jamLalu: 52, kategori: 'keluarga', urgensi: 'tinggi', status: 'ditindaklanjuti', bk: BK_ID_KOORDINATOR, tingkat: 'X', lokasi: '-', isi: 'Orang tua saya sering bertengkar hebat di rumah, saya susah tidur dan tidak bisa fokus belajar.', pesan: [
    { dari: 'bk', jamLalu: 50, isi: 'Kami di sini untuk membantu. Kalau kamu bersedia, kamu bisa datang ke ruang BK kapan saja tanpa harus menyebut laporan ini.' },
    { dari: 'pelapor', jamLalu: 3, isi: 'Baik bu, saya mungkin akan datang minggu ini.' },
  ] },
  { jamLalu: 75, kategori: 'pelecehan', urgensi: 'tinggi', status: 'ditinjau', bk: BK_ID_KOORDINATOR, tingkat: null, lokasi: 'Lorong lantai 2', isi: 'Ada siswa laki-laki yang sering berkata tidak sopan dan menyentuh siswi saat berpapasan di lorong.', pesan: [] },
  { jamLalu: 120, kategori: 'lainnya', urgensi: 'normal', status: 'selesai', bk: BK_ID_ANGGOTA, tingkat: 'XI', lokasi: 'Kelas', isi: 'Barang-barang di kelas sering hilang, termasuk kalkulator dan uang.', pesan: [
    { dari: 'bk', jamLalu: 110, isi: 'Kami sudah menyampaikan ke wali kelas untuk pengecekan dan pemasangan loker.' },
  ] },
  { jamLalu: 200, kategori: 'lainnya', urgensi: 'normal', status: 'ditutup', bk: BK_ID_KOORDINATOR, tingkat: null, lokasi: '-', isi: 'tes tes', pesan: [], alasan_tutup: 'Laporan uji coba, tidak berisi pengaduan.' },
  { jamLalu: 260, kategori: 'kekerasan', urgensi: 'tinggi', status: 'selesai', bk: BK_ID_ANGGOTA, tingkat: 'XI', lokasi: 'Lapangan', isi: 'Terjadi perkelahian antar kelas setelah pertandingan futsal.', pesan: [
    { dari: 'bk', jamLalu: 255, isi: 'Kasus sudah ditangani melalui mediasi kedua kelas. Terima kasih atas laporanmu.' },
  ] },
];

const kodeTiket = (i) => `ADU-${(4729 + i * 137).toString(36).toUpperCase()}`;

const seed = () => {
  const now = Date.now();
  return SEED.map((s, i) => ({
    id: `00000000-0000-4000-a000-${String(i + 1).padStart(12, '0')}`,
    kode_tiket: kodeTiket(i),
    dibuat_pada: new Date(now - s.jamLalu * JAM_MS).toISOString(),
    kategori: s.kategori,
    isi: s.isi,
    lokasi: s.lokasi,
    tingkat: s.tingkat,
    urgensi: s.urgensi,
    status: s.status,
    ditugaskan_ke: s.bk,
    alasan_tutup: s.alasan_tutup || null,
    percakapan: s.pesan.map((p, j) => ({
      id: `${i}-${j}`,
      dari: p.dari,
      isi: p.isi,
      waktu: new Date(now - p.jamLalu * JAM_MS).toISOString(),
      bk_id: p.dari === 'bk' ? s.bk : null,
    })),
    catatan_internal: [],
    jurnal_ids: [],
    diperbarui_pada: new Date(now - (s.pesan.length ? Math.min(...s.pesan.map((p) => p.jamLalu)) : s.jamLalu) * JAM_MS).toISOString(),
  }));
};

let cache = null;
export const ambilPengaduan = () => {
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
  simpanPengaduan();
  return cache;
};
export const simpanPengaduan = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
export const resetPengaduanBk = () => {
  localStorage.removeItem(STORAGE_KEY);
  cache = null;
};

// ─── Bentuk respons ──────────────────────────────────────────────────────────

const meta = (map, kode) => ({ kode, label: map[kode] });
const bkRingkas = (id) => (id ? { id, nama: namaBk(id) } : null);

/** Pesan terakhir dari pelapor belum dibalas BK. */
const menungguBalasan = (p) => p.percakapan.length > 0 && p.percakapan[p.percakapan.length - 1].dari === 'pelapor';

const bentukRingkas = (p) => ({
  id: p.id,
  kode_tiket: p.kode_tiket,
  dibuat_pada: p.dibuat_pada,
  diperbarui_pada: p.diperbarui_pada,
  kategori: meta(KATEGORI, p.kategori),
  urgensi: meta(URGENSI, p.urgensi),
  status: meta(STATUS, p.status),
  cuplikan: p.isi.length > 140 ? `${p.isi.slice(0, 140)}…` : p.isi,
  tingkat: p.tingkat,
  ditugaskan_ke: bkRingkas(p.ditugaskan_ke),
  jumlah_pesan: p.percakapan.length,
  menunggu_balasan: menungguBalasan(p),
});

const bentukLengkap = (p) => ({
  ...bentukRingkas(p),
  isi: p.isi,
  lokasi: p.lokasi,
  alasan_tutup: p.alasan_tutup,
  percakapan: p.percakapan.map((m) => ({ ...m, bk: m.dari === 'bk' ? bkRingkas(m.bk_id) : null })),
  catatan_internal: p.catatan_internal.map((c) => ({ ...c, bk: bkRingkas(c.bk_id) })),
  jurnal_ids: p.jurnal_ids,
});

const pengaduanTerlihat = (akun) => {
  const saya = anggotaLogin(akun);
  if (!saya?.aktif) return null;
  const semua = ambilPengaduan();
  return saya.is_koordinator ? semua : semua.filter((p) => p.ditugaskan_ke === saya.id);
};

const cariTerlihat = (akun, id) => (pengaduanTerlihat(akun) || []).find((p) => p.id === id) || null;

const URUT_URGENSI = { darurat: 0, tinggi: 1, normal: 2 };
const AKTIF = ['baru', 'ditinjau', 'ditindaklanjuti'];

/** Dipakai jurnal untuk memvalidasi `pengaduan_id` sebelum catatan disimpan. */
export const adaPengaduanTerlihat = (pengaduanId, akun) => Boolean(cariTerlihat(akun, pengaduanId));

/** Dipakai jurnal: tautkan catatan penanganan ke pengaduan & tandai ditindaklanjuti. */
export const tautkanJurnalKePengaduan = (pengaduanId, jurnalId, akun) => {
  const p = cariTerlihat(akun, pengaduanId);
  if (!p) return false;
  p.jurnal_ids.push(jurnalId);
  if (['baru', 'ditinjau'].includes(p.status)) p.status = 'ditindaklanjuti';
  p.diperbarui_pada = new Date().toISOString();
  simpanPengaduan();
  return true;
};

// ─── Handler ─────────────────────────────────────────────────────────────────

export const handlerPengaduanBk = [
  ['GET', new RegExp(`^${BK}/pengaduan$`), ({ akun, params }) => {
    const terlihat = pengaduanTerlihat(akun);
    if (!terlihat) return TIDAK_AKTIF;
    let rows = terlihat;
    const q = String(params.q || '').trim().toLowerCase();

    if (params.kelompok === 'aktif') rows = rows.filter((p) => AKTIF.includes(p.status));
    else if (params.kelompok === 'arsip') rows = rows.filter((p) => !AKTIF.includes(p.status));
    if (params.status) rows = rows.filter((p) => p.status === params.status);
    if (params.kategori) rows = rows.filter((p) => p.kategori === params.kategori);
    if (params.urgensi) rows = rows.filter((p) => p.urgensi === params.urgensi);
    if (params.ditugaskan === 'saya') rows = rows.filter((p) => p.ditugaskan_ke === akun?.bkId);
    if (params.ditugaskan === 'belum') rows = rows.filter((p) => !p.ditugaskan_ke);
    if (q) rows = rows.filter((p) => p.isi.toLowerCase().includes(q) || p.kode_tiket.toLowerCase().includes(q));

    // Pengaduan aktif di atas, diurutkan dari yang paling mendesak; sisanya terbaru dulu.
    const bobot = (p) => (AKTIF.includes(p.status) ? URUT_URGENSI[p.urgensi] : 9);
    rows = [...rows].sort((a, b) => bobot(a) - bobot(b) || b.dibuat_pada.localeCompare(a.dibuat_pada));

    const total = rows.length;
    const limit = Number(params.limit) || total || 1;
    const page = Number(params.page) || 1;
    return ok({
      data: rows.slice((page - 1) * limit, page * limit).map(bentukRingkas),
      meta: {
        total,
        page,
        limit,
        ringkasan: {
          baru: terlihat.filter((p) => p.status === 'baru').length,
          darurat_aktif: terlihat.filter((p) => p.urgensi === 'darurat' && AKTIF.includes(p.status)).length,
          belum_ditugaskan: terlihat.filter((p) => !p.ditugaskan_ke && AKTIF.includes(p.status)).length,
          menunggu_balasan: terlihat.filter((p) => AKTIF.includes(p.status) && menungguBalasan(p)).length,
          aktif: terlihat.filter((p) => AKTIF.includes(p.status)).length,
        },
      },
    });
  }],

  ['GET', new RegExp(`^${BK}/pengaduan/([^/]+)$`), ({ akun, match }) => {
    if (!pengaduanTerlihat(akun)) return TIDAK_AKTIF;
    const p = cariTerlihat(akun, match[1]);
    return p ? ok({ data: bentukLengkap(p) }) : gagal(404, 'Pengaduan tidak ditemukan');
  }],

  ['PATCH', new RegExp(`^${BK}/pengaduan/([^/]+)$`), ({ akun, match, body }) => {
    const saya = anggotaLogin(akun);
    const p = cariTerlihat(akun, match[1]);
    if (!p) return gagal(404, 'Pengaduan tidak ditemukan');
    if (['ditugaskan_ke', 'urgensi', 'status'].every((k) => body?.[k] === undefined)) return gagal(422, 'Tidak ada perubahan yang dikirim');

    if (body?.ditugaskan_ke !== undefined) {
      if (!saya.is_koordinator) return gagal(403, 'Hanya koordinator BK yang dapat menugaskan pengaduan');
      const target = body.ditugaskan_ke ? anggotaLogin({ bkId: body.ditugaskan_ke }) : null;
      if (body.ditugaskan_ke && !target?.aktif) return gagal(422, 'BK tujuan tidak valid atau tidak aktif');
      p.ditugaskan_ke = body.ditugaskan_ke || null;
    }
    if (body?.urgensi !== undefined) {
      if (!URGENSI[body.urgensi]) return gagal(422, 'Urgensi tidak valid');
      p.urgensi = body.urgensi;
    }
    if (body?.status !== undefined) {
      if (!STATUS[body.status]) return gagal(422, 'Status tidak valid');
      if (body.status === 'ditutup' && String(body.alasan_tutup || '').trim().length < 5) {
        return gagal(422, 'Alasan menutup pengaduan wajib diisi (minimal 5 karakter)');
      }
      p.status = body.status;
      p.alasan_tutup = body.status === 'ditutup' ? String(body.alasan_tutup).trim() : null;
    }
    p.diperbarui_pada = new Date().toISOString();
    simpanPengaduan();
    return ok({ msg: 'Pengaduan diperbarui', data: bentukLengkap(p) });
  }],

  ['POST', new RegExp(`^${BK}/pengaduan/([^/]+)/balasan$`), ({ akun, match, body }) => {
    const p = cariTerlihat(akun, match[1]);
    if (!p) return gagal(404, 'Pengaduan tidak ditemukan');
    if (!AKTIF.includes(p.status)) return gagal(409, 'Pengaduan sudah selesai/ditutup; buka kembali untuk membalas');
    const isi = String(body?.isi || '').trim();
    if (isi.length < 2) return gagal(422, 'Balasan tidak boleh kosong');
    p.percakapan.push({ id: `${p.id}-${Date.now()}`, dari: 'bk', isi, waktu: new Date().toISOString(), bk_id: akun.bkId });
    if (p.status === 'baru') p.status = 'ditinjau';
    p.diperbarui_pada = new Date().toISOString();
    simpanPengaduan();
    return ok({ msg: 'Balasan terkirim ke pelapor', data: bentukLengkap(p) }, 201);
  }],

  ['POST', new RegExp(`^${BK}/pengaduan/([^/]+)/catatan$`), ({ akun, match, body }) => {
    const p = cariTerlihat(akun, match[1]);
    if (!p) return gagal(404, 'Pengaduan tidak ditemukan');
    const isi = String(body?.isi || '').trim();
    if (isi.length < 2) return gagal(422, 'Catatan tidak boleh kosong');
    p.catatan_internal.push({ id: `${p.id}-c${Date.now()}`, isi, waktu: new Date().toISOString(), bk_id: akun.bkId });
    simpanPengaduan();
    return ok({ msg: 'Catatan internal disimpan', data: bentukLengkap(p) }, 201);
  }],
];
