import { IconDashboard } from '@tabler/icons-react';
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
];

export default MenuitemsGuruBk;
