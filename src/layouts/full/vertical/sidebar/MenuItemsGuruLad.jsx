import { IconChartBar } from '@tabler/icons-react';
import { uniqueId } from 'lodash';

// Menu Dashboard Analitik Pembelajaran (LAD). Tidak lewat registri portal karena aksesnya ditentukan
// server (fitur sekolah aktif DAN akun terdaftar sebagai guru LAD); SidebarItems menampilkannya
// hanya bila probe /api/v1/lad/ping berhasil.
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
