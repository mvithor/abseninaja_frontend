import PropTypes from 'prop-types';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import { formatRupiah, metaKategoriMenu, metaKetersediaanMenu } from '../kantin';

const KOLOM = 6;

const BarisTengah = ({ children }) => (
  <TableRow>
    <TableCell colSpan={KOLOM}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
        {children}
      </Box>
    </TableCell>
  </TableRow>
);

BarisTengah.propTypes = { children: PropTypes.node };

const MenuTable = ({
  items,
  total,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
  onEdit,
  onHapus,
  unitAktif = true,
  isLoading,
  isError,
  errorMessage,
}) => {
  const baseIndex = page * rowsPerPage;

  return (
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
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Aksi
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <BarisTengah>
                <CircularProgress />
              </BarisTengah>
            ) : isError ? (
              <BarisTengah>
                <Typography color="error" variant="h6">
                  {errorMessage}
                </Typography>
              </BarisTengah>
            ) : items.length === 0 ? (
              <BarisTengah>
                <Typography variant="h6" color="text.secondary">
                  Belum ada menu kantin yang cocok dengan filter
                </Typography>
              </BarisTengah>
            ) : (
              items.map((item, idx) => {
                const status = metaKetersediaanMenu(item.is_tersedia);
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + idx + 1}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>{item.nama_menu}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip size="small" label={metaKategoriMenu(item.kategori)} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>{formatRupiah(item.harga)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip size="small" label={status.label} color={status.color} />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Menu">
                        <span>
                          <IconButton size="small" disabled={!unitAktif} onClick={() => onEdit(item)}>
                            <IconEdit size={18} />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Hapus Menu">
                        <span>
                          <IconButton size="small" color="error" disabled={!unitAktif} onClick={() => onHapus(item)}>
                            <IconTrash size={18} />
                          </IconButton>
                        </span>
                      </Tooltip>
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
                SelectProps={{ inputProps: { 'aria-label': 'baris per halaman' }, native: true }}
                onPageChange={onChangePage}
                onRowsPerPageChange={onChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Paper>
  );
};

MenuTable.propTypes = {
  items: PropTypes.array.isRequired,
  total: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangeRowsPerPage: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onHapus: PropTypes.func.isRequired,
  unitAktif: PropTypes.bool,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  errorMessage: PropTypes.string,
};

export default MenuTable;
