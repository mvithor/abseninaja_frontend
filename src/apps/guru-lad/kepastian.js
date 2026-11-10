// Kejujuran pesan gagal simpan. Server menyimpan nilai, kehadiran, dan nilai proyek dalam SATU transaksi per
// permintaan (semua atau tidak sama sekali) dan idempoten: menyimpan ulang isian yang sama tidak mengubah apa pun.
// Karena itu ada dua kemungkinan saat simpan gagal, dan guru berhak diberi tahu yang mana:
//
//  PASTI_GAGAL : server menjawab dan menolak (galat isian 4xx, atau galat server 500 yang membatalkan transaksi).
//                Isian belum tersimpan.
//  TIDAK_PASTI : tidak ada jawaban (jaringan putus, batas waktu 60 detik) atau perantara menjawab 408/502/503/504.
//                Permintaan mungkin sudah sampai dan tersimpan, hanya jawabannya yang tidak kembali.
//
// File ini sengaja tanpa impor (tidak memuat axios) supaya bisa diuji langsung dengan node:test.

export const KEPASTIAN = Object.freeze({ PASTI_GAGAL: 'PASTI_GAGAL', TIDAK_PASTI: 'TIDAK_PASTI' });

const STATUS_PERANTARA = new Set([408, 502, 503, 504]);

const galatJaringan = (error) => error?.isAxiosError === true
  || error?.code === 'ECONNABORTED'
  || (typeof error?.code === 'string' && error.code.startsWith('ERR_'));

/** @returns {'PASTI_GAGAL'|'TIDAK_PASTI'} */
export function kepastianSimpan(error) {
  if (error?.response) {
    return STATUS_PERANTARA.has(error.response.status) ? KEPASTIAN.TIDAK_PASTI : KEPASTIAN.PASTI_GAGAL;
  }
  // Tanpa jawaban: hanya galat jaringan yang tidak pasti. Galat program (bukan axios) berarti tidak ada yang terkirim.
  return galatJaringan(error) ? KEPASTIAN.TIDAK_PASTI : KEPASTIAN.PASTI_GAGAL;
}

/** Kalimat untuk keadaan tidak pasti. `objek`: "nilai", "kehadiran", dst. Tanpa kata Anda. */
export const teksTidakPasti = (objek) => (
  `Koneksi terputus atau terlalu lama, jadi belum pasti apakah ${objek} sudah tersimpan. `
  + 'Isian tetap ada di layar. Menyimpan ulang aman dan tidak membuat data ganda.'
);

/**
 * Pesan untuk panel. Keadaan tidak pasti memakai severity `warning`: pesan sukses dan galat hilang sendiri, sedangkan
 * peringatan tetap tampil sampai dibaca atau ditutup. Keadaan pasti gagal memakai `teksPasti` yang sudah disusun
 * pemanggil dari respons server (daftar galat per kolom dan sebagainya).
 */
export function pesanSimpanGagal(error, { teksPasti, objek }) {
  if (kepastianSimpan(error) === KEPASTIAN.TIDAK_PASTI) {
    return { jenis: 'warning', teks: teksTidakPasti(objek), tidakPasti: true };
  }
  return { jenis: 'error', teks: teksPasti };
}
