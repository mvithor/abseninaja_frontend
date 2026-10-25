// Fungsi murni untuk input grid LAD: penguraian teks tempel dari Excel dan pemeriksaan nilai.
// Tanpa impor sama sekali supaya dapat diuji dengan `node --test` tanpa Vite (lihat tempel.test.js).
//
// Aturan nilai MENCERMINKAN backend (src/lad/data/validasi.js, bacaNilai) hanya sebagai umpan balik
// cepat. Yang berwenang tetap server: ia menolak nilai tidak sah dan tidak pernah membulatkan.

// Batas ini sama dengan batas di backend (satu permintaan nilai paling banyak 1500 sel).
export const MAKS_SEL_PER_PERMINTAAN = 1500;
export const MAKS_SISWA_PER_PERMINTAAN = 100;

/** Pecah teks tempel (hasil salin Excel) menjadi baris dan kolom. Sel kosong dipertahankan. */
export function uraiTempel(teks) {
  if (typeof teks !== 'string' || teks === '') return [];
  const baris = teks.replace(/\r\n?/g, '\n').split('\n');
  // Excel selalu menutup salinan dengan satu baris baru; baris kosong di ujung bukan data.
  while (baris.length > 0 && baris[baris.length - 1] === '') baris.pop();
  return baris.map((b) => b.split('\t'));
}

/**
 * Periksa satu sel nilai yang diketik atau ditempel.
 * Mengembalikan { nilai: null } untuk kosong (belum dinilai, BUKAN nol),
 * { nilai, centi } untuk nilai sah, atau { galat: <pesan> }.
 * Koma dan titik sama-sama diterima sebagai pemisah desimal (salinan Excel Indonesia memakai koma).
 */
export function bacaNilaiSel(teks) {
  const t = String(teks ?? '').trim();
  if (t === '') return { nilai: null };
  const m = /^(\d{1,3})(?:[.,](\d+))?$/.exec(t);
  if (!m) return { galat: 'bukan bilangan yang sah' };
  if (m[2] !== undefined && m[2].length > 2) return { galat: 'paling banyak dua angka desimal' };
  const centi = Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0') || '0');
  if (centi > 10000) return { galat: 'harus antara 0 dan 100' };
  return { nilai: centi / 100, centi };
}

/** Tampilan nilai dari server: 74.5 menjadi "74,5", 80 menjadi "80". */
export function tampilNilai(nilai) {
  if (nilai === null || nilai === undefined) return '';
  return String(nilai).replace('.', ',');
}

/**
 * Terapkan hasil tempel pada grid mulai dari sel (mulaiBaris, mulaiKolom). Sel di luar grid dipotong
 * dan dihitung, tidak membuat kolom atau baris baru.
 */
export function terapkanTempel({
  data, mulaiBaris, mulaiKolom, jumlahBaris, jumlahKolom,
}) {
  const perubahan = [];
  let terpotong = 0;
  data.forEach((baris, i) => {
    baris.forEach((teks, j) => {
      const r = mulaiBaris + i;
      const c = mulaiKolom + j;
      if (r >= jumlahBaris || c >= jumlahKolom) { terpotong += 1; return; }
      perubahan.push({ baris: r, kolom: c, teks: teks.trim() });
    });
  });
  return { perubahan, terpotong };
}

/**
 * Daftar siswa dari teks tempel: satu siswa per baris; kolom kedua (dipisah tab atau titik koma)
 * adalah NIS dan boleh kosong. Baris kosong dilewati. Nama dipangkas dan spasi ganda dirapikan.
 */
export function uraiDaftarSiswa(teks) {
  const hasil = [];
  const rincian = [];
  const galat = [];
  uraiTempel(teks).forEach((sel, i) => {
    const sebaris = sel.length === 1 && sel[0].includes(';') ? sel[0].split(';') : sel;
    const nama = (sebaris[0] ?? '').replace(/\s+/g, ' ').trim();
    const nis = (sebaris[1] ?? '').trim();
    if (nama === '' && nis === '') return;
    if (nama === '') { galat.push({ baris: i + 1, pesan: 'nama kosong' }); return; }
    hasil.push(nis === '' ? { nama } : { nama, nis });
    // `rincian` menyimpan nomor baris asli (mulai dari 1) agar pesan dapat menunjuk baris yang dilihat guru.
    rincian.push({ baris: i + 1, nama, nis });
  });
  return { siswa: hasil, rincian, galat };
}

const kunciNama = (nama) => String(nama ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Pilah baris tempelan terhadap siswa yang sudah ada di kelas (dan terhadap baris tempelan sebelumnya):
 *  - `dilewati`: nama dan NIS sama persis dengan siswa yang sudah ada (atau baris tempelan sebelumnya).
 *    Guru yang menempel ulang daftar tidak bermaksud membuat siswa ganda. Dua baris tanpa NIS dengan nama
 *    sama dianggap identik, sebab tanpa NIS keduanya tidak dapat dibedakan.
 *  - `bentrok`: NIS sama tetapi nama berbeda. Ini kemungkinan salah ketik, jadi tidak boleh dilewati
 *    diam-diam; guru harus memperbaikinya.
 *  - `tambah`: sisanya. Nama sama dengan NIS berbeda tetap ditambahkan (dua siswa dapat senama);
 *    server menambahkan peringatan sendiri untuk kasus itu.
 * NIS dibandingkan persis seperti di server (tanpa mengubah awalan nol).
 */
export function pisahDuplikat(rincian, ada) {
  const pemilikNis = new Map();
  const identik = new Set();
  const tandai = (nama, nis, asal) => {
    if (nis !== '') pemilikNis.set(nis, { nama, asal });
    identik.add(`${kunciNama(nama)}\u0000${nis}`);
  };
  (ada ?? []).forEach((s) => tandai(s.nama, String(s.nis ?? '').trim(), 'daftar'));

  const tambah = [];
  const dilewati = [];
  const bentrok = [];
  (rincian ?? []).forEach((r) => {
    const nis = r.nis ?? '';
    if (identik.has(`${kunciNama(r.nama)}\u0000${nis}`)) { dilewati.push(r); return; }
    if (nis !== '' && pemilikNis.has(nis)) {
      const pemilik = pemilikNis.get(nis);
      bentrok.push({ ...r, dipakaiOleh: pemilik.nama, asal: pemilik.asal });
      return;
    }
    tambah.push(r);
    tandai(r.nama, nis, 'tempelan');
  });
  return { tambah, dilewati, bentrok };
}

/** Bentuk muatan untuk API dari baris rincian: NIS kosong tidak dikirim. */
export const kePayloadSiswa = (daftar) => daftar.map(({ nama, nis }) => (nis ? { nama, nis } : { nama }));

/** Bagi daftar menjadi potongan berukuran paling banyak `ukuran`. */
export function potong(daftar, ukuran) {
  const hasil = [];
  for (let i = 0; i < daftar.length; i += ukuran) hasil.push(daftar.slice(i, i + ukuran));
  return hasil;
}
