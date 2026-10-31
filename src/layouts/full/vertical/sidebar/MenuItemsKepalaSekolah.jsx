import { IconDashboard } from '@tabler/icons-react';
import { uniqueId } from 'lodash';


const MenuitemsKepalaSekolah = [
  {
    navlabel: true,
    subheader: 'Dashboard Kepala Sekolah',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconDashboard,
    href: '/dashboard/kepala-sekolah',
    chipColor: 'secondary',
  },
];

export default MenuitemsKepalaSekolah;
