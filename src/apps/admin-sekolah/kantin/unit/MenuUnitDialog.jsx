import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import SearchButton from 'src/components/button-group/SearchButton';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import useDebouncedValue from 'src/hooks/useDebouncedValue';
import { KATEGORI_MENU } from 'src/apps/admin-kantin/kantin';
import { ambilMenuUnitKantin } from '../api';
import {
  KUNCI_KANTIN_SEKOLAH,
  formatRupiah,
  metaKategoriMenu,
  metaKetersediaanMenu,
  pesanGalatKantin,
} from '../kantinSekolah';

const KOLOM = 5;

const MenuUnitDialog = ({ buka, kantin, onTutup }) => {
  const userId = useSelector((state) => state.user.userId);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [kategori, setKategori] = useState('');
  const qDebounced = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    if (!buka) return;
    setPage(0);
    setSearchQuery('');
    setKategori('');
  }, [buka, kantin?.id]);

  const params = {
    page: page + 1,
    limit: rowsPerPage,
    ...(qDebounced.trim() ? { q: qDebounced.trim() } : {}),
    ...(kategori ? { kategori } : {}),
  };

  const menuQuery = useQuery({
    queryKey: [KUNCI_KANTIN_SEKOLAH.menuUnit, userId, kantin?.id, params],
    queryFn: () => ambilMenuUnitKantin({ kantinId: kantin.id, params }),
    enabled: Boolean(buka && kantin?.id),
    placeholderData: keepPreviousData,
  });

  const items = menuQuery.data?.items || [];
  const total = menuQuery.data?.pagination?.total ?? items.length;
  const baseIndex = page * rowsPerPage;

  return (
    <Dialog open={buka} onClose={onTutup} maxWidth="md" fullWidth aria-labelledby="judul-menu-unit">
      <DialogTitle id="judul-menu-unit">
        Katalog Menu · {kantin?.nama_kantin || 'Unit Kantin'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <SearchButton
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Cari nama menu..."
            />
            <CustomSelect
              size="small"
              displayEmpty
              value={kategori}
              onChange={(e) => {
                setKategori(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Semua Kategori</MenuItem>
              {KATEGORI_MENU.map((kat) => (
                <MenuItem key={kat.kode} value={kat.kode}>
                  {kat.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Box>

          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        No
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        Nama Menu
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        Kategori
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        Harga
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        Status
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {menuQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={KOLOM} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : menuQuery.isError ? (
                    <TableRow>
                      <TableCell colSpan={KOLOM}>
                        <Alert severity="error">
                          {pesanGalatKantin(menuQuery.error, 'Gagal memuat daftar menu unit kantin.')}
                        </Alert>
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={KOLOM} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">Belum ada menu pada unit kantin ini.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((menu, idx) => {
                      const status = metaKetersediaanMenu(menu.is_tersedia);
                      return (
                        <TableRow key={menu.id} hover>
                          <TableCell>{baseIndex + idx + 1}</TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {menu.nama_menu}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip size="small" label={metaKategoriMenu(menu.kategori)} variant="outlined" />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2" fontWeight={600}>
                              {formatRupiah(menu.harga)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip size="small" label={status.label} color={status.color} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[10, 25, 50]}
                      colSpan={KOLOM}
                      count={total}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={(_, newPage) => setPage(newPage)}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                      ActionsComponent={TablePaginationActions}
                      labelRowsPerPage="Baris per halaman:"
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onTutup} variant="contained">
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
};

MenuUnitDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  kantin: PropTypes.object,
  onTutup: PropTypes.func.isRequired,
};

export default MenuUnitDialog;
