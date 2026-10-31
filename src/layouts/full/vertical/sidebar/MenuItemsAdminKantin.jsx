import { IconDashboard } from '@tabler/icons-react';
import { uniqueId } from 'lodash';


const MenuitemsAdminKantin = [
  {
    navlabel: true,
    subheader: 'Dashboard Admin Kantin',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconDashboard,
    href: '/dashboard/admin-kantin',
    chipColor: 'secondary',
  },
];

export default MenuitemsAdminKantin;
