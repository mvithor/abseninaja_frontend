// Mock jurnal harian penanganan siswa, riwayat permasalahan, dan ekspor PDF profil siswa (portal BK).
// Kontrak: docunentation/dashboard bk/PRD-Frontend-Jurnal-Riwayat-BK.md.
//
// Aturan kerahasiaan: entri `rahasia` hanya bisa dibaca lengkap oleh BK penulisnya. BK lain melihat
// judul, kategori, dan status saja (`terbatas: true`). Pengecualian: koordinator BK boleh membaca bila
// sudah MEMINTA izin dan penulis MENYETUJUI (`akses_koordinator.status = 'disetujui'`); penulis bisa
// mencabutnya kapan saja. Ubah/hapus tetap hanya oleh penulis.

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BK_ID_ANGGOTA, BK_ID_KOORDINATOR } from './akunDummy';
import {
  alasanPerhatian,
  anggotaLogin,
  BK,
  barisSiswa,
  KELAS,
  kelasDalamLingkup,
  LABEL_DIMENSI,
  mulberry32,
  namaBk,
  SISWA,
  TIDAK_AKTIF,
} from './bkDummy';
import { ymdJakarta } from './dbDummy';
import { gagal, ok } from './dokumenDummy';
import { adaJadwalMilik, tautkanJurnalKeJadwal } from './jadwalBkDummy';
import { adaPengaduanTerlihat, tautkanJurnalKePengaduan } from './pengaduanBkDummy';

// v2: entri rahasia punya `akses_koordinator` (permintaan izin baca koordinator)
const STORAGE_KEY = 'abseninaja_dummy_bk_jurnal_v2';
const HARI_MS = 24 * 60 * 60 * 1000;

const JENIS_LAYANAN = {
  konseling_individu: 'Konseling Individu',
  konseling_kelompok: 'Konseling Kelompok',
  panggilan_ortu: 'Panggilan Orang Tua',
  home_visit: 'Kunjungan Rumah',
  mediasi: 'Mediasi',
  konsultasi: 'Konsultasi Guru/Wali Kelas',
  referal: 'Alih Tangan Kasus',
};
const KATEGORI = {
  pribadi: 'Pribadi', sosial: 'Sosial', belajar: 'Belajar', karier: 'Karier', kedisiplinan: 'Kedisiplinan',
  kehadiran: 'Kehadiran', ekonomi: 'Ekonomi', kesehatan: 'Kesehatan', keluarga: 'Keluarga',
};
const STATUS = { selesai: 'Selesai', tindak_lanjut: 'Perlu Tindak Lanjut', dirujuk: 'Dirujuk' };

// ─── Seed ────────────────────────────────────────────────────────────────────

const TEMPLATE = [
  { kategori: 'kehadiran', layanan: ['konseling_individu', 'panggilan_ortu'], judul: 'Sering terlambat dan alpa', uraian: 'Siswa tercatat terlambat 4 kali dan alpa 2 hari dalam dua pekan terakhir. Menurut pengakuan siswa, harus mengantar adik ke sekolah lebih dulu.', tindakan: 'Konseling individu, menyusun ulang jadwal berangkat bersama siswa.', hasil: 'Siswa berkomitmen berangkat 20 menit lebih awal.' },
  { kategori: 'belajar', layanan: ['konseling_individu', 'konsultasi'], judul: 'Nilai beberapa mapel turun', uraian: 'Wali kelas melaporkan nilai harian Matematika dan Basis Data turun di bawah KKM. Siswa mengaku kesulitan membagi waktu belajar.', tindakan: 'Konseling belajar dan koordinasi dengan guru mapel untuk remedial.', hasil: 'Disepakati jadwal belajar mandiri dan bimbingan teman sebaya.' },
  { kategori: 'sosial', layanan: ['mediasi', 'konseling_kelompok'], judul: 'Konflik dengan teman sekelas', uraian: 'Terjadi perselisihan di grup kelas yang berlanjut ke saling ejek di sekolah.', tindakan: 'Mediasi antar siswa yang terlibat.', hasil: 'Kedua pihak saling meminta maaf dan sepakat menjaga komunikasi.' },
  { kategori: 'pribadi', layanan: ['konseling_individu'], judul: 'Tampak murung dan menarik diri', uraian: 'Siswa terlihat sering menyendiri dan kurang bersemangat sejak awal bulan.', tindakan: 'Konseling individu dengan pendekatan client-centered.', hasil: 'Siswa mulai terbuka; disepakati sesi lanjutan.', rahasia: true },
  { kategori: 'keluarga', layanan: ['konseling_individu', 'home_visit'], judul: 'Masalah keluarga berdampak ke sekolah', uraian: 'Orang tua siswa sedang dalam proses perpisahan; siswa sering tidak fokus di kelas.', tindakan: 'Konseling individu dan kunjungan rumah untuk bertemu wali.', hasil: 'Wali bersedia berkomunikasi rutin dengan BK.', rahasia: true },
  { kategori: 'ekonomi', layanan: ['panggilan_ortu', 'home_visit'], judul: 'Tunggakan biaya dan kebutuhan seragam', uraian: 'Siswa belum memiliki seragam praktik dan orang tua kesulitan biaya.', tindakan: 'Pendataan untuk usulan bantuan sekolah dan KIP.', hasil: 'Diusulkan ke bagian kesiswaan untuk bantuan.' },
  { kategori: 'kedisiplinan', layanan: ['konseling_individu', 'panggilan_ortu'], judul: 'Membawa motor tanpa SIM', uraian: 'Siswa kedapatan mengendarai motor ke sekolah tanpa SIM dan tanpa helm.', tindakan: 'Pembinaan dan pemanggilan orang tua.', hasil: 'Orang tua bersedia mengantar sementara siswa belum memiliki SIM.' },
  { kategori: 'karier', layanan: ['konseling_individu', 'konseling_kelompok'], judul: 'Bimbang memilih tempat PKL', uraian: 'Siswa ragu antara PKL di bidang jaringan atau pemrograman.', tindakan: 'Konseling karier dan pengisian inventori minat.', hasil: 'Siswa memilih bidang pemrograman sesuai minat.' },
  { kategori: 'kesehatan', layanan: ['konsultasi', 'panggilan_ortu'], judul: 'Sering izin karena sakit', uraian: 'Siswa beberapa kali izin pulang karena asma kambuh saat pelajaran olahraga.', tindakan: 'Koordinasi dengan guru PJOK dan UKS, konfirmasi ke orang tua.', hasil: 'Guru PJOK menyesuaikan intensitas kegiatan.' },
];

const seed = () => {
  const rnd = mulberry32(512026);
  const now = Date.now();
  const prioritas = SISWA.filter((s) => alasanPerhatian(s).length > 0);
  const daftar = [];

  for (let hari = 29; hari >= 0; hari -= 1) {
    const tanggal = new Date(now - hari * HARI_MS);
    const dow = new Date(`${ymdJakarta(tanggal)}T12:00:00+07:00`).getUTCDay();
    if (dow === 0 || dow === 6) continue;
    const jumlah = hari === 0 ? 2 : Math.floor(rnd() * 3) + (rnd() < 0.5 ? 1 : 0);

    for (let i = 0; i < jumlah; i += 1) {
      const t = TEMPLATE[Math.floor(rnd() * TEMPLATE.length)];
      const kelompok = t.layanan.includes('mediasi') || t.layanan.includes('konseling_kelompok');
      const utama = prioritas[Math.floor(rnd() * prioritas.length)];
      const teman = kelompok ? SISWA.filter((s) => s.kelas_id === utama.kelas_id && s.id !== utama.id).slice(0, 1 + Math.floor(rnd() * 2)) : [];
      const siswa = [utama, ...teman];
      const tingkat = KELAS.find((k) => k.id === utama.kelas_id)?.tingkat;
      const status = hari > 10 ? (rnd() < 0.85 ? 'selesai' : 'dirujuk') : rnd() < 0.45 ? 'tindak_lanjut' : 'selesai';
      const jamMulai = 8 + Math.floor(rnd() * 6);

      daftar.push({
        id: `00000000-0000-4000-9000-${String(daftar.length + 1).padStart(12, '0')}`,
        tanggal: ymdJakarta(tanggal),
        jam_mulai: `${String(jamMulai).padStart(2, '0')}:${rnd() < 0.5 ? '00' : '30'}`,
        jam_selesai: `${String(jamMulai + 1).padStart(2, '0')}:00`,
        siswa_ids: siswa.map((s) => s.id),
        jenis_layanan: t.layanan[Math.floor(rnd() * t.layanan.length)],
        kategori: t.kategori,
        judul: t.judul,
        uraian: t.uraian,
        tindakan: t.tindakan,
        hasil: t.hasil,
        status,
        tindak_lanjut: status === 'tindak_lanjut'
          ? { rencana: 'Sesi konseling lanjutan untuk evaluasi kesepakatan.', tanggal: ymdJakarta(new Date(tanggal.getTime() + (2 + Math.floor(rnd() * 9)) * HARI_MS)) }
          : status === 'dirujuk'
            ? { rencana: 'Dirujuk ke psikolog puskesmas.', tanggal: null }
            : null,
        rahasia: Boolean(t.rahasia),
        bk_id: tingkat === 'XI' ? BK_ID_ANGGOTA : BK_ID_KOORDINATOR,
        dibuat_pada: new Date(tanggal.getTime()).toISOString(),
        diubah_pada: null,
        akses_koordinator: null,
      });
    }
  }
  // Contoh: satu permintaan izin baca dari koordinator yang menunggu persetujuan anggota.
  const contoh = [...daftar].reverse().find((e) => e.rahasia && e.bk_id === BK_ID_ANGGOTA);
  if (contoh) {
    contoh.akses_koordinator = {
      status: 'diminta',
      alasan: 'Supervisi penanganan kasus: siswa juga dilaporkan wali kelas, perlu koordinasi tindak lanjut.',
      diminta_pada: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      diputuskan_pada: null,
    };
  }
  return daftar;
};

let cache = null;
const ambilJurnal = () => {
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

export const resetJurnalBk = () => {
  localStorage.removeItem(STORAGE_KEY);
  cache = null;
};

// ─── Bentuk respons ──────────────────────────────────────────────────────────

const ringkasSiswa = (id) => {
  const s = SISWA.find((x) => x.id === id);
  return s ? { id: s.id, nama: s.nama, nis: s.nis, kelas: { id: s.kelas_id, nama: KELAS.find((k) => k.id === s.kelas_id)?.nama } } : null;
};

const isKoordinator = (akun) => Boolean(anggotaLogin(akun)?.is_koordinator);

/** Koordinator (bukan penulis) yang sudah disetujui penulis untuk membaca catatan rahasia ini. */
const aksesDisetujui = (e, akun) =>
  e.rahasia && e.bk_id !== akun?.bkId && isKoordinator(akun) && e.akses_koordinator?.status === 'disetujui';

const bolehBacaIsi = (e, akun) => !e.rahasia || e.bk_id === akun?.bkId || aksesDisetujui(e, akun);

const bentukEntri = (e, akun) => {
  const penulis = e.bk_id === akun?.bkId;
  const terbatas = !bolehBacaIsi(e, akun);
  // Status izin hanya relevan untuk penulis (yang memutuskan) dan koordinator (yang meminta).
  const lihatAkses = e.rahasia && (penulis || isKoordinator(akun)) && !(penulis && isKoordinator(akun));
  return {
    id: e.id,
    tanggal: e.tanggal,
    jam_mulai: e.jam_mulai,
    jam_selesai: e.jam_selesai,
    siswa: e.siswa_ids.map(ringkasSiswa).filter(Boolean),
    jenis_layanan: { kode: e.jenis_layanan, label: JENIS_LAYANAN[e.jenis_layanan] },
    kategori: { kode: e.kategori, label: KATEGORI[e.kategori] },
    judul: e.judul,
    uraian: terbatas ? null : e.uraian,
    tindakan: terbatas ? null : e.tindakan,
    hasil: terbatas ? null : e.hasil,
    status: { kode: e.status, label: STATUS[e.status] },
    tindak_lanjut: terbatas ? (e.tindak_lanjut ? { rencana: null, tanggal: e.tindak_lanjut.tanggal } : null) : e.tindak_lanjut,
    rahasia: e.rahasia,
    terbatas,
    akses_koordinator: lihatAkses ? e.akses_koordinator || null : null,
    dibaca_dengan_izin: aksesDisetujui(e, akun),
    bisa_ubah: penulis,
    bk: { id: e.bk_id, nama: namaBk(e.bk_id) },
    dibuat_pada: e.dibuat_pada,
    diubah_pada: e.diubah_pada,
  };
};

/** Entri terlihat bila minimal satu siswanya ada di lingkup BK, atau BK itu penulisnya. */
const entriDalamLingkup = (akun, params) => {
  const kelasIds = kelasDalamLingkup(akun, params);
  if (!kelasIds) return null;
  const siswaIds = new Set(SISWA.filter((s) => kelasIds.has(s.kelas_id)).map((s) => s.id));
  return ambilJurnal().filter((e) => e.bk_id === akun?.bkId || e.siswa_ids.some((id) => siswaIds.has(id)));
};

const urutTerbaru = (a, b) => b.tanggal.localeCompare(a.tanggal) || b.jam_mulai.localeCompare(a.jam_mulai);

const validasiEntri = (body) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body?.tanggal || '')) return 'Tanggal penanganan tidak valid';
  if (body.tanggal > ymdJakarta(new Date())) return 'Tanggal penanganan tidak boleh di masa depan';
  if (!/^\d{2}:\d{2}$/.test(body?.jam_mulai || '')) return 'Jam mulai tidak valid';
  if (body.jam_selesai && !/^\d{2}:\d{2}$/.test(body.jam_selesai)) return 'Jam selesai tidak valid';
  if (body.jam_selesai && body.jam_selesai <= body.jam_mulai) return 'Jam selesai harus setelah jam mulai';
  if (!Array.isArray(body?.siswa_ids) || body.siswa_ids.length === 0) return 'Pilih minimal satu siswa';
  if (!JENIS_LAYANAN[body?.jenis_layanan]) return 'Jenis layanan tidak valid';
  if (!KATEGORI[body?.kategori]) return 'Kategori masalah tidak valid';
  if (!STATUS[body?.status]) return 'Status penanganan tidak valid';
  if (String(body?.judul || '').trim().length < 5) return 'Ringkasan masalah minimal 5 karakter';
  if (String(body.judul).trim().length > 200) return 'Ringkasan masalah maksimal 200 karakter';
  if (body.status === 'tindak_lanjut' && !String(body?.tindak_lanjut?.rencana || '').trim()) return 'Rencana tindak lanjut wajib diisi';
  return '';
};

const isiEntri = (body) => ({
  tanggal: body.tanggal,
  jam_mulai: body.jam_mulai,
  jam_selesai: body.jam_selesai || null,
  siswa_ids: body.siswa_ids,
  jenis_layanan: body.jenis_layanan,
  kategori: body.kategori,
  judul: String(body.judul).trim(),
  uraian: body.uraian?.trim() || null,
  tindakan: body.tindakan?.trim() || null,
  hasil: body.hasil?.trim() || null,
  status: body.status,
  tindak_lanjut: body.status === 'selesai' ? null : { rencana: body.tindak_lanjut?.rencana?.trim() || null, tanggal: body.tindak_lanjut?.tanggal || null },
  rahasia: Boolean(body.rahasia),
});

// ─── PDF profil ──────────────────────────────────────────────────────────────

const pdfProfil = (s, akun, { includeRiwayat, includeRahasia }) => {
  const kelas = KELAS.find((k) => k.id === s.kelas_id)?.nama;
  const baris = barisSiswa(s);
  const doc = new jsPDF();
  const ungu = [94, 92, 230];

  doc.setFontSize(15);
  doc.text('Profil Siswa - Bimbingan dan Konseling', 14, 18);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Dicetak ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} oleh ${akun?.name || '-'} (mode dummy)`, 14, 24);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 30,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1.5 },
    columnStyles: { 0: { cellWidth: 40, textColor: 100 } },
    body: [['Nama', s.nama], ['NIS', s.nis || '-'], ['Kelas', kelas || '-'], ['Jenis kelamin', { L: 'Laki-laki', P: 'Perempuan' }[s.jenis_kelamin] || '-'],
      ['Faktor perhatian', baris.perhatian.length ? baris.perhatian.map((p) => `${LABEL_DIMENSI[p.dimensi]}: ${p.alasan}`).join('\n') : 'Tidak ada']],
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    head: [['Dimensi', 'Kategori', 'Rincian']],
    headStyles: { fillColor: ungu },
    styles: { fontSize: 9 },
    body: [
      ['Ekonomi', baris.ekonomi.label, `Ayah: ${s.ekonomi.pekerjaan_ayah || '-'}; Ibu: ${s.ekonomi.pekerjaan_ibu || '-'}; tanggungan ${s.ekonomi.tanggungan ?? '-'}; bantuan: ${s.ekonomi.bantuan.join(', ') || '-'}`],
      ['Geografis', baris.geografis.label, s.geografis.jarak_km == null ? '-' : `${s.geografis.desa}, Kec. ${s.geografis.kecamatan}; ${s.geografis.jarak_km} km; ± ${s.geografis.waktu_tempuh_menit} menit`],
      ['Kesehatan', baris.kesehatan.label, `Kondisi: ${s.kesehatan.kondisi.join(', ') || '-'}; alergi: ${s.kesehatan.alergi || '-'}; gol. darah ${s.kesehatan.golongan_darah || '-'}`],
      ['Kendaraan', baris.kendaraan.label, s.kendaraan.punya_sim == null ? '-' : s.kendaraan.punya_sim ? 'Memiliki SIM' : 'Tidak memiliki SIM'],
      ['Ekstrakurikuler', baris.ekskul.label, s.ekskul.daftar.join(', ') || '-'],
    ],
  });

  if (includeRiwayat) {
    const entri = ambilJurnal().filter((e) => e.siswa_ids.includes(s.id)).sort(urutTerbaru);
    doc.setFontSize(12);
    doc.text(`Riwayat Permasalahan & Penanganan (${entri.length})`, 14, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 13,
      head: [['Tanggal', 'Layanan', 'Kategori', 'Permasalahan & Penanganan', 'Status']],
      headStyles: { fillColor: ungu },
      styles: { fontSize: 8, valign: 'top' },
      columnStyles: { 3: { cellWidth: 80 } },
      body: entri.length
        ? entri.map((e) => {
            const bolehBaca = !e.rahasia || (includeRahasia && bolehBacaIsi(e, akun));
            const isi = bolehBaca
              ? [e.judul, e.tindakan && `Tindakan: ${e.tindakan}`, e.hasil && `Hasil: ${e.hasil}`].filter(Boolean).join('\n')
              : `${e.judul}\n(Catatan rahasia tidak disertakan)`;
            return [e.tanggal, JENIS_LAYANAN[e.jenis_layanan], KATEGORI[e.kategori], isi, STATUS[e.status]];
          })
        : [['-', '-', '-', 'Belum ada catatan penanganan', '-']],
    });
  }

  const halaman = doc.getNumberOfPages();
  for (let i = 1; i <= halaman; i += 1) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('RAHASIA - hanya untuk keperluan layanan Bimbingan dan Konseling', 14, 290);
    doc.text(`Hal. ${i}/${halaman}`, 196, 290, { align: 'right' });
  }
  return doc.output('arraybuffer');
};

// ─── Handler ─────────────────────────────────────────────────────────────────

export const handlerJurnalBk = [
  ['GET', new RegExp(`^${BK}/jurnal$`), ({ akun, params }) => {
    let entri = entriDalamLingkup(akun, params);
    if (!entri) return TIDAK_AKTIF;
    const q = String(params.q || '').trim().toLowerCase();
    if (params.tanggal_mulai) entri = entri.filter((e) => e.tanggal >= params.tanggal_mulai);
    if (params.tanggal_selesai) entri = entri.filter((e) => e.tanggal <= params.tanggal_selesai);
    ['jenis_layanan', 'kategori', 'status'].forEach((k) => {
      if (params[k]) entri = entri.filter((e) => e[k] === params[k]);
    });
    if (params.penulis === 'saya') entri = entri.filter((e) => e.bk_id === akun?.bkId);
    if (q) {
      entri = entri.filter(
        (e) => e.judul.toLowerCase().includes(q) || e.siswa_ids.some((id) => ringkasSiswa(id)?.nama.toLowerCase().includes(q) || (ringkasSiswa(id)?.nis || '').includes(q)),
      );
    }

    if (params.sort === 'tindak_lanjut') {
      entri = [...entri].sort((a, b) => (a.tindak_lanjut?.tanggal || '9999').localeCompare(b.tindak_lanjut?.tanggal || '9999'));
    } else entri = [...entri].sort(urutTerbaru);

    const total = entri.length;
    const limit = Number(params.limit) || total || 1;
    const page = Number(params.page) || 1;
    return ok({
      data: entri.slice((page - 1) * limit, page * limit).map((e) => bentukEntri(e, akun)),
      meta: {
        total,
        page,
        limit,
        ringkasan: {
          jumlah_penanganan: total,
          jumlah_siswa: new Set(entri.flatMap((e) => e.siswa_ids)).size,
          tindak_lanjut: entri.filter((e) => e.status === 'tindak_lanjut').length,
        },
      },
    });
  }],

  ['GET', new RegExp(`^${BK}/jurnal/([^/]+)$`), ({ akun, match }) => {
    const e = (entriDalamLingkup(akun, { lingkup: 'semua' }) || []).find((x) => x.id === match[1]);
    return e ? ok({ data: bentukEntri(e, akun) }) : gagal(404, 'Catatan penanganan tidak ditemukan');
  }],

  ['POST', new RegExp(`^${BK}/jurnal$`), ({ akun, body }) => {
    const saya = anggotaLogin(akun);
    if (!saya?.aktif) return TIDAK_AKTIF;
    const galat = validasiEntri(body);
    if (galat) return gagal(422, galat);
    const lingkup = kelasDalamLingkup(akun, { lingkup: 'semua' });
    if (body.siswa_ids.some((id) => !lingkup.has(SISWA.find((s) => s.id === id)?.kelas_id))) {
      return gagal(403, 'Ada siswa di luar kelas tanggung jawab Anda');
    }
    if (body.jadwal_id && !adaJadwalMilik(body.jadwal_id, akun)) return gagal(422, 'Jadwal tidak ditemukan');
    if (body.pengaduan_id && !adaPengaduanTerlihat(body.pengaduan_id, akun)) return gagal(422, 'Pengaduan tidak ditemukan');
    const baru = { id: `00000000-0000-4000-9000-${String(Date.now() % 1e12).padStart(12, '0')}`, ...isiEntri(body), bk_id: saya.id, dibuat_pada: new Date().toISOString(), diubah_pada: null };
    ambilJurnal().push(baru);
    simpan();
    // Catatan dari sesi terjadwal / pengaduan: tautkan dan perbarui status sumbernya.
    if (body.jadwal_id) tautkanJurnalKeJadwal(body.jadwal_id, baru.id, akun);
    if (body.pengaduan_id) tautkanJurnalKePengaduan(body.pengaduan_id, baru.id, akun);
    return ok({ msg: 'Catatan penanganan berhasil disimpan', data: bentukEntri(baru, akun) }, 201);
  }],

  ['PATCH', new RegExp(`^${BK}/jurnal/([^/]+)$`), ({ akun, match, body }) => {
    const e = ambilJurnal().find((x) => x.id === match[1]);
    if (!e) return gagal(404, 'Catatan penanganan tidak ditemukan');
    if (e.bk_id !== akun?.bkId) return gagal(403, 'Hanya BK penulis yang dapat mengubah catatan ini');
    const galat = validasiEntri(body);
    if (galat) return gagal(422, galat);
    Object.assign(e, isiEntri(body), { diubah_pada: new Date().toISOString() });
    simpan();
    return ok({ msg: 'Catatan penanganan berhasil diperbarui', data: bentukEntri(e, akun) });
  }],

  ['DELETE', new RegExp(`^${BK}/jurnal/([^/]+)$`), ({ akun, match }) => {
    const e = ambilJurnal().find((x) => x.id === match[1]);
    if (!e) return gagal(404, 'Catatan penanganan tidak ditemukan');
    if (e.bk_id !== akun?.bkId) return gagal(403, 'Hanya BK penulis yang dapat menghapus catatan ini');
    cache = cache.filter((x) => x.id !== e.id);
    simpan();
    return ok({ msg: 'Catatan penanganan dihapus' });
  }],

  // Izin baca catatan rahasia oleh koordinator
  ['GET', new RegExp(`^${BK}/akses-rahasia$`), ({ akun }) => {
    const saya = anggotaLogin(akun);
    if (!saya?.aktif) return TIDAK_AKTIF;
    const jurnal = ambilJurnal();
    const ringkas = (e) => ({ ...bentukEntri(e, akun), akses_koordinator: e.akses_koordinator });
    return ok({
      data: {
        // Permintaan yang menunggu keputusan saya (sebagai penulis)
        masuk: jurnal.filter((e) => e.rahasia && e.bk_id === saya.id && e.akses_koordinator?.status === 'diminta').map(ringkas),
        // Permintaan saya (koordinator) ke anggota, semua status
        keluar: saya.is_koordinator ? jurnal.filter((e) => e.rahasia && e.bk_id !== saya.id && e.akses_koordinator).map(ringkas) : [],
      },
    });
  }],

  ['POST', new RegExp(`^${BK}/jurnal/([^/]+)/akses$`), ({ akun, match, body }) => {
    if (!isKoordinator(akun)) return gagal(403, 'Hanya koordinator BK yang dapat meminta izin membaca catatan rahasia');
    const e = (entriDalamLingkup(akun, { lingkup: 'semua' }) || []).find((x) => x.id === match[1]);
    if (!e) return gagal(404, 'Catatan penanganan tidak ditemukan');
    if (!e.rahasia || e.bk_id === akun.bkId) return gagal(409, 'Catatan ini tidak memerlukan izin baca');
    if (['diminta', 'disetujui'].includes(e.akses_koordinator?.status)) return gagal(409, 'Permintaan izin sudah ada');
    const alasan = String(body?.alasan || '').trim();
    if (alasan.length < 10) return gagal(422, 'Alasan permintaan minimal 10 karakter');
    e.akses_koordinator = { status: 'diminta', alasan, diminta_pada: new Date().toISOString(), diputuskan_pada: null };
    simpan();
    return ok({ msg: `Permintaan izin dikirim ke ${namaBk(e.bk_id)}`, data: bentukEntri(e, akun) }, 201);
  }],

  ['PATCH', new RegExp(`^${BK}/jurnal/([^/]+)/akses$`), ({ akun, match, body }) => {
    const e = ambilJurnal().find((x) => x.id === match[1]);
    if (!e) return gagal(404, 'Catatan penanganan tidak ditemukan');
    if (e.bk_id !== akun?.bkId) return gagal(403, 'Hanya BK penulis yang dapat memutuskan permintaan izin');
    if (e.akses_koordinator?.status !== 'diminta') return gagal(409, 'Tidak ada permintaan izin yang menunggu');
    if (!['disetujui', 'ditolak'].includes(body?.keputusan)) return gagal(422, 'Keputusan tidak valid');
    e.akses_koordinator = { ...e.akses_koordinator, status: body.keputusan, diputuskan_pada: new Date().toISOString() };
    simpan();
    return ok({
      msg: body.keputusan === 'disetujui' ? 'Koordinator kini dapat membaca catatan ini' : 'Permintaan izin ditolak',
      data: bentukEntri(e, akun),
    });
  }],

  // Penulis mencabut izin yang sudah diberikan, atau koordinator membatalkan permintaannya.
  ['DELETE', new RegExp(`^${BK}/jurnal/([^/]+)/akses$`), ({ akun, match }) => {
    const e = ambilJurnal().find((x) => x.id === match[1]);
    if (!e?.akses_koordinator) return gagal(404, 'Tidak ada izin atau permintaan pada catatan ini');
    const penulis = e.bk_id === akun?.bkId;
    if (penulis && e.akses_koordinator.status === 'disetujui') {
      e.akses_koordinator = { ...e.akses_koordinator, status: 'dicabut', diputuskan_pada: new Date().toISOString() };
      simpan();
      return ok({ msg: 'Izin baca koordinator dicabut', data: bentukEntri(e, akun) });
    }
    if (isKoordinator(akun) && !penulis && e.akses_koordinator.status === 'diminta') {
      e.akses_koordinator = null;
      simpan();
      return ok({ msg: 'Permintaan izin dibatalkan', data: bentukEntri(e, akun) });
    }
    return gagal(409, 'Izin ini tidak dapat dicabut atau dibatalkan');
  }],

  // Riwayat permasalahan: daftar siswa + ringkasan penanganan
  ['GET', new RegExp(`^${BK}/riwayat$`), ({ akun, params }) => {
    const kelasIds = kelasDalamLingkup(akun, params);
    if (!kelasIds) return TIDAK_AKTIF;
    const q = String(params.q || '').trim().toLowerCase();
    const jurnal = ambilJurnal();

    let rows = SISWA.filter((s) => kelasIds.has(s.kelas_id)).map((s) => {
      const entri = jurnal.filter((e) => e.siswa_ids.includes(s.id)).sort(urutTerbaru);
      const perKategori = {};
      entri.forEach((e) => { perKategori[e.kategori] = (perKategori[e.kategori] || 0) + 1; });
      const utama = Object.entries(perKategori).sort((a, b) => b[1] - a[1])[0];
      return {
        siswa: ringkasSiswa(s.id),
        perhatian: alasanPerhatian(s),
        jumlah_penanganan: entri.length,
        tindak_lanjut_terbuka: entri.filter((e) => e.status === 'tindak_lanjut').length,
        terakhir: entri[0] ? { tanggal: entri[0].tanggal, kategori: { kode: entri[0].kategori, label: KATEGORI[entri[0].kategori] }, status: { kode: entri[0].status, label: STATUS[entri[0].status] } } : null,
        kategori_utama: utama ? { kode: utama[0], label: KATEGORI[utama[0]] } : null,
      };
    });

    if (params.ada_riwayat === '1') rows = rows.filter((r) => r.jumlah_penanganan > 0);
    if (params.tindak_lanjut === '1') rows = rows.filter((r) => r.tindak_lanjut_terbuka > 0);
    if (params.kategori) rows = rows.filter((r) => jurnal.some((e) => e.kategori === params.kategori && e.siswa_ids.includes(r.siswa.id)));
    if (q) rows = rows.filter((r) => r.siswa.nama.toLowerCase().includes(q) || (r.siswa.nis || '').includes(q));
    rows.sort((a, b) => (b.terakhir?.tanggal || '').localeCompare(a.terakhir?.tanggal || '') || a.siswa.nama.localeCompare(b.siswa.nama));

    const total = rows.length;
    const limit = Number(params.limit) || total || 1;
    const page = Number(params.page) || 1;
    return ok({ data: rows.slice((page - 1) * limit, page * limit), meta: { total, page, limit } });
  }],

  ['GET', new RegExp(`^${BK}/riwayat/([^/]+)$`), ({ akun, match }) => {
    const kelasIds = kelasDalamLingkup(akun, { lingkup: 'semua' });
    if (!kelasIds) return TIDAK_AKTIF;
    const s = SISWA.find((x) => x.id === match[1] && kelasIds.has(x.kelas_id));
    if (!s) return gagal(404, 'Siswa tidak ditemukan atau bukan siswa binaan Anda');
    const entri = ambilJurnal().filter((e) => e.siswa_ids.includes(s.id)).sort(urutTerbaru);
    const hitung = (kunci, label) =>
      Object.entries(entri.reduce((acc, e) => ({ ...acc, [e[kunci]]: (acc[e[kunci]] || 0) + 1 }), {}))
        .map(([kode, jumlah]) => ({ kode, label: label[kode], jumlah }))
        .sort((a, b) => b.jumlah - a.jumlah);
    return ok({
      data: {
        siswa: barisSiswa(s),
        ringkasan: { total: entri.length, per_kategori: hitung('kategori', KATEGORI), per_status: hitung('status', STATUS) },
        penanganan: entri.map((e) => bentukEntri(e, akun)),
      },
    });
  }],

  // Ekspor PDF profil siswa
  ['GET', new RegExp(`^${BK}/pemetaan/siswa/([^/]+)/export$`), ({ akun, match, params }) => {
    const kelasIds = kelasDalamLingkup(akun, { lingkup: 'semua' });
    if (!kelasIds) return TIDAK_AKTIF;
    const s = SISWA.find((x) => x.id === match[1] && kelasIds.has(x.kelas_id));
    if (!s) return gagal(404, 'Siswa tidak ditemukan atau bukan siswa binaan Anda');
    const pdf = pdfProfil(s, akun, { includeRiwayat: params.include_riwayat !== 'false', includeRahasia: params.include_rahasia === 'true' });
    const nama = `Profil-BK-${s.nama.replace(/\s+/g, '-')}.pdf`;
    return {
      status: 200,
      data: new Blob([pdf], { type: 'application/pdf' }),
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `${params.disposition === 'inline' ? 'inline' : 'attachment'}; filename="${nama}"`,
      },
    };
  }],
];
