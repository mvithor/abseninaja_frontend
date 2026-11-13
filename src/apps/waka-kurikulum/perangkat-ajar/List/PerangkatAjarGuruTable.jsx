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
  LinearProgress,
} from '@mui/material';
import { IconEye } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

// Warna sel ringkasan per jenis: revisi paling mendesak, lalu menunggu validasi, lalu lengkap.
const warnaRingkasan = (r) => {
  if (!r || !r.total) return 'default';
  if (r.perlu_revisi > 0) return 'error';
  if (r.menunggu_validasi > 0) return 'warning';
  if (r.disetujui === r.total) return 'success';
  return 'default';
};

const tooltipRingkasan = (r) => {
  if (!r || !r.total) return 'Tidak ada penugasan';
  return [
    `Disetujui: ${r.disetujui ?? 0}`,
    `Menunggu validasi: ${r.menunggu_validasi ?? 0}`,
    `Perlu revisi: ${r.perlu_revisi ?? 0}`,
    `Belum unggah: ${r.belum_unggah ?? 0}`,
    r.terlambat ? `Terlambat: ${r.terlambat}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
};

const PerangkatAjarGuruTable = ({
  guruList,
  jenisList,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleDetail,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;
  const colSpan = 5 + jenisList.length;

  return (
    <Paper variant='outlined'>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Guru</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Mapel</Typography>
              </TableCell>
              {jenisList.map((jenis) => (
                <TableCell key={jenis.kode} align='center'>
                  <Typography variant="h6" sx={{ fontSize: '1rem' }}>{jenis.label_singkat || jenis.label}</Typography>
                </TableCell>
              ))}
              <TableCell align='center' sx={{ minWidth: 140 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kelengkapan</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={colSpan}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={colSpan}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <Typography color="error" variant="h6">{errorMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : guruList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
                    <Typography variant="h6">{emptyMessage || 'Belum ada penugasan guru di semester ini'}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              guruList.map((guru, index) => {
                const kelengkapan = Math.round(Number(guru.kelengkapan_persen) || 0);
                const mapelList = guru.mapel || [];

                return (
                  <TableRow key={guru.guru_id || index} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{guru.nama || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">{guru.nip || '-'}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Tooltip title={mapelList.length > 0 ? mapelList.join(', ') : 'Belum ada mapel'}>
                        <Chip label={`${guru.jumlah_mapel ?? mapelList.length} mapel`} size="small" variant="outlined" />
                      </Tooltip>
                    </TableCell>
                    {jenisList.map((jenis) => {
                      const r = guru.ringkasan_jenis?.[jenis.kode];
                      const terunggah = r ? (r.total ?? 0) - (r.belum_unggah ?? 0) : 0;
                      return (
                        <TableCell key={jenis.kode} align='center'>
                          <Tooltip title={tooltipRingkasan(r)}>
                            <Chip
                              label={r?.total ? `${terunggah}/${r.total}` : '-'}
                              color={warnaRingkasan(r)}
                              size="small"
                              variant={r?.terlambat ? 'outlined' : 'filled'}
                            />
                          </Tooltip>
                        </TableCell>
                      );
                    })}
                    <TableCell align='center'>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={kelengkapan}
                          color={kelengkapan >= 100 ? 'success' : kelengkapan >= 50 ? 'primary' : 'warning'}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 36 }}>{kelengkapan}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Tooltip title="Lihat Detail" placement="bottom">
                          <IconButton onClick={() => handleDetail(guru.guru_id)}>
                            <IconEye width={18} />
                          </IconButton>
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
                colSpan={colSpan}
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

PerangkatAjarGuruTable.propTypes = {
  guruList: PropTypes.array.isRequired,
  jenisList: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleDetail: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default PerangkatAjarGuruTable;
