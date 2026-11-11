// "Database" dummy modul Perangkat Ajar. Disimpan di localStorage supaya perubahan (unggah guru,
// edit deadline Waka) tetap ada setelah refresh dan terlihat saat berganti akun dummy di browser
// yang sama. Reset: hapus key STORAGE_KEY di localStorage, atau jalankan window.__resetDummyDb().

import { GURU_ID_DUMMY } from './akunDummy';

// v4: id guru, penugasan, mapel, kelas berupa angka (mengikuti backend); dokumen & deadline tetap UUID.
const STORAGE_KEY = 'abseninaja_dummy_db_v4';
const TZ_OFFSET = '+07:00'; // Asia/Jakarta, sama dengan timezone_sekolah di token dummy

// UUID valid (versi 4) yang deterministik, supaya lolos validasi isUUID di halaman.
export const uid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

export const TAHUN_AJARAN = [
  { id: uid(21), nama: '2026/2027' },
  { id: uid(22), nama: '2025/2026' },
];

export const SEMESTER = [
  { id: uid(11), label: 'Ganjil 2026/2027', nama_semester: 'Ganjil', tahun_ajaran: TAHUN_AJARAN[0], is_aktif: true },
  { id: uid(12), label: 'Genap 2025/2026', nama_semester: 'Genap', tahun_ajaran: TAHUN_AJARAN[1], is_aktif: false },
  { id: uid(13), label: 'Ganjil 2025/2026', nama_semester: 'Ganjil', tahun_ajaran: TAHUN_AJARAN[1], is_aktif: false },
];

export const JENIS = [
  { kode: 'silabus', label: 'Silabus', label_singkat: 'Silabus' },
  { kode: 'cp', label: 'Capaian Pembelajaran (CP)', label_singkat: 'CP' },
  { kode: 'tp', label: 'Tujuan Pembelajaran (TP)', label_singkat: 'TP' },
  { kode: 'atp', label: 'Alur Tujuan Pembelajaran (ATP)', label_singkat: 'ATP' },
  { kode: 'modul_ajar', label: 'Modul Ajar', label_singkat: 'Modul Ajar' },
];

// Status per jenis (urutan JENIS): D=disetujui, M=menunggu_validasi, R=perlu_revisi, B=belum_unggah
const GURU_SEED = [
  { nama: 'Siti Rahmawati, S.Pd.', nip: '198705122010012001', penugasan: [['Informatika', 'X TKJ 1', 'DMRBB'], ['Informatika', 'X TKJ 2', 'BDBBB']] },
  { nama: 'Ahmad Fauzi, S.Kom.', nip: '198903042014031002', penugasan: [['Pemrograman Web', 'XI RPL 1', 'DDDDD'], ['Basis Data', 'XI RPL 2', 'DDDDD']] },
  { nama: 'Dewi Lestari, S.Pd.', nip: '199001172015042003', penugasan: [['Bahasa Indonesia', 'X TKJ 1', 'DMMBB']] },
  { nama: 'Budi Santoso, M.Pd.', nip: '198211232009011004', penugasan: [['Matematika', 'X RPL 1', 'BBBBB'], ['Matematika', 'X RPL 2', 'BBBBB']] },
  { nama: 'Rina Marlina, S.Pd.', nip: '199204302019032005', penugasan: [['Bahasa Inggris', 'XI TKJ 1', 'DDRMB']] },
  { nama: 'Hendra Gunawan, S.T.', nip: '198606152011011006', penugasan: [['Komputer dan Jaringan Dasar', 'X TKJ 2', 'DDDDM']] },
  { nama: 'Nur Aisyah, S.Pd.I.', nip: '199108082018012007', penugasan: [['Pendidikan Agama Islam', 'XII TKJ 1', 'MBBBB']] },
  { nama: 'Yusuf Maulana, S.Pd.', nip: '198812012013031008', penugasan: [['PJOK', 'XI RPL 1', 'DDDBB'], ['PJOK', 'XI RPL 2', 'DMBBB']] },
];

const KODE_STATUS = { D: 'disetujui', M: 'menunggu_validasi', R: 'perlu_revisi', B: 'belum_unggah' };

// Deadline semester aktif relatif terhadap hari seed: dua sudah lewat (untuk melihat kunci otomatis).
const DEADLINE_HARI = { silabus: -7, cp: -1, tp: 2, atp: 9, modul_ajar: 21 };

const HARI_MS = 24 * 60 * 60 * 1000;

/** YYYY-MM-DD di zona waktu Asia/Jakarta. */
export const ymdJakarta = (date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

export const deadlineIso = (d) => (d ? `${d.tanggal_deadline}T${d.jam_deadline}:00${TZ_OFFSET}` : null);

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const NAMA_WAKA_DUMMY = 'Drs. Waka Kurikulum (Dummy)';

const CATATAN_REVISI_LAMA = 'Format belum sesuai template sekolah. Cantumkan identitas mapel, fase, dan alokasi waktu.';
const CATATAN_REVISI = 'Tujuan pembelajaran belum diturunkan dari CP Fase E. Lengkapi kriteria ketercapaian tiap TP dan sisipkan nilai Kurikulum Berbasis Cinta.';

// Riwayat versi hasil seed: versi sebelum terakhir selalu "diminta revisi", versi terakhir mengikuti status.
const seedRiwayat = ({ status, versi, diunggah, namaFile, ukuran, now }) => {
  if (!versi || !diunggah) return [];
  const terakhir = new Date(diunggah).getTime();
  return Array.from({ length: versi }, (_, i) => {
    const v = i + 1;
    const waktu = terakhir - (versi - v) * 2 * HARI_MS;
    const pada = new Date(Math.min(waktu + HARI_MS / 2, now - 60 * 60 * 1000)).toISOString();
    let keputusan = null;
    if (v < versi) keputusan = { status: 'perlu_revisi', catatan: CATATAN_REVISI_LAMA, oleh: NAMA_WAKA_DUMMY, pada };
    else if (status === 'disetujui') keputusan = { status: 'disetujui', catatan: 'Sudah sesuai CP dan format sekolah.', oleh: NAMA_WAKA_DUMMY, pada };
    else if (status === 'perlu_revisi') keputusan = { status: 'perlu_revisi', catatan: CATATAN_REVISI, oleh: NAMA_WAKA_DUMMY, pada };
    return { versi: v, diunggah_pada: new Date(waktu).toISOString(), nama_file: namaFile, ukuran, keputusan };
  });
};

export const GURU = GURU_SEED.map((g, i) => ({
  id: i === 0 ? GURU_ID_DUMMY : 100 + i,
  nama: g.nama,
  nip: g.nip,
}));

const seed = () => {
  const now = Date.now();
  const semAktif = SEMESTER.find((s) => s.is_aktif);
  const semesterLalu = SEMESTER.filter((s) => !s.is_aktif);
  const deadline = [];
  const penugasan = [];
  const dokumen = [];
  let n = 0;

  JENIS.forEach((jenis, j) => {
    deadline.push({
      id: uid(300 + j),
      semester_ajaran_id: semAktif.id,
      jenis: jenis.kode,
      tanggal_deadline: ymdJakarta(new Date(now + DEADLINE_HARI[jenis.kode] * HARI_MS)),
      jam_deadline: '23:59',
      keterangan: j === 4 ? 'Modul ajar untuk seluruh pertemuan semester ganjil' : '',
    });
    semesterLalu.forEach((sem, k) => {
      deadline.push({
        id: uid(400 + k * 10 + j),
        semester_ajaran_id: sem.id,
        jenis: jenis.kode,
        tanggal_deadline: ymdJakarta(new Date(now - (150 + k * 180 - j * 7) * HARI_MS)),
        jam_deadline: '23:59',
        keterangan: '',
      });
    });
  });

  const tambahPenugasan = (semester, idBase, guru, gi, [mapel, kelas, pola], pi, semuaDisetujui) => {
    const id = idBase + gi * 10 + pi;
    penugasan.push({
      id,
      semester_ajaran_id: semester.id,
      guru_id: guru.id,
      mapel: { id: 500 + gi * 10 + pi, nama: mapel },
      kelas: { id: 600 + gi * 10 + pi, nama: kelas },
    });

    JENIS.forEach((jenis, j) => {
      n += 1;
      const status = semuaDisetujui ? 'disetujui' : KODE_STATUS[pola[j]];
      const dl = deadline.find((d) => d.semester_ajaran_id === semester.id && d.jenis === jenis.kode);
      const batas = new Date(deadlineIso(dl)).getTime();
      // Sebagian guru mengunggah sehari setelah deadline (untuk penanda "Terlambat"); unggahan tidak boleh di masa depan.
      const rencana = gi % 3 === 0 && j < 2 ? batas + HARI_MS : batas - 3 * HARI_MS;
      const diunggah = status === 'belum_unggah' ? null : new Date(Math.min(rencana, now - (n % 12 + 1) * 60 * 60 * 1000)).toISOString();

      const versi = status === 'belum_unggah' ? 0 : status === 'perlu_revisi' ? 1 : (n % 3 === 0 ? 2 : 1);
      const namaFile = status === 'belum_unggah' ? null : `${jenis.kode}-${slug(mapel)}-${slug(kelas)}.pdf`;
      const ukuran = status === 'belum_unggah' ? null : 350000 + (n % 7) * 120000;
      const riwayat = seedRiwayat({ status, versi, diunggah, namaFile, ukuran, now });

      dokumen.push({
        id: uid(10000 + n),
        penugasan_id: id,
        jenis: jenis.kode,
        status,
        versi,
        diunggah_pada: diunggah,
        nama_file: namaFile,
        ukuran,
        feedback: riwayat.at(-1)?.keputusan || null,
        riwayat,
      });
    });
  };

  GURU.forEach((guru, gi) => {
    GURU_SEED[gi].penugasan.forEach((p, pi) => {
      tambahPenugasan(semAktif, 2000, guru, gi, p, pi, false);
      semesterLalu.forEach((sem, k) => tambahPenugasan(sem, 3000 + k * 1000, guru, gi, p, pi, true));
    });
  });

  return { deadline, penugasan, dokumen };
};

let cache = null;

export const ambilDb = () => {
  if (cache) return cache;
  try {
    const tersimpan = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (tersimpan?.dokumen && tersimpan?.deadline && tersimpan?.penugasan) {
      cache = tersimpan;
      return cache;
    }
  } catch {
    // data rusak: seed ulang
  }
  cache = seed();
  simpanDb();
  return cache;
};

export const simpanDb = () => {
  if (cache) localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
};

export const resetDb = () => {
  localStorage.removeItem(STORAGE_KEY);
  cache = null;
  return ambilDb();
};

// File PDF hasil unggah hanya disimpan di memori (hilang saat refresh); selebihnya PDF dibuat on-the-fly.
export const FILE_UNGGAHAN = new Map();
