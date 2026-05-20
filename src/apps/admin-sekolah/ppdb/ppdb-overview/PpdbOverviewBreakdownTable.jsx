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

const clampInt = (n) => {
  const x = Number(n || 0);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.trunc(x));
};

const getOpenChipProps = (isOpen) => {
  if (isOpen === true) return { label: 'OPEN', color: 'success', variant: 'outlined' };
  if (isOpen === false) return { label: 'CLOSED', color: 'default', variant: 'outlined' };
  return { label: '-', color: 'default', variant: 'outlined' };
};

const getQuotaChipProps = ({ quota, accepted }) => {
  const q = quota === null || quota === undefined ? null : clampInt(quota);
  const a = clampInt(accepted);
  if (!q || q <= 0) return { label: 'Quota: -', color: 'default', variant: 'outlined' };
  if (a >= q) return { label: `FULL (${a}/${q})`, color: 'error', variant: 'filled' };
  return { label: `${a}/${q}`, color: 'info', variant: 'outlined' };
};

const getTodayDeltaChipProps = (n) => {
  const v = clampInt(n);
  if (v <= 0) return { label: '+0 hari ini', color: 'default', variant: 'outlined' };
  return { label: `+${v} hari ini`, color: 'success', variant: 'filled' };
};

const getSlaChipProps = (n) => {
  const v = clampInt(n);
  if (v <= 0) return { label: 'SLA aman', color: 'success', variant: 'outlined' };
  return { label: `SLA ⚠ ${v}`, color: 'warning', variant: 'filled' };
};

const PpdbOverviewBreakdownTable = ({
  items,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleViewQueue,
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
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Gelombang</Typography>
              </TableCell>
              <TableCell width={220}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Jalur</Typography>
              </TableCell>
              <TableCell align="center" width={120}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Open</Typography>
              </TableCell>
              <TableCell align="center" width={120}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Quota</Typography>
              </TableCell>
              <TableCell align="right" width={110}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Total</Typography>
              </TableCell>
              <TableCell align="right" width={130}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Finalized</Typography>
              </TableCell>
              <TableCell align="right" width={130}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Revisi</Typography>
              </TableCell>
              <TableCell align="right" width={120}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Verified</Typography>
              </TableCell>
              <TableCell align="right" width={120}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Accepted</Typography>
              </TableCell>
              <TableCell align="center" width={150}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Delta</Typography>
              </TableCell>
              <TableCell align="center" width={160}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>SLA Aging</Typography>
              </TableCell>
              <TableCell align="center" width={90}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={13}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={13}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140 }}>
                    <Typography color="error" variant="h6">{errorMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (items?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={13}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140, textAlign: 'center' }}>
                    <Typography variant="h6">Belum ada data breakdown</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              items.map((r, index) => {
                const openProps = getOpenChipProps(r?.wavetrack_is_open);
                const quotaProps = getQuotaChipProps({ quota: r?.quota, accepted: r?.accepted });
                const todayProps = getTodayDeltaChipProps(r?.today_delta);
                const slaProps = getSlaChipProps(r?.sla_finalized_over_24h_unverified);

                return (
                  <TableRow key={r?.ppdb_wave_track_id || index} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                        {r?.wave_nama || '-'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {r?.wave_status ? `Status: ${r.wave_status}` : ''}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                        {r?.track_nama || '-'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {r?.track_kode ? `Kode: ${r.track_kode}` : ''}
                        {r?.requires_prestasi ? ' • Prestasi' : ''}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...openProps} />
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...quotaProps} />
                    </TableCell>

                    <TableCell align="right">
                      <Typography sx={{ fontSize: '1rem', fontWeight: 800 }}>
                        {clampInt(r?.total)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {clampInt(r?.finalized_menunggu_verifikasi)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {clampInt(r?.revision_required)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {clampInt(r?.verified)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {clampInt(r?.accepted)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center">
                        <Chip size="small" {...todayProps} />
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center">
                        <Chip size="small" {...slaProps} />
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Lihat Queue (FINALIZED) untuk jalur ini" placement="bottom">
                        <span>
                          <IconButton onClick={() => handleViewQueue(r?.ppdb_wave_track_id)}>
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
                colSpan={13}
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

PpdbOverviewBreakdownTable.propTypes = {
  items: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleViewQueue: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string
};

export default PpdbOverviewBreakdownTable;
