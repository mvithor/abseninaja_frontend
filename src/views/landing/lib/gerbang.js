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

// Gerbang rilis dua alat konten (F7): Blog (/blog dan /blog/:slug) dan Kalkulator
// Digitalisasi (/kalkulator). Keduanya satu bendera karena sama-sama masih berisi
// konten CONTOH dari desain: tujuh artikel dummy (judul, isi, penulis) dan
// kalkulator dengan pertanyaan, rumus skor, ambang, dan teks saran contoh.
//  - Bendera mati (bawaan di produksi): ketiga rute tidak didaftarkan (404),
//    kode halaman dan datanya tidak ikut build, dan REGISTRI_RUTE.blog dan
//    REGISTRI_RUTE.kalkulator `tersedia` bernilai false sehingga menu Blog
//    (header dan lembar Lainnya), kolom Perusahaan footer, dan butir "Kalkulator
//    Digitalisasi" di lembar Lainnya tampil nonaktif. Tidak ada tautan hidup ke
//    rute yang 404.
//  - Bendera menyala: ketiga rute terdaftar dan `tersedia` bernilai true.
//
// Daftar periksa sebelum menyalakan (semua wajib beres):
//  1. Artikel nyata menggantikan dummy di data/blog.js (judul, ringkasan, isi,
//     tanggal, menit baca, kategori, daftar isi). Jumlah artikel dan hitungan
//     kategori sudah diturunkan dari data, tidak ada angka yang perlu diganti.
//  2. Nama penulis ("Tim Absenin Aja") dan inisial avatar ("SR") adalah dummy;
//     ganti dengan penulis sebenarnya atau hapus avatar.
//  3. Pertanyaan, pilihan jawaban, rumus skor (jumlah nilai dibagi dua kali
//     jumlah soal), ambang tingkat (35 dan 70), dan tiga teks saran di
//     data/kalkulator.js masih CONTOH. Tim menetapkan versi sebenarnya, lalu
//     perbarui lib/kalkulator.test.js bila rumus berubah.
//  4. Klaim "Skor menunjukkan tahap digitalisasi sekolah" dan "Saran modul yang
//     paling relevan" ditinjau: hasilnya bukan penilaian resmi.
//  5. Semua penanda `// DUMMY wajib diganti sebelum main` di data/blog.js dan
//     data/kalkulator.js beres (lib/blog.test.js menjaga penanda itu masih ada
//     selama datanya dummy; hapus tes itu bersama penandanya).
//  6. Empat kartu kategori di hero Blog ("Panduan", "Tips sekolah", "Kabar
//     produk", "Cerita mitra") tidak sama dengan kategori artikel (Absensi,
//     Keuangan, Pembelajaran, Fitur, Panduan): samakan atau ubah.
//  7. Klaim "Gratis" (kartu di bawah kalkulator) dan "Waktu pengisian sekitar
//     2 menit" (pengantar kalkulator) diverifikasi; waktu belum pernah diukur.
//  8. Tanggal artikel adalah fakta yang tampil ke publik: pastikan tanggal terbit
//     nyata, bukan tanggal contoh desain.
//  9. Klaim privasi kalkulator "Tanpa daftar" dan jawaban tidak disimpan atau
//     dikirim masih benar saat bendera dinyalakan (kode kalkulator tidak punya
//     akses jaringan atau penyimpanan; jangan menambahkannya tanpa memperbarui
//     klaim itu). Pertimbangkan tautan ke Kebijakan Privasi di dekat kartu.
// 10. SEO belum ada: entri sitemap dan robots untuk /blog dan /blog/*, Open Graph,
//     dan `noindex` selama konten masih dummy (Open Graph menyentuh index.html,
//     dibicarakan di F8). Halaman belum noindex.
//
// Cara menyalakan: setelah daftar di atas beres, setel
// VITE_LANDING_ALAT_AKTIF=true di lingkungan build (Netlify). Di DEV bendera
// selalu menyala untuk pratinjau.
export const ALAT_DIRILIS = import.meta.env.DEV || import.meta.env.VITE_LANDING_ALAT_AKTIF === 'true';
