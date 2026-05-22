import PropTypes from 'prop-types';
import {
  Typography,
  TableHead,
  Table,
  TableBody,
  Tooltip,
  TableCell,
  TablePagination,
  TableRow,
  TableFooter,
  IconButton,
  TableContainer,
  Box,
  Paper,
  CircularProgress,
  Chip,
  Switch,
  Stack
} from '@mui/material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const getActiveChipProps = (isActive) => {
  if (isActive === true) return { label: 'AKTIF', color: 'success' };
  if (isActive === false) return { label: 'NONAKTIF', color: 'default' };
  return { label: '-', color: 'default' };
};

const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const PpdbTahapanTable = ({
  rows,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleDelete,
  handleToggle,
  isLoading,
  isError,
  errorMessage
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Code</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Tahapan</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Urutan</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Toggle</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Updated</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <Typography color="error" variant="h6">
                      {errorMessage || 'Gagal memuat data'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (rows?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, textAlign: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Belum ada Tahapan PMB
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Tambahkan tahapan untuk menyusun jadwal PMB (contoh: PENDAFTARAN, VERIFIKASI, TES, PENGUMUMAN).
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, index) => {
                const chip = getActiveChipProps(r?.is_active);

                return (
                  <TableRow key={r?.id || index} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 900 }}>
                        {r?.code || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem', fontWeight: 800 }}>
                        {r?.nama || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={r?.sort_order === null || r?.sort_order === undefined ? '-' : String(r.sort_order)}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...chip} />
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                        <Switch
                          checked={Boolean(r?.is_active)}
                          onChange={(e) => handleToggle(r?.id, e.target.checked)}
                          inputProps={{ 'aria-label': 'toggle active' }}
                        />
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {formatDateTime(r?.updated_at)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Edit" placement="bottom">
                          <span>
                            <IconButton onClick={() => handleEdit(r?.id)}>
                              <IconEdit width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Hapus" placement="bottom">
                          <span>
                            <IconButton onClick={() => handleDelete(r?.id)}>
                              <IconTrash width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 25, { label: 'All', value: -1 }]}
                colSpan={8}
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
                labelRowsPerPage="Rows per page:"
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Paper>
  );
};

PpdbTahapanTable.propTypes = {
  rows: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleToggle: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string
};

export default PpdbTahapanTable;
