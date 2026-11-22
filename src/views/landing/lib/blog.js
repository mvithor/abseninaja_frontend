// Fungsi murni untuk Blog (tanpa React, tanpa impor, tanpa Intl): format tanggal
// dan waktu baca, urutan, penyaringan kategori, pencarian slug, artikel terkait,
// dan daftar isi. Diuji dengan node --test (lib/blog.test.js).
//
// Bentuk artikel: { slug, judul, kategori, tanggal (ISO "YYYY-MM-DD"), menitBaca,
// ringkasan, isi: [blok], utama?, daftarIsi?: [teks] }. Blok:
// { tipe: 'p' | 'h2' | 'kutipan', teks }.

// Pengganti pilihan "semua kategori" di bar tab dan di `saring`. Bukan nama
// kategori mana pun (huruf kecil dengan garis bawah ganda, tidak dipakai artikel).
export const SEMUA_KATEGORI = '__semua__';

// Singkatan bulan sendiri, supaya hasilnya sama di semua peramban dan versi ICU.
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function kabisat(tahun) {
  return (tahun % 4 === 0 && tahun % 100 !== 0) || tahun % 400 === 0;
}

function hariDalamBulan(tahun, bulan) {
  if (bulan === 2) return kabisat(tahun) ? 29 : 28;
  return [4, 6, 9, 11].includes(bulan) ? 30 : 31;
}

// Uraikan "YYYY-MM-DD" yang sah menjadi { tahun, bulan, hari }; selain itu null.
// Hanya bentuk ISO tanggal murni: tanpa jam, tanpa zona waktu, tanpa spasi.
export function uraikanTanggal(iso) {
  if (typeof iso !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const tahun = Number(m[1]);
  const bulan = Number(m[2]);
  const hari = Number(m[3]);
  if (bulan < 1 || bulan > 12 || hari < 1 || hari > hariDalamBulan(tahun, bulan)) return null;
  return { tahun, bulan, hari };
}

// "2026-11-12" -> "12 Nov 2026". Tanggal tidak sah -> "" (tidak melempar galat,
// supaya satu data keliru tidak merobohkan halaman).
export function formatTanggal(iso) {
  const t = uraikanTanggal(iso);
  if (!t) return '';
  return `${t.hari} ${BULAN[t.bulan - 1]} ${t.tahun}`;
}

// 5 -> "5 menit baca". Pecahan dibulatkan, minimal 1. Bukan angka terhingga
// positif -> "".
export function formatMenitBaca(menit) {
  if (typeof menit !== 'number' || !Number.isFinite(menit) || menit <= 0) return '';
  return `${Math.max(1, Math.round(menit))} menit baca`;
}

// Urutan terbaru dulu. Tanggal sama mempertahankan urutan asli (stabil, dijamin
// lewat indeks, bukan bergantung pada mesin). Tanggal tidak sah di akhir.
export function urutkanTerbaru(artikel) {
  if (!Array.isArray(artikel)) return [];
  return artikel
    .map((a, i) => ({ a, i, t: uraikanTanggal(a?.tanggal) ? a.tanggal : '' }))
    .sort((x, y) => {
      if (x.t === y.t) return x.i - y.i;
      if (x.t === '') return 1;
      if (y.t === '') return -1;
      return x.t < y.t ? 1 : -1;
    })
    .map((x) => x.a);
}

// Kategori yang punya artikel. Urutan: yang ada di `urutan` dulu (sesuai urutan
// itu), lalu sisanya menurut kemunculan pertama di `artikel`.
export function daftarKategori(artikel, urutan = []) {
  if (!Array.isArray(artikel)) return [];
  const ada = [];
  artikel.forEach((a) => {
    if (typeof a?.kategori === 'string' && a.kategori && !ada.includes(a.kategori)) ada.push(a.kategori);
  });
  const dulu = (Array.isArray(urutan) ? urutan : []).filter((k, i, s) => ada.includes(k) && s.indexOf(k) === i);
  return [...dulu, ...ada.filter((k) => !dulu.includes(k))];
}

// [{ kategori, jumlah }] dalam urutan daftarKategori. Menghitung semua artikel
// yang diberikan.
export function hitungPerKategori(artikel, urutan = []) {
  return daftarKategori(artikel, urutan).map((kategori) => ({
    kategori,
    jumlah: artikel.filter((a) => a?.kategori === kategori).length,
  }));
}

// Artikel menurut kategori (terbaru dulu). Tanpa kategori atau SEMUA_KATEGORI =
// semua artikel. Kategori yang tidak dikenal = daftar kosong.
export function saring(artikel, kategori) {
  const urut = urutkanTerbaru(artikel);
  if (kategori === undefined || kategori === null || kategori === SEMUA_KATEGORI) return urut;
  return urut.filter((a) => a?.kategori === kategori);
}

// Artikel dengan slug persis sama (huruf besar kecil dibedakan); tidak ada -> null.
export function cariBySlug(artikel, slug) {
  if (!Array.isArray(artikel) || typeof slug !== 'string' || slug === '') return null;
  return artikel.find((a) => a?.slug === slug) ?? null;
}

// Artikel utama: yang bertanda `utama: true` (pertama), bila tidak ada artikel
// terbaru. Daftar kosong -> null.
export function artikelUtama(artikel) {
  if (!Array.isArray(artikel) || artikel.length === 0) return null;
  return artikel.find((a) => a?.utama === true) ?? urutkanTerbaru(artikel)[0] ?? null;
}

// Hingga `n` artikel terkait untuk `slug`: sekategori dulu (terbaru dulu), lalu
// kategori lain (terbaru dulu), tanpa artikelnya sendiri. Slug tidak dikenal atau
// n bukan bilangan bulat positif -> [].
export function artikelTerkait(artikel, slug, n = 3) {
  const ini = cariBySlug(artikel, slug);
  if (!ini || !Number.isInteger(n) || n <= 0) return [];
  // Butir bukan objek (null, teks, angka) dibuang lebih dulu.
  const lain = urutkanTerbaru(artikel).filter((a) => a !== null && typeof a === 'object' && a.slug !== slug);
  const sekategori = lain.filter((a) => a.kategori === ini.kategori);
  const sisanya = lain.filter((a) => a.kategori !== ini.kategori);
  return [...sekategori, ...sisanya].slice(0, n);
}

// Id jangkar untuk judul bagian ke-`indeks` (mulai 0): "bagian-1", "bagian-2", ...
export function idBagian(indeks) {
  return `bagian-${indeks + 1}`;
}

const TIPE_BLOK = ['p', 'h2', 'kutipan'];

// Blok isi yang sah, tipe tak dikenal dan teks kosong dibuang. Judul bagian (h2)
// diberi `id` berurutan lewat idBagian. Bukan array -> [].
export function blokBernomor(isi) {
  if (!Array.isArray(isi)) return [];
  let h2 = 0;
  return isi
    .filter((b) => b && TIPE_BLOK.includes(b.tipe) && typeof b.teks === 'string' && b.teks.trim() !== '')
    .map((b) => {
      if (b.tipe !== 'h2') return { tipe: b.tipe, teks: b.teks };
      const id = idBagian(h2);
      h2 += 1;
      return { tipe: 'h2', teks: b.teks, id };
    });
}

// Daftar isi sisi samping: [{ teks, id }]. Bila artikel punya `daftarIsi` eksplisit
// (daftar teks, minimal satu butir tidak kosong), itu dipakai dan `id` null (butirnya tidak harus sama dengan judul
// bagian, jadi tidak menaut). Selain itu diturunkan dari blok h2, dengan `id`
// yang sama dengan id judul di isi artikel.
export function daftarIsi(artikel) {
  if (!artikel) return [];
  if (Array.isArray(artikel.daftarIsi)) {
    const eksplisit = artikel.daftarIsi.filter((t) => typeof t === 'string' && t.trim() !== '');
    // Eksplisit yang setelah disaring kosong jatuh ke turunan dari judul bagian.
    if (eksplisit.length > 0) return eksplisit.map((teks) => ({ teks, id: null }));
  }
  return blokBernomor(artikel.isi)
    .filter((b) => b.tipe === 'h2')
    .map((b) => ({ teks: b.teks, id: b.id }));
}

// Gabungkan path dasar dan satu segmen: ("/blog", "judul-a") -> "/blog/judul-a".
// Segmen di-encode; garis miring akhir pada dasar dibuang.
export function gabungPath(dasar, segmen) {
  return `${String(dasar).replace(/\/+$/, '')}/${encodeURIComponent(String(segmen))}`;
}

// Artikel yang tampil di kisi daftar: semua kecuali artikel utama (yang tampil di
// kartu sendiri). Kategori tab, hitungan tab, hitungan "N artikel", dan hitungan
// "Kategori artikel" di bilah samping SEMUA diturunkan dari daftar ini, jadi angka
// dan kartu yang tampil selalu sama dan kategori yang hanya berisi artikel utama
// tidak punya tab kosong.
export function artikelKisi(artikel) {
  if (!Array.isArray(artikel)) return [];
  const utama = artikelUtama(artikel);
  return artikel.filter((a) => a !== utama);
}

// Id tab kategori berbasis indeks (aman untuk atribut id dan aria-labelledby walau
// nama kategori berspasi atau berhuruf aneh): "semua", "kategori-0", "kategori-1".
export const ID_TAB_SEMUA = 'semua';
export function idTabKategori(indeks) {
  return `kategori-${indeks}`;
}

// Daftar tab untuk bar tab: Semua di depan, lalu satu tab per kategori, masing-masing
// { id, label, kategori } ("kategori" = nilai untuk saring).
export function buatTabKategori(kategori, labelSemua) {
  return [
    { id: ID_TAB_SEMUA, label: labelSemua, kategori: SEMUA_KATEGORI },
    ...kategori.map((k, i) => ({ id: idTabKategori(i), label: k, kategori: k })),
  ];
}
