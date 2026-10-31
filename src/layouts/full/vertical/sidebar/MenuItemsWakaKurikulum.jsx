import { IconDashboard } from '@tabler/icons-react';
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
];

export default MenuitemsWakaKurikulum;
