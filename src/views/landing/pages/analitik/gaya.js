// Nilai gaya bersama seksi halaman Analitik (dari LAD.dc.html).

// Sasaran jangkar: ruang napas kecil saat gulir ke bagian lewat tautan hash.
// Tidak ada bar menempel di atas, jadi tidak perlu offset besar.
export const sxJangkar = { scrollMarginTop: '16px' };

// Subjudul bagian di desain LAD: 16 px (seluler 15). Skala subjudul bawaan
// JudulSeksi 17 px (F1 dan F2), jadi di sini diturunkan satu langkah.
export const sxSubLad = { '& > h2 + p': { fontSize: { xs: '15px', md: '16px' } } };

// Jarak judul bagian ke isi (margin-top isi), sama di web dan seluler.
export const JARAK_ISI = '48px';

// Lebar layar tempat navigasi jangkar berupa rel di tepi kanan (di bawahnya
// tombol bulat dengan panel). Hanya satu yang tampil; yang lain display none
// sehingga tidak terbaca pembaca layar.
export const MQ_REL = '@media (min-width:1280px)';
