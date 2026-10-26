// Fungsi murni untuk tab Kehadiran LAD. Tanpa impor sama sekali supaya dapat diuji dengan `node --test`.
//
// Kode kehadiran LAD ada empat: H, S, I, A. Sel kosong berarti BELUM DICATAT, bukan alpa (D-01): pertemuan
// tanpa catatan untuk seorang siswa tidak masuk hitungan dan tidak dianggap A.
//
// Pemetaan nama status meniru absensi mapel Absenin (status_kehadiran): HADIR dan TERLAMBAT menjadi H,
// SAKIT S, IZIN I, ALPA dan TANPA KETERANGAN (TK) menjadi A. LIBUR bukan kehadiran: hari libur tidak
// membentuk pertemuan, jadi tidak diterima sebagai isian sel.

export const KODE_HADIR = ['H', 'S', 'I', 'A'];

export const TEKS_KODE = {
  H: 'Hadir',
  S: 'Sakit',
  I: 'Izin',
  A: 'Alpa (tanpa keterangan)',
};

const PETA_KODE = {
  H: 'H', HADIR: 'H', TERLAMBAT: 'H',
  S: 'S', SAKIT: 'S',
  I: 'I', IZIN: 'I',
  A: 'A', ALPA: 'A', ALPHA: 'A', TK: 'A', 'TANPA KETERANGAN': 'A',
};

const KODE_LIBUR = new Set(['L', 'LIBUR']);

/**
 * Baca satu sel yang diketik atau ditempel. Kosong -> { kode: null } (belum dicatat);
 * dikenal -> { kode }; selain itu { galat }.
 */
export function bacaKodeSel(teks) {
  const t = String(teks ?? '').replace(/\s+/g, ' ').trim().toUpperCase();
  if (t === '') return { kode: null };
  if (Object.prototype.hasOwnProperty.call(PETA_KODE, t)) return { kode: PETA_KODE[t] };
  if (KODE_LIBUR.has(t)) return { galat: 'libur bukan kehadiran; hari libur tidak dicatat sebagai pertemuan' };
  return { galat: 'gunakan H, S, I, atau A' };
}

export const kunciSel = (siswaId, pertemuanId) => `${siswaId}:${pertemuanId}`;

/** Peta "siswa:pertemuan" -> kode dari daftar `kehadiran` server. */
export function petaKehadiran(kehadiran) {
  const peta = new Map();
  (kehadiran ?? []).forEach((h) => peta.set(kunciSel(h.siswa_id, h.pertemuan_id), h.kode));
  return peta;
}

/**
 * Kode efektif sebuah sel: isian yang belum disimpan (jika ada) menimpa data server.
 * Mengembalikan { kode, galat }; `kode` null bila kosong atau tidak sah.
 */
export function kodeEfektif(kunci, edit, server) {
  if (Object.prototype.hasOwnProperty.call(edit, kunci)) {
    const b = bacaKodeSel(edit[kunci]);
    return b.galat ? { kode: null, galat: b.galat } : { kode: b.kode, galat: null };
  }
  return { kode: server.get(kunci) ?? null, galat: null };
}

const hitungKosong = () => ({ H: 0, S: 0, I: 0, A: 0 });

/** Rekap satu siswa atas pertemuan-pertemuan yang ditampilkan: jumlah per kode dan jumlah tercatat. */
export function rekapSiswa(siswaId, pertemuan, edit, server) {
  const r = { ...hitungKosong(), tercatat: 0 };
  pertemuan.forEach((p) => {
    const { kode } = kodeEfektif(kunciSel(siswaId, p.id), edit, server);
    if (kode) { r[kode] += 1; r.tercatat += 1; }
  });
  return r;
}

/** Rekap satu pertemuan atas seluruh siswa: jumlah per kode dan jumlah yang belum dicatat. */
export function rekapPertemuan(pertemuanId, siswa, edit, server) {
  const r = { ...hitungKosong(), belum: 0 };
  siswa.forEach((s) => {
    const { kode } = kodeEfektif(kunciSel(s.id, pertemuanId), edit, server);
    if (kode) r[kode] += 1; else r.belum += 1;
  });
  return r;
}

/**
 * Isian untuk tombol "Semua hadir": hanya sel yang BELUM dicatat (tidak ada di server, tidak diisi,
 * dan tidak sedang salah ketik) menjadi H. Catatan yang sudah ada tidak pernah ditimpa.
 * Mengembalikan daftar kunci sel.
 */
export function selUntukSemuaHadir(pertemuanId, siswa, edit, server) {
  const hasil = [];
  siswa.forEach((s) => {
    const k = kunciSel(s.id, pertemuanId);
    const ada = Object.prototype.hasOwnProperty.call(edit, k) ? String(edit[k]).trim() !== '' : server.has(k);
    if (!ada) hasil.push(k);
  });
  return hasil;
}

/** Terapkan satu isian ke peta `edit`: bila sama dengan data server, entri dibuang (sel kembali bersih). */
export function terapkanIsian(edit, kunci, teks, server) {
  const dasar = server.get(kunci) ?? null;
  const baca = bacaKodeSel(teks);
  const lanjut = { ...edit };
  if (!baca.galat && baca.kode === dasar) delete lanjut[kunci]; else lanjut[kunci] = teks;
  return lanjut;
}

/** Jumlah sel yang akan DIKOSONGKAN: isian kosong pada sel yang di server sudah bercatatan. */
export function hitungPengosonganKode(edit, server) {
  return Object.entries(edit).filter(([k, t]) => {
    const b = bacaKodeSel(t);
    return !b.galat && b.kode === null && server.has(k);
  }).length;
}

/** Kelompokkan isian kotor per pertemuan: Map(pertemuanId -> [{ siswa_id, kode }]), urut siswa. Sel tidak sah dilewati. */
export function susunMuatanSimpan(edit) {
  const peta = new Map();
  Object.entries(edit).forEach(([k, t]) => {
    const b = bacaKodeSel(t);
    if (b.galat) return;
    const [siswaId, pertemuanId] = k.split(':').map(Number);
    if (!peta.has(pertemuanId)) peta.set(pertemuanId, []);
    peta.get(pertemuanId).push({ siswa_id: siswaId, kode: b.kode });
  });
  peta.forEach((daftar) => daftar.sort((a, b) => a.siswa_id - b.siswa_id));
  return peta;
}

// ---------------------------------------------------------------- tanggal dan zona waktu sekolah

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** Pecah YYYY-MM-DD yang nyata menjadi { y, m, d }, atau null. Tidak memakai zona waktu apa pun. */
export function uraiTanggal(teks) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(teks ?? '').trim());
  if (!m) return null;
  const [y, bln, tgl] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(y, bln - 1, tgl));
  if (d.getUTCFullYear() !== y || d.getUTCMonth() !== bln - 1 || d.getUTCDate() !== tgl) return null;
  return { y, m: bln, d: tgl };
}

/** "Senin, 26 Oktober 2026"; teks asli bila bukan tanggal nyata. Hari dihitung dari kalender, bukan zona peramban. */
export function tanggalPanjang(teks) {
  const u = uraiTanggal(teks);
  if (!u) return String(teks ?? '');
  const hari = NAMA_HARI[new Date(Date.UTC(u.y, u.m - 1, u.d)).getUTCDay()];
  return `${hari}, ${u.d} ${NAMA_BULAN[u.m - 1]} ${u.y}`;
}

/** "26/10" untuk judul kolom yang sempit; teks asli bila bukan tanggal nyata. */
export function tanggalPendek(teks) {
  const u = uraiTanggal(teks);
  if (!u) return String(teks ?? '');
  return `${String(u.d).padStart(2, '0')}/${String(u.m).padStart(2, '0')}`;
}

const SINGKATAN_ZONA = {
  'Asia/Jakarta': 'WIB', 'Asia/Pontianak': 'WIB', 'Asia/Makassar': 'WITA', 'Asia/Jayapura': 'WIT',
};

/** Singkatan zona Indonesia (WIB, WITA, WIT); zona lain ditampilkan apa adanya. */
export const namaZona = (zona) => SINGKATAN_ZONA[zona] ?? String(zona ?? '');

/**
 * Periksa tanggal pertemuan. `hariIni` adalah tanggal HARI INI MENURUT SEKOLAH dari server, bukan jam
 * peramban. Mengembalikan { galat } atau { peringatan } (tanggal sama dengan pertemuan lain) atau {}.
 * Pertemuan yang belum berlangsung ditolak (server menolaknya juga; ini hanya umpan balik cepat).
 */
export function periksaTanggalPertemuan(tanggal, hariIni, pertemuan = [], kecualiId = null) {
  const u = uraiTanggal(tanggal);
  if (!u) return { galat: String(tanggal ?? '').trim() === '' ? 'Tanggal wajib diisi' : 'Tanggal tidak ada di kalender' };
  const t = String(tanggal).trim();
  if (uraiTanggal(hariIni) && t > hariIni) {
    return { galat: `Tanggal belum berlangsung menurut zona waktu sekolah (hari ini ${tanggalPanjang(hariIni)})` };
  }
  const sama = pertemuan.filter((p) => p.tanggal === t && p.id !== kecualiId);
  if (sama.length > 0) {
    const nomor = sama.map((p) => `P${p.nomor}`).join(', ');
    return { peringatan: `Sudah ada pertemuan pada tanggal ini (${nomor}). Lanjutkan hanya bila ini jam pelajaran lain pada hari yang sama.` };
  }
  return {};
}

/** ID pertemuan menurut urutan kronologis (tanggal, lalu nomor). */
export function idKronologis(pertemuan) {
  return [...pertemuan]
    .sort((a, b) => (a.tanggal < b.tanggal ? -1 : a.tanggal > b.tanggal ? 1 : a.nomor - b.nomor))
    .map((p) => p.id);
}

/** Benar bila urutan nomor sekarang berbeda dari urutan tanggal. */
export function perluUrutKronologis(pertemuan) {
  const sekarang = [...pertemuan].sort((a, b) => a.nomor - b.nomor).map((p) => p.id);
  const harusnya = idKronologis(pertemuan);
  return sekarang.some((id, i) => id !== harusnya[i]);
}

/** Label ringkas lingkup materi untuk judul kolom dan pilihan. */
export function labelLm(lm, lmId) {
  if (lmId === null || lmId === undefined) return null;
  const m = (lm ?? []).find((x) => x.id === lmId);
  return m ? `LM ${m.urutan}` : null;
}
