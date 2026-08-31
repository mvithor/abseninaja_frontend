import { lazy } from "react";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "src/components/protected-route/ProtectedRoutes";
import Loadable from "src/layouts/full/shared/loadable/Loadable";

// Layout
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

/* ****Dashboard Super Admin***** */
const DashboardSuperAdmin = Loadable(lazy(() => import('../views/dashboard/SuperAdmin')));

// Pendaftaran Sekolah
const PendaftaranSekolahList = Loadable(lazy(() => import('../views/apps/super-admin/pendaftaran-sekolah/PendaftaranSekolahList')));
const PendaftaranSekolahAdd = Loadable(lazy(() => import('../views/apps/super-admin/pendaftaran-sekolah/PendaftaranSekolahAdd')));
const PendaftaranSekolahEdit = Loadable(lazy(() => import('../views/apps/super-admin/pendaftaran-sekolah/PendaftaranSekolahEdit')));
// Data Admin Sekolah
const AdminSekolahList = Loadable(lazy(() => import('../views/apps/super-admin/admin-sekolah/AdminSekolahList')));
const AdminSekolahAdd = Loadable(lazy(() => import('../views/apps/super-admin/admin-sekolah/AdminSekolahAdd')));
// Fitur Tambahan Sekolah
const FiturTambahanSekolahList = Loadable(lazy(() => import('../views/apps/super-admin/fitur-tambahan-sekolah/FiturTambahanSekolahList')));
const FiturTambahanSekolahEdit = Loadable(lazy(() => import('../views/apps/super-admin/fitur-tambahan-sekolah/FiturTambahanEdit')));



/* ****Dashboard Admin Sekolah***** */
const DashboardAdminSekolah = Loadable(lazy(() => import('../views/dashboard/AdminSekolah')));

// Absensi 
const AbsensiList = Loadable(lazy(() => import('../views/apps/admin-sekolah/absensi/AbsensiList')));
const QrCodeScanView = Loadable(lazy(() => import('../views/apps/admin-sekolah/absensi/QrCodeScanView')));
const AbsensiAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/absensi/AbsensiAdd')));
const AbsensiEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/absensi/AbsensiEdit')));
// Data Siswa
const SiswaList = Loadable(lazy(() => import('../views/apps/admin-sekolah/data-siswa/SiswaList')));
const SiswaAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/data-siswa/SiswaAdd')));
const SiswaEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/data-siswa/SiswaEdit')));
// Data Pegawai Guru
const PegawaiGuruList = Loadable(lazy(() => import('../views/apps/admin-sekolah/data-guru/PegawaiGuruList')));
const PegawaiGuruAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/data-guru/PegawaiGuruAdd')));
const PegawaiGuruEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/data-guru/PegawaiGuruEdit')));
// Data Pegawai Staff
const PegawaiStafList = Loadable(lazy(() => import('../views/apps/admin-sekolah/data-staf/PegawaiStafList')));
const PegawaiStafAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/data-staf/PegawaiStafAdd')));
const PegawaiStafEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/data-staf/PegawaiStafEdit')));
// Data Wali Siswa
const WaliSiswaList = Loadable(lazy(() => import('../views/apps/admin-sekolah/data-wali-siswa/WaliSiswaList')));
const WaliSiswaAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/data-wali-siswa/WaliSiswaAdd')));
const WaliSiswaEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/data-wali-siswa/WaliSiswaEdit')));
// Kategori Pegawai
const KategoriPegawaiList = Loadable(lazy(() => import('../views/apps/admin-sekolah/kategori-pegawai/KategoriPegawaiList')));
const KategoriPegawaiEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/kategori-pegawai/KategoriPegawaiEdit')));
const KategoriPegawaiAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/kategori-pegawai/KategoriPegawaiAdd')));
const KategoriPegawaiDetailList = Loadable(lazy(() => import('../views/apps/admin-sekolah/kategori-pegawai/KategoriPegawaiDetailList')));
const KategoriPegawaiDetailAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/kategori-pegawai/KategoriPegawaiDetailAdd')));
const KategoriPegawaiDetailEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/kategori-pegawai/KategoriPegawaiDetailEdit')));
// Perizinan Pegawai
const PerizinanPegawaiList = Loadable(lazy(() => import('../views/apps/admin-sekolah/perizinan-pegawai/PerizinanPegawaiList')));
const PerizinanPegawaiEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/perizinan-pegawai/PerizinanPegawaiEdit')));
// Perizinan Siswa
const PerizinanSiswaList = Loadable(lazy(() => import('../views/apps/admin-sekolah/perizinan-siswa/PerizinanSiswaList')));
const PerizinanSiswaEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/perizinan-siswa/PerizinanSiswaEdit')));
// Generate QR-Code
const QrCodeGenerateList = Loadable(lazy(() => import('../views/apps/admin-sekolah/qr-code/QrCodeGenerateList')));
// Ekskul Sekolah
const EkskulList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ekskul/EkskulList')));
const EkskulAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ekskul/EkskulAdd')));
const EkskulEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ekskul/EkskulEdit')));
// Anggota Ekskul
const EkskulSiswaList = Loadable(lazy(() => import('../views/apps/admin-sekolah/anggota-ekskul/EkskulSiswaList')));
const EkskulSiswaDetail = Loadable(lazy(() => import('../views/apps/admin-sekolah/anggota-ekskul/EkskulSiswaDetail')));
// Kelas
const KelasList = Loadable(lazy(() => import('../views/apps/admin-sekolah/kelas/KelasList')));
const KelasDetail = Loadable(lazy(() => import('../views/apps/admin-sekolah/kelas/KelasDetail')));
const KelasAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/kelas/KelasAdd')));
const KelasEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/kelas/KelasEdit')));
// Jurusan
const JurusanList = Loadable(lazy(() => import('../views/apps/admin-sekolah/jurusan/JurusanList')));
const JurusanAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/jurusan/JurusanAdd')));
const JurusanEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/jurusan/JurusanEdit')));
// Kepala Jurusan
const KepalaJurusanAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/kepala-jurusan/KepalaJurusanAdd')));

// Alumni
const AlumniList = Loadable(lazy(() => import('../views/apps/admin-sekolah/alumni/AlumniList')));
const AlumniImport = Loadable(lazy(() => import('../views/apps/admin-sekolah/alumni/AlumniImport')));
// Mata Pelajaran
const MataPelajaranList = Loadable(lazy(() => import('../views/apps/admin-sekolah/mata-pelajaran/MataPelajaranList')));
const MataPelajaranAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/mata-pelajaran/MataPelajaranAdd')));
const MataPelajaranEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/mata-pelajaran/MataPelajaranEdit')));
const MataPelajaranDetail = Loadable(lazy(() => import('../views/apps/admin-sekolah/mata-pelajaran/MataPelajaranDetail')));
// Jadwal Mapel
const JadwalMapelList = Loadable(lazy(() => import('../views/apps/admin-sekolah/jadwal-mapel/JadwalMapelList')));
const JadwalMapelAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/jadwal-mapel/JadwalMapelAdd')));
const JadwalMapelEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/jadwal-mapel/JadwalMapelEdit')));
// Jadwal Ekskul
const JadwalEkskulList = Loadable(lazy(() => import('../views/apps/admin-sekolah/jadwal-ekskul/JadwalEkskulList')));
const JadwalEkskulAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/jadwal-ekskul/JadwalEkskulAdd')));
const JadwalEkskulEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/jadwal-ekskul/JadwalEkskulEdit')));
// Guru Mapel
const GuruMapelList = Loadable(lazy(() => import('../views/apps/admin-sekolah/guru-mapel/GuruMapelList')));
const GuruMapelAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/guru-mapel/GuruMapelAdd')));
const GuruMapelEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/guru-mapel/GuruMapelEdit')));
// Tingkat Kelas
const TingkatList = Loadable(lazy(() => import('../views/apps/admin-sekolah/tingkat/TingkatList')));
const TingkatAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/tingkat/TingkatAdd')));
const TingkatEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/tingkat/TingkatEdit')));
// Wali Kelas
const WaliKelasList = Loadable(lazy(() => import('../views/apps/admin-sekolah/wali-kelas/WaliKelasList')));
const WaliKelasAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/wali-kelas/WaliKelasAdd')));
const WaliKelasEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/wali-kelas/WaliKelasEdit')));
// WhatsApp
const WhatsAppList = Loadable(lazy(() => import('../views/apps/admin-sekolah/whatsApp/WhatsAppList')));
// Template WhatsApp
const WaTemplateList = Loadable(lazy(() => import('../views/apps/admin-sekolah/wa-template/WaTemplateList')));
const WaTemplateAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/wa-template/WaTemplateAdd')));
const WaTemplateEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/wa-template/WaTemplateEdit')));
// Kategori Template
const KategoriTemplateList = Loadable(lazy(() => import('../views/apps/admin-sekolah/kategori-template/KategoriTemplateList')));
const KategoriTemplateAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/kategori-template/KategoriTemplateAdd')));
const KategoriTemplateEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/kategori-template/KategoriTemplateEdit')));
// Notifikasi Template Mobile
const NotifikasiTemplateList = Loadable(lazy(() => import('../views/apps/admin-sekolah/notifikasi-template/NotifikasiTemplateList')));
const NotifikasiTemplateAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/notifikasi-template/NotifikasiTemplateAdd')));
const NotifikasiTemplateEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/notifikasi-template/NotifikasiTemplateEdit')));
// Pengaturan Jam
const PengaturanJamList = Loadable(lazy(() => import('../views/apps/admin-sekolah/pengaturan-jam/PengaturanJamList')));
const PengaturanJamEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/pengaturan-jam/PengaturanJamEdit')));
// Hari
const HariList = Loadable(lazy(() => import('../views/apps/admin-sekolah/hari/HariList')));
const HariAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/hari/HariAdd')));
const HariEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/hari/HariEdit')));
// Waktu
const WaktuList = Loadable(lazy(() => import('../views/apps/admin-sekolah/waktu/WaktuList')));
const WaktuAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/waktu/WaktuAdd')));
const WaktuEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/waktu/WaktuEdit')));
// Kategori Waktu
const KategoriWaktuList = Loadable(lazy(() => import('../views/apps/admin-sekolah/kategori-waktu/KategoriWaktuList')));
const KategoriWaktuAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/kategori-waktu/KategoriWaktuAdd')));
const KategoriWaktuEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/kategori-waktu/KategoriWaktuEdit')));
// Status Kehadiran
const StatusKehadiranList = Loadable(lazy(() => import('../views/apps/admin-sekolah/status-kehadiran/StatusKehadiranList')));
const StatusKehadiranAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/status-kehadiran/StatusKehadiranAdd')));
const StatusKehadiranEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/status-kehadiran/StatusKehadiranEdit')));
// Semester Ajaran
const SemesterAjaranList = Loadable(lazy(() => import('../views/apps/admin-sekolah/semester-ajaran/SemesterAjaranList')));
const SemesterAjaranAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/semester-ajaran/SemesterAjaranAdd')));
const SemesterAjaranEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/semester-ajaran/SemesterAjaranEdit')));
// Tahun Ajaran
const TahunAjaranList = Loadable(lazy(() => import('../views/apps/admin-sekolah/tahun-ajaran/TahunAjaranList')));
const TahunAjaranAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/tahun-ajaran/TahunAjaranAdd')));
const TahunAjaranEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/tahun-ajaran/TahunAjaranEdit')));
// Prestasi Siswa
const PrestasiSiswaList = Loadable(lazy(() => import('../views/apps/admin-sekolah/prestasi-siswa/PrestasiSiswaList')));
const PrestasiSiswaAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/prestasi-siswa/PrestasiSiswaAdd')));
const PrestasiSiswaEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/prestasi-siswa/PrestasiSiswaEdit')));
// Prestasi Institusi
const PrestasiMadrasahList = Loadable(lazy(() => import('../views/apps/admin-sekolah/prestasi-madrasah/PrestasiMadrasahList')));
const PrestasiMadrasahAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/prestasi-madrasah/PrestasiMadrasahAdd')));
const PrestasiMadrasahEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/prestasi-madrasah/PrestasiMadrasahEdit')));
// User Admin
const UserAdminList = Loadable(lazy(() => import('../views/apps/admin-sekolah/user-admin/UserAdminList')));
const UserAdminAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/user-admin/UserAdminAdd')));
// User Staf
const UserStafList = Loadable(lazy(() => import('../views/apps/admin-sekolah/user-staf/UserStafList')));
// User Siswa
const UserSiswaList = Loadable(lazy(() => import('../views/apps/admin-sekolah/user-siswa/UserSiswaList')));
// User Guru List
const UserGuruList = Loadable(lazy(() => import('../views/apps/admin-sekolah/user-guru/UserGuruList')));
// User Wali Siswa
const UserWaliSiswaList = Loadable(lazy(() => import('../views/apps/admin-sekolah/user-wali-siswa/UserWaliSiswaList')));
// Download Data Siswa
const DownloadDataSiswaList = Loadable(lazy(() => import('../views/apps/admin-sekolah/download-data-siswa/DownloadDataSiswaList')));
const DownloadDataWaliSiswaList = Loadable(lazy(() => import('../views/apps/admin-sekolah/download-data-wali-siswa/DownloadDataWaliSiswaList')));
// Rekap Absensi 
const RekapAbsensiGlobalList = Loadable(lazy(() => import('../views/apps/admin-sekolah/rekap-absensi-global/RekapAbsensiGlobalList')));


// Penerimaan Peserta Didik Baru (PPDB)

// PPDB Overview
const PpdbOverviewDashboard = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-overview/PpdbOverviewDashboard')));

// PPDB Period
const PpdbPeriodList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-period/PpdbPeriodList')));
const PpdbPeriodAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-period/PpdbPeriodAdd')));
const PpdbPeriodEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-period/PpdbPeriodEdit')));
const PpdbPeriodDetail = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-period/PpdbPeriodDetail')));

// PPDB Gelombang
const PpdbGelombangList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-wave/PpdbWaveList')));
const PpdbGelombangAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-wave/PpdbWaveAdd')));
const PpdbGelombangEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-wave/PpdbWaveEdit')));
const PpdbGelombangDetail = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-wave/PpdbWaveDetail')));

// PPDB Jalur
const PpdbJalurList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-track/PpdbTrackList')));
const PpdbJalurAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-track/PpdbTrackAdd')));
const PpdbJalurEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-track/PpdbTrackEdit')));

// PPDB Jalur Per Gelombang
const PpdbJalurGelombangList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-wave-tracks/PpdbWaveTrackList')));
const PpdbJalurGelombangAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-wave-tracks/PpdbWaveTrackAdd')));
const PpdbJalurGelombangEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-wave-tracks/PpdbWaveTrackEdit')));

// PPDB Panitia
const PpdbPanitiaList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-panitia/PpdbPanitiaList')));
const PpdbPanitiaAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-panitia/PpdbPanitiaAdd')));
const PpdbPanitiaEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-panitia/PpdbPanitiaEdit')));

// PPDB Pendaftar
const PpdbPendaftarList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-pendaftar/PpdbPendaftarList')));
const PpdbPendaftarDetail = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-pendaftar/PpdbPendaftarDetail')));

// PPDB Berkas
const PpdbBerkasList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-berkas/PpdbBerkasList')));
const PpdbBerkasVerify = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-berkas/PpdbBerkasVerify')));

// PPDB Tahapan
const PpdbTahapanList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-tahapan/PpdbTahapanList')));
const PpdbTahapanAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-tahapan/PpdbTahapanAdd')));
const PpdbTahapanEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-tahapan/PpdbTahapanEdit')));

// PPDB Jadwal Tahapan
const PpdbJadwalTahapanList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-jadwal-tahapan/PpdbJadwalTahapanList')));
const PpdbJadwalTahapanAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-jadwal-tahapan/PpdbJadwalTahapanAdd')));
const PpdbJadwalTahapanEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-jadwal-tahapan/PpdbJadwalTahapanEdit')));

// PPDB Komponen Test
const PpdbTestComponentList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-test-component/PpdbTestComponentList')));
const PpdbTestComponentAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-test-component/PpdbTestComponentAdd')));
const PpdbTestComponentEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-test-component/PpdbTestComponentEdit')));

// PPDB Persyaratan Tes
const PpdbPersyaratanTesList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-wave-track-requirement/PpdbWaveTrackRequirementList')));
const PpdbPersyaratanTesAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-wave-track-requirement/PpdbWaveTrackRequirementAdd')));
const PpdbPersyaratanTesEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-wave-track-requirement/PpdbWaveTrackRequirementEdit')));

// PPDB Sesi dan Jadwal Tes
const PpdbSesiJadwalList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-sesi-jadwal/PpdbSesiJadwalList')));
const PpdbSesiJadwalAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-sesi-jadwal/PpdbSesiJadwalAdd')));
const PpdbSesiJadwalEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-sesi-jadwal/PpdbSesiJadwalEdit')));
const PpdbSesiJadwalDetail = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-sesi-jadwal/PpdbSesiJadwalDetail')));

// PPDB Ruangan
const PpdbRoomList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-room/PpdbRoomList')));
const PpdbRoomAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-room/PpdbRoomAdd')));
const PpdbRoomEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-room/PpdbRoomEdit')));

// PPDB Ruangan Sesi Tes
const PpdbSesiRoomList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-sesi-room/PpdbSesiRoomList')));
const PpdbSesiRoomAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-sesi-room/PpdbSesiRoomAdd')));
const PpdbSesiRoomEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-sesi-room/PpdbSesiRoomEdit')));

// PPDB Peserta Tes
const PpdbPesertaTesList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-peserta-tes/PpdbPesertaTesList')));
const PpdbPesertaTesAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-peserta-tes/PpdbPesertaTesAdd')));

// PPDB Pengawas ruangan
const PpdbProctorList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-proctor/PpdbProctorList')));
const PpdbProctorAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-proctor/PpdbProctorAdd')));
const PpdbProctorEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-proctor/PpdbProctorEdit')));

// PPDB Monitoring Nilai
const PpdbNilaiList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-nilai/PpdbNilaiList')));
const PpdbNilaiDetail = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-nilai/PpdbNilaiDetail')));

// PPDB Input Nilai
const PpdbInputNilaiList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-input-nilai/PpdbInputList')));
const PpdbInputNilaiDetail = Loadable(lazy(() => import('../views/apps/admin-sekolah/ppdb/ppdb-input-nilai/PpdbInputNilaiDetail')));

// DASHBOARD KEPALA JURUSAN
/* ****Dashboard Kepala Jurusan***** */
const DashboardKepalaJurusan = Loadable(lazy(() => import('../views/dashboard/KepalaJurusan')));

// SKKNI Unit
const SkkniUnitList = Loadable(lazy(() => import('../views/apps/kepala-jurusan/skkni-unit/SkkniUnitList')));
const SkkniUnitAdd = Loadable(lazy(() => import('../views/apps/kepala-jurusan/skkni-unit/SkkniUnitAdd')));
const SkkniUnitEdit = Loadable(lazy(() => import('../views/apps/kepala-jurusan/skkni-unit/SkkniUnitEdit')));
// Mitra Industri
const MitraIndustriList = Loadable(lazy(() => import('../views/apps/kepala-jurusan/mitra-industri/MitraIndustriList')));
const MitraIndustriAdd = Loadable(lazy(() => import('../views/apps/kepala-jurusan/mitra-industri/MitraIndustriAdd')));
const MitraIndustriEdit = Loadable(lazy(() => import('../views/apps/kepala-jurusan/mitra-industri/MitraIndustriEdit')));
// Mapel SKKNI Mapping
const MapelSkkniMappingList = Loadable(lazy(() => import('../views/apps/kepala-jurusan/mapel-skkni-mapping/MapelSkkniMappingList')));
// Konfigurasi Jurusan
const KonfigurasiJurusanList = Loadable(lazy(() => import('../views/apps/kepala-jurusan/konfigurasi-jurusan/KonfigurasiJurusan')));
// Profil Siswa
const ProfilSiswaList = Loadable(lazy(() => import('../views/apps/kepala-jurusan/profil-siswa/ProfilSiswaList')));

// DASHBOARD ADMIN MITRA INDUSTRI
/* ****Dashboard Admin Mitra Industri***** */
const DashboardAdminMitraIndustri = Loadable(lazy(() => import('../views/dashboard/AdminMitraIndustri')));


// Authentication
const Login = Loadable(lazy(() => import('../views/authentication/auth/Login')));
const Activation = Loadable(lazy(() => import('../views/authentication/auth/Activation')));
const PrivacyPolicy = Loadable(lazy(() => import('../views/privacy-policy/PrivacyPolicy')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const Forbidden = Loadable(lazy(() => import('../views/authentication/Forbidden')));

const Router = [
    {
        path: '/',
        element: <BlankLayout />, 
        children: [
          { path: '/', element: <Login /> },
          { path: '/404', element: <Error /> },
          { path: '/privacy-policy', element: <PrivacyPolicy/> },
          { path: '/forbidden', element: <Forbidden /> },
          { path: '/aktivasi/:token', element: <Activation /> },
          { path: '*', element: <Navigate to="/404" /> },
        ],
    },
    {
        path: '/',
        element: <FullLayout/>,
        children: [
            {
                path: 'dashboard/admin-sekolah',
                element: <ProtectedRoute allowedRoles={['admin sekolah']}/>,
                children: [
                    { path: '', element: <DashboardAdminSekolah /> },
                    // Absensi Siswa
                    { path: 'absensi-siswa', element: <AbsensiList/> },
                    { path: 'absensi', element: <QrCodeScanView/> },
                    { path: 'absensi-siswa/tambah', element: <AbsensiAdd/> },
                    { path: 'absensi-siswa/edit/:id', element: <AbsensiEdit/> },
                    // Data Siswa
                    { path: 'siswa', element: <SiswaList/> },
                    { path: 'siswa/edit/:id', element: <SiswaEdit/> },
                    { path: 'siswa/tambah', element: <SiswaAdd/> },
                    // Data Pegawai Guru
                    { path: 'pegawai/guru', element: <PegawaiGuruList /> },
                    { path: 'pegawai/guru/tambah-guru', element: <PegawaiGuruAdd /> },
                    { path: 'pegawai/guru/edit/:id', element: <PegawaiGuruEdit /> },
                    // Data Pegawai Staff
                    { path: 'pegawai/staf', element: <PegawaiStafList /> },
                    { path: 'pegawai/staf/tambah-staf', element: <PegawaiStafAdd /> },
                    { path: 'pegawai/staf/edit/:id', element: <PegawaiStafEdit /> },
                    // Wali Kelas
                    { path: 'wali-kelas', element: <WaliKelasList/> },
                    { path: 'wali-kelas/tambah-wali-kelas', element: <WaliKelasAdd/> },
                    { path: 'wali-kelas/edit/:id', element: <WaliKelasEdit/> },
                    // Tingkat
                    { path: 'tingkat', element: <TingkatList/> },
                    { path: 'tingkat/tambah-tingkat', element: <TingkatAdd/> },
                    { path: 'tingkat/edit/:id', element: <TingkatEdit/> },
                    // Data Wali Siswa
                    { path: 'wali-siswa', element: <WaliSiswaList/> },
                    { path: 'wali-siswa/tambah', element: <WaliSiswaAdd/> },
                    { path: 'wali-siswa/edit/:id', element: <WaliSiswaEdit/> },
                    // Kategori Pegawai
                    { path: 'kategori-pegawai', element: <KategoriPegawaiList /> },
                    { path: 'kategori-pegawai/tambah-kategori', element: <KategoriPegawaiAdd /> },
                    { path: 'kategori-pegawai/edit/:id', element: <KategoriPegawaiEdit/> },
                    { path: 'kategori-pegawai/detail/:id', element: <KategoriPegawaiDetailList/> },
                    { path: 'kategori-pegawai/:id/tambah-sub-kategori', element: <KategoriPegawaiDetailAdd/> },
                    { path: 'kategori-pegawai/:id/edit-sub-kategori/:subKategoriId', element: <KategoriPegawaiDetailEdit/> },
                    // Perizinan Pegawai
                    { path: 'perizinan-pegawai', element: <PerizinanPegawaiList /> }, 
                    { path: 'perizinan-pegawai/edit/:id', element: <PerizinanPegawaiEdit /> }, 
                    // Perizinan Siswa
                    { path: 'perizinan-siswa', element: <PerizinanSiswaList /> }, 
                    { path: 'perizinan-siswa/edit/:id', element: <PerizinanSiswaEdit /> }, 
                    // WhatsApp
                    { path: 'whatsapp', element: <WhatsAppList/> },
                    // Template WhatsApp
                    { path: 'wa-template', element: <WaTemplateList/> },
                    { path: 'wa-template/tambah-wa-template', element: <WaTemplateAdd/> },
                    { path: 'wa-template/edit/:id', element: <WaTemplateEdit/> },
                    //Kategori Template
                    { path: 'kategori-template', element: <KategoriTemplateList/> },
                    { path: 'kategori-template/tambah-template', element: <KategoriTemplateAdd/> },
                    { path: 'kategori-template/edit/:id', element: <KategoriTemplateEdit/> },
                    // Notifikasi Template Mobile
                    { path: 'notifikasi-template', element: <NotifikasiTemplateList/> },
                    { path: 'notifikasi-template/tambah', element: <NotifikasiTemplateAdd/> },
                    { path: 'notifikasi-template/edit/:id', element: <NotifikasiTemplateEdit/> },
                    // Kelas
                    { path: 'kelas', element: <KelasList/> },
                    { path: 'kelas/detail/:id', element: <KelasDetail/> },
                    { path: 'kelas/tambah-kelas', element: <KelasAdd/> },
                    { path: 'kelas/edit/:id', element: <KelasEdit/> },
                    // Jurusan
                    {
                        path: 'jurusan',
                        element: <ProtectedRoute allowedRoles={['admin sekolah']} requireJurusanFiturAktif />,
                        children: [
                            { path: '', element: <JurusanList/> },
                            { path: 'tambah-jurusan', element: <JurusanAdd/> },
                            { path: 'edit/:id', element: <JurusanEdit/> },
                            { path: ':id/kepala-jurusan', element: <KepalaJurusanAdd/> },
                        ],
                    },
                    // Alumni
                    { path: 'alumni', element: <AlumniList/> },
                    { path: 'alumni/import', element: <AlumniImport/> },
                    // Mata Pelajaran
                    { path: 'mata-pelajaran', element: <MataPelajaranList/> },
                    { path: 'mata-pelajaran/tambah-mapel', element: <MataPelajaranAdd/> },
                    { path: 'mata-pelajaran/edit/:id', element: <MataPelajaranEdit/> },
                    { path: 'mata-pelajaran/detail/:id', element: <MataPelajaranDetail/> },
                    // Jadwal Mapel
                    { path: 'jadwal-mapel', element: <JadwalMapelList/> },
                    { path: 'jadwal-mapel/tambah-jadwal', element: <JadwalMapelAdd/> },
                    { path: 'jadwal-mapel/edit/:id', element: <JadwalMapelEdit/> },
                    // Jadwal Ekskul
                    { path: 'jadwal-ekskul', element: <JadwalEkskulList/> },
                    { path: 'jadwal-ekskul/tambah-jadwal', element: <JadwalEkskulAdd/> },
                    { path: 'jadwal-ekskul/edit/:id', element: <JadwalEkskulEdit/> },
                    // Guru Mapel
                    { path: 'guru-mapel', element: <GuruMapelList/> },
                    { path: 'guru-mapel/tambah-guru-mapel', element: <GuruMapelAdd/> },
                    { path: 'guru-mapel/edit/:id', element: <GuruMapelEdit/> },
                    // Waktu
                    { path: 'waktu', element: <WaktuList/> },
                    { path: 'waktu/tambah-waktu', element: <WaktuAdd/> },
                    { path: 'waktu/edit/:id', element: <WaktuEdit/> },
                    // Kategori Waktu
                    { path: 'kategori-waktu', element: <KategoriWaktuList/> },
                    { path: 'kategori-waktu/tambah-kategori', element: <KategoriWaktuAdd/> },
                    { path: 'kategori-waktu/edit/:id', element: <KategoriWaktuEdit/> },
                    // Generate QR-Code
                    { path: 'generate-student-card', element: <QrCodeGenerateList/> },
                    // Ekskul Sekolah
                    { path: 'ekskul', element: <EkskulList/> },
                    { path: 'ekskul/tambah-ekskul', element: <EkskulAdd/> },
                    { path: 'ekskul/edit/:id', element: <EkskulEdit/> },
                    // Anggota Ekskul
                    { path: 'anggota-ekskul', element: <EkskulSiswaList/> },
                    { path: 'anggota-ekskul/detail/:id', element: <EkskulSiswaDetail/> },
                    // Pengaturan Jam
                    { path: 'pengaturan-jam', element: <PengaturanJamList/> }, 
                    { path: 'pengaturan-jam/edit/:id', element: <PengaturanJamEdit/> },   
                    // Status Kehadiran
                    { path: 'status-kehadiran', element: <StatusKehadiranList/> }, 
                    { path: 'status-kehadiran/tambah', element: <StatusKehadiranAdd/> }, 
                    { path: 'status-kehadiran/edit/:id', element: <StatusKehadiranEdit/> }, 
                    // Tahun Ajaran
                    { path: 'tahun-ajaran', element: <TahunAjaranList/> },
                    { path: 'tahun-ajaran/tambah', element: <TahunAjaranAdd/> },
                    { path: 'tahun-ajaran/edit/:id', element: <TahunAjaranEdit/> },
                    // Semester Ajaran 
                    { path: 'semester-ajaran', element: <SemesterAjaranList/> },
                    { path: 'semester-ajaran/tambah', element: <SemesterAjaranAdd/> },
                    { path: 'semester-ajaran/edit/:id', element: <SemesterAjaranEdit/> },
                    // Prestasi Siswa
                    { path: 'prestasi-siswa', element: <PrestasiSiswaList/> },
                    { path: 'prestasi-siswa/tambah-prestasi', element: <PrestasiSiswaAdd/> },
                    { path: 'prestasi-siswa/edit/:id', element: <PrestasiSiswaEdit/> },
                    // Prestasi Institusi
                    { path: 'prestasi-Institusi', element: <PrestasiMadrasahList/> },
                    { path: 'prestasi-Institusi/tambah-prestasi', element: <PrestasiMadrasahAdd/> },
                    { path: 'prestasi-Institusi/edit/:id', element: <PrestasiMadrasahEdit/> },
                    // Hari
                    { path: 'hari', element: <HariList/> },
                    { path: 'hari/tambah-hari', element: <HariAdd/> },
                    { path: 'hari/edit/:id', element: <HariEdit/> },
                    // User Admiin
                    { path: 'user-admin', element: <UserAdminList/> },
                    { path: 'user-admin/tambah', element: <UserAdminAdd/> },
                    { path: 'user-staf', element: <UserStafList/> },
                    // User Siswa
                    { path: 'user-siswa', element: <UserSiswaList/> },
                    // User Guru
                    { path: 'user-guru', element: <UserGuruList/> },
                    // User Wali Siswa
                    { path: 'user-wali-siswa', element: <UserWaliSiswaList/> },
                     // Download
                     { path: 'download/data-siswa-kelas', element: <DownloadDataSiswaList/> },
                     { path: 'download/data-wali-siswa', element: <DownloadDataWaliSiswaList/> },
                    // Rekap Absensi
                    { path: 'rekap-absensi', element: <RekapAbsensiGlobalList/> }, 

                    // Penerimaan Peserta Didik Baru (PPDB)

                    // PPDB Period
                    { path: 'ppdb-overview', element: <PpdbOverviewDashboard/> }, 
                    { path: 'ppdb-period', element: <PpdbPeriodList/> }, 
                    { path: 'ppdb-period/tambah-period', element: <PpdbPeriodAdd/> }, 
                    { path: 'ppdb-period/edit/:id', element: <PpdbPeriodEdit/> }, 
                    { path: 'ppdb-period/detail/:id', element: <PpdbPeriodDetail/> }, 
                    // PPDB Gelombang
                    { path: 'ppdb-gelombang', element: <PpdbGelombangList/> },  
                    { path: 'ppdb-gelombang/tambah-gelombang', element: <PpdbGelombangAdd/> }, 
                    { path: 'ppdb-gelombang/edit/:id', element: <PpdbGelombangEdit/> },  
                    { path: 'ppdb-gelombang/detail/:id', element: <PpdbGelombangDetail/> },
                    // PPDB Jalur
                    { path: 'ppdb-jalur', element: <PpdbJalurList/> }, 
                    { path: 'ppdb-jalur/tambah-jalur', element: <PpdbJalurAdd/> },   
                    { path: 'ppdb-jalur/edit/:id', element: <PpdbJalurEdit/> },  
                    // PPDB Jalur Gelombang
                    { path: 'ppdb-jalur-gelombang', element: <PpdbJalurGelombangList/> },
                    { path: 'ppdb-jalur-gelombang/tambah-jalur-gelombang', element: <PpdbJalurGelombangAdd/> }, 
                    { path: 'ppdb-jalur-gelombang/edit/:id', element: <PpdbJalurGelombangEdit/> },
                    // PPDB Panitia
                    { path: 'ppdb-panitia', element: <PpdbPanitiaList/> },
                    { path: 'ppdb-panitia/tambah', element: <PpdbPanitiaAdd/> },
                    {path: 'ppdb-panitia/edit/:id', element: <PpdbPanitiaEdit/> },
                    // PPDB Pendaftar
                    { path: 'ppdb-pendaftar', element: <PpdbPendaftarList/> },
                    { path: 'ppdb-pendaftar/detail/:id', element: <PpdbPendaftarDetail/> },
                    // PPDB Berkas
                    { path: 'ppdb-berkas', element: <PpdbBerkasList/> },
                    { path: 'ppdb-berkas/verifikasi/:id', element: <PpdbBerkasVerify/> },
                    // PPDB Tahapan
                    { path: 'ppdb-tahapan', element: <PpdbTahapanList/> },
                    { path: 'ppdb-tahapan/tambah', element: <PpdbTahapanAdd/> },
                    { path: 'ppdb-tahapan/edit/:id', element: <PpdbTahapanEdit/> },
                    // PPDB Jadwal Tahapan
                    { path: 'ppdb-jadwal-tahapan', element: <PpdbJadwalTahapanList/> },
                    { path: 'ppdb-jadwal-tahapan/tambah', element: <PpdbJadwalTahapanAdd/> },
                    { path: 'ppdb-jadwal-tahapan/edit/:id', element: <PpdbJadwalTahapanEdit/> },
                    // PPDB Komponen Tes
                    { path: 'ppdb-test-component', element: <PpdbTestComponentList/> },
                    { path: 'ppdb-test-component/tambah', element: <PpdbTestComponentAdd/> },
                    { path: 'ppdb-test-component/edit/:id', element: <PpdbTestComponentEdit/> },
                    // PPDB Persyaratan Tes
                    { path: 'ppdb-persyaratan-tes', element: <PpdbPersyaratanTesList/> },
                    { path: 'ppdb-persyaratan-tes/tambah', element: <PpdbPersyaratanTesAdd/> },
                    { path: 'ppdb-persyaratan-tes/edit/:id', element: <PpdbPersyaratanTesEdit/> },
                    // PPDB Sesi Jadwal
                    { path: 'ppdb-sesi-jadwal', element: <PpdbSesiJadwalList/> },
                    { path: 'ppdb-sesi-jadwal/tambah', element: <PpdbSesiJadwalAdd/> },
                    { path: 'ppdb-sesi-jadwal/edit/:id', element: <PpdbSesiJadwalEdit/> },
                    { path: 'ppdb-sesi-jadwal/detail/:id', element: <PpdbSesiJadwalDetail/> },
                    // PPDB Ruangan
                    { path: 'ppdb-room', element: <PpdbRoomList/> },
                    { path: 'ppdb-room/tambah', element: <PpdbRoomAdd/> },
                    { path: 'ppdb-room/edit/:id', element: <PpdbRoomEdit/> },
                    // PPDB Sesi Ruangan Tes
                    { path: 'ppdb-sesi-room', element: <PpdbSesiRoomList/> },
                    { path: 'ppdb-sesi-room/tambah', element: <PpdbSesiRoomAdd/> },
                    { path: 'ppdb-sesi-room/edit/:id', element: <PpdbSesiRoomEdit/> },
                    // PPDB Peserta Tes
                    { path: 'ppdb-peserta-tes', element: <PpdbPesertaTesList/> },
                    { path: 'ppdb-peserta-tes/tambah', element: <PpdbPesertaTesAdd/> },
                    // PPDB Pengawas Ruangan
                    { path: 'ppdb-proctors', element: <PpdbProctorList/> },
                    { path: 'ppdb-proctors/tambah', element: <PpdbProctorAdd/> },
                    { path: 'ppdb-proctors/edit/:id', element: <PpdbProctorEdit/> },
                    // PPDB Monitoring Nilai
                    { path: 'ppdb-nilai', element: <PpdbNilaiList/> },
                    { path: 'ppdb-nilai/detail/:id', element: <PpdbNilaiDetail/> },
                    // PPDB Input Nilai
                    { path: 'ppdb-input-nilai', element: <PpdbInputNilaiList/> },
                    { path: 'ppdb-input-nilai/detail/:participant_id', element: <PpdbInputNilaiDetail/> },
                
                ]
            },
            {
                path: 'dashboard/super-admin',
                element: <ProtectedRoute allowedRoles={['super admin']}/>,
                children: [
                    { path: '', element: <DashboardSuperAdmin /> },
                    // Pendaftaran Sekolah
                    { path: 'pendaftaran-sekolah', element: <PendaftaranSekolahList /> },
                    { path: 'pendaftaran-sekolah/tambah', element: <PendaftaranSekolahAdd /> },
                    { path: 'pendaftaran-sekolah/edit/:id', element: <PendaftaranSekolahEdit /> },
                    // Admin Sekolah
                    { path: 'manajemen-sekolah/admin-sekolah', element: <AdminSekolahList /> },
                    { path: 'manajemen-sekolah/tambah-admin/:sekolah_id', element: <AdminSekolahAdd /> },
                    // Fitur Tambahan Sekolah
                    { path: 'fitur-tambahan', element: <FiturTambahanSekolahList /> },
                    { path: 'fitur-tambahan/edit/:id', element: <FiturTambahanSekolahEdit /> },
                ]
        
              },
            {
                path: 'dashboard/kepala-jurusan',
                element: <ProtectedRoute allowedRoles={['pegawai']} requireKepalaJurusan />,
                children: [
                    { path: '', element: <DashboardKepalaJurusan /> },
                    // SKKNI Unit
                    { path: 'skkni-unit', element: <SkkniUnitList/> },
                    { path: 'skkni-unit/tambah', element: <SkkniUnitAdd/> },
                    { path: 'skkni-unit/edit/:id', element: <SkkniUnitEdit/> },
                    // Mitra Industri
                    { path: 'mitra-industri', element: <MitraIndustriList/> },
                    { path: 'mitra-industri/tambah', element: <MitraIndustriAdd/> },
                    { path: 'mitra-industri/edit/:id', element: <MitraIndustriEdit/> },
                    // Mapel SKKNI Mapping
                    { path: 'mapel-skkni-mapping', element: <MapelSkkniMappingList/> },
                    // Konfigurasi Jurusan
                    { path: 'konfigurasi-jurusan', element: <KonfigurasiJurusanList/> },
                    // Profil Siswa
                    { path: 'profil-siswa', element: <ProfilSiswaList/> },

                ]   
            },
            {
                path: 'dashboard/admin-mitra-industri',
                element: <ProtectedRoute allowedRoles={['admin mitra industri']} />,
                children: [
                    { path: '', element: <DashboardAdminMitraIndustri /> },
                ]
            },
        ]
    }
];

export default Router;