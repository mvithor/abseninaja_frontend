// Helper bersama handler dummy: bentuk respons dokumen, ringkasan, dan file PDF contoh.
// Perhitungan di sini (terkunci, terlambat, ringkasan) adalah tugas server di backend asli.

import { jsPDF } from 'jspdf';
import { ambilDb, deadlineIso, FILE_UNGGAHAN, GURU, JENIS, SEMESTER } from './dbDummy';

export const WAKA = '/api/v1/waka-kurikulum';
export const GURU_API = '/api/v1/guru';

export const ok = (data, status = 200) => ({ status, data });
export const gagal = (status, msg) => ({ status, data: { msg } });

// Semester tidak aktif = arsip baca-saja: aksi tulis dijawab 409 seperti backend.
export const PESAN_ARSIP = 'Semester ini sudah diarsipkan';
export const isSemesterArsip = (semesterId) => !SEMESTER.find((s) => s.id === semesterId)?.is_aktif;
export const semesterDokumen = (dok) => ambilDb().penugasan.find((p) => p.id === dok?.penugasan_id)?.semester_ajaran_id;

export const labelJenis = (kode) => JENIS.find((j) => j.kode === kode) || { kode, label: kode };

// ─── Perhitungan status turunan (tugas server di backend asli) ────────────────

export const cariDeadline = (semesterId, jenis) =>
  ambilDb().deadline.find((d) => d.semester_ajaran_id === semesterId && d.jenis === jenis) || null;

export const bentukDokumen = (dok, semesterId, now = Date.now()) => {
  const dlIso = deadlineIso(cariDeadline(semesterId, dok.jenis));
  const batas = dlIso ? new Date(dlIso).getTime() : null;
  const lewat = batas !== null && now > batas;
  const diunggah = dok.diunggah_pada ? new Date(dok.diunggah_pada).getTime() : null;
  const bukaKunciAktif = Boolean(dok.kunci_dibuka && new Date(dok.kunci_dibuka.sampai).getTime() > now);

  return {
    id: dok.id,
    jenis: labelJenis(dok.jenis),
    status: dok.status,
    terlambat: (dok.status === 'belum_unggah' && lewat) || (diunggah !== null && batas !== null && diunggah > batas),
    // Kunci otomatis setelah deadline hanya untuk dokumen yang belum diunggah, kecuali Waka
    // membuka kunci sementara. Dokumen perlu_revisi tetap terbuka: feedback membuka unggah ulang.
    terkunci: lewat && dok.status === 'belum_unggah' && !bukaKunciAktif,
    kunci_dibuka: bukaKunciAktif ? dok.kunci_dibuka : null,
    versi_terakhir: dok.versi || null,
    diunggah_pada: dok.diunggah_pada,
    deadline: dlIso,
    feedback_terakhir: dok.feedback,
    file: dok.nama_file ? { nama: dok.nama_file, ukuran: dok.ukuran } : null,
  };
};

export const penugasanLengkap = (p) => {
  const dokumen = ambilDb()
    .dokumen.filter((d) => d.penugasan_id === p.id)
    .sort((a, b) => JENIS.findIndex((j) => j.kode === a.jenis) - JENIS.findIndex((j) => j.kode === b.jenis))
    .map((d) => bentukDokumen(d, p.semester_ajaran_id));
  return { id: p.id, mapel: p.mapel, kelas: p.kelas, dokumen };
};

export const penugasanGuru = (guruId, semesterId) =>
  ambilDb().penugasan.filter((p) => p.guru_id === guruId && p.semester_ajaran_id === semesterId).map(penugasanLengkap);

export const hitungRingkasan = (dokumenList) => {
  const r = { total: 0, disetujui: 0, menunggu_validasi: 0, perlu_revisi: 0, belum_unggah: 0, terlambat: 0 };
  dokumenList.forEach((d) => {
    r.total += 1;
    r[d.status] += 1;
    if (d.terlambat) r.terlambat += 1;
  });
  return r;
};

export const persenKelengkapan = (r) => (r.total ? Math.round(((r.total - r.belum_unggah) / r.total) * 100) : 0);

// ─── PDF dummy ────────────────────────────────────────────────────────────────

export const pdfDummy = (dok, versi, { arrayBuffer = false } = {}) => {
  const db = ambilDb();
  const penugasan = db.penugasan.find((p) => p.id === dok.penugasan_id);
  const guru = GURU.find((g) => g.id === penugasan?.guru_id);
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(labelJenis(dok.jenis).label, 20, 30);
  doc.setFontSize(12);
  doc.text(`Guru      : ${guru?.nama || '-'}`, 20, 45);
  doc.text(`Mapel     : ${penugasan?.mapel?.nama || '-'}`, 20, 53);
  doc.text(`Kelas     : ${penugasan?.kelas?.nama || '-'}`, 20, 61);
  doc.text(`Versi     : v${versi || dok.versi || 1}`, 20, 69);
  doc.setTextColor(150);
  doc.text('Dokumen contoh (mode dummy) - bukan perangkat ajar asli.', 20, 85);
  return doc.output(arrayBuffer ? 'arraybuffer' : 'blob');
};

// `versi` dari query (?versi=n); tanpa versi = versi terakhir.
export const responsFile = (dok, versiParam) => {
  if (!dok || !dok.versi) return gagal(404, 'File tidak ditemukan');
  const versi = Number(versiParam) || dok.versi;
  const entri = (dok.riwayat || []).find((r) => r.versi === versi);
  if (versi > dok.versi) return gagal(404, 'Versi tidak ditemukan');
  const blob = FILE_UNGGAHAN.get(`${dok.id}:${versi}`) || pdfDummy(dok, versi);
  const nama = entri?.nama_file || dok.nama_file || 'perangkat-ajar.pdf';
  return {
    status: 200,
    data: blob,
    headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="v${versi}-${nama}"` },
  };
};

export const bentukRiwayat = (dok) => {
  const penugasan = ambilDb().penugasan.find((p) => p.id === dok.penugasan_id);
  const dlIso = deadlineIso(cariDeadline(penugasan?.semester_ajaran_id, dok.jenis));
  const batas = dlIso ? new Date(dlIso).getTime() : null;
  return (dok.riwayat || []).map((r) => ({
    ...r,
    terlambat: batas !== null && new Date(r.diunggah_pada).getTime() > batas,
  }));
};

export const dokumenMilikGuru = (dokumenId, guruId) => {
  const db = ambilDb();
  const dok = db.dokumen.find((d) => d.id === dokumenId);
  const milik = dok && db.penugasan.some((p) => p.id === dok.penugasan_id && p.guru_id === guruId);
  return milik ? dok : null;
};
