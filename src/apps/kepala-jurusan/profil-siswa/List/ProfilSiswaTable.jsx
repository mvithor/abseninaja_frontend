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
import { IconEye } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const STATUS_PROFIL_CONFIG = {
  RISIKO_BEHAVIOR: { label: 'Risiko Behavior', color: '#FF7B01', bg: '#FF7B0114' },
  SIAP_PENUH: { label: 'Siap Penuh', color: '#34A853', bg: '#34C75914' },
  RISIKO_GANDA: { label: 'Risiko Ganda', color: '#FF383C', bg: '#FF383C14' },
  RISIKO_COMPETENCY: { label: 'Risiko Kompetensi', color: '#2388FF', bg: '#2388FF14' },
  PARSIAL_BEHAVIOR_SAJA: { label: 'Parsial (Behavior)', color: '#6B7280', bg: '#F3F4F6' },
  PARSIAL_COMPETENCY_SAJA: { label: 'Parsial (Kompetensi)', color: '#6B7280', bg: '#F3F4F6' },
  DATA_BELUM_CUKUP: { label: 'Data Belum Cukup', color: '#9CA3AF', bg: '#F9FAFB' },
};

const StatusProfilChip = ({ status }) => {
  const cfg = STATUS_PROFIL_CONFIG[status] || STATUS_PROFIL_CONFIG.DATA_BELUM_CUKUP;
  return (
    <Chip
      size="small"
      label={cfg.label}
      sx={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        fontSize: '0.8rem',
        borderRadius: '6px',
        px: 0.5,
      }}
    />
  );
};

const ProfilSiswaTable = ({
  profilSiswaList,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleLihatDetail,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;

  return (
    <Paper variant='outlined'>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>NIS</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kelas</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status Profil</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Behavior</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kompetensi</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (profilSiswaList?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
                    <Typography variant="h6">{emptyMessage || 'Belum ada data siswa'}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              profilSiswaList.map((siswa, index) => (
                <TableRow key={siswa.siswa_id}>
                  <TableCell>
                    <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography sx={{ fontSize: '1rem' }}>{siswa.nama || '-'}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography sx={{ fontSize: '1rem' }}>{siswa.nis || '-'}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography sx={{ fontSize: '1rem' }}>{siswa.kelas || '-'}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <StatusProfilChip status={siswa.profil_status} />
                  </TableCell>
                  <TableCell align='center'>
                    <Typography sx={{ fontSize: '1rem' }}>{siswa.behavior_score ?? '-'}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography sx={{ fontSize: '1rem' }}>{siswa.competency_score ?? '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Tooltip title="Lihat Detail" placement="bottom">
                        <IconButton onClick={() => handleLihatDetail(siswa.siswa_id)}>
                          <IconEye width={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
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

ProfilSiswaTable.propTypes = {
  profilSiswaList: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleLihatDetail: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default ProfilSiswaTable;