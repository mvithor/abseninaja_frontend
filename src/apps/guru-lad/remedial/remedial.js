// Fungsi murni untuk remedial. Tanpa impor selain modul murni lain (lihat remedial.test.js).
//
// Yang berwenang tetap server dan mesin aturan: remedial TERBARU (urutan terbesar) yang mencapai KKTP
// menuntaskan TP dan memadamkan penanda P1 untuk TP itu. Berkas ini hanya menyusun tampilan dan
// pemeriksaan cepat di sisi guru.

import { bacaNilaiSel } from '../nilai/tempel.js';

export const kunciRemedial = (siswaId, tpId) => `${siswaId}:${tpId}`;
const centi = (x) => Math.round(Number(x) * 100);

/** "TP 1.2 (LM 1)" bila TP berkode, kalau tidak "TP 2 (LM 1)". Sama dengan namaTp di evaluasi/penjelasan.js. */
export const namaTpLengkap = (tp, lmNo) => {
  const kode = typeof tp?.kode === 'string' ? tp.kode.trim() : '';
  return `TP ${kode || tp?.urutan} (LM ${lmNo})`;
};

/** Kelompokkan catatan remedial per (siswa, TP), tiap kelompok terurut menaik menurut urutan. */
export function kelompokkanRemedial(remedial) {
  const peta = new Map();
  (remedial ?? []).forEach((r) => {
    const k = kunciRemedial(r.siswa_id, r.tp_id);
    if (!peta.has(k)) peta.set(k, []);
    peta.get(k).push(r);
  });
  peta.forEach((daftar) => daftar.sort((a, b) => a.urutan - b.urutan));
  return peta;
}

/** Remedial terbaru dari daftar yang sudah terurut menaik, atau null. */
export const remedialTerbaru = (daftar) => (daftar && daftar.length > 0 ? daftar[daftar.length - 1] : null);

/** Skor remedial yang mencapai KKTP (nilai tepat di KKTP mencapai). */
export const mencapaiKktp = (skor, kktp) => centi(skor) >= centi(kktp);

/**
 * Catatan bila skor melebihi KKTP. Server menyimpan skor apa adanya (D-27); kebijakan sekolah membatasi
 * nilai remedial di rapor paling tinggi KKTP, jadi guru perlu tahu supaya tidak mengira angkanya terpakai.
 */
export function catatanBatas(skor, kktp) {
  if (skor === null || skor === undefined || Number.isNaN(Number(skor))) return null;
  if (centi(skor) <= centi(kktp)) return null;
  return `Skor disimpan apa adanya. Menurut kebijakan, nilai remedial di rapor paling tinggi sebesar KKTP (${String(Number(kktp)).replace('.', ',')}).`;
}

/** Skor wajib diisi. Mengembalikan { nilai } atau { galat }. */
export function periksaSkor(teks) {
  const h = bacaNilaiSel(teks);
  if (h.galat) return { galat: h.galat === 'bukan bilangan yang sah' ? 'Isi dengan angka, mis. 80 atau 80,5' : h.galat };
  if (h.nilai === null) return { galat: 'Skor remedial wajib diisi' };
  return { nilai: h.nilai };
}

/** Tanggal kalender nyata berbentuk YYYY-MM-DD. */
export function periksaTanggal(teks) {
  const t = String(teks ?? '').trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (!m) return { galat: 'Tanggal wajib diisi' };
  const [y, bln, tgl] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(y, bln - 1, tgl));
  if (d.getUTCFullYear() !== y || d.getUTCMonth() !== bln - 1 || d.getUTCDate() !== tgl) return { galat: 'Tanggal tidak ada di kalender' };
  return { tanggal: t };
}

/** Tanggal hari ini menurut jam perangkat guru, YYYY-MM-DD. */
export function tanggalLokal(d = new Date()) {
  const dua = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())}`;
}

/** Id TP dari nomor LM dan nomor TP (keduanya urutan mulai dari 1), atau null. */
export function cariTpId(lm, lmNo, tpNo) {
  const m = Array.isArray(lm) ? lm.find((x) => x.urutan === lmNo) : undefined;
  const t = m && Array.isArray(m.tp) ? m.tp.find((x) => x.urutan === tpNo) : undefined;
  return t ? t.id : null;
}

/**
 * TP yang dapat diberi remedial untuk satu siswa: hanya yang sudah bernilai (syarat server). Diurutkan
 * menurut urutan LM lalu TP; `bawahKktp` menandai yang masih di bawah KKTP supaya mudah dipilih.
 * `nilaiPeta` = Map("siswa:tp" -> nilai | null).
 */
export function tpUntukRemedial(siswaId, lm, nilaiPeta, kktp) {
  const hasil = [];
  (lm ?? []).forEach((m) => {
    (m.tp ?? []).forEach((t) => {
      const nilai = nilaiPeta.get(kunciRemedial(siswaId, t.id));
      if (nilai === null || nilai === undefined) return;
      hasil.push({
        id: t.id, label: namaTpLengkap(t, m.urutan), nilai, bawahKktp: centi(nilai) < centi(kktp),
      });
    });
  });
  return hasil;
}

/** Baris tabel remedial seluruh kelas: menurut urutan siswa, urutan TP, lalu urutan remedial. */
export function barisRemedial({ remedial, siswa, lm }) {
  const siswaPeta = new Map((siswa ?? []).map((s) => [s.id, s]));
  const tpPeta = new Map();
  (lm ?? []).forEach((m) => (m.tp ?? []).forEach((t) => tpPeta.set(t.id, { t, lmNo: m.urutan })));
  const terbaru = new Set();
  kelompokkanRemedial(remedial).forEach((daftar) => terbaru.add(remedialTerbaru(daftar).id));
  const baris = (remedial ?? []).map((r) => {
    const s = siswaPeta.get(r.siswa_id);
    const p = tpPeta.get(r.tp_id);
    return {
      id: r.id,
      siswaId: r.siswa_id,
      tpId: r.tp_id,
      nama: s ? s.nama : `Siswa ${r.siswa_id}`,
      urutanSiswa: s ? s.urutan : Number.MAX_SAFE_INTEGER,
      labelTp: p ? namaTpLengkap(p.t, p.lmNo) : `TP ${r.tp_id}`,
      urutanTp: p ? p.lmNo * 1000 + p.t.urutan : Number.MAX_SAFE_INTEGER,
      nilaiAwal: r.nilai_awal,
      urutan: r.urutan,
      skor: r.nilai_remedial,
      tanggal: r.tanggal,
      catatan: r.catatan ?? '',
      terbaru: terbaru.has(r.id),
    };
  });
  return baris.sort((a, b) => a.urutanSiswa - b.urutanSiswa || a.urutanTp - b.urutanTp || a.urutan - b.urutan);
}
