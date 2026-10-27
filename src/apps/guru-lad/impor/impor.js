// Logika murni layar impor blanko (FR-07). Tanpa impor supaya dapat diuji dengan `node --test`.
// Server adalah pemegang aturan (struktur, nilai, bentrok); di sini hanya: memilah berkas yang dipilih,
// menyusun isian `meta` per berkas, dan membaca laporan pratinjau untuk ditampilkan.

export const MAKS_BERKAS = 10;
export const MAKS_BYTE = 2 * 1024 * 1024;

// Tahun ajaran berjalan: Juli ke atas dihitung tahun ajaran yang baru mulai.
export function tahunAjaranSekarang(tanggal = new Date()) {
  const awal = tanggal.getMonth() >= 6 ? tanggal.getFullYear() : tanggal.getFullYear() - 1;
  return `${awal}/${awal + 1}`;
}

const kunciBerkas = (f) => `${f.name}|${f.size}|${f.lastModified}`;

/**
 * Memilah berkas yang baru dipilih. Penolakan di sini hanya kenyamanan (pesan cepat); server memeriksa ulang
 * semuanya, termasuk isi sebenarnya berkas.
 * @returns {{diterima: File[], ditolak: {nama: string, alasan: string}[]}}
 */
export function periksaPilihan(baru, sudahAda = []) {
  const diterima = [];
  const ditolak = [];
  const ada = new Set(sudahAda.map(kunciBerkas));
  Array.from(baru).forEach((f) => {
    if (!/\.xlsx$/i.test(f.name)) {
      ditolak.push({ nama: f.name, alasan: 'bukan berkas .xlsx (simpan dulu sebagai Excel Workbook)' });
    } else if (f.size === 0) {
      ditolak.push({ nama: f.name, alasan: 'berkas kosong' });
    } else if (f.size > MAKS_BYTE) {
      ditolak.push({ nama: f.name, alasan: 'lebih dari 2 MB' });
    } else if (ada.has(kunciBerkas(f))) {
      ditolak.push({ nama: f.name, alasan: 'sudah dipilih' });
    } else if (sudahAda.length + diterima.length >= MAKS_BERKAS) {
      ditolak.push({ nama: f.name, alasan: `paling banyak ${MAKS_BERKAS} berkas sekali impor` });
    } else {
      diterima.push(f);
      ada.add(kunciBerkas(f));
    }
  });
  return { diterima, ditolak };
}

/** Butir berkas awal. `jenis` diisi setelah pratinjau pertama, sebanyak proyek di berkas itu. */
export const butirBaru = (file, id) => ({
  id, file, nama_kelas: '', mapel: '', jenis: [],
});

/**
 * Isian `meta` untuk server, satu objek per berkas menurut urutan berkas. Yang kosong tidak dikirim, sehingga
 * server memakai apa yang terbaca dari blanko atau melaporkannya sebagai keputusan yang masih diperlukan.
 */
export function susunMeta(butir, bersama) {
  return butir.map((b) => {
    const m = {};
    const semester = String(bersama.semester ?? '').trim();
    const tahun = String(bersama.tahun_ajaran ?? '').trim();
    if (semester) m.semester = semester;
    if (tahun) m.tahun_ajaran = tahun;
    const mapel = String(b.mapel || bersama.mapel || '').trim();
    if (mapel) m.mapel = mapel;
    const nama = String(b.nama_kelas ?? '').trim();
    if (nama) m.nama_kelas = nama;
    if (b.jenis.length > 0) m.jenis_proyek = b.jenis.map((j) => j || '');
    return m;
  });
}

/** Tanda permintaan: berubah bila berkas atau isian apa pun berubah. Simpan hanya boleh bila tandanya sama dengan pratinjau terakhir. */
export const tandaPermintaan = (butir, bersama) => JSON.stringify([
  butir.map((b) => [b.file.name, b.file.size, b.file.lastModified]),
  susunMeta(butir, bersama),
]);

/** 'siap' | 'keputusan' | 'galat' | 'bentrok' untuk satu berkas dalam laporan server. */
export function statusBerkas(laporan) {
  if (laporan.bentrok) return 'bentrok';
  if ((laporan.galat?.length ?? 0) > 0 || (laporan.jumlah_galat ?? 0) > 0) return 'galat';
  if ((laporan.perlu_keputusan?.length ?? 0) > 0) return 'keputusan';
  return 'siap';
}

/**
 * Setelah pratinjau: nama kelas yang terbaca dari blanko menjadi isian awal (boleh diubah guru), dan daftar jenis
 * proyek disiapkan sebanyak proyek di berkas, kosong sampai guru memilih. Isian yang sudah diubah guru tidak ditimpa.
 */
export function isiDariLaporan(butir, laporan) {
  return butir.map((b, i) => {
    const l = laporan[i];
    if (!l) return b;
    const proyek = l.struktur?.proyek ?? [];
    return {
      ...b,
      nama_kelas: b.nama_kelas || (l.kelas?.nama_kelas ?? ''),
      jenis: b.jenis.length === proyek.length ? b.jenis : proyek.map((p) => p.jenis ?? ''),
    };
  });
}

export const ringkasBerkas = (r) => (r
  ? `${r.jumlah_siswa} siswa, ${r.jumlah_lm} lingkup materi, ${r.jumlah_tp} TP, ${r.jumlah_proyek} proyek, ${r.sel_nilai_terisi} nilai terisi`
  : '');

/** Satu baris galat: sel Excel (bila ada) diikuti pesannya. */
export const barisGalat = (g) => (g.sel ? `${g.sel}: ${g.pesan}` : g.pesan);

/** Ringkasan hasil simpan untuk guru. */
export function ringkasHasilSimpan(hasil) {
  const kelas = hasil?.kelas ?? [];
  if (kelas.length === 0) return '';
  const siswa = kelas.reduce((a, k) => a + k.jumlah_siswa, 0);
  const nilai = kelas.reduce((a, k) => a + k.jumlah_nilai, 0);
  return `${kelas.length} kelas dibuat: ${siswa} siswa dan ${nilai} nilai tersimpan.`;
}
