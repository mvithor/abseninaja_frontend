import { IconChartBar } from '@tabler/icons-react';
import { uniqueId } from 'lodash';

// Menu Dashboard Analitik Pembelajaran (LAD). Akses akhirnya diputuskan server (fitur sekolah aktif DAN akun terdaftar
// aktif sebagai guru LAD). SidebarItems memakainya lewat portal `guru-lad` (persona guru_lad dari login atau /konteks);
// untuk sesi yang belum membawa persona itu, probe /api/v1/lad/ping menambahkannya (lihat menuLad.js). Guru yang baru
// dinonaktifkan masih melihat menu ini sampai /konteks menyegarkan persona (maksimal sekitar satu menit); halaman LAD
// tetap menolak dengan pesan yang jelas.
const MenuitemsGuruLad = [
  {
    navlabel: true,
    subheader: 'Analitik Pembelajaran',
  },
  {
    id: uniqueId(),
    title: 'Kelas Saya',
    icon: IconChartBar,
    href: '/dashboard/guru-lad',
    chipColor: 'secondary',
  },
];

export default MenuitemsGuruLad;
