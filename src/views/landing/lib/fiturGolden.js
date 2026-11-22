// Fixture golden halaman Fitur Lengkap per peran: isi tabel D1 sampai D10 pada naskah
// "2026-11-22 Naskah Halaman Fitur Lengkap v2" (sepuluh tab, 126 kartu, tabel C untuk label
// tab), disalin mesin dari naskah, BUKAN dari data/fiturPeran/*.js. Dipakai
// lib/fiturData.test.js untuk membandingkan PERAN kartu demi kartu.
//
// Satu kartu = satu baris: [grup, judul, deskripsi web, deskripsi seluler, tag, chip, kode].
// chip: null = tanpa chip. kode: daftar kode H-x yang bertanda [V] (penanda di data berbentuk
// "Verifikasi H-2, H-5"). `catatan` = teks bantu di bawah panel (kode: penanda catatan).
//
// Satu penyimpangan sengaja dari naskah (tinjauan 22 Nov): kartu "Dasbor kepala sekolah"
// bertanda [V: H-15] di naskah, tetapi pemilik mengonfirmasi rilis Januari 2027 pasti, jadi
// penanda kartu dihapus (kode: []). Penanda H-15 tetap pada isi dasbor: deskripsi peran
// (`verifikasiPeran`) dan catatan "Tanpa peringkat guru".
// Mengubah naskah berarti memperbarui berkas ini, lalu data/fiturPeran/*.js.
export const GOLDEN = [
  {
    label: { web: 'Admin sekolah', mobile: 'Admin' },
    judul: 'Kehadiran, data, dan jadwal sekolah dikelola dari satu portal web.',
    deskripsi: { web: 'Admin dan tata usaha mengelola kehadiran, data murid dan pegawai, serta jadwal. Keuangan sedang dibuat. Penerimaan murid baru ada di tab sendiri.', mobile: 'Kehadiran, data, dan jadwal. Keuangan segera.' },
    sub: [
      {
        judul: '',
        kartu: [
          ['Presensi', 'Absensi QR di gerbang', 'Murid memindai kartu QR saat datang dan pulang, kehadiran tercatat otomatis.', 'Datang dan pulang tercatat dari kartu QR.', ['Kartu QR', 'Datang', 'Pulang'], null, []],
          ['Presensi', 'Absensi pegawai', 'Kehadiran guru dan staf dicatat dalam sistem yang sama.', 'Kehadiran guru dan staf dicatat.', ['Guru', 'Staf'], null, ['H-2']],
          ['Presensi', 'Perizinan', 'Izin murid dan pegawai dicatat, rekapnya bisa diunduh sebagai PDF.', 'Izin tercatat, rekap bisa diunduh.', ['Murid', 'Pegawai', 'Rekap PDF'], null, []],
          ['Kesiswaan', 'Data murid, alumni, dan transfer kelas', 'Data murid, wali, dan alumni di satu tempat, termasuk transfer kelas.', 'Murid, wali, alumni, dan transfer kelas.', ['Murid', 'Alumni', 'Transfer kelas'], null, []],
          ['Kesiswaan', 'Ekskul', 'Admin mengelola ekskul, jadwal, dan anggotanya.', 'Kelola ekskul, jadwal, dan anggota.', ['Ekskul', 'Jadwal', 'Anggota'], null, []],
          ['Kesiswaan', 'Prestasi', 'Prestasi murid dan prestasi sekolah dicatat di satu tempat.', 'Prestasi murid dan sekolah tercatat.', ['Murid', 'Sekolah', 'Galeri'], null, []],
          ['Data induk', 'Data pegawai dan status', 'Data guru dan staf, termasuk status nonaktif dengan alasan baku.', 'Data guru dan staf, termasuk status nonaktif.', ['Guru', 'Staf', 'Status nonaktif'], null, []],
          ['Data induk', 'Impor Excel dan pusat unduh', 'Data masuk lewat berkas Excel, dokumen dan rekap keluar lewat pusat unduh.', 'Impor Excel, unduh rekap dari satu tempat.', ['Impor Excel', 'Pusat unduh'], null, []],
          ['Akademik', 'Struktur akademik dan jadwal', 'Semester, kelas, mapel, dan jadwal pelajaran serta ekskul disusun di satu tempat.', 'Kelas, mapel, ekskul, dan jadwal.', ['Kelas', 'Mapel', 'Ekskul'], null, []],
          ['Keuangan', 'Keuangan dan SPP', 'Tagihan dan pembayaran SPP akan dikelola dalam sistem.', 'Tagihan dan pembayaran SPP.', ['Tagihan', 'Pembayaran'], 'segera', ['H-11']],
        ],
      },
    ],
  },
  {
    label: { web: 'Guru', mobile: 'Guru' },
    judul: 'Dari absensi kelas sampai jurnal dan nilai, guru mencatat di satu tempat.',
    deskripsi: { web: 'Guru mencatat kehadiran, jurnal, tugas, dan nilai, lalu membaca ringkasannya. Keputusan tetap di guru.', mobile: 'Absensi, jurnal, tugas, dan nilai.' },
    catatan: { teks: 'Tujuan pembelajaran (TP) adalah capaian per topik yang dipakai guru untuk mengelompokkan nilai.', kode: [] },
    sub: [
      {
        judul: '',
        kartu: [
          ['Presensi', 'Absensi mata pelajaran', 'Guru mencatat kehadiran tiap jam pelajaran dari aplikasi seluler, lengkap dengan rekap.', 'Absensi per mapel dari aplikasi guru.', ['Aplikasi guru', 'Per mapel', 'Rekap'], null, []],
          ['Presensi', 'Rekapitulasi absensi mapel', 'Guru melihat rekap absensi mapel hari ini, detailnya, dan riwayat.', 'Rekap absensi mapel dan riwayatnya.', ['Hari ini', 'Detail', 'Riwayat'], null, []],
          ['Jadwal', 'Jadwal mengajar', 'Guru melihat jadwal mengajar hari ini, kelas hari ini, dan mingguan.', 'Jadwal mengajar harian dan mingguan.', ['Hari ini', 'Kelas', 'Mingguan'], null, []],
          ['Pembelajaran', 'Jurnal harian mengajar', 'Guru mencatat jurnal mengajar harian di sistem.', 'Jurnal mengajar harian di sistem.', ['Jurnal', 'Harian'], null, ['H-4']],
          ['Pembelajaran', 'Tugas', 'Guru memberi tugas per mapel, murid mengumpulkannya lewat aplikasi.', 'Tugas per mapel dan pengumpulannya.', ['Tugas', 'Pengumpulan'], null, []],
          ['Pembelajaran', 'Wali kelas dan piket', 'Jurnal kelas, piket, dan profil murid binaan untuk wali kelas.', 'Jurnal kelas, piket, dan murid binaan.', ['Jurnal kelas', 'Piket', 'Murid binaan'], null, []],
          ['Pembelajaran', 'Ringkasan mengajar', 'Guru melihat ringkasan kegiatan mengajarnya sendiri.', 'Ringkasan mengajar untuk guru sendiri.', ['Ringkasan'], null, ['H-4']],
          ['Pembelajaran', 'LAKSANA, analitik pembelajaran untuk guru', 'Guru akan melihat penanda dari nilai dan kehadiran. Analitik untuk guru, bukan tentang guru.', 'Guru akan dapat penanda, keputusan tetap di guru.', ['Impor dari Excel', 'Nilai per tujuan', 'Saran tindak lanjut'], 'segera', ['H-5']],
          ['Penilaian', 'Penilaian langsung', 'Penilaian langsung dicatat guru di sistem.', 'Penilaian langsung dicatat guru.', ['Penilaian langsung'], null, []],
          ['Penilaian', 'Nilai per kategori', 'Nilai per kategori dicatat dan direkap guru.', 'Nilai per kategori dicatat guru.', ['Nilai', 'Kategori'], null, []],
          ['Layanan', 'Unduh jurnal dan rekap mapel', 'PDF jurnal harian, absensi mapel, dan rekap nilai diunduh dari pusat unduh guru.', 'Unduh PDF jurnal, absensi, dan rekap nilai.', ['Jurnal', 'Absensi mapel', 'Rekap nilai'], null, []],
          ['Layanan', 'Perizinan guru', 'Guru mengajukan izin atau sakit dan memantau statusnya.', 'Ajukan izin atau sakit, pantau status.', ['Izin', 'Sakit', 'Status'], null, ['H-3']],
          ['Komunikasi', 'Notifikasi', 'Guru menerima notifikasi di kotak masuk, termasuk pengingat mengajar otomatis.', 'Kotak masuk dan pengingat mengajar.', ['Kotak masuk', 'Pengingat mengajar'], null, ['H-22']],
          ['Perangkat ajar', 'Perangkat ajar', 'Guru akan mengunggah perangkat ajar dan melihat riwayat serta berkasnya.', 'Unggah perangkat ajar, lihat riwayatnya.', ['Unggah', 'Riwayat', 'Berkas'], 'segera', ['H-13']],
        ],
      },
    ],
  },
  {
    label: { web: 'Wali murid', mobile: 'Wali' },
    judul: 'Wali memantau kehadiran, tugas, nilai, dan jadwal anak dari aplikasi.',
    deskripsi: { web: 'Kabar dan data anak sampai ke wali lewat aplikasi. Beberapa fitur berstatus Segera.', mobile: 'Data anak di aplikasi wali.' },
    sub: [
      {
        judul: '',
        kartu: [
          ['Notifikasi', 'Kabar kehadiran ke wali', 'Kabar kehadiran sampai ke wali lewat notifikasi di aplikasi, otomatis.', 'Notifikasi otomatis di aplikasi wali.', ['Notifikasi aplikasi', 'Kotak masuk'], null, ['H-6']],
          ['Notifikasi', 'Notifikasi tugas', 'Wali menerima notifikasi saat guru memberi tugas untuk anak.', 'Notifikasi tugas anak.', ['Tugas', 'Notifikasi'], null, ['H-6']],
          ['Notifikasi', 'Notifikasi penilaian', 'Wali menerima notifikasi saat nilai anak dicatat guru.', 'Notifikasi nilai anak.', ['Nilai', 'Notifikasi'], null, ['H-6']],
          ['Tugas dan nilai', 'Tugas anak', 'Wali melihat tugas anak dari tiap mapel.', 'Tugas anak per mapel.', ['Tugas', 'Per mapel'], null, []],
          ['Tugas dan nilai', 'Nilai anak', 'Wali melihat nilai anak per mapel dan kategori.', 'Nilai anak di aplikasi.', ['Nilai', 'Per mapel'], null, []],
          ['Kehadiran', 'Kehadiran sekolah', 'Wali melihat kehadiran anak di gerbang sekolah.', 'Kehadiran anak di sekolah.', ['Gerbang', 'Datang', 'Pulang'], null, []],
          ['Kehadiran', 'Kehadiran per mapel', 'Wali melihat kehadiran anak pada tiap mata pelajaran.', 'Kehadiran anak per mapel.', ['Per mapel', 'Kehadiran'], null, []],
          ['Rapor', 'Rapor', 'Wali melihat rapor anak di aplikasi.', 'Rapor anak di aplikasi.', ['Rapor'], null, []],
          ['Jadwal', 'Jadwal mapel', 'Wali melihat jadwal mata pelajaran anak.', 'Jadwal mapel anak.', ['Jadwal', 'Mapel'], null, []],
          ['Jadwal', 'Jadwal ekskul', 'Wali melihat jadwal ekskul anak.', 'Jadwal ekskul anak.', ['Ekskul', 'Jadwal'], null, []],
          ['Jadwal', 'Jadwal piket', 'Jadwal piket anak akan tampil di aplikasi wali.', 'Jadwal piket anak akan tampil.', ['Piket', 'Jadwal'], 'segera', ['H-29']],
          ['Jadwal', 'Jadwal ujian', 'Jadwal ujian anak akan tampil di aplikasi.', 'Jadwal ujian anak akan tampil.', ['Ujian', 'Jadwal'], 'segera', ['H-28']],
          ['Sekolah', 'Daftar guru sekolah', 'Wali melihat daftar guru dan staf sekolah.', 'Daftar guru dan staf.', ['Guru', 'Staf'], null, []],
          ['Layanan', 'Izin', 'Wali mengajukan izin atau sakit untuk anak dan memantau statusnya.', 'Ajukan izin anak, pantau status.', ['Izin', 'Sakit', 'Status'], null, ['H-3']],
          ['Layanan', 'Ekskul anak', 'Wali melihat ekskul yang diikuti anak.', 'Ekskul yang diikuti anak.', ['Ekskul'], null, []],
          ['Layanan', 'Prestasi anak', 'Wali melihat prestasi anak di galeri.', 'Prestasi anak di galeri.', ['Prestasi', 'Galeri'], null, []],
          ['Layanan', 'Dompet anak', 'Dompet anak akan dipakai jajan di kantin, dengan PIN dan batas harian.', 'Dompet anak untuk jajan di kantin.', ['Dompet', 'PIN', 'Batas harian'], 'segera', ['H-12']],
        ],
      },
    ],
  },
  {
    label: { web: 'Murid', mobile: 'Murid' },
    judul: 'Murid melihat jadwal, tugas, nilai, dan kehadirannya dari aplikasi.',
    deskripsi: { web: 'Kartu QR, jadwal, tugas, dan nilai ada di aplikasi murid. Beberapa fitur berstatus Segera.', mobile: 'Kartu, jadwal, tugas, dan nilai di aplikasi.' },
    sub: [
      {
        judul: '',
        kartu: [
          ['Kesiswaan', 'Kartu pelajar QR', 'Murid memakai kartu pelajar berkode QR saat datang dan pulang.', 'Kartu pelajar QR untuk absensi gerbang.', ['Kartu QR', 'Gerbang'], null, []],
          ['Kesiswaan', 'Ekskul', 'Murid mendaftar dan melihat ekskul yang diikuti.', 'Daftar dan lihat ekskul.', ['Ekskul', 'Daftar'], null, []],
          ['Kesiswaan', 'Prestasi', 'Murid melihat prestasi di galeri sekolah.', 'Galeri prestasi murid.', ['Prestasi', 'Galeri'], null, []],
          ['Kantin', 'Saldo murid', 'Murid akan melihat saldo dompet kantinnya di aplikasi.', 'Saldo dompet kantin murid.', ['Dompet', 'Saldo'], 'segera', ['H-12']],
          ['Pembelajaran', 'Tugas', 'Murid melihat dan mengumpulkan tugas lewat aplikasi.', 'Lihat dan kumpulkan tugas.', ['Tugas', 'Pengumpulan'], null, []],
          ['Pembelajaran', 'Nilai', 'Murid melihat nilai per mapel dan kategori.', 'Nilai murid di aplikasi.', ['Nilai', 'Per mapel'], null, []],
          ['Pembelajaran', 'Rapor', 'Murid melihat rapornya di aplikasi.', 'Rapor murid di aplikasi.', ['Rapor'], null, []],
          ['Jadwal', 'Jadwal mapel', 'Murid melihat jadwal mata pelajaran.', 'Jadwal mapel.', ['Jadwal', 'Mapel'], null, []],
          ['Jadwal', 'Jadwal ekskul', 'Murid melihat jadwal ekskul yang diikuti.', 'Jadwal ekskul.', ['Ekskul', 'Jadwal'], null, []],
          ['Jadwal', 'Jadwal ujian', 'Jadwal ujian murid akan tampil di aplikasi.', 'Jadwal ujian murid.', ['Ujian', 'Jadwal'], 'segera', ['H-28']],
          ['Jadwal', 'Jadwal piket', 'Murid akan melihat jadwal piketnya di aplikasi.', 'Jadwal piket murid akan tampil.', ['Piket', 'Jadwal'], 'segera', ['H-29']],
          ['Sekolah', 'Daftar guru', 'Murid melihat daftar guru sekolah.', 'Daftar guru sekolah.', ['Guru'], null, []],
          ['Kehadiran', 'Rekapitulasi kehadiran', 'Murid melihat rekap kehadiran di sekolah dan di tiap mapel.', 'Rekap kehadiran sekolah dan mapel.', ['Sekolah', 'Per mapel'], null, []],
          ['Layanan', 'Perizinan', 'Murid hanya melihat riwayat perizinan.', 'Riwayat perizinan murid.', ['Riwayat'], null, ['H-3']],
          ['Komunikasi', 'Notifikasi', 'Murid menerima notifikasi di kotak masuk aplikasi.', 'Notifikasi di aplikasi murid.', ['Kotak masuk', 'Notifikasi'], null, []],
        ],
      },
    ],
  },
  {
    label: { web: 'Penerimaan murid baru', mobile: 'PMB' },
    judul: 'Penerimaan murid baru akan berjalan lewat web, dari perencanaan sampai penilaian.',
    deskripsi: { web: 'Admin, panitia, dan calon murid memakai web, tanpa aplikasi. Semua fitur di tab ini berstatus Segera.', mobile: 'Lewat web, tanpa aplikasi. Semua berstatus Segera.' },
    sub: [
      {
        judul: 'Admin sekolah',
        kartu: [
          ['Perencanaan', 'Periode PMB', 'Admin akan membuat, mengubah, membuka, menutup, dan mengarsipkan periode PMB.', 'Atur periode PMB dari buka sampai arsip.', ['Periode', 'Buka dan tutup', 'Arsip'], 'segera', []],
          ['Perencanaan', 'Gelombang pendaftaran', 'Admin akan membuka dan menutup gelombang pendaftaran dalam satu periode.', 'Buka dan tutup gelombang pendaftaran.', ['Gelombang', 'Buka dan tutup'], 'segera', []],
          ['Perencanaan', 'Jalur pendaftaran', 'Jalur pendaftaran akan diatur per gelombang.', 'Jalur pendaftaran per gelombang.', ['Jalur', 'Per gelombang'], 'segera', []],
          ['Perencanaan', 'Tahapan dan jadwal', 'Urutan tahapan dan jadwal PMB akan diatur, bisa diaktifkan atau dinonaktifkan.', 'Urutan tahapan dan jadwal PMB.', ['Tahapan', 'Jadwal', 'Aktif atau nonaktif'], 'segera', []],
          ['Perencanaan', 'Petugas panitia', 'Admin akan mengelola petugas panitia PMB.', 'Kelola petugas panitia PMB.', ['Panitia', 'Petugas'], 'segera', []],
          ['Perencanaan', 'Komponen dan persyaratan tes', 'Komponen dan persyaratan tes akan diatur per jalur dan gelombang.', 'Komponen tes per jalur dan gelombang.', ['Komponen tes', 'Persyaratan'], 'segera', []],
          ['Pendaftaran dan verifikasi', 'Ringkasan dan antrean', 'Admin akan melihat ringkasan, calon murid hari ini, dan antrean verifikasi.', 'Ringkasan dan antrean verifikasi.', ['Ringkasan', 'Hari ini', 'Antrean'], 'segera', []],
          ['Pendaftaran dan verifikasi', 'Data calon murid', 'Daftar dan detail data calon murid akan tersedia bagi admin.', 'Daftar dan detail calon murid.', ['Daftar', 'Detail'], 'segera', []],
          ['Pendaftaran dan verifikasi', 'Verifikasi berkas', 'Admin akan memverifikasi berkas satu per satu atau massal, lalu menghitung ulang status.', 'Verifikasi berkas satu per satu atau massal.', ['Satu per satu', 'Massal', 'Hitung ulang status'], 'segera', []],
          ['Pelaksanaan tes', 'Sesi dan jadwal tes', 'Admin akan menyusun sesi dan jadwal tes.', 'Sesi dan jadwal tes.', ['Sesi', 'Jadwal'], 'segera', []],
          ['Pelaksanaan tes', 'Ruang tes', 'Ruang tes dan penempatan ruang akan diatur admin.', 'Ruang tes dan penempatan ruang.', ['Ruang', 'Penempatan'], 'segera', []],
          ['Pelaksanaan tes', 'Penugasan pengawas', 'Admin akan menugaskan pengawas tes.', 'Penugasan pengawas tes.', ['Pengawas'], 'segera', []],
          ['Pelaksanaan tes', 'Penempatan peserta', 'Calon murid akan ditempatkan di kursi tes, lengkap dengan kode QR kartu tes.', 'Kursi tes dan kode QR kartu tes.', ['Jadwal ulang', 'Batal', 'Kode QR'], 'segera', []],
          ['Penilaian', 'Pemantauan penilaian', 'Admin akan memantau perkembangan penilaian calon murid.', 'Pantau perkembangan penilaian.', ['Pemantauan'], 'segera', []],
          ['Penilaian', 'Input nilai', 'Admin akan menyimpan nilai dan bisa membukanya kembali untuk diubah.', 'Simpan nilai, buka kembali bila perlu.', ['Simpan', 'Buka kembali'], 'segera', []],
        ],
      },
      {
        judul: 'Panitia',
        kartu: [
          ['Panitia', 'Linimasa tahapan', 'Panitia akan melihat linimasa tahapan PMB.', 'Linimasa tahapan PMB.', ['Linimasa'], 'segera', []],
          ['Panitia', 'Wawasan pendaftaran dan penilaian', 'Panitia akan melihat wawasan pendaftaran dan penilaian.', 'Wawasan pendaftaran dan penilaian.', ['Pendaftaran', 'Penilaian'], 'segera', []],
          ['Panitia', 'Input nilai komponen tes', 'Panitia akan memasukkan nilai tiap komponen tes.', 'Input nilai komponen tes.', ['Nilai', 'Komponen tes'], 'segera', []],
          ['Panitia', 'Absensi tes per sesi', 'Panitia akan mencatat kehadiran calon murid pada tiap sesi tes.', 'Absensi tes per sesi.', ['Absensi', 'Per sesi'], 'segera', []],
        ],
      },
      {
        judul: 'Calon murid dan wali',
        kartu: [
          ['Calon murid dan wali', 'Registrasi dan masuk', 'Calon murid dan wali akan mendaftar akun dan masuk lewat web.', 'Daftar akun dan masuk lewat web.', ['Registrasi', 'Masuk', 'Web'], 'segera', []],
          ['Calon murid dan wali', 'Formulir empat langkah', 'Formulir pendaftaran akan diisi dalam empat langkah.', 'Formulir empat langkah.', ['Formulir', 'Empat langkah'], 'segera', []],
          ['Calon murid dan wali', 'Prestasi calon murid', 'Calon murid akan mengisi prestasi yang dimiliki.', 'Isi prestasi calon murid.', ['Prestasi'], 'segera', []],
          ['Calon murid dan wali', 'Unggah berkas dan finalisasi', 'Calon murid akan mengunggah berkas, mengirim, dan memfinalisasi pendaftaran.', 'Unggah berkas, kirim, finalisasi.', ['Unggah', 'Kirim', 'Finalisasi'], 'segera', []],
          ['Calon murid dan wali', 'Bukti pendaftaran dan kartu tes', 'Bukti pendaftaran dan kartu tes akan bisa diunduh.', 'Unduh bukti dan kartu tes.', ['Bukti', 'Kartu tes', 'Unduh'], 'segera', []],
          ['Calon murid dan wali', 'Progres dan pengumuman', 'Progres, linimasa, dan pengumuman akan terlihat di akun calon murid.', 'Progres, linimasa, dan pengumuman.', ['Progres', 'Linimasa', 'Pengumuman'], 'segera', []],
          ['Calon murid dan wali', 'Revisi berkas', 'Calon murid akan memperbaiki berkas yang diminta revisi.', 'Revisi berkas yang diminta.', ['Revisi'], 'segera', []],
          ['Calon murid dan wali', 'Notifikasi', 'Calon murid akan menerima notifikasi tentang pendaftarannya.', 'Notifikasi pendaftaran.', ['Notifikasi'], 'segera', []],
        ],
      },
    ],
  },
  {
    label: { web: 'Admin kantin', mobile: 'Kantin' },
    judul: 'Portal kantin sedang dibuat, dari kasir sampai laporan.',
    deskripsi: { web: 'Kasir dan admin kantin akan memakai kartu QR murid dan PIN. Semua fitur di tab ini berstatus Segera.', mobile: 'Kasir sampai laporan. Semua berstatus Segera.' },
    catatan: { teks: 'Konsinyor adalah pemasok yang menitipkan barangnya untuk dijual di kantin.', kode: ['H-26'] },
    sub: [
      {
        judul: '',
        kartu: [
          ['Kasir dan transaksi', 'Pembayaran kasir', 'Kasir akan memindai kartu QR murid, memilih menu, lalu konfirmasi dengan PIN.', 'Scan kartu QR, pilih menu, konfirmasi PIN.', ['Kartu QR', 'Menu', 'PIN'], 'segera', []],
          ['Kasir dan transaksi', 'Daftar menu dan harga', 'Kasir akan melihat daftar menu dan harga saat melayani.', 'Daftar menu dan harga.', ['Menu', 'Harga'], 'segera', []],
          ['Kasir dan transaksi', 'Riwayat dan struk transaksi', 'Riwayat transaksi dan struk akan tersedia untuk tiap pembayaran.', 'Riwayat transaksi dan struk.', ['Riwayat', 'Struk'], 'segera', []],
          ['Kasir dan transaksi', 'Cek saldo murid', 'Kasir akan mengecek saldo dompet murid sebelum transaksi.', 'Cek saldo dompet murid.', ['Saldo', 'Dompet'], 'segera', []],
          ['Admin kantin', 'Dasbor transaksi', 'Admin kantin akan melihat ringkasan transaksi kantin di satu dasbor.', 'Dasbor transaksi kantin.', ['Dasbor', 'Transaksi'], 'segera', ['H-26']],
          ['Admin kantin', 'Manajemen menu', 'Admin kantin akan mengelola menu, kategori menu, menu paket, dan kode batang produk.', 'Kelola menu, paket, dan kode batang.', ['Kategori', 'Menu paket', 'Kode batang'], 'segera', ['H-26']],
          ['Admin kantin', 'Persediaan dan stok', 'Admin kantin akan menambah persediaan dan melihat riwayat stok.', 'Tambah persediaan, lihat riwayat stok.', ['Persediaan', 'Riwayat stok'], 'segera', ['H-26']],
          ['Admin kantin', 'Promo produk', 'Admin kantin akan membuat promo untuk produk tertentu.', 'Promo produk kantin.', ['Promo'], 'segera', ['H-26']],
          ['Laporan keuangan kantin', 'Laporan lengkap', 'Laporan penjualan, keuangan, dan transaksi kantin akan tersedia.', 'Laporan penjualan, keuangan, transaksi.', ['Penjualan', 'Keuangan', 'Transaksi'], 'segera', ['H-26']],
          ['Laporan keuangan kantin', 'Pencairan dana kantin', 'Penarikan dana kantin akan dilengkapi dokumentasi.', 'Pencairan dana dengan dokumentasi.', ['Pencairan', 'Dokumentasi'], 'segera', []],
          ['Konsinyasi', 'Manajemen konsinyasi', 'Data konsinyor, menu konsinyor, riwayat distribusi, laporan transaksi, dan pencairan konsinyor akan dikelola.', 'Kelola konsinyor, distribusi, dan laporan.', ['Konsinyor', 'Distribusi', 'Laporan'], 'segera', ['H-26']],
          ['Konsinyasi', 'Pengaturan tampilan dan petugas', 'Tampilan kantin dan petugas akan bisa diatur admin kantin.', 'Atur tampilan dan petugas.', ['Tampilan', 'Petugas'], 'segera', ['H-26']],
        ],
      },
    ],
  },
  {
    label: { web: 'Waka kurikulum', mobile: 'Waka' },
    judul: 'Portal Waka kurikulum untuk perangkat ajar sedang dibuat.',
    deskripsi: { web: 'Waka akan memantau dan memvalidasi perangkat ajar guru. Semua fitur di tab ini berstatus Segera.', mobile: 'Sedang dibuat, belum bisa dipakai.' },
    sub: [
      {
        judul: '',
        kartu: [
          ['Pantauan', 'Ringkasan perangkat ajar', 'Waka akan melihat ringkasan perangkat ajar guru di satu dasbor.', 'Ringkasan perangkat ajar di satu dasbor.', ['Dasbor', 'Ringkasan'], 'segera', ['H-13']],
          ['Pantauan', 'Daftar guru dan kelengkapan unggahan', 'Waka akan melihat daftar guru, kelengkapan unggahan, dan detail tiap guru.', 'Daftar guru dan kelengkapan unggahan.', ['Daftar guru', 'Detail'], 'segera', ['H-13']],
          ['Pantauan', 'Jenis dokumen perangkat ajar', 'Daftar jenis dokumen perangkat ajar akan tersedia bagi Waka.', 'Daftar jenis dokumen perangkat ajar.', ['Jenis dokumen'], 'segera', ['H-13']],
          ['Pantauan', 'Semester dan tahun ajaran', 'Waka akan memilih semester dan tahun ajaran yang dilihat.', 'Pilih semester dan tahun ajaran.', ['Semester', 'Tahun ajaran'], 'segera', ['H-13']],
          ['Batas waktu', 'Batas waktu unggah', 'Waka akan membuat, mengubah, menghapus, dan melihat batas waktu unggah.', 'Atur batas waktu unggah.', ['Buat', 'Ubah', 'Hapus'], 'segera', ['H-13']],
          ['Validasi', 'Berkas dan riwayat dokumen', 'Waka akan membuka berkas dokumen guru beserta riwayat versinya.', 'Berkas dokumen dan riwayat versi.', ['Berkas', 'Riwayat versi'], 'segera', ['H-13']],
          ['Validasi', 'Antrean validasi', 'Dokumen yang menunggu validasi akan tampil dalam satu antrean.', 'Antrean dokumen menunggu validasi.', ['Antrean'], 'segera', ['H-13']],
          ['Validasi', 'Validasi dokumen', 'Waka akan memvalidasi dokumen perangkat ajar yang diunggah guru.', 'Validasi dokumen perangkat ajar.', ['Validasi'], 'segera', ['H-13']],
          ['Validasi', 'Buka kunci dokumen', 'Waka akan bisa membuka kunci dokumen guru.', 'Buka kunci dokumen.', ['Kunci dokumen'], 'segera', ['H-13']],
          ['Arsip', 'Arsip dan rekap', 'Waka akan melihat arsip dan rekap perangkat ajar.', 'Arsip dan rekap perangkat ajar.', ['Arsip', 'Rekap'], 'segera', ['H-13']],
          ['Arsip', 'Unduh arsip ZIP', 'Arsip perangkat ajar akan bisa diunduh sekaligus dalam satu berkas ZIP.', 'Unduh arsip dalam satu ZIP.', ['ZIP', 'Unduh'], 'segera', ['H-13']],
        ],
      },
    ],
  },
  {
    label: { web: 'Guru BK', mobile: 'BK' },
    judul: 'Portal Guru BK sedang dibuat.',
    deskripsi: { web: 'Guru BK akan memetakan kondisi murid, mencatat konseling, dan menerima pengaduan. Semua fitur di tab ini berstatus Segera.', mobile: 'Sedang dibuat, belum bisa dipakai.' },
    sub: [
      {
        judul: '',
        kartu: [
          ['Pemetaan murid', 'Ringkasan pemetaan murid', 'Guru BK akan melihat ringkasan pemetaan kondisi murid.', 'Ringkasan pemetaan kondisi murid.', ['Ringkasan', 'Pemetaan'], 'segera', ['H-13']],
          ['Pemetaan murid', 'Daftar dan profil murid', 'Guru BK akan melihat daftar murid dan profil tiap murid.', 'Daftar dan profil murid.', ['Daftar', 'Profil'], 'segera', ['H-13']],
          ['Pemetaan murid', 'Ekspor profil murid', 'Profil murid akan bisa diekspor oleh Guru BK.', 'Ekspor profil murid.', ['Ekspor'], 'segera', ['H-13']],
          ['Pemetaan murid', 'Pilih kelas', 'Guru BK akan memilih kelas dari daftar referensi kelas.', 'Pilih kelas dari daftar.', ['Kelas'], 'segera', ['H-13']],
          ['Pemetaan murid', 'Pemetaan minat dan bakat', 'Pemetaan potensi minat dan bakat murid masih rencana, belum ada di sistem.', 'Pemetaan minat dan bakat, masih rencana.', ['Minat', 'Bakat'], 'segera', ['H-16']],
          ['Pemetaan murid', 'Pemetaan jalur karier', 'Pemetaan jalur karier akan menjadi bahan percakapan Guru BK dengan murid.', 'Jalur karier sebagai bahan percakapan.', ['Jalur karier', 'Percakapan'], 'segera', ['H-27']],
          ['Pemetaan murid', 'Pemetaan kesesuaian jurusan kuliah', 'Pemetaan kesesuaian jurusan kuliah untuk murid SMA, sebagai bahan percakapan.', 'Jurusan kuliah sebagai bahan percakapan.', ['Jurusan kuliah', 'SMA'], 'segera', ['H-27']],
          ['Konseling', 'Jadwal konseling', 'Guru BK akan melihat, membuat, dan mengubah jadwal konseling.', 'Lihat dan atur jadwal konseling.', ['Lihat', 'Buat', 'Ubah'], 'segera', ['H-13']],
          ['Konseling', 'Jurnal konseling', 'Guru BK akan melihat, membuat, mengubah, dan menghapus jurnal konseling.', 'Kelola jurnal konseling.', ['Buat', 'Ubah', 'Hapus'], 'segera', ['H-13']],
          ['Konseling', 'Akses rahasia jurnal', 'Jurnal konseling akan disimpan dengan akses rahasia.', 'Akses rahasia untuk jurnal konseling.', ['Beri akses', 'Ubah akses', 'Cabut akses'], 'segera', []],
          ['Konseling', 'Riwayat konseling', 'Riwayat konseling akan tersedia secara umum dan per murid.', 'Riwayat konseling umum dan per murid.', ['Umum', 'Per murid'], 'segera', ['H-13']],
          ['Pengaduan', 'Pengaduan anonim', 'Pengaduan anonim dari murid akan diterima Guru BK.', 'Pengaduan anonim untuk Guru BK.', ['Anonim', 'Daftar', 'Detail'], 'segera', []],
          ['Pengaduan', 'Status dan balasan pengaduan', 'Guru BK akan mengubah status, membalas, dan mencatat tiap pengaduan.', 'Status, balasan, dan catatan pengaduan.', ['Status', 'Balasan', 'Catatan'], 'segera', ['H-13']],
        ],
      },
    ],
  },
  {
    label: { web: 'Kepala sekolah', mobile: 'Kepala sekolah' },
    judul: 'Dasbor kepala sekolah dijadwalkan rilis Januari 2027.',
    deskripsi: { web: 'Dasbor akan merangkum kondisi sekolah secara agregat, tanpa peringkat guru. Saat ini berstatus Segera.', mobile: 'Dasbor satu layar, rilis Januari 2027.' },
    catatan: { teks: 'Tanpa peringkat guru adalah prinsip rancangan dasbor.', kode: ['H-15'] },
    verifikasiPeran: ['H-15'],
    sub: [
      {
        judul: '',
        kartu: [
          ['Dasbor', 'Dasbor kepala sekolah', 'Kondisi sekolah di satu layar, dijadwalkan rilis Januari 2027.', 'Satu layar, rilis Januari 2027.', ['Satu layar', 'Ringkasan', 'Tanpa peringkat guru'], 'segera', []],
        ],
      },
    ],
  },
  {
    label: { web: 'Kepala jurusan', mobile: 'Jurusan' },
    judul: 'Kesiapan kerja murid dan penempatan PKL dikelola di Prakersa.',
    deskripsi: { web: 'Kepala jurusan memantau kesiapan murid dan memutuskan penempatan PKL. Fitur unggulannya ada di bawah.', mobile: 'Kesiapan dan PKL ada di Prakersa.' },
    catatan: { teks: 'SKKNI adalah Standar Kompetensi Kerja Nasional Indonesia.', kode: [] },
    sub: [
      {
        judul: '',
        kartu: [
          ['Kesiapan dan kompetensi', 'Profil kesiapan kerja per murid', 'Dua skor kesiapan kerja per murid: perilaku dari data kehadiran, dan kompetensi.', 'Skor perilaku dan kompetensi per murid.', ['Perilaku', 'Kompetensi', 'Dua skor'], 'uji-terbatas', ['H-17']],
          ['Kesiapan dan kompetensi', 'Pemetaan kompetensi SKKNI', 'Unit kompetensi SKKNI dan pemetaan mapel ke SKKNI diatur per jurusan.', 'Pemetaan mapel ke SKKNI per jurusan.', ['SKKNI', 'Pemetaan mapel', 'Jurusan'], 'uji-terbatas', ['H-17']],
          ['Kesiapan dan kompetensi', 'Dasbor kesiapan dan penanda dini', 'Ringkasan kelas, matriks kesiapan, dan panel penanda dini, dengan ekspor PDF.', 'Matriks kesiapan dan penanda dini.', ['Matriks kesiapan', 'Penanda dini', 'Ekspor PDF'], 'uji-terbatas', ['H-17']],
          ['Penempatan dan pemantauan', 'Saran penempatan PKL', 'Saran industri untuk tiap murid, kepala jurusan yang memutuskan dan menetapkan penempatan.', 'Saran industri, kepala jurusan memutuskan.', ['Saran industri', 'Keputusan kepala jurusan'], 'uji-terbatas', ['H-17']],
          ['Penempatan dan pemantauan', 'Mitra industri', 'Kepala jurusan mengelola daftar mitra industri untuk penempatan PKL.', 'Kelola daftar mitra industri.', ['Mitra industri', 'Daftar'], 'uji-terbatas', []],
          ['Penempatan dan pemantauan', 'Pemantauan selama PKL', 'Pemantauan murid selama PKL akan tersedia.', 'Pemantauan murid selama PKL.', ['Pemantauan', 'PKL'], 'segera', ['H-17']],
        ],
      },
    ],
  },
];
