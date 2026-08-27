import { IconDashboard } from '@tabler/icons-react';
import { uniqueId } from 'lodash';


const MenuitemsAdminMitraIndustri = [
  {
    navlabel: true,
    subheader: 'Dashboard Mitra Industri',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconDashboard,
    href: '/dashboard/admin-mitra-industri',
    chipColor: 'secondary',
  },
];

export default MenuitemsAdminMitraIndustri;