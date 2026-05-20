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
} from '@mui/material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const getRoleChipProps = (role) => {
  const r = String(role || '').toUpperCase();
  if (r === 'PROCTOR') return { label: 'Pengawas', color: 'primary' };
  if (r === 'ASSISTANT') return { label: 'Asisten', color: 'info' };
  return { label: '-', color: 'default' };
};

const getSessionStatusChipProps = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'DRAFT') return { label: 'DRAFT', color: 'default' };
  if (s === 'SCHEDULED') return { label: 'SCHEDULED', color: 'info' };
  if (s === 'ONGOING') return { label: 'ONGOING', color: 'warning' };
  if (s === 'FINISHED') return { label: 'FINISHED', color: 'success' };
  if (s === 'CANCELLED') return { label: 'CANCELLED', color: 'error' };
  return { label: s || '-', color: 'default' };
};

const getModeChipProps = (mode) => {
  const m = String(mode || '').toUpperCase();
  if (m === 'ONLINE') return { label: 'ONLINE', color: 'success' };
  if (m === 'OFFLINE') return { label: 'OFFLINE', color: 'default' };
  if (m === 'HYBRID') return { label: 'HYBRID', color: 'warning' };
  return { label: m || '-', color: 'default' };
};

const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const formatDateTimeRange = (start, end) => {
  const s = formatDateTime(start);
  const e = formatDateTime(end);
  if (s === '-' && e === '-') return '-';
  return `${s} - ${e}`;
};

const safeStr = (v) => (v === null || v === undefined ? '-' : String(v));

const PpdbProctorTable = ({
  proctorList,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleDelete,
  isLoading,
  isError,
  errorMessage,
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={60}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  No
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Pengawas
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Ruangan
                </Typography>
              </TableCell>

              <TableCell align="center" width={140}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Mode
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Sesi
                </Typography>
              </TableCell>

              <TableCell width={260}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Jadwal Sesi
                </Typography>
              </TableCell>

              <TableCell align="center" width={140}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Role
                </Typography>
              </TableCell>

              <TableCell align="center" width={160}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Status Sesi
                </Typography>
              </TableCell>

              <TableCell align="center" width={140}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Aksi
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (proctorList?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, textAlign: 'center' }}>
                    <Typography variant="h6">Belum ada Pengawas PMB</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              proctorList.map((p, index) => {
                const proctorName = p?.User?.name || '-';

                const roomLabel = p?.SessionRoom?.room_label || p?.SessionRoom?.Room?.nama || '-';
                const roomMode = p?.SessionRoom?.mode || '-';

                const sessionTitle = p?.SessionRoom?.Session?.title || '-';
                const sessionStatus = p?.SessionRoom?.Session?.status || '-';

                const startAt = p?.SessionRoom?.Session?.start_at;
                const endAt = p?.SessionRoom?.Session?.end_at;

                const roleProps = getRoleChipProps(p?.role);
                const statusProps = getSessionStatusChipProps(sessionStatus);
                const modeProps = getModeChipProps(roomMode);

                return (
                  <TableRow key={p?.id || index}>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>{safeStr(proctorName)}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>{safeStr(roomLabel)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...modeProps} />
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>{safeStr(sessionTitle)}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{formatDateTimeRange(startAt, endAt)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...roleProps} />
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...statusProps} />
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Edit" placement="bottom">
                          <span>
                            <IconButton onClick={() => handleEdit(p?.id)}>
                              <IconEdit width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Hapus" placement="bottom">
                          <IconButton onClick={() => handleDelete(p?.id)}>
                            <IconTrash width={18} />
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
                colSpan={9}
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

PpdbProctorTable.propTypes = {
  proctorList: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default PpdbProctorTable;