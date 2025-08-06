import { useState } from 'react';
import {
  IconButton,
  Dialog,
  DialogContent,
  Stack,
  Divider,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  InputAdornment,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import { IconSearch, IconX } from '@tabler/icons-react';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import MenuitemsAdminSekolah from '../sidebar/MenuItemsAdminSekolah';


const SearchAdminSekolah = () => {
  const [showDrawer2, setShowDrawer2] = useState(false);
  const [search, setSearch] = useState('');
  const theme = useTheme(); // 

  const handleDrawerClose2 = () => {
    setShowDrawer2(false);
  };

  const filterRoutes = (rotr, cSearch) => {
    if (rotr.length > 1)
      return rotr.filter((t) =>
        t.title ? t.href.toLocaleLowerCase().includes(cSearch.toLocaleLowerCase()) : '',
      );
    return rotr;
  };

  const searchData = filterRoutes(MenuitemsAdminSekolah, search);

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'transparent' : '#f5f5f5', // Background light abu-abu, dark transparan
          borderRadius: '8px',
          padding: '4px 12px',
          width: '100%',
          maxWidth: { xs: '200px', sm: '250px', md: '300px' }, 
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.grey[500]}` : 'none', // Outline hanya di dark mode
        }}
      >
        <CustomOutlinedInput
          id="tb-search"
          placeholder="Cari"
          fullWidth
          value={search}
          onClick={() => setShowDrawer2(true)}
          startAdornment={
            <InputAdornment position="start">
              <IconSearch size="20" color={theme.palette.text.secondary} />
            </InputAdornment>
          }
          sx={{
            bgcolor: 'transparent',
            borderRadius: '8px',
            height: '30px',
            color: theme.palette.text.primary,
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, // Hapus outline dalam
          }}
        />
      </Box>

      <Dialog
        open={showDrawer2}
        onClose={handleDrawerClose2}
        fullWidth
        maxWidth={'sm'}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            position: 'fixed',
            top: 30,
            m: 0,
            bgcolor: theme.palette.background.paper,
          },
        }}
      >
        <DialogContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <CustomTextField
              id="tb-search"
              placeholder="Search here"
              fullWidth
              onChange={(e) => setSearch(e.target.value)}
              inputProps={{ 'aria-label': 'Search here' }}
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'transparent' : theme.palette.background.default,
                border: `1px solid ${theme.palette.grey[400]}`, // Outline abu-abu di dalam input dialog
                color: theme.palette.text.primary,
                borderRadius: '8px',
              }}
            />
            <IconButton size="small" onClick={handleDrawerClose2}>
              <IconX size="18" color={theme.palette.text.primary} />
            </IconButton>
          </Stack>
        </DialogContent>
        <Divider sx={{ bgcolor: theme.palette.divider }} />
        <Box p={2} sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          <Typography variant="h5" p={1} color="text.primary">
            Quick Page Links
          </Typography>
          <Box>
            <List component="nav">
              {searchData.map((menu) => (
                <Box key={menu.title ? menu.id : menu.subheader}>
                  {menu.title && !menu.children ? (
                    <ListItemButton
                      sx={{
                        py: 0.5,
                        px: 1,
                        borderRadius: '8px',
                        bgcolor: theme.palette.background.paper, // Background warna dasar
                        border: 'none', // Tidak ada outline untuk hasil pencarian
                        '&:hover': {
                          bgcolor: theme.palette.action.hover,
                        },
                      }}
                      to={menu.href}
                      component={Link}
                    >
                      <ListItemText
                        primary={menu.title}
                        secondary={menu.href}
                        sx={{
                          color: theme.palette.text.primary,
                          my: 0,
                          py: 0.5,
                        }}
                      />
                    </ListItemButton>
                  ) : null}
                  {menu.children &&
                    menu.children.map((child) => (
                      <ListItemButton
                        sx={{
                          py: 0.5,
                          px: 1,
                          borderRadius: '8px',
                          bgcolor: theme.palette.background.paper,
                          border: 'none', // Tidak ada outline
                          '&:hover': {
                            bgcolor: theme.palette.action.hover,
                          },
                        }}
                        to={child.href}
                        component={Link}
                        key={child.title ? child.id : menu.subheader}
                      >
                        <ListItemText
                          primary={child.title}
                          secondary={child.href}
                          sx={{
                            color: theme.palette.text.primary,
                            my: 0,
                            py: 0.5,
                          }}
                        />
                      </ListItemButton>
                    ))}
                </Box>
              ))}
            </List>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default SearchAdminSekolah;
