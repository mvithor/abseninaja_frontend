import { useLocation } from 'react-router';
import { Box, List, useMediaQuery } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import axiosInstance from 'src/utils/axiosInstance';
import { getUserPortals } from 'src/portals/registry';
import MenuitemsSuperAdmin from './MenuItemsSuperAdmin';
import MenuitemsAdminSekolah from './MenuItemsAdminSekolah';
import MenuitemsKepalaJurusan from './MenuItemsKepalaJurusan';
import MenuitemsAdminMitraIndustri from './MenuItemsAdminMitraIndustri';
import MenuitemsGuruSekolah from './MenuItemsGuruSekolah';
import MenuitemsGuruLad from './MenuItemsGuruLad';
import useAksesLad from 'src/apps/guru-lad/useAksesLad';
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import NavGroup from './NavGroup/NavGroup';

// Peta portal (key di src/portals/registry.js) ke daftar menunya.
// Menu tetap di folder ini; registri sengaja tidak mengimpor menu agar halaman login ringan.
const MENU_BY_PORTAL = {
  'super-admin': MenuitemsSuperAdmin,
  'admin-sekolah': MenuitemsAdminSekolah,
  'kepala-jurusan': MenuitemsKepalaJurusan,
  'guru': MenuitemsGuruSekolah,
  'admin-mitra-industri': MenuitemsAdminMitraIndustri,
};

const SidebarItems = () => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const customizer = useSelector((state) => state.customizer);
  const user = useSelector((state) => state.user); 
  const role = user ? user.role : ''; 
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? customizer.isCollapse && !customizer.isSidebarHover : '';
  const dispatch = useDispatch();

  const { data: jurusanFiturStatus } = useQuery({
    queryKey: ['jurusan-fitur-status'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/admin-sekolah/jurusan/fitur-status');
      return response.data;
    },
    enabled: role === 'admin sekolah',
  });

  const fiturEnabledMap = {
    jurusan_kompetensi: Boolean(jurusanFiturStatus?.enabled),
  };

  // Menu = gabungan menu semua portal yang boleh diakses akun ini, urut prioritas.
  // Pegawai yang merangkap (mis. kepala jurusan dan guru) melihat kedua grup menu.
  // Tanpa portal apa pun, menu kosong.
  const menuPortal = getUserPortals(user).flatMap((portal) => {
    const menu = MENU_BY_PORTAL[portal.key] || [];
    if (portal.key === 'admin-sekolah') {
      return menu.filter((item) => !item.requiredFitur || fiturEnabledMap[item.requiredFitur]);
    }
    return menu;
  });

  // Menu LAD tidak berasal dari registri portal: aksesnya diputuskan server (fitur sekolah dan
  // pendaftaran guru LAD), jadi tampil hanya bila probe berhasil.
  const { boleh: bolehLad } = useAksesLad();
  const menuItems = bolehLad ? [...menuPortal, ...MenuitemsGuruLad] : menuPortal;

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {menuItems.map((item) => {
          if (item.subheader) {
            return <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />;
          } else if (item.children) {
            return (
              <NavCollapse
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
                onClick={() => dispatch(toggleMobileSidebar())}
              />
            );
          } else {
            return (
              <NavItem
                item={item}
                key={item.id}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                onClick={() => dispatch(toggleMobileSidebar())}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};

export default SidebarItems;