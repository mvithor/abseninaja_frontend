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

// Gerbang rilis tiga halaman Perusahaan (F6): Tentang Kami (/tentang-kami),
// Kerja Sama (/kerja-sama), dan Afiliator (/afiliator). Isinya masih DUMMY dari
// desain (nama pendiri, linimasa, alamat, imbalan afiliator "contoh 10%", klaim
// "pantau lewat dasbor" padahal dasbor afiliator belum ada), dan program
// afiliator belum ada sebagai produk. Halaman ini TIDAK boleh tampil di produksi
// sebelum data nyata dan keputusan programnya ada.
//  - Bendera mati (bawaan di produksi): ketiga rute tidak didaftarkan (404),
//    kode halaman dan datanya tidak ikut build, dan
//    REGISTRI_RUTE.tentangKami/kerjaSama/afiliator `tersedia` bernilai false
//    sehingga menu (header dan lembar Lainnya), footer, kartu afiliator footer,
//    dan tombol "Daftar Afiliator" tampil nonaktif.
//  - Bendera menyala: ketiga rute terdaftar dan `tersedia` bernilai true.
//
// Daftar periksa sebelum menyalakan (semua wajib beres):
//  1. Endpoint formulir (VITE_LANDING_FORM_URL, lihat lib/kirimFormulir.js) menerima
//     jenis `kerjaSama` dan `afiliator`, selain `demo` dan `guru`.
//  2. Server menangani kolom `kontak` pada jenis kerjaSama: isinya campuran email
//     (huruf kecil) dan nomor `628...`; server membedakannya dari tanda "@".
//  3. Server menetralkan sel berawalan rumus (`=`, `+`, `-`, `@`) bila isian ditulis
//     ke lembar kerja atau CSV (klien hanya membersihkan, tidak menetralkan rumus).
//  4. Server menyelaraskan batas karakter dengan klien: batas dihitung dalam satuan
//     UTF-16 (`String.length`), mis. pesan kerja sama 1000, email 254; baris baru
//     dalam pesan dikirim sebagai `\n`.
//  5. Semua dummy diganti dengan data nyata: nama pendiri, inisial "NP", kutipan,
//     cerita pendiri, seluruh linimasa, alamat dan kontak resmi (data/kontak.js,
//     KONTAK_RESMI true), "Contoh besaran 10%", "Pantau lewat dasbor" (dasbor
//     afiliator harus ada), bahan promosi, aturan dan tanya jawab afiliator, dan
//     kalimat privasi (tinjauan hukum UU PDP). Semua penanda
//     `// DUMMY wajib diganti sebelum main` di data/tentangKami.js, kerjaSama.js,
//     afiliator.js, dan kontak.js beres.
//
// Cara menyalakan: setelah daftar di atas beres, setel
// VITE_LANDING_PERUSAHAAN_AKTIF=true di lingkungan build (Netlify). Di DEV bendera
// selalu menyala untuk pratinjau.
export const PERUSAHAAN_DIRILIS = import.meta.env.DEV || import.meta.env.VITE_LANDING_PERUSAHAAN_AKTIF === 'true';
