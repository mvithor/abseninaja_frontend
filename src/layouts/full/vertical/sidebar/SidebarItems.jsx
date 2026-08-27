import { useLocation } from 'react-router';
import { Box, List, useMediaQuery } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import axiosInstance from 'src/utils/axiosInstance';
import MenuitemsSuperAdmin from './MenuItemsSuperAdmin';
import MenuitemsAdminSekolah from './MenuItemsAdminSekolah';
import MenuitemsKepalaJurusan from './MenuItemsKepalaJurusan';
import MenuitemsAdminMitraIndustri from './MenuItemsAdminMitraIndustri';
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import NavGroup from './NavGroup/NavGroup';

const SidebarItems = () => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const customizer = useSelector((state) => state.customizer);
  const user = useSelector((state) => state.user); 
  const role = user ? user.role : ''; 
  const isKepalaJurusan = user ? user.isKepalaJurusan : false;
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

  // Pilih menu items berdasarkan user role
  let menuItems;
  switch (role) {
    case 'super admin':
      menuItems = MenuitemsSuperAdmin;
      break;
    case 'admin sekolah':
      menuItems = MenuitemsAdminSekolah.filter(
        (item) => !item.requiredFitur || fiturEnabledMap[item.requiredFitur],
      );
      break;
    case 'pegawai':
      menuItems = isKepalaJurusan ? MenuitemsKepalaJurusan : [];
      break;
    case 'admin mitra industri':
      menuItems = MenuitemsAdminMitraIndustri;
      break;
    default:
      menuItems = []; // Kosongkan menu items jika role tidak dikenali
      break;
  }

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