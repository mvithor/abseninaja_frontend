import { IconDashboard, IconFileText, IconUsers, IconCalendarDue, IconArchive } from '@tabler/icons-react';
import { uniqueId } from 'lodash';


const MenuitemsWakaKurikulum = [
  {
    navlabel: true,
    subheader: 'Dashboard Waka Kurikulum',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconDashboard,
    href: '/dashboard/waka-kurikulum',
    chipColor: 'secondary',
  },
  {
    id: uniqueId(),
    title: 'Perangkat Ajar',
    icon: IconFileText,
    href: '',
    children: [
      {
        id: uniqueId(),
        title: 'Daftar Guru',
        icon: IconUsers,
        href: '/dashboard/waka-kurikulum/perangkat-ajar',
      },
      {
        id: uniqueId(),
        title: 'Deadline',
        icon: IconCalendarDue,
        href: '/dashboard/waka-kurikulum/deadline',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Arsip',
    icon: IconArchive,
    href: '/dashboard/waka-kurikulum/arsip',
  },
];

export default MenuitemsWakaKurikulum;
