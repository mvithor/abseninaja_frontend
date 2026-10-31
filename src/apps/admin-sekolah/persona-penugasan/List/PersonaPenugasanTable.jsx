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
import { IconUserOff } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import { metaStatus, bisaDicabut, formatWaktu } from 'src/apps/admin-sekolah/persona-penugasan/penugasan';

const KOLOM = 7;

const PesanTengah = ({ children }) => (
  <TableRow>
    <TableCell colSpan={KOLOM}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
        {children}
      </Box>
    </TableCell>
  </TableRow>
);

PesanTengah.propTypes = { children: PropTypes.node };

const PersonaPenugasanTable = ({
  penugasan,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleCabut,
  timeZone,
  isLoading,
  isError,
  errorMessage,
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;
  const baris = rowsPerPage > 0 ? penugasan.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : penugasan;

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
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Pegawai</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Persona</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Tahun Ajaran</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Diberikan</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <PesanTengah>
                <CircularProgress />
              </PesanTengah>
            ) : isError ? (
              <PesanTengah>
                <Typography color="error" variant="h6">{errorMessage}</Typography>
              </PesanTengah>
            ) : penugasan.length === 0 ? (
              <PesanTengah>
                <Typography variant="h6">Tidak ada penugasan persona ditemukan</Typography>
              </PesanTengah>
            ) : (
              baris.map((item, index) => {
                const status = metaStatus(item.status);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{item.pegawai?.nama || '-'}</Typography>
                      {item.pegawai?.nip ? (
                        <Typography variant="caption" color="text.secondary">NIP {item.pegawai.nip}</Typography>
                      ) : null}
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{item.label}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{item.tahun_ajaran?.label || '-'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={status.label}
                        size="medium"
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: status.bg,
                          color: status.color,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{formatWaktu(item.diberikan_pada, timeZone)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        oleh {item.diberikan_oleh || '-'}
                      </Typography>
                      {item.dicabut_pada ? (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Dicabut {formatWaktu(item.dicabut_pada, timeZone)} oleh {item.dicabut_oleh || '-'}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        {bisaDicabut(item) ? (
                          <Tooltip title="Cabut penugasan" placement="bottom">
                            <IconButton onClick={() => handleCabut(item)} aria-label="Cabut penugasan">
                              <IconUserOff width={18} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography color="text.secondary">-</Typography>
                        )}
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
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={KOLOM}
                count={penugasan.length}
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

PersonaPenugasanTable.propTypes = {
  penugasan: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleCabut: PropTypes.func.isRequired,
  timeZone: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default PersonaPenugasanTable;
