import { IconDashboard } from '@tabler/icons-react';
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
];

export default MenuitemsGuruSekolah;