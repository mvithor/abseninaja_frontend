import {
    IconDashboard,
  } from '@tabler/icons-react';
  
import { uniqueId } from 'lodash';
  
  const MenuitemsKepalaJurusan = [
    {
        navlabel: true,
        subheader: 'Dashboard Kepala Jurusan',
    },
    {
      id: uniqueId(),
      title: 'Dashboard',
      icon: IconDashboard,
      href: '/dashboard/kepala-jurusan',
      chipColor: 'secondary'
    },
    {
      id: uniqueId(),
      title: 'Profil Siswa',
      icon: IconDashboard,
      href: '/dashboard/kepala-jurusan/profil-siswa',
    },
    {
      id: uniqueId(),
      title: 'Unit Kompetensi (SKKNI)',
      icon: IconDashboard,
      href: '/dashboard/kepala-jurusan/skkni-unit',
    },
        {
      id: uniqueId(),
      title: 'Mitra Industri',
      icon: IconDashboard,
      href: '/dashboard/kepala-jurusan/mitra-industri',
    },
    {
      id: uniqueId(),
      title: 'Pemetaan Mapel-SKKNI',
      icon: IconDashboard,
      href: '/dashboard/kepala-jurusan/mapel-skkni-mapping',
    },
    {
      id: uniqueId(),
      title: 'Konfigurasi Jurusan',
      icon: IconDashboard,
      href: '/dashboard/kepala-jurusan/konfigurasi-jurusan',
    },
    {
      id: uniqueId(),
      title: 'Penempatan PKL',
      icon: IconDashboard,
      href: '#',
    },
    {
      id: uniqueId(),
      title: 'Evaluasi Industri',
      icon: IconDashboard,
      href: '#',
    },
    {
      id: uniqueId(),
      title: 'Early Warning System',
      icon: IconDashboard,
      href: '#',
    },
    {
      id: uniqueId(),
      title: 'Pengaturan',
      icon: IconDashboard,
      href: '#',
    },
   
   
  ];
  
  export default MenuitemsKepalaJurusan;
  