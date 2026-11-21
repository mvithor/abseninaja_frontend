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
