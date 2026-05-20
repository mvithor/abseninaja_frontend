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
  Chip
} from '@mui/material';
import { IconEye } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const STATUS_LABEL = {
  FINALIZED: 'Perlu Verifikasi',
  REVISION_REQUIRED: 'Perlu Revisi',
  SUBMITTED: 'Sudah Submit',
  VERIFIED: 'Terverifikasi',
  ACCEPTED: 'Diterima',
  REJECTED: 'Ditolak',
  RE_REGISTERED: 'Daftar Ulang',
  DRAFT: 'Draft'
};

const getStatusChipProps = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'FINALIZED') return { label: STATUS_LABEL.FINALIZED, color: 'success' };
  if (s === 'REVISION_REQUIRED') return { label: STATUS_LABEL.REVISION_REQUIRED, color: 'warning' };
  if (s === 'SUBMITTED') return { label: STATUS_LABEL.SUBMITTED, color: 'info' };
  if (s === 'VERIFIED') return { label: STATUS_LABEL.VERIFIED, color: 'primary' };
  if (s === 'ACCEPTED') return { label: STATUS_LABEL.ACCEPTED, color: 'secondary' };
  if (s === 'REJECTED') return { label: STATUS_LABEL.REJECTED, color: 'error' };
  if (s === 'RE_REGISTERED') return { label: STATUS_LABEL.RE_REGISTERED, color: 'secondary' };
  if (s === 'DRAFT') return { label: STATUS_LABEL.DRAFT, color: 'default' };
  return { label: s ? `Legacy: ${s}` : '-', color: 'default' };
};

const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const PpdbOverviewQueueTable = ({
  applicantList,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleView,
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
              <TableCell width={70}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>
              <TableCell width={180}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kode</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama</Typography>
              </TableCell>
              <TableCell width={220}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Gelombang × Jalur</Typography>
              </TableCell>
              <TableCell align="center" width={160}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>
              <TableCell width={190}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Finalisasi</Typography>
              </TableCell>
              <TableCell align="center" width={90}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140 }}>
                    <Typography color="error" variant="h6">{errorMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (applicantList?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140, textAlign: 'center' }}>
                    <Typography variant="h6">Queue kosong</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              applicantList.map((a, index) => {
                const statusProps = getStatusChipProps(a?.status);

                const wave = a?.WaveTrack?.Wave?.nama || '-';
                const track = a?.WaveTrack?.Track?.nama || '-';

                return (
                  <TableRow key={a?.id || index} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>
                        {a?.kode_pendaftaran || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                        {a?.nama_calon_peserta_didik || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {wave} × {track}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...statusProps} />
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {formatDateTime(a?.finalized_at)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Lihat detail pendaftar" placement="bottom">
                        <span>
                          <IconButton onClick={() => handleView(a?.id)}>
                            <IconEye width={18} />
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
                rowsPerPageOptions={[5, 10, 20, 25]}
                colSpan={7}
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

PpdbOverviewQueueTable.propTypes = {
  applicantList: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleView: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string
};

export default PpdbOverviewQueueTable;
