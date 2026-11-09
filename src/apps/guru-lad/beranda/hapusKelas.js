// Penyusun teks dialog "Hapus kelas" dan label pola di tabel Kelas Saya. Fungsi murni tanpa impor selain modul murni
// lain (lihat hapusKelas.test.js), supaya dapat diuji dengan `node --test` tanpa Vite.
//
// Semua ANGKA berasal dari server: DELETE /lad/kelas/:id tanpa ?konfirmasi=hapus selalu dibalas 409 beserta
// `isian_terhapus` (pratinjau tanpa menghapus). Berkas ini hanya menyusun kalimatnya.

import { URUTAN_PRIORITAS, POLA_INFO } from '../evaluasi/penjelasan.js';

const n = (x) => Number(x) || 0;

/**
 * Baris "Yang ikut terhapus dari kelas ini", menurut urutan di desain. Baris yang semua angkanya 0 dibuang.
 * Nilai proyek tidak punya baris sendiri: ia ikut disebut lewat "proyek beserta nilainya".
 * Keputusan saran tindak lanjut tidak ada di desain awal tetapi ikut terhapus di server, jadi disebut bila ada.
 */
export function barisIsian(isian) {
  const i = isian ?? {};
  const baris = [
    { kunci: 'siswa', ada: n(i.siswa) > 0, teks: `${n(i.siswa)} murid` },
    { kunci: 'struktur', ada: n(i.lingkup_materi) + n(i.tp) > 0, teks: `${n(i.lingkup_materi)} lingkup materi dan ${n(i.tp)} TP` },
    { kunci: 'nilai_tp', ada: n(i.nilai_tp) > 0, teks: `${n(i.nilai_tp)} nilai TP` },
    { kunci: 'proyek', ada: n(i.proyek) + n(i.nilai_proyek) > 0, teks: `${n(i.proyek)} proyek beserta nilainya` },
    { kunci: 'kehadiran', ada: n(i.pertemuan) + n(i.kehadiran) > 0, teks: `${n(i.pertemuan)} pertemuan dan ${n(i.kehadiran)} catatan kehadiran` },
    { kunci: 'remedial', ada: n(i.remedial) > 0, teks: `${n(i.remedial)} catatan remedial` },
    { kunci: 'saran', ada: n(i.keputusan_saran) > 0, teks: `${n(i.keputusan_saran)} keputusan saran tindak lanjut` },
  ];
  return baris.filter((b) => b.ada).map(({ kunci, teks }) => ({ kunci, teks }));
}

/** Nama kelas yang diketik cocok dengan nama kelas: spasi di tepi dan huruf besar-kecil tidak dipersoalkan. */
export function namaCocok(diketik, namaKelas) {
  const a = String(diketik ?? '').trim().toLowerCase();
  const b = String(namaKelas ?? '').trim().toLowerCase();
  return a.length > 0 && a === b;
}

/** Judul dialog: "Hapus kelas 8A · Bahasa Arab?". */
export const judulHapusKelas = (k) => `Hapus kelas ${k.nama_kelas} · ${k.mapel}?`;

/** Kalimat sukses setelah kelas terhapus: "Kelas 8A · Bahasa Arab dihapus." */
export const pesanKelasDihapus = (k) => `Kelas ${k.nama_kelas} · ${k.mapel} dihapus.`;

/**
 * Galat 404 saat menghapus berarti server tidak menemukan kelas itu: terhapus dari tab lain, atau permintaan
 * sebelumnya sampai ke server tetapi balasannya hilang. Tampilan TIDAK boleh menyebutnya "berhasil dihapus":
 * 404 juga muncul bila server belum memuat rute hapus kelas. Ia hanya memperbarui daftar dan memberi tahu guru.
 */
export const kelasTidakDitemukan = (error) => error?.response?.status === 404;

export const pesanKelasTidakDitemukan = (k) => `Kelas ${k.nama_kelas} · ${k.mapel} tidak ditemukan di server. Daftar kelas sudah diperbarui.`;

// Nama pola yang dipendekkan untuk kolom "Pola yang muncul" di Beranda. Tab Perlu Perhatian tetap memakai nama penuh
// (POLA_INFO), karena di sana ada ruang dan pembaca memerlukan arti lengkapnya.
const NAMA_POLA_BERANDA = Object.freeze({
  P1: 'Kesulitan pada TP',
  P3: 'Proyek tidak dikumpulkan',
});

/**
 * Isi kolom "Pola yang muncul": satu entri per pola yang jumlah siswa utamanya lebih dari 0, menurut urutan
 * prioritas tampilan. Hanya pola jenis perhatian yang dihitung (pengayaan bukan peringatan), sama dengan
 * kartu "Perlu perhatian" di sebelahnya, sehingga jumlah semua chip sama dengan angka perhatian kelas.
 */
export function polaMuncul(kartu) {
  const per = kartu?.perhatian_per_pola_utama ?? {};
  return URUTAN_PRIORITAS
    .filter((kode) => POLA_INFO[kode].jenis === 'perhatian' && n(per[kode]) > 0)
    .map((kode) => ({ kode, teks: NAMA_POLA_BERANDA[kode] ?? POLA_INFO[kode].judul, jumlah: n(per[kode]) }));
}
