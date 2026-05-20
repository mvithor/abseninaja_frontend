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
  Stack
} from '@mui/material';
import { IconEye } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const STATUS_LABEL = {
  FINALIZED: 'Perlu Verifikasi',
  SUBMITTED: 'Sudah Submit',
  VERIFIED: 'Terverifikasi',
  RE_REGISTERED: 'Daftar Ulang',
  DRAFT: 'Draft',
};

const getStatusChipProps = (status) => {
  const s = String(status || '').toUpperCase();

  // ✅ urutan logis baru:
  // SUBMITTED = sudah submit tapi belum finalisasi
  // FINALIZED = sudah finalisasi (locked) => siap diverifikasi panitia
  if (s === 'FINALIZED') return { label: STATUS_LABEL.FINALIZED, color: 'success' };
  if (s === 'SUBMITTED') return { label: STATUS_LABEL.SUBMITTED, color: 'info' };
  if (s === 'VERIFIED') return { label: STATUS_LABEL.VERIFIED, color: 'primary' };
  if (s === 'RE_REGISTERED') return { label: STATUS_LABEL.RE_REGISTERED, color: 'secondary' };
  if (s === 'DRAFT') return { label: STATUS_LABEL.DRAFT, color: 'default' };

  // Legacy fallback biar admin sadar ini status lama
  return { label: s ? `Legacy: ${s}` : '-', color: 'default' };
};

const getKondisiChipProps = (flags) => {
  const locked = !!flags?.is_locked;
  const editable = !!flags?.is_editable;

  // Prioritas: locked dulu
  if (locked) return { label: 'LOCKED', color: 'success', variant: 'outlined' };
  if (editable) return { label: 'EDITABLE', color: 'warning', variant: 'outlined' };
  return { label: '-', color: 'default', variant: 'outlined' };
};

const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const formatJk = (val) => {
  const v = String(val || '').toLowerCase();
  if (v === 'laki-laki') return 'Laki-laki';
  if (v === 'perempuan') return 'Perempuan';
  return '-';
};

const PpdbPendaftarTable = ({
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
              <TableCell width={170}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kode</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama</Typography>
              </TableCell>
              <TableCell width={120}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>JK</Typography>
              </TableCell>
              <TableCell width={160}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>WA Wali</Typography>
              </TableCell>
              <TableCell width={160}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Gelombang</Typography>
              </TableCell>
              <TableCell width={160}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Jalur</Typography>
              </TableCell>
              <TableCell align="center" width={160}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>
              <TableCell align="center" width={140}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kondisi</Typography>
              </TableCell>
              <TableCell width={190}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Registrasi</Typography>
              </TableCell>
              <TableCell width={190}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aktivitas Terakhir</Typography>
              </TableCell>
              <TableCell align="center" width={90}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140 }}>
                    <Typography color="error" variant="h6">{errorMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (applicantList?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140, textAlign: 'center' }}>
                    <Typography variant="h6">Belum ada pendaftar</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              applicantList.map((a, index) => {
                const statusProps = getStatusChipProps(a?.status);
                const kondisiProps = getKondisiChipProps(a?.flags);
                const canVerify = !!a?.flags?.can_verify;

                return (
                  <TableRow key={a?.id || index} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
                        {a?.kode_pendaftaran || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        {a?.nama || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {formatJk(a?.jk)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {a?.wa || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {a?.gelombang || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {a?.jalur || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...statusProps} />
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center">
                        <Chip size="small" {...kondisiProps} />
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {formatDateTime(a?.registered_at)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {formatDateTime(a?.last_activity_at)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip
                        title={canVerify ? 'Review (Siap Diverifikasi)' : 'Lihat Detail'}
                        placement="bottom"
                      >
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
                colSpan={12}
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

PpdbPendaftarTable.propTypes = {
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

export default PpdbPendaftarTable;
