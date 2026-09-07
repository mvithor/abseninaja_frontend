import {
    IconLayoutDashboard, IconUserCircle, IconSettings, IconBriefcase, IconTargetArrow, IconUsers, IconHistory,
    IconActivity, IconClipboardCheck, IconAlertTriangle, IconDatabase, IconAdjustmentsHorizontal, IconCertificate,
    IconArrowsRightLeft, IconBuildingFactory2, IconBook,
 
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
      icon: IconLayoutDashboard,
      href: '/dashboard/kepala-jurusan',
      chipColor: 'secondary'
    },
    {
      id: uniqueId(),
      title: 'Profil Siswa',
      icon: IconUserCircle,
      href: '/dashboard/kepala-jurusan/profil-siswa',
    },

    {
        id: uniqueId(),
        title: 'Penempatan',
        icon: IconBriefcase,
        href: '',
        children: [
            {
                id: uniqueId(),
                title: 'Penempatan PKL',
                icon: IconTargetArrow,
                href: '/dashboard/kepala-jurusan/penempatan-pkl',
            },
            {
                id: uniqueId(),
                title: 'Siswa PKL',
                icon: IconUsers,
                href: '/dashboard/kepala-jurusan/siswa-pkl',
            },
            {
                id: uniqueId(),
                title: 'Riwayat PKL',
                icon: IconHistory,
                href: '/dashboard/kepala-jurusan/riwayat-pkl',
            },
        ],
    },
    {
        id: uniqueId(),
        title: 'Evaluasi',
        icon: IconActivity,
        href: '',
        children: [
            {
                id: uniqueId(),
                title: 'Evaluasi Industri',
                icon: IconClipboardCheck,
                href: '#',
            },
            {
                id: uniqueId(),
                title: 'Logbook dan Laporan',
                icon: IconBook,
                href: '#',
            },
            {
                id: uniqueId(),
                title: 'Early Warning System',
                icon: IconAlertTriangle,
                href: '#',
            },
        ],
    },
    {
        id: uniqueId(),
        title: 'Konfigurasi',
        icon: IconDatabase,
        href: '',
        children: [
            {
                id: uniqueId(),
                title: 'Konfigurasi Jurusan',
                icon: IconAdjustmentsHorizontal,
                href: '/dashboard/kepala-jurusan/konfigurasi-jurusan',
            },
            {
                id: uniqueId(),
                title: 'Unit Kompetensi (SKKNI)',
                icon: IconCertificate,
                href: '/dashboard/kepala-jurusan/skkni-unit',
            },
            {
                id: uniqueId(),
                title: 'Pemetaan Mapel-SKKNI',
                icon: IconArrowsRightLeft,
                href: '/dashboard/kepala-jurusan/mapel-skkni-mapping',
            },
            {
                id: uniqueId(),
                title: 'Mitra Industri',
                icon: IconBuildingFactory2,
                href: '/dashboard/kepala-jurusan/mitra-industri',
            },
        ],
    },

    {
      id: uniqueId(),
      title: 'Pengaturan',
      icon: IconSettings,
      href: '#',
    },
  ];
  
  export default MenuitemsKepalaJurusan;