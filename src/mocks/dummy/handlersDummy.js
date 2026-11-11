// Handler endpoint dummy. Bentuk respons mengikuti kontrak usulan di
// docunentation/dashboard waka/PRD-Frontend-Perangkat-Ajar-Waka-Kurikulum.md §9.

import { buatTokenDummy, cariAkunDummy } from './akunDummy';
import { ambilDb, deadlineIso, FILE_UNGGAHAN, GURU, JENIS, NAMA_WAKA_DUMMY, SEMESTER, simpanDb, uid } from './dbDummy';
import {
  bentukDokumen,
  bentukRiwayat,
  dokumenMilikGuru,
  gagal,
  GURU_API,
  isSemesterArsip,
  PESAN_ARSIP,
  semesterDokumen,
  hitungRingkasan,
  labelJenis,
  ok,
  penugasanGuru,
  persenKelengkapan,
  responsFile,
  WAKA,
} from './dokumenDummy';
import { handlerArsip, handlerBukaKunci } from './arsipDummy';
import { anggotaLogin, handlerBk } from './bkDummy';
import { handlerJurnalBk } from './jurnalBkDummy';
import { handlerJadwalBk } from './jadwalBkDummy';
import { handlerPengaduanBk } from './pengaduanBkDummy';

const MAX_PDF = 10 * 1024 * 1024;

// ─── Handler ──────────────────────────────────────────────────────────────────

// Persona dihitung ulang setiap kali (seperti backend): `guru_bk` hanya dipegang anggota Tim BK yang AKTIF.
// Anggota yang dinonaktifkan koordinator kehilangan portal BK dan diarahkan ke portal lain miliknya.
const personaAkun = (akun) =>
  (akun?.persona || []).filter((p) => p.kode !== 'guru_bk' || Boolean(anggotaLogin(akun)?.aktif));

const daftarHandler = [
  // Umum
  ['POST', /^\/api\/v1\/login$/, ({ body }) => {
    const akun = cariAkunDummy(body?.email);
    if (!akun || body?.password !== akun.password) return gagal(401, 'Email atau password salah');
    const persona = personaAkun(akun);
    return ok({ accessToken: buatTokenDummy({ ...akun, persona }, body?.deviceId), daftarPersona: persona });
  }],
  ['GET', /^\/api\/v1\/konteks$/, ({ akun }) => ok({ data: { persona: personaAkun(akun) } })],
  ['DELETE', /^\/api\/v1\/logout$/, () => ok({ msg: 'Logout berhasil' })],

  // Referensi (dua portal)
  ['GET', /^\/api\/v1\/(waka-kurikulum|guru)\/referensi\/semester$/, () => ok({ data: SEMESTER })],
  ['GET', /^\/api\/v1\/(waka-kurikulum|guru)\/perangkat-ajar\/jenis$/, () => ok({ data: JENIS })],

  // Waka: daftar guru & perangkat ajar
  ['GET', new RegExp(`^${WAKA}/perangkat-ajar/guru$`), ({ params }) => {
    const semesterId = params.semester_ajaran_id;
    const q = String(params.q || '').toLowerCase();

    let rows = GURU.map((guru) => {
      const penugasan = penugasanGuru(guru.id, semesterId);
      const semuaDok = penugasan.flatMap((p) => p.dokumen);
      const ringkasan_jenis = {};
      JENIS.forEach((j) => {
        ringkasan_jenis[j.kode] = hitungRingkasan(semuaDok.filter((d) => d.jenis.kode === j.kode));
      });
      const ringkasan = hitungRingkasan(semuaDok);
      return {
        guru_id: guru.id,
        nama: guru.nama,
        nip: guru.nip,
        jumlah_mapel: penugasan.length,
        mapel: penugasan.map((p) => `${p.mapel.nama} (${p.kelas.nama})`),
        ringkasan_jenis,
        kelengkapan_persen: persenKelengkapan(ringkasan),
        _ringkasan: ringkasan,
      };
    }).filter((r) => r.jumlah_mapel > 0);

    if (q) rows = rows.filter((r) => r.nama.toLowerCase().includes(q) || r.nip.includes(q));
    if (params.status) rows = rows.filter((r) => r._ringkasan[params.status] > 0);
    if (params.verifikasi === 'terverifikasi') rows = rows.filter((r) => r._ringkasan.disetujui === r._ringkasan.total);
    if (params.verifikasi === 'belum') rows = rows.filter((r) => r._ringkasan.disetujui < r._ringkasan.total);

    if (params.sort === 'kelengkapan_asc') rows.sort((a, b) => a.kelengkapan_persen - b.kelengkapan_persen);
    else if (params.sort === 'kelengkapan_desc') rows.sort((a, b) => b.kelengkapan_persen - a.kelengkapan_persen);
    else rows.sort((a, b) => a.nama.localeCompare(b.nama));

    const total = rows.length;
    const limit = Number(params.limit) || total || 1;
    const page = Number(params.page) || 1;
    const data = rows.slice((page - 1) * limit, page * limit).map((r) => {
      const salinan = { ...r };
      delete salinan._ringkasan;
      return salinan;
    });
    return ok({ data, meta: { total, page, limit } });
  }],

  ['GET', new RegExp(`^${WAKA}/perangkat-ajar/guru/([^/]+)$`), ({ match, params }) => {
    const guru = GURU.find((g) => String(g.id) === match[1]);
    if (!guru) return gagal(404, 'Guru tidak ditemukan');
    const penugasan = penugasanGuru(guru.id, params.semester_ajaran_id);
    const ringkasan = hitungRingkasan(penugasan.flatMap((p) => p.dokumen));
    return ok({
      data: {
        guru: { id: guru.id, nama: guru.nama, nip: guru.nip },
        kelengkapan_persen: persenKelengkapan(ringkasan),
        ringkasan,
        penugasan,
      },
    });
  }],

  ['GET', new RegExp(`^${WAKA}/perangkat-ajar/dokumen/([^/]+)/file$`), ({ match, params }) =>
    responsFile(ambilDb().dokumen.find((d) => d.id === match[1]), params.versi)],

  ['GET', new RegExp(`^${WAKA}/perangkat-ajar/dokumen/([^/]+)/riwayat$`), ({ match }) => {
    const dok = ambilDb().dokumen.find((d) => d.id === match[1]);
    return dok ? ok({ data: bentukRiwayat(dok) }) : gagal(404, 'Dokumen tidak ditemukan');
  }],

  // Waka: validasi dokumen (setujui / minta revisi)
  ['POST', new RegExp(`^${WAKA}/perangkat-ajar/dokumen/([^/]+)/validasi$`), ({ match, body, akun }) => {
    const dok = ambilDb().dokumen.find((d) => d.id === match[1]);
    if (!dok) return gagal(404, 'Dokumen tidak ditemukan');
    if (isSemesterArsip(semesterDokumen(dok))) return gagal(409, PESAN_ARSIP);
    if (dok.status !== 'menunggu_validasi') return gagal(409, 'Dokumen ini tidak sedang menunggu validasi');
    if (!['disetujui', 'perlu_revisi'].includes(body?.keputusan)) return gagal(422, 'Keputusan validasi tidak valid');
    const catatan = String(body?.catatan || '').trim();
    if (body.keputusan === 'perlu_revisi' && catatan.length < 10) {
      return gagal(422, 'Catatan revisi wajib diisi minimal 10 karakter');
    }

    const keputusan = { status: body.keputusan, catatan: catatan || null, oleh: akun?.name || NAMA_WAKA_DUMMY, pada: new Date().toISOString() };
    dok.status = body.keputusan;
    dok.feedback = keputusan;
    const entri = (dok.riwayat || []).find((r) => r.versi === dok.versi);
    if (entri) entri.keputusan = keputusan;
    simpanDb();

    const label = labelJenis(dok.jenis).label;
    return ok({
      msg: body.keputusan === 'disetujui' ? `${label} berhasil disetujui` : `Permintaan revisi ${label} berhasil dikirim ke guru`,
    });
  }],

  // Waka: deadline
  ['GET', new RegExp(`^${WAKA}/perangkat-ajar/deadline$`), ({ params }) => {
    const data = ambilDb()
      .deadline.filter((d) => d.semester_ajaran_id === params.semester_ajaran_id)
      .sort((a, b) => JENIS.findIndex((j) => j.kode === a.jenis) - JENIS.findIndex((j) => j.kode === b.jenis))
      .map(bentukDeadline);
    return ok({ data });
  }],

  ['POST', new RegExp(`^${WAKA}/perangkat-ajar/deadline$`), ({ body }) => {
    const galat = validasiDeadline(body, true);
    if (galat) return gagal(422, galat);
    if (isSemesterArsip(body.semester_ajaran_id)) return gagal(409, PESAN_ARSIP);
    const db = ambilDb();
    if (db.deadline.some((d) => d.semester_ajaran_id === body.semester_ajaran_id && d.jenis === body.jenis)) {
      return gagal(409, `Deadline ${labelJenis(body.jenis).label} untuk semester ini sudah ada. Silakan edit deadline yang ada.`);
    }
    const baru = {
      id: uid(Date.now() % 1e12),
      semester_ajaran_id: body.semester_ajaran_id,
      jenis: body.jenis,
      tanggal_deadline: body.tanggal_deadline,
      jam_deadline: body.jam_deadline,
      keterangan: body.keterangan || '',
    };
    db.deadline.push(baru);
    simpanDb();
    return ok({ msg: 'Deadline berhasil ditambahkan', data: bentukDeadline(baru) }, 201);
  }],

  ['GET', new RegExp(`^${WAKA}/perangkat-ajar/deadline/([^/]+)$`), ({ match }) => {
    const d = ambilDb().deadline.find((x) => x.id === match[1]);
    return d ? ok({ data: bentukDeadline(d) }) : gagal(404, 'Deadline tidak ditemukan');
  }],

  ['PATCH', new RegExp(`^${WAKA}/perangkat-ajar/deadline/([^/]+)$`), ({ match, body }) => {
    const d = ambilDb().deadline.find((x) => x.id === match[1]);
    if (!d) return gagal(404, 'Deadline tidak ditemukan');
    const galat = validasiDeadline({ ...d, ...body }, false);
    if (galat) return gagal(422, galat);
    if (isSemesterArsip(d.semester_ajaran_id)) return gagal(409, PESAN_ARSIP);
    // Field yang tidak dikirim (atau null) tetap seperti semula, sama seperti backend.
    Object.assign(d, {
      tanggal_deadline: body.tanggal_deadline ?? d.tanggal_deadline,
      jam_deadline: body.jam_deadline ?? d.jam_deadline,
      keterangan: body.keterangan ?? d.keterangan ?? '',
    });
    simpanDb();
    return ok({ msg: 'Deadline berhasil diperbarui', data: bentukDeadline(d) });
  }],

  ['DELETE', new RegExp(`^${WAKA}/perangkat-ajar/deadline/([^/]+)$`), ({ match }) => {
    const db = ambilDb();
    const target = db.deadline.find((x) => x.id === match[1]);
    if (target && isSemesterArsip(target.semester_ajaran_id)) return gagal(409, PESAN_ARSIP);
    const sebelum = db.deadline.length;
    db.deadline = db.deadline.filter((x) => x.id !== match[1]);
    if (db.deadline.length === sebelum) return gagal(404, 'Deadline tidak ditemukan');
    simpanDb();
    return ok({ msg: 'Deadline berhasil dihapus' });
  }],

  // Guru: perangkat ajar milik sendiri
  ['GET', new RegExp(`^${GURU_API}/perangkat-ajar$`), ({ akun, params }) =>
    ok({ data: penugasanGuru(akun?.guruId, params.semester_ajaran_id) })],

  ['POST', new RegExp(`^${GURU_API}/perangkat-ajar/unggah$`), ({ akun, body }) => {
    const db = ambilDb();
    const penugasanId = body?.get?.('penugasan_id');
    const jenis = body?.get?.('jenis');
    const file = body?.get?.('file');
    // FormData mengirim angka sebagai string.
    const penugasan = db.penugasan.find((p) => String(p.id) === String(penugasanId) && p.guru_id === akun?.guruId);
    if (!penugasan) return gagal(404, 'Penugasan tidak ditemukan');
    if (!(file instanceof Blob)) return gagal(422, 'File wajib diunggah');
    if (file.type !== 'application/pdf') return gagal(422, 'File harus berformat PDF');
    if (file.size > MAX_PDF) return gagal(422, 'Ukuran file maksimal 10MB');

    const dok = db.dokumen.find((d) => d.penugasan_id === penugasan.id && d.jenis === jenis);
    if (!dok) return gagal(404, 'Jenis perangkat ajar tidak ditemukan');
    if (isSemesterArsip(penugasan.semester_ajaran_id)) return gagal(409, PESAN_ARSIP);
    const bentuk = bentukDokumen(dok, penugasan.semester_ajaran_id);
    if (!['belum_unggah', 'perlu_revisi'].includes(dok.status)) {
      return gagal(409, 'Dokumen sedang menunggu validasi atau sudah disetujui. Unggah ulang hanya bisa setelah ada permintaan revisi.');
    }
    if (bentuk.terkunci) return gagal(409, 'Unggahan terkunci karena deadline pengumpulan sudah lewat');

    const versi = (dok.versi || 0) + 1;
    const diunggah = new Date().toISOString();
    const namaFile = file.name || `${jenis}.pdf`;
    // feedback revisi sebelumnya tetap tersimpan di riwayat versi lama
    Object.assign(dok, { status: 'menunggu_validasi', versi, diunggah_pada: diunggah, nama_file: namaFile, ukuran: file.size, feedback: null, kunci_dibuka: null });
    dok.riwayat = [...(dok.riwayat || []), { versi, diunggah_pada: diunggah, nama_file: namaFile, ukuran: file.size, keputusan: null }];
    FILE_UNGGAHAN.set(`${dok.id}:${versi}`, file);
    simpanDb();
    return ok({ msg: `${labelJenis(jenis).label} berhasil diunggah dan menunggu validasi`, data: bentukDokumen(dok, penugasan.semester_ajaran_id) }, 201);
  }],

  ['GET', new RegExp(`^${GURU_API}/perangkat-ajar/dokumen/([^/]+)/file$`), ({ akun, match, params }) => {
    const dok = dokumenMilikGuru(match[1], akun?.guruId);
    return dok ? responsFile(dok, params.versi) : gagal(404, 'Dokumen tidak ditemukan');
  }],

  ['GET', new RegExp(`^${GURU_API}/perangkat-ajar/dokumen/([^/]+)/riwayat$`), ({ akun, match }) => {
    const dok = dokumenMilikGuru(match[1], akun?.guruId);
    return dok ? ok({ data: bentukRiwayat(dok) }) : gagal(404, 'Dokumen tidak ditemukan');
  }],
];

function bentukDeadline(d) {
  return {
    id: d.id,
    semester_ajaran_id: d.semester_ajaran_id,
    semester_ajaran: SEMESTER.find((s) => s.id === d.semester_ajaran_id) || null,
    jenis: labelJenis(d.jenis),
    deadline: deadlineIso(d),
    tanggal_deadline: d.tanggal_deadline,
    jam_deadline: d.jam_deadline,
    keterangan: d.keterangan || '',
  };
}

function validasiDeadline(body, baru) {
  if (baru && !SEMESTER.some((s) => s.id === body?.semester_ajaran_id)) return 'Semester ajaran tidak valid';
  if (baru && !JENIS.some((j) => j.kode === body?.jenis)) return 'Jenis perangkat ajar tidak valid';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body?.tanggal_deadline || '')) return 'Tanggal deadline tidak valid';
  if (!/^\d{2}:\d{2}$/.test(body?.jam_deadline || '')) return 'Jam deadline tidak valid';
  return '';
}

/** Mencari handler untuk method + path. Mengembalikan { handler, match } atau null. */
export const cariHandler = (method, path) => {
  for (const [m, pola, handler] of [...daftarHandler, ...handlerBukaKunci, ...handlerArsip, ...handlerBk, ...handlerJurnalBk, ...handlerJadwalBk, ...handlerPengaduanBk]) {
    if (m !== method) continue;
    const match = pola.exec(path);
    if (match) return { handler, match };
  }
  return null;
};
