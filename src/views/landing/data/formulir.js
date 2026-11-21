// Skema dan teks bersama formulir konversi (Jadwalkan Demo, Akun Guru Mandiri,
// Kerja Sama, dan Afiliator). Disalin dari desain kanvas (Demo.dc.html,
// Demo-Seluler.dc.html, Guru-Mandiri.dc.html, Guru-Mandiri-Seluler.dc.html,
// Kerja-Sama.dc.html, Kerja-Sama-Seluler.dc.html, Afiliator.dc.html,
// Afiliator-Seluler.dc.html).
//
// Skema ini ikut terbawa ke chunk FormulirKonversi (dipakai semua halaman
// berformulir), termasuk saat gerbang rilis Perusahaan mati. Karena itu skema
// kerjaSama dan afiliator HANYA berisi nama jenis, label kolom, placeholder, dan
// opsi pilihan: tanpa klaim, janji, atau angka. Teks seperti "Data dipakai hanya
// untuk membalas" tinggal di data/kerjaSama.js dan data/afiliator.js.
//
// BERKAS INI SENGAJA TANPA IMPOR: lib/formulir.js (logika murni) membacanya
// dan diuji dengan `node --test` tanpa React, MUI, atau Vite.
//
// Setiap kolom: { nama, label, jenis, wajib, maks, placeholder, autoComplete,
// lebar, awal, opsi }.
//  jenis   : 'teks' | 'pilihan' | 'whatsapp' | 'email' | 'kontak' | 'teksPanjang'
//            'kontak'      = satu kolom "WhatsApp atau email": isian ber-"@" dianggap
//                            email, selain itu nomor WhatsApp (lib/formulir.js,
//                            normalisasiKontak).
//            'teksPanjang' = teks beberapa baris (textarea), biasanya opsional, dengan
//                            `maks` sebagai batas karakter; baris baru dipertahankan.
//  lebar   : 'penuh' (dua kolom di md ke atas) | 'setengah'
//  opsi    : untuk 'pilihan' saja, [{ nilai, label }]. `placeholderPilih` = teks
//            butir kosong (tanpa butir kosong bila tidak ada, nilai awal = awal).
//  maks    : batas panjang setelah dipangkas.

const OPSI_JABATAN = [
  { nilai: 'kepala-sekolah', label: 'Kepala sekolah' },
  { nilai: 'wakil-kepala-sekolah', label: 'Wakil kepala sekolah' },
  { nilai: 'admin-tata-usaha', label: 'Admin atau tata usaha' },
  { nilai: 'guru', label: 'Guru' },
  { nilai: 'yayasan', label: 'Yayasan' },
];

const OPSI_JENIS_SEKOLAH = [
  { nilai: 'umum', label: 'Sekolah umum' },
  { nilai: 'smk-mak', label: 'SMK atau MAK' },
];

const OPSI_JUMLAH_MURID = [
  { nilai: 'kurang-200', label: 'Kurang dari 200' },
  { nilai: '200-500', label: '200 sampai 500' },
  { nilai: '500-1000', label: '500 sampai 1.000' },
  { nilai: 'lebih-1000', label: 'Lebih dari 1.000' },
];

const OPSI_BENTUK_KERJA_SAMA = [
  { nilai: 'sekolah-yayasan', label: 'Sekolah dan yayasan' },
  { nilai: 'komunitas-guru', label: 'Komunitas guru' },
  { nilai: 'mitra-industri', label: 'Mitra industri' },
  { nilai: 'lainnya', label: 'Lainnya' },
];

const OPSI_LATAR_BELAKANG = [
  { nilai: 'guru', label: 'Guru' },
  { nilai: 'kepala-sekolah', label: 'Kepala sekolah' },
  { nilai: 'komunitas', label: 'Komunitas' },
  { nilai: 'lainnya', label: 'Lainnya' },
];

export const SKEMA = {
  demo: [
    { nama: 'nama', label: 'Nama lengkap', jenis: 'teks', wajib: true, maks: 100, placeholder: 'Nama Anda', autoComplete: 'name', lebar: 'penuh' },
    {
      nama: 'jabatan',
      label: 'Jabatan',
      jenis: 'pilihan',
      wajib: true,
      opsi: OPSI_JABATAN,
      placeholderPilih: 'Pilih jabatan',
      autoComplete: 'organization-title',
      lebar: 'setengah',
    },
    {
      nama: 'jenisSekolah',
      label: 'Jenis sekolah',
      jenis: 'pilihan',
      wajib: true,
      opsi: OPSI_JENIS_SEKOLAH,
      awal: 'umum',
      autoComplete: 'off',
      lebar: 'setengah',
    },
    { nama: 'sekolah', label: 'Nama sekolah', jenis: 'teks', wajib: true, maks: 150, placeholder: 'Nama sekolah', autoComplete: 'organization', lebar: 'setengah' },
    { nama: 'kota', label: 'Kota', jenis: 'teks', wajib: true, maks: 100, placeholder: 'Kota atau kabupaten', autoComplete: 'address-level2', lebar: 'setengah' },
    {
      nama: 'jumlahMurid',
      label: 'Jumlah murid',
      jenis: 'pilihan',
      wajib: false,
      opsi: OPSI_JUMLAH_MURID,
      placeholderPilih: 'Pilih rentang',
      autoComplete: 'off',
      lebar: 'setengah',
    },
    { nama: 'whatsapp', label: 'Nomor WhatsApp', jenis: 'whatsapp', wajib: true, placeholder: '08xxxxxxxxxx', autoComplete: 'tel', lebar: 'setengah' },
  ],
  guru: [
    { nama: 'nama', label: 'Nama lengkap', jenis: 'teks', wajib: true, maks: 100, placeholder: 'Nama Anda', autoComplete: 'name', lebar: 'penuh' },
    { nama: 'sekolah', label: 'Nama sekolah', jenis: 'teks', wajib: true, maks: 150, placeholder: 'Tempat Anda mengajar', autoComplete: 'organization', lebar: 'setengah' },
    { nama: 'mapel', label: 'Mata pelajaran', jenis: 'teks', wajib: true, maks: 100, placeholder: 'Mata pelajaran', autoComplete: 'off', lebar: 'setengah' },
    { nama: 'email', label: 'Email', jenis: 'email', wajib: true, maks: 254, placeholder: 'nama@email.com', autoComplete: 'email', lebar: 'setengah' },
    { nama: 'whatsapp', label: 'WhatsApp', jenis: 'whatsapp', wajib: false, placeholder: '08xxxxxxxxxx', autoComplete: 'tel', lebar: 'setengah' },
  ],
  // Kerja Sama (Kerja-Sama.dc.html). Pilihan "Bentuk kerja sama" tanpa butir kosong,
  // seperti desain: nilai awal butir pertama.
  kerjaSama: [
    { nama: 'nama', label: 'Nama lengkap', jenis: 'teks', wajib: true, maks: 100, placeholder: 'Nama Anda', autoComplete: 'name', lebar: 'setengah' },
    { nama: 'instansi', label: 'Instansi', jenis: 'teks', wajib: true, maks: 150, placeholder: 'Nama instansi', autoComplete: 'organization', lebar: 'setengah' },
    {
      nama: 'bentuk',
      label: 'Bentuk kerja sama',
      jenis: 'pilihan',
      wajib: true,
      opsi: OPSI_BENTUK_KERJA_SAMA,
      awal: 'sekolah-yayasan',
      autoComplete: 'off',
      lebar: 'penuh',
    },
    { nama: 'kontak', label: 'WhatsApp atau email', jenis: 'kontak', wajib: true, maks: 254, placeholder: 'Kontak yang bisa dihubungi', autoComplete: 'off', lebar: 'penuh' },
    { nama: 'pesan', label: 'Pesan', jenis: 'teksPanjang', wajib: false, maks: 1000, placeholder: 'Ceritakan singkat rencana Anda', autoComplete: 'off', lebar: 'penuh' },
  ],
  // Afiliator (Afiliator.dc.html). Latar belakang: pilihan tanpa butir kosong,
  // nilai awal butir pertama.
  afiliator: [
    { nama: 'nama', label: 'Nama lengkap', jenis: 'teks', wajib: true, maks: 100, placeholder: 'Nama Anda', autoComplete: 'name', lebar: 'penuh' },
    { nama: 'whatsapp', label: 'Nomor WhatsApp', jenis: 'whatsapp', wajib: true, placeholder: '08xxxxxxxxxx', autoComplete: 'tel', lebar: 'setengah' },
    { nama: 'email', label: 'Email', jenis: 'email', wajib: true, maks: 254, placeholder: 'nama@email.com', autoComplete: 'email', lebar: 'setengah' },
    { nama: 'kota', label: 'Kota', jenis: 'teks', wajib: true, maks: 100, placeholder: 'Kota atau kabupaten', autoComplete: 'address-level2', lebar: 'setengah' },
    {
      nama: 'latarBelakang',
      label: 'Latar belakang',
      jenis: 'pilihan',
      wajib: true,
      opsi: OPSI_LATAR_BELAKANG,
      awal: 'guru',
      autoComplete: 'off',
      lebar: 'setengah',
    },
  ],
};

// Nama kolom jebakan spam (honeypot). Disembunyikan dari pengguna dan pembaca
// layar. Namanya sengaja tidak bermakna (bukan "situs", "website", "email",
// dst.) supaya pengisi otomatis peramban dan ekstensi tidak mengisinya. Bila
// tetap terisi, data TIDAK dibuang: formulir dikirim dengan penanda `curiga`
// (lihat lib/formulir.js, siapkanKirim).
export const KOLOM_JEBAKAN = 'hp_k7x2';
// Label kolom jebakan (di dalam wrapper aria-hidden). Netral dan tidak mirip kolom nyata.
export const LABEL_JEBAKAN = 'Jangan diisi';

// Pesan galat per kolom. "Nomor WhatsApp tidak valid." persis dari desain;
// pesan lain tidak ada di desain (kolom kosong dan terlalu panjang), disusun
// satu pola dan perlu ditinjau copywriter.
export const PESAN_GALAT = {
  wajibIsi: (label) => `${label} wajib diisi.`,
  wajibPilih: (label) => `${label} wajib dipilih.`,
  terlaluPanjang: (label, maks) => `${label} maksimal ${maks} karakter.`,
  pilihanTidakDikenal: (label) => `${label} tidak valid.`,
  whatsapp: 'Nomor WhatsApp tidak valid.',
  email: 'Alamat email tidak valid.',
  // Kolom "WhatsApp atau email" tanpa "@": belum jelas yang dimaksud nomor atau email,
  // jadi pesannya menyebut keduanya. Dengan "@" dipakai pesan `email`. Tidak ada di
  // desain: perlu ditinjau copywriter.
  kontak: 'Nomor WhatsApp atau alamat email tidak valid.',
};

// Teks bersama kedua formulir. Tanda keadaan: isian, mengirim, terkirim, gagal.
export const TEKS_FORMULIR = {
  catatanWajib: 'Kolom bertanda * wajib diisi.',
  tombolMengirim: 'Mengirim...',
  tombolCoba: 'Coba Lagi',
  // Galat kirim menurut kode (lib/kirimFormulir.js). `gagal` = jaringan (teks desain);
  // `gagalDitolak` dan `gagalWaktu` tidak ada di desain (perlu ditinjau copywriter).
  gagal: {
    judul: 'Permintaan belum terkirim.',
    isi: 'Periksa koneksi, lalu coba lagi. Data yang Anda isi tidak hilang.',
  },
  gagalDitolak: {
    judul: 'Permintaan ditolak server.',
    isi: 'Coba lagi sebentar lagi atau hubungi kami. Data yang Anda isi tidak hilang.',
  },
  gagalWaktu: {
    judul: 'Server lambat menjawab.',
    isi: 'Coba lagi sebentar lagi. Data yang Anda isi tidak hilang.',
  },
  // Kalimat privasi di bawah tombol kirim, dengan tautan ke Kebijakan Privasi.
  // DUMMY wajib diganti sebelum main: bukan dari desain; perlu ditinjau copywriter
  // dan pihak hukum (tanpa klaim persetujuan sengaja).
  // Jenis kerjaSama dan afiliator sengaja tanpa kalimat di sini (desainnya tidak
  // punya, dan tidak ada klaim baru yang ditulis): hanya tautan Kebijakan Privasi
  // yang tampil. Kalimat desain ("Data dipakai hanya untuk membalas" dan "... untuk
  // pendaftaran") ada di jaminan data/kerjaSama.js dan data/afiliator.js, ditandai
  // verifikasi (butuh tinjauan hukum UU PDP sebelum rilis).
  privasi: {
    demo: 'Data Anda dipakai untuk menghubungi Anda.',
    guru: 'Data Anda dipakai untuk membuat akun Anda.',
    tautan: 'Baca Kebijakan Privasi.',
  },
  terkirimJudul: 'Permintaan terkirim',
  kembali: { label: 'Kembali ke Beranda', to: '/' },
  // Pengumuman pembaca layar (aria-live). Teks tidak ada di desain. Hanya
  // keadaan "mengirim" dan ringkasan galat validasi yang diumumkan lewat region
  // live; hasil (terkirim atau gagal) diumumkan lewat pemindahan fokus.
  live: {
    mengirim: 'Mengirim permintaan.',
  },
  galatRingkas: (jumlah) => `${jumlah} kolom perlu diperbaiki.`,
  // Keadaan khusus produksi tanpa endpoint (flags.formulirAktif false).
  // Teks tidak ada di desain: dibuat seminimal mungkin dan perlu ditinjau.
  nonaktif: {
    judul: 'Formulir belum aktif.',
    isi: 'Permintaan belum bisa dikirim lewat halaman ini.',
    aksiWa: 'Hubungi lewat WhatsApp',
  },
  // Pemilih keadaan: hanya tampil di DEV (flags.pratinjauTombolAktif).
  pratinjau: {
    label: 'Lihat keadaan:',
    keadaan: [
      { status: 'isian', label: 'Formulir' },
      { status: 'mengirim', label: 'Mengirim' },
      { status: 'terkirim', label: 'Terkirim' },
      { status: 'gagal', label: 'Galat' },
    ],
  },
};
