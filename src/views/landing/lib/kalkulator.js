// Logika murni Kalkulator Digitalisasi (tanpa React, tanpa impor, tanpa efek
// samping): skor, tingkat, penerapan jawaban, dan mesin keadaan (intro, soal,
// hasil). Diuji dengan node --test (lib/kalkulator.test.js). Pertanyaan, pilihan,
// ambang, dan teks ada di data/kalkulator.js; fungsi di sini menerimanya sebagai
// argumen.
//
// RUMUS CONTOH (belum ditetapkan tim): skor = jumlah nilai jawaban dibagi
// (NILAI_MAKS x jumlah soal), dibulatkan ke persen. Soal yang belum dijawab
// dihitung 0 tetapi `lengkap` bernilai false.
//
// PRIVASI: jawaban hanya hidup di memori komponen. Tidak ada yang dikirim,
// disimpan, atau dicatat; berkas ini tidak punya akses jaringan atau penyimpanan.

// Nilai tertinggi per soal ("Sudah berjalan" = 2). Nilai terendah 0.
export const NILAI_MAKS = 2;

// Id tingkat dari rendah ke tinggi.
export const ID_TINGKAT = ['awal', 'berkembang', 'terintegrasi'];

function nilaiSah(n) {
  return Number.isInteger(n) && n >= 0 && n <= NILAI_MAKS;
}

function jumlahSoalSah(n) {
  return Number.isInteger(n) && n > 0;
}

// Satu angka sah menjadi 0 bila -0 (supaya perbandingan ketat konsisten).
function normal(n) {
  return n === 0 ? 0 : n;
}

// Larik jawaban kosong: `jumlahSoal` butir null. Jumlah tidak sah -> [].
export function buatJawabanKosong(jumlahSoal) {
  return jumlahSoalSah(jumlahSoal) ? Array(jumlahSoal).fill(null) : [];
}

// { persen (0 sampai 100, bilangan bulat), total, terjawab, lengkap }.
// Hanya `jumlahSoal` butir pertama yang dihitung. Butir yang bukan bilangan bulat
// 0 sampai NILAI_MAKS (NaN, teks, null, undefined, negatif, lebih dari NILAI_MAKS,
// pecahan) dihitung 0 dan tidak dihitung sebagai terjawab. Masukan bukan larik
// atau jumlahSoal tidak sah -> semua 0 dan lengkap false. Persen tidak pernah di
// luar 0 sampai 100.
export function hitungSkor(jawaban, jumlahSoal) {
  if (!jumlahSoalSah(jumlahSoal)) return { persen: 0, total: 0, terjawab: 0, lengkap: false };
  const larik = Array.isArray(jawaban) ? jawaban : [];
  let total = 0;
  let terjawab = 0;
  for (let i = 0; i < jumlahSoal; i += 1) {
    const n = larik[i];
    if (nilaiSah(n)) {
      total += n;
      terjawab += 1;
    }
  }
  // Satu pembagian dari bilangan bulat: total * 100 dan pembagi bulat membuat
  // pembulatan tepat di .5 (membagi dulu lalu mengali 100 menggeser 23/40 menjadi
  // 57,4999... dan menampilkan 57, bukan 58).
  const mentah = Math.round((total * 100) / (NILAI_MAKS * jumlahSoal));
  const persen = Math.min(100, Math.max(0, mentah));
  return { persen, total, terjawab, lengkap: terjawab === jumlahSoal };
}

// Semua soal terjawab dengan nilai sah?
export function adaJawabanLengkap(jawaban, jumlahSoal) {
  return hitungSkor(jawaban, jumlahSoal).lengkap;
}

// Id tingkat untuk persen. `ambang` = { berkembang, terintegrasi }: persen di
// bawah `berkembang` -> 'awal'; dari `berkembang` sampai di bawah `terintegrasi`
// -> 'berkembang'; dari `terintegrasi` ke atas -> 'terintegrasi' (batas bawah
// inklusif).
// ATURAN PRODUK: ambang dibandingkan dengan persen BULAT, yaitu angka yang tampil
// ke pengguna. Persen pecahan dibulatkan lebih dulu (34,5 menjadi 35), sehingga
// angka di layar dan nama tingkat tidak pernah saling bertentangan (skor 35 tidak
// mungkin berlabel "Tahap awal"). Contoh: 13 soal dengan total 9 = 34,6 persen
// mentah, tampil 35, tingkat "Berkembang".
// Persen bukan angka (NaN, teks, null) dihitung 0; di luar 0 sampai 100 dijepit.
// Ambang tidak sah adalah galat pemrograman dan melempar TypeError.
export function tingkat(persen, ambang) {
  const a = ambang;
  if (
    !a ||
    typeof a.berkembang !== 'number' ||
    typeof a.terintegrasi !== 'number' ||
    Number.isNaN(a.berkembang) ||
    Number.isNaN(a.terintegrasi) ||
    !(a.berkembang < a.terintegrasi)
  ) {
    throw new TypeError('ambang harus { berkembang, terintegrasi } dengan berkembang < terintegrasi');
  }
  const p = typeof persen === 'number' && !Number.isNaN(persen) ? Math.round(Math.min(100, Math.max(0, persen))) : 0;
  if (p < a.berkembang) return ID_TINGKAT[0];
  if (p < a.terintegrasi) return ID_TINGKAT[1];
  return ID_TINGKAT[2];
}

// Jawaban baru dengan soal ke-`indeks` (mulai 0) bernilai `nilai`. Tidak mengubah
// larik asli. Indeks bukan bilangan bulat di dalam 0 sampai jumlahSoal-1, atau
// nilai bukan bilangan bulat 0 sampai NILAI_MAKS, DITOLAK: larik asli yang sama
// dikembalikan (rujukan sama, jadi pemanggil bisa membandingkan dengan ===).
// Masukan bukan larik dengan indeks dan nilai sah mulai dari larik kosong.
export function terapkanJawaban(jawaban, indeks, nilai, jumlahSoal) {
  if (!jumlahSoalSah(jumlahSoal) || !Number.isInteger(indeks) || indeks < 0 || indeks >= jumlahSoal || !nilaiSah(nilai)) {
    return jawaban;
  }
  const dasar = Array.isArray(jawaban) ? jawaban : buatJawabanKosong(jumlahSoal);
  const baru = Array.from({ length: jumlahSoal }, (_, i) => (nilaiSah(dasar[i]) ? normal(dasar[i]) : null));
  baru[indeks] = normal(nilai);
  return baru;
}

// Terbilang untuk 0 sampai 10 ("tujuh"); selain itu angka biasa; bukan bilangan
// bulat tidak negatif -> "". Dipakai supaya teks ("Jawab tujuh pertanyaan") ikut
// jumlah soal di data.
const KATA = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh'];
export function terbilang(n) {
  if (!Number.isInteger(n) || n < 0) return '';
  return n < KATA.length ? KATA[n] : String(n);
}

// ---- Mesin keadaan ---------------------------------------------------------
// Keadaan: { langkah, jawaban, bergerak }.
//  langkah 0 = intro, 1 sampai jumlahSoal = soal ke-langkah, jumlahSoal+1 = hasil.
//  bergerak = sudah pernah pindah langkah (UI memakainya agar fokus dan
//  pengumuman tidak muncul saat halaman baru dimuat).

export function langkahHasil(jumlahSoal) {
  return jumlahSoal + 1;
}

export function keadaanAwal(jumlahSoal) {
  return { langkah: 0, jawaban: buatJawabanKosong(jumlahSoal), bergerak: false };
}

// Aksi:
//  { type: 'mulai' }          intro -> soal 1 (jawaban dipertahankan)
//  { type: 'jawab', nilai }   simpan jawaban soal sekarang lalu maju (soal terakhir -> hasil)
//  { type: 'kembali' }        soal N -> soal N-1, soal 1 -> intro (jawaban dipertahankan)
//  { type: 'ulangi' }         ke intro dengan jawaban kosong
//  { type: 'muat', langkah, jawaban }  pratinjau DEV: loncat ke keadaan tertentu.
//     Langkah harus bilangan bulat 0 sampai jumlahSoal+1 (selain itu ditolak).
//     Jawaban hanya diambil dari aksi (bukan larik atau butir tidak sah menjadi
//     null); jawaban keadaan lama tidak ikut, termasuk saat memuat langkah 0.
// Aksi yang tidak berlaku pada langkah sekarang, atau berisi nilai tidak sah,
// mengembalikan keadaan yang sama (rujukan sama).
export function reduksi(keadaan, aksi, jumlahSoal) {
  // Jumlah soal bukan bilangan bulat >= 1: tidak ada mesin keadaan yang sah, jadi
  // tidak ada yang berubah. Keadaan rusak (bukan objek, langkah atau jawaban tidak
  // sah) dipulihkan ke keadaan awal.
  if (!jumlahSoalSah(jumlahSoal)) return keadaan;
  if (!keadaan || typeof keadaan !== 'object' || !Number.isInteger(keadaan.langkah) || !Array.isArray(keadaan.jawaban)) {
    return keadaanAwal(jumlahSoal);
  }
  const { langkah, jawaban } = keadaan;
  const hasil = langkahHasil(jumlahSoal);
  switch (aksi?.type) {
    case 'mulai':
      return langkah === 0 ? { langkah: 1, jawaban, bergerak: true } : keadaan;
    case 'jawab': {
      if (langkah < 1 || langkah > jumlahSoal) return keadaan;
      const baru = terapkanJawaban(jawaban, langkah - 1, aksi.nilai, jumlahSoal);
      if (baru === jawaban) return keadaan;
      return { langkah: langkah + 1, jawaban: baru, bergerak: true };
    }
    case 'kembali':
      return langkah >= 1 && langkah <= jumlahSoal ? { langkah: langkah - 1, jawaban, bergerak: true } : keadaan;
    case 'ulangi':
      return { langkah: 0, jawaban: buatJawabanKosong(jumlahSoal), bergerak: true };
    case 'muat': {
      if (!Number.isInteger(aksi.langkah) || aksi.langkah < 0 || aksi.langkah > hasil) return keadaan;
      let baru = buatJawabanKosong(jumlahSoal);
      (Array.isArray(aksi.jawaban) ? aksi.jawaban : []).forEach((n, i) => {
        baru = terapkanJawaban(baru, i, n, jumlahSoal);
      });
      return { langkah: aksi.langkah, jawaban: baru, bergerak: true };
    }
    default:
      return keadaan;
  }
}

// ---- Jeda penolakan setelah pergantian soal ---------------------------------
// Dua klik atau ketukan cepat pada satu posisi layar menjawab DUA soal: klik
// pertama memilih opsi dan memajukan soal, klik kedua jatuh pada opsi di posisi
// yang sama di soal berikutnya. Karena itu jawaban diabaikan bila datang kurang
// dari JEDA_JAWAB_MS sejak soal dipasang. Berlaku untuk klik, ketuk, dan Enter
// atau Spasi berulang. Tombol TIDAK dinonaktifkan (pembaca layar tetap melihatnya
// aktif); aksinya saja yang diabaikan. Pengguna yang membaca soal lebih dari
// sepertiga detik tidak terpengaruh.
export const JEDA_JAWAB_MS = 350;

// Bolehkah jawaban diterima? `sekarang` dan `waktuGanti` dalam milidetik dari jam
// yang sama (disarankan performance.now()). Masukan bukan angka terhingga (waktu
// pasang belum tercatat) atau selisih negatif (jam bergeser) tidak pernah menahan
// pengguna: dijawab true. Selisih persis sama dengan jeda diterima.
export function bolehMenjawab(sekarang, waktuGanti, jeda = JEDA_JAWAB_MS) {
  if (!Number.isFinite(sekarang) || !Number.isFinite(waktuGanti) || !Number.isFinite(jeda)) return true;
  const selisih = sekarang - waktuGanti;
  if (selisih < 0) return true;
  return selisih >= jeda;
}
