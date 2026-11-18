// Hitung sisa waktu murni (tanpa React, tanpa Date.now) untuk kartu promo.
// Diuji dengan node --test.

const MENIT = 60 * 1000;
const JAM = 60 * MENIT;
const HARI = 24 * JAM;

// hitungSisa(sekarangMs, akhirMs) -> { berakhir, hari, jam, menit }
//  - dua argumen berupa milidetik epoch (angka);
//  - `berakhir` true bila akhir sudah tercapai atau lewat (sisa <= 0) atau
//    masukan bukan angka terhingga; angka lain lalu 0;
//  - sisa dibulatkan ke bawah ke menit penuh: sisa 59 detik tampil 0 hari
//    0 jam 0 menit, tetapi belum berakhir.
export function hitungSisa(sekarangMs, akhirMs) {
  if (!Number.isFinite(sekarangMs) || !Number.isFinite(akhirMs)) {
    return { berakhir: true, hari: 0, jam: 0, menit: 0 };
  }
  const sisa = akhirMs - sekarangMs;
  if (sisa <= 0) return { berakhir: true, hari: 0, jam: 0, menit: 0 };
  return {
    berakhir: false,
    hari: Math.floor(sisa / HARI),
    jam: Math.floor((sisa % HARI) / JAM),
    menit: Math.floor((sisa % JAM) / MENIT),
  };
}

// Dua digit minimal ("08"); lebih dari 99 tetap utuh.
export function duaDigit(angka) {
  return String(Math.max(0, Math.trunc(angka))).padStart(2, '0');
}
