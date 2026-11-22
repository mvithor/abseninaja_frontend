import {
  IconDashboard,
  IconReceipt,
  IconReportMoney,
  IconShoppingCart,
  IconToolsKitchen2,
  IconWallet,
} from '@tabler/icons-react';
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
  {
    id: uniqueId(),
    title: 'Kasir POS',
    icon: IconShoppingCart,
    href: '/dashboard/admin-kantin/kasir',
  },
  {
    id: uniqueId(),
    title: 'Katalog Menu',
    icon: IconToolsKitchen2,
    href: '/dashboard/admin-kantin/menu',
  },
  {
    id: uniqueId(),
    title: 'Dompet & Top-Up',
    icon: IconWallet,
    href: '/dashboard/admin-kantin/dompet',
  },
  {
    id: uniqueId(),
    title: 'Riwayat Transaksi',
    icon: IconReceipt,
    href: '/dashboard/admin-kantin/transaksi',
  },
  {
    id: uniqueId(),
    title: 'Pencairan & Rekon',
    icon: IconReportMoney,
    href: '/dashboard/admin-kantin/pencairan',
  },
];

export default MenuitemsAdminKantin;
