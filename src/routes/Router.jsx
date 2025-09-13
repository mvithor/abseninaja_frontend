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
// Generate QR-Code
const QrCodeGenerateList = Loadable(lazy(() => import('../views/apps/admin-sekolah/qr-code/QrCodeGenerateList')));
// Ekskul Sekolah
const EkskulList = Loadable(lazy(() => import('../views/apps/admin-sekolah/ekskul/EkskulList')));
const EkskulAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/ekskul/EkskulAdd')));
const EkskulEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/ekskul/EkskulEdit')));
// Kelas
const KelasList = Loadable(lazy(() => import('../views/apps/admin-sekolah/kelas/KelasList')));
const KelasDetail = Loadable(lazy(() => import('../views/apps/admin-sekolah/kelas/KelasDetail')));
const KelasAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/kelas/KelasAdd')));
const KelasEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/kelas/KelasEdit')));
// Mata Pelajaran
const MataPelajaranList = Loadable(lazy(() => import('../views/apps/admin-sekolah/mata-pelajaran/MataPelajaranList')));
const MataPelajaranAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/mata-pelajaran/MataPelajaranAdd')));
const MataPelajaranEdit = Loadable(lazy(() => import('../views/apps/admin-sekolah/mata-pelajaran/MataPelajaranEdit')));
// Jadwal Mapel
const JadwalMapelList = Loadable(lazy(() => import('../views/apps/admin-sekolah/jadwal-mapel/JadwalMapelList')));
const JadwalMapelAdd = Loadable(lazy(() => import('../views/apps/admin-sekolah/jadwal-mapel/JadwalMapelAdd')));
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
// Rekap Absensi 
const RekapAbsensiGlobalList = Loadable(lazy(() => import('../views/apps/admin-sekolah/rekap-absensi-global/RekapAbsensiGlobalList')));

// Authentication
const Login = Loadable(lazy(() => import('../views/authentication/auth/Login')));
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
                    // Kelas
                    { path: 'kelas', element: <KelasList/> }, 
                    { path: 'kelas/detail/:id', element: <KelasDetail/> },
                    { path: 'kelas/tambah-kelas', element: <KelasAdd/> }, 
                    { path: 'kelas/edit/:id', element: <KelasEdit/> }, 
                    // Mata Pelajaran
                    { path: 'mata-pelajaran', element: <MataPelajaranList/> },
                    { path: 'mata-pelajaran/tambah-mapel', element: <MataPelajaranAdd/> },
                    { path: 'mata-pelajaran/edit/:id', element: <MataPelajaranEdit/> },
                    // Jadwal Mapel
                    { path: 'jadwal-mapel', element: <JadwalMapelList/> },
                    { path: 'jadwal-mapel/tambah-jadwal', element: <JadwalMapelAdd/> },
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
                    // Pengaturan Jam
                    { path: 'pengaturan-jam', element: <PengaturanJamList/> }, 
                    { path: 'pengaturan-jam/edit/:id', element: <PengaturanJamEdit/> },   
                    // Status Kehadiran
                    { path: 'status-kehadiran', element: <StatusKehadiranList/> }, 
                    { path: 'status-kehadiran/tambah', element: <StatusKehadiranAdd/> }, 
                    { path: 'status-kehadiran/edit/:id', element: <StatusKehadiranEdit/> }, 
                    // Semester Ajaran dan Tahun Ajaran
                    { path: 'semester-ajaran', element: <SemesterAjaranList/> },
                    { path: 'semester-ajaran/tambah', element: <SemesterAjaranAdd/> },
                    { path: 'semester-ajaran/edit/:id', element: <SemesterAjaranEdit/> },
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
                     // Rekap Absensi
                    { path: 'rekap-absensi', element: <RekapAbsensiGlobalList/> }, 
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
        
                ]
        
              },
        ]
    }
];

export default Router;