import { IconDashboard, IconMapSearch, IconUsersGroup, IconNotebook, IconHistory, IconMessageReport, IconCalendarEvent } from '@tabler/icons-react';
import { uniqueId } from 'lodash';


const MenuitemsGuruBk = [
  {
    navlabel: true,
    subheader: 'Dashboard Guru BK',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconDashboard,
    href: '/dashboard/guru-bk',
    chipColor: 'secondary',
  },
  {
    id: uniqueId(),
    title: 'Pemetaan Siswa',
    icon: IconMapSearch,
    href: '/dashboard/guru-bk/pemetaan-siswa',
  },
  {
    id: uniqueId(),
    title: 'Pengaduan Anonim',
    icon: IconMessageReport,
    href: '/dashboard/guru-bk/pengaduan',
  },
  {
    id: uniqueId(),
    title: 'Jadwal Konseling',
    icon: IconCalendarEvent,
    href: '/dashboard/guru-bk/jadwal',
  },
  {
    id: uniqueId(),
    title: 'Jurnal Harian',
    icon: IconNotebook,
    href: '/dashboard/guru-bk/jurnal',
  },
  {
    id: uniqueId(),
    title: 'Riwayat Siswa',
    icon: IconHistory,
    href: '/dashboard/guru-bk/riwayat-siswa',
  },
  {
    id: uniqueId(),
    title: 'Tim BK',
    icon: IconUsersGroup,
    href: '/dashboard/guru-bk/tim-bk',
  },
];

export default MenuitemsGuruBk;
