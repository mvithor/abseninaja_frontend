import { IconDashboard, IconFileText } from '@tabler/icons-react';
import { uniqueId } from 'lodash';


const MenuitemsGuruSekolah = [
  {
    navlabel: true,
    subheader: 'Dashboard Guru Sekolah',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconDashboard,
    href: '/dashboard/guru-sekolah',
    chipColor: 'secondary',
  },
  {
    id: uniqueId(),
    title: 'Perangkat Ajar',
    icon: IconFileText,
    href: '/dashboard/guru-sekolah/perangkat-ajar',
  },
];

export default MenuitemsGuruSekolah;
