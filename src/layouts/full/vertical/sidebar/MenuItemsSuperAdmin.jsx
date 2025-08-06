import {
    IconTrophy,
    IconAward,
    IconHealthRecognition,
    IconTargetArrow,
    IconDashboard,
  } from '@tabler/icons-react';
  
import { uniqueId } from 'lodash';
  
  const MenuitemsSuperAdmin = [
    {
        navlabel: true,
        subheader: 'Dashboard Super Admin',
    },
    {
      id: uniqueId(),
      title: 'Dashboard',
      icon: IconDashboard,
      href: '/dashboard/super-admin',
      chipColor: 'secondary'
    },
    {
        id: uniqueId(),
        title: 'Manajemen Sekolah',
        icon: IconAward,
        href: '',
        children: [
            {
                id: uniqueId(),
                title: 'Data Sekolah',
                icon: IconAward,
                href: '#',
            },
            {
                id: uniqueId(),
                title: 'Admin Sekolah',
                icon: IconAward,
                href: '/dashboard/super-admin/manajemen-sekolah/admin-sekolah',
            },
            {
                id: uniqueId(),
                title: 'Pendaftaran Sekolah',
                icon: IconAward,
                href: '/dashboard/super-admin/pendaftaran-sekolah',
            },
            {
                id: uniqueId(),
                title: 'Tambah Pendaftaran Sekolah',
                icon: IconAward,
                href: '/dashboard/super-admin/pendaftaran-sekolah/tambah',
            },
        ],
    },
    {
        id: uniqueId(),
        title: 'Pesan',
        icon: IconTrophy,
        href: '#'
    },
    {
        id: uniqueId(),
        title: 'Pengajuan',
        icon: IconTargetArrow,
        href: '#'
    },
    {
        id: uniqueId(),
        title: 'Status Kerja Sama',
        icon: IconTargetArrow,
        href: '#'
    },
    {
        id: uniqueId(),
        title: 'Manajemen Pengguna',
        icon: IconHealthRecognition,
        href: '#'
    },
  ];
  
  export default MenuitemsSuperAdmin;
  