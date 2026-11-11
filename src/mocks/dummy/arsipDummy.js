// Handler dummy: buka kunci unggah per dokumen, serta arsip & ekspor (ZIP, rekap PDF/Excel).
//
// Catatan rekap Excel: mock mengembalikan CSV (bisa dibuka Excel) karena tidak ada pustaka xlsx
// di FE. Backend asli diharapkan mengirim .xlsx sungguhan.

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { zipSync } from 'fflate';
import {
  ambilDb,
  deadlineIso,
  FILE_UNGGAHAN,
  GURU,
  JENIS,
  NAMA_WAKA_DUMMY,
  SEMESTER,
  simpanDb,
  TAHUN_AJARAN,
} from './dbDummy';
import { bentukDokumen, cariDeadline, gagal, isSemesterArsip, labelJenis, ok, pdfDummy, PESAN_ARSIP, WAKA } from './dokumenDummy';

const TZ_OFFSET = '+07:00';

// ─── Buka kunci ──────────────────────────────────────────────────────────────

const urlBukaKunci = new RegExp(`^${WAKA}/perangkat-ajar/dokumen/([^/]+)/buka-kunci$`);

export const handlerBukaKunci = [
  ['POST', urlBukaKunci, ({ match, body, akun }) => {
    const db = ambilDb();
    const dok = db.dokumen.find((d) => d.id === match[1]);
    if (!dok) return gagal(404, 'Dokumen tidak ditemukan');
    const penugasan = db.penugasan.find((p) => p.id === dok.penugasan_id);
    if (isSemesterArsip(penugasan?.semester_ajaran_id)) return gagal(409, PESAN_ARSIP);
    const dl = deadlineIso(cariDeadline(penugasan?.semester_ajaran_id, dok.jenis));
    const lewat = dl && Date.now() > new Date(dl).getTime();
    if (dok.status !== 'belum_unggah' || !lewat) {
      return gagal(409, 'Hanya dokumen yang belum diunggah dan sudah melewati deadline yang bisa dibuka kuncinya');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body?.tanggal_batas || '') || !/^\d{2}:\d{2}$/.test(body?.jam_batas || '')) {
      return gagal(422, 'Batas waktu buka kunci tidak valid');
    }
    const sampai = `${body.tanggal_batas}T${body.jam_batas}:00${TZ_OFFSET}`;
    if (new Date(sampai).getTime() <= Date.now()) return gagal(422, 'Batas waktu buka kunci harus setelah waktu sekarang');

    dok.kunci_dibuka = {
      sampai,
      alasan: String(body?.alasan || '').trim() || null,
      oleh: akun?.name || NAMA_WAKA_DUMMY,
      pada: new Date().toISOString(),
    };
    simpanDb();
    return ok({ msg: `Akses unggah ${labelJenis(dok.jenis).label} dibuka`, data: bentukDokumen(dok, penugasan.semester_ajaran_id) });
  }],

  ['DELETE', urlBukaKunci, ({ match }) => {
    const dok = ambilDb().dokumen.find((d) => d.id === match[1]);
    if (!dok) return gagal(404, 'Dokumen tidak ditemukan');
    if (!dok.kunci_dibuka) return gagal(409, 'Dokumen ini tidak sedang dibuka kuncinya');
    dok.kunci_dibuka = null;
    simpanDb();
    return ok({ msg: `Akses unggah ${labelJenis(dok.jenis).label} dikunci kembali` });
  }],
];

// ─── Arsip ───────────────────────────────────────────────────────────────────

const urutanJenis = (kode) => JENIS.findIndex((j) => j.kode === kode);

const semesterDalamLingkup = ({ tahun_ajaran_id: tahunId, semester_ajaran_id: semesterId }) =>
  SEMESTER.filter((s) => (!tahunId || s.tahun_ajaran.id === tahunId) && (!semesterId || s.id === semesterId));

/** Baris arsip: satu dokumen (versi terakhir) + guru, mapel, kelas, semester. */
const barisArsip = (params, { hanyaTerunggah = true } = {}) => {
  const db = ambilDb();
  const semesterIds = new Set(semesterDalamLingkup(params).map((s) => s.id));
  const q = String(params.q || '').trim().toLowerCase();

  return db.dokumen
    .map((dok) => {
      const penugasan = db.penugasan.find((p) => p.id === dok.penugasan_id);
      if (!penugasan || !semesterIds.has(penugasan.semester_ajaran_id)) return null;
      if (hanyaTerunggah && !dok.versi) return null;
      const guru = GURU.find((g) => g.id === penugasan.guru_id);
      const semester = SEMESTER.find((s) => s.id === penugasan.semester_ajaran_id);
      const bentuk = bentukDokumen(dok, penugasan.semester_ajaran_id);
      return {
        dokumen_id: dok.id,
        semester: { id: semester.id, label: semester.label },
        guru: { id: guru.id, nama: guru.nama, nip: guru.nip },
        mapel: penugasan.mapel,
        kelas: penugasan.kelas,
        jenis: bentuk.jenis,
        status: dok.status,
        terlambat: bentuk.terlambat,
        versi_terakhir: dok.versi || null,
        diunggah_pada: dok.diunggah_pada,
        divalidasi_pada: dok.status === 'disetujui' ? dok.feedback?.pada || null : null,
        file: bentuk.file,
        _dok: dok,
      };
    })
    .filter(Boolean)
    .filter((r) => !params.jenis || r.jenis.kode === params.jenis)
    .filter((r) => !params.status || r.status === params.status)
    .filter(
      (r) =>
        !q ||
        [r.guru.nama, r.guru.nip, r.mapel.nama, r.kelas.nama, r.file?.nama].some((v) =>
          String(v || '').toLowerCase().includes(q),
        ),
    )
    .sort(
      (a, b) =>
        SEMESTER.findIndex((s) => s.id === a.semester.id) - SEMESTER.findIndex((s) => s.id === b.semester.id) ||
        a.guru.nama.localeCompare(b.guru.nama) ||
        a.mapel.nama.localeCompare(b.mapel.nama) ||
        a.kelas.nama.localeCompare(b.kelas.nama) ||
        urutanJenis(a.jenis.kode) - urutanJenis(b.jenis.kode),
    );
};

const tanpaInternal = ({ _dok, ...r }) => r; // eslint-disable-line no-unused-vars

const slug = (s) => String(s).replace(/[\\/:*?"<>|]+/g, '-').trim();

const labelLingkup = (params) => {
  const tahun = TAHUN_AJARAN.find((t) => t.id === params.tahun_ajaran_id);
  const semester = SEMESTER.find((s) => s.id === params.semester_ajaran_id);
  return semester?.label || (tahun ? `Tahun Ajaran ${tahun.nama}` : 'Semua Tahun Ajaran');
};

const namaFileEkspor = (params, ext) =>
  `arsip-perangkat-ajar-${labelLingkup(params).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${ext}`;

const responsBlob = (data, type, nama) => ({
  status: 200,
  data: new Blob([data], { type }),
  headers: { 'content-type': type, 'content-disposition': `attachment; filename="${nama}"` },
});

/** Rekap per guru: jumlah disetujui / total dokumen per jenis, untuk lingkup arsip terpilih. */
const rekapPerGuru = (params) => {
  const baris = barisArsip({ ...params, status: '', q: '' }, { hanyaTerunggah: false });
  return GURU.map((guru) => {
    const milik = baris.filter((r) => r.guru.id === guru.id);
    const perJenis = JENIS.map((j) => {
      const d = milik.filter((r) => r.jenis.kode === j.kode);
      return `${d.filter((r) => r.status === 'disetujui').length}/${d.length}`;
    });
    const disetujui = milik.filter((r) => r.status === 'disetujui').length;
    return { guru, perJenis, persen: milik.length ? Math.round((disetujui / milik.length) * 100) : 0, total: milik.length };
  }).filter((r) => r.total > 0);
};

export const handlerArsip = [
  ['GET', new RegExp(`^${WAKA}/referensi/tahun-ajaran$`), () => ok({ data: TAHUN_AJARAN })],

  ['GET', new RegExp(`^${WAKA}/perangkat-ajar/arsip$`), ({ params }) => {
    const rows = barisArsip(params);
    const total = rows.length;
    const limit = Number(params.limit) || total || 1;
    const page = Number(params.page) || 1;
    return ok({
      data: rows.slice((page - 1) * limit, page * limit).map(tanpaInternal),
      meta: {
        total,
        page,
        limit,
        ringkasan: {
          jumlah_guru: new Set(rows.map((r) => r.guru.id)).size,
          disetujui: rows.filter((r) => r.status === 'disetujui').length,
          ukuran_total: rows.reduce((n, r) => n + (r.file?.ukuran || 0), 0),
        },
      },
    });
  }],

  ['GET', new RegExp(`^${WAKA}/perangkat-ajar/arsip/unduh-zip$`), async ({ params }) => {
    const rows = barisArsip(params);
    if (rows.length === 0) return gagal(404, 'Tidak ada dokumen untuk diunduh pada filter ini');

    const isi = {};
    for (const r of rows) {
      const versi = r._dok.versi;
      const unggahan = FILE_UNGGAHAN.get(`${r._dok.id}:${versi}`);
      const bytes = unggahan
        ? new Uint8Array(await unggahan.arrayBuffer())
        : new Uint8Array(pdfDummy(r._dok, versi, { arrayBuffer: true }));
      // Struktur folder: Semester / Guru / Mapel - Kelas / file
      const path = [r.semester.label, r.guru.nama, `${r.mapel.nama} - ${r.kelas.nama}`]
        .map(slug)
        .concat(`${r.jenis.label_singkat || r.jenis.label} - v${versi} - ${slug(r.file?.nama || 'dokumen.pdf')}`)
        .join('/');
      isi[path] = bytes;
    }
    return responsBlob(zipSync(isi, { level: 0 }), 'application/zip', namaFileEkspor(params, 'zip'));
  }],

  ['GET', new RegExp(`^${WAKA}/perangkat-ajar/arsip/rekap$`), ({ params }) => {
    const rekap = rekapPerGuru(params);
    if (rekap.length === 0) return gagal(404, 'Tidak ada data untuk direkap pada filter ini');
    const judul = `Rekap Perangkat Ajar - ${labelLingkup(params)}`;
    const kepala = ['No', 'Nama Guru', 'NIP', ...JENIS.map((j) => j.label_singkat), 'Disetujui (%)'];
    const isi = rekap.map((r, i) => [i + 1, r.guru.nama, r.guru.nip, ...r.perJenis, `${r.persen}%`]);

    if (params.format === 'pdf') {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(14);
      doc.text(judul, 14, 16);
      doc.setFontSize(9);
      doc.text('Kolom jenis: jumlah dokumen disetujui / total dokumen wajib. (Mode dummy)', 14, 22);
      autoTable(doc, { head: [kepala], body: isi, startY: 27, styles: { fontSize: 9 }, headStyles: { fillColor: [94, 92, 230] } });
      return responsBlob(doc.output('arraybuffer'), 'application/pdf', namaFileEkspor(params, 'pdf'));
    }

    const sel = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [[judul], kepala, ...isi].map((baris) => baris.map(sel).join(',')).join('\r\n');
    // BOM agar Excel membaca UTF-8 dengan benar
    return responsBlob(`\uFEFF${csv}`, 'text/csv;charset=utf-8', namaFileEkspor(params, 'csv'));
  }],
];
