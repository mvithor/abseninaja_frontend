// Gerbang rilis halaman Analitik Pembelajaran (LAD). Berkas ini sengaja kecil
// dan tanpa impor: routes.jsx (chunk entry aplikasi) dan data/nav.js sama-sama
// membacanya, jadi tokens.js dan bagian lain landing tidak ikut terseret ke
// chunk entry. Inilah satu-satunya sumber bendera (tidak ada salinan di
// theme/tokens.js flags).
//
// Aturan: halaman /analitik-pembelajaran TIDAK boleh tampil di produksi sebelum
// LAD dirilis ke `main`.
//  - Bendera mati (bawaan di produksi): rute tidak didaftarkan (404), kode
//    halamannya tidak ikut build, dan REGISTRI_RUTE.analitik.tersedia bernilai
//    false sehingga menu, bar tab, footer, dan tombol "Lihat ... analitik"
//    tampil sebagai teks nonaktif.
//  - Bendera menyala: rute terdaftar dan tersedia bernilai true.
//
// Cara menyalakan: saat build produksi setelah LAD rilis, setel
// VITE_LANDING_LAD_AKTIF=true di lingkungan build (Netlify). Di DEV (npm run
// dev) bendera selalu menyala untuk pratinjau.
// Nilai dibaca statis oleh Vite: bila tidak menyala, cabang kode terkait dibuang
// dari bundel produksi.
export const LAD_DIRILIS = import.meta.env.DEV || import.meta.env.VITE_LANDING_LAD_AKTIF === 'true';

// Gerbang rilis lima halaman Bukti (F5): Dampak, Testimoni, Sekolah Mitra,
// Keamanan Data, dan Legalitas (/bukti/*). Seluruh isinya masih DUMMY dari
// desain (angka, nama sekolah, nama orang, penghargaan, nomor dokumen), jadi
// halaman ini TIDAK boleh tampil di produksi sebelum data nyata dan izin
// tertulis (sekolah, narasumber, dokumen) ada.
//  - Bendera mati (bawaan di produksi): kelima rute tidak didaftarkan (404),
//    kode halaman dan datanya tidak ikut build, dan
//    REGISTRI_RUTE.dampak/testimoni/sekolahMitra/keamananData/legalitas
//    `tersedia` bernilai false sehingga menu Bukti (header dan lembar Lainnya),
//    footer, dan tombol "Lihat ..." tampil nonaktif.
//  - Bendera menyala: kelima rute terdaftar dan `tersedia` bernilai true.
//
// Cara menyalakan: setelah data dan izin lengkap (dan semua penanda
// `// DUMMY wajib diganti sebelum main` di data/*.js beres), setel
// VITE_LANDING_BUKTI_AKTIF=true di lingkungan build (Netlify). Di DEV bendera
// selalu menyala untuk pratinjau.
export const BUKTI_DIRILIS = import.meta.env.DEV || import.meta.env.VITE_LANDING_BUKTI_AKTIF === 'true';
