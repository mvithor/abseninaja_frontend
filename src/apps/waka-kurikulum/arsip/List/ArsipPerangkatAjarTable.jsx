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
} from '@mui/material';
import { IconDownload, IconEye, IconHistory } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import StatusPerangkatChip from 'src/components/perangkat-ajar/StatusPerangkatChip';
import { formatTanggalWaktu, formatUkuranFile } from 'src/components/perangkat-ajar/perangkatAjarConfig';

const KOLOM = ['No', 'Semester', 'Guru', 'Mapel / Kelas', 'Jenis', 'Status', 'Versi', 'Tanggal', 'Aksi'];

// Arsip bersifat baca-saja: hanya pratinjau, unduh, dan riwayat (tanpa validasi).
const ArsipPerangkatAjarTable = ({
  arsipList,
  timezone,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  onPratinjau,
  onUnduh,
  onRiwayat,
  unduhSedangId,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;
  const colSpan = KOLOM.length;

  const barisInfo = (children) => (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
          {children}
        </Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Paper variant='outlined'>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {KOLOM.map((judul, i) => (
                <TableCell key={judul} align={i < 2 ? 'left' : 'center'}>
                  <Typography variant="h6" sx={{ fontSize: '1rem' }}>{judul}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading
              ? barisInfo(<CircularProgress />)
              : isError
                ? barisInfo(<Typography color="error" variant="h6">{errorMessage}</Typography>)
                : arsipList.length === 0
                  ? barisInfo(<Typography variant="h6">{emptyMessage || 'Belum ada dokumen di arsip ini'}</Typography>)
                  : arsipList.map((item, index) => {
                      const disetujui = item.status === 'disetujui' && item.divalidasi_pada;
                      return (
                        <TableRow key={item.dokumen_id} hover>
                          <TableCell>
                            <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{item.semester?.label || '-'}</Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Typography sx={{ fontSize: '0.95rem' }}>{item.guru?.nama || '-'}</Typography>
                            <Typography variant="caption" color="text.secondary">{item.guru?.nip || '-'}</Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Typography sx={{ fontSize: '0.95rem' }}>{item.mapel?.nama || '-'}</Typography>
                            <Typography variant="caption" color="text.secondary">{item.kelas?.nama || '-'}</Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Typography sx={{ fontSize: '0.95rem' }}>{item.jenis?.label_singkat || item.jenis?.label || '-'}</Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <StatusPerangkatChip status={item.status} terlambat={Boolean(item.terlambat)} />
                          </TableCell>
                          <TableCell align='center'>
                            <Typography variant="body2">{item.versi_terakhir ? `v${item.versi_terakhir}` : '-'}</Typography>
                            <Typography variant="caption" color="text.secondary">{formatUkuranFile(item.file?.ukuran)}</Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                              {formatTanggalWaktu(disetujui ? item.divalidasi_pada : item.diunggah_pada, timezone)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{disetujui ? 'Disetujui' : 'Diunggah'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <Tooltip title="Pratinjau">
                                <IconButton size="small" onClick={() => onPratinjau(item)}>
                                  <IconEye width={18} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Unduh">
                                <span>
                                  <IconButton size="small" onClick={() => onUnduh(item)} disabled={unduhSedangId === item.dokumen_id}>
                                    <IconDownload width={18} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Riwayat Versi">
                                <IconButton size="small" onClick={() => onRiwayat(item)}>
                                  <IconHistory width={18} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, { label: 'All', value: -1 }]}
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

ArsipPerangkatAjarTable.propTypes = {
  arsipList: PropTypes.array.isRequired,
  timezone: PropTypes.string,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  onPratinjau: PropTypes.func.isRequired,
  onUnduh: PropTypes.func.isRequired,
  onRiwayat: PropTypes.func.isRequired,
  unduhSedangId: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default ArsipPerangkatAjarTable;
