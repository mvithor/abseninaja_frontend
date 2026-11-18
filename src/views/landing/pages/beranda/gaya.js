// Nilai gaya khusus Beranda yang berbeda dari bawaan Seksi dan JudulSeksi
// (diambil dari Beranda-v3.dc.html: .sec 88 px, .h2 38 px, jarak isi).

// Padding atas dan bawah seksi: 88 px di web, setengahnya di seluler.
export const PAD_SEKSI = { xs: '44px', md: '88px' };

// Judul bagian (h2) 38 px dari md; di bawahnya memakai skala token.
export const sxJudulBeranda = { '& > h2': { fontSize: { md: '38px' } } };

// Jarak antara judul bagian dan isi (margin-top isi). Seluler memakai nilai
// yang sama dengan web, sesuai desain seluler.
export const JARAK = { sebelumSesudah: '64px', fitur: '56px', untukSekolah: '56px', pendampingan: '44px', faq: '52px' };
