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
import { IconEdit, IconTrash } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const JadwalMapelTable = ({
  jadwalMapel,
  page,
  rowsPerPage,
  totalCount,                 // ← pakai total dari server
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
    <Paper variant='outlined'>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kelas</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Hari</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Waktu/Jam</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kategori</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Mapel</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Guru</Typography>
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
            ) : (jadwalMapel?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '100px', textAlign: 'center' }}>
                    <Typography variant="h6">
                      Tidak ada jadwal mata pelajaran tersedia
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              jadwalMapel.map((row, index) => {
                const isKBM = row.kategori === 'KBM';
                const kelasDisp = isKBM ? (row.kelas || '-') : 'ALL';
                const mapelDisp = isKBM ? (row.mata_pelajaran || '-') : '–';
                const guruDisp  = isKBM ? (row.nama_guru || '-') : '–';

                return (
                  <TableRow key={row.id || index}>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {baseIndex + index + 1}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {kelasDisp}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {row.hari || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {row.waktu || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem', fontStyle: row.kategori && row.kategori !== 'KBM' ? 'italic' : 'normal' }}>
                        {row.kategori || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {mapelDisp}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {guruDisp}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Tooltip title={isKBM ? "Edit" : "Tidak tersedia untuk Non-KBM, ubah melalui menu waktu"} placement="bottom">
                          <span>
                            <IconButton
                              onClick={() => isKBM && handleEdit(row.id)}
                              disabled={!isKBM}
                            >
                              <IconEdit width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={isKBM ? "Hapus" : "Tidak tersedia untuk Non-KBM, ubah melalui menu waktu"} placement="bottom">
                          <span>
                            <IconButton
                              onClick={() => isKBM && handleDelete(row.id)}
                              disabled={!isKBM}
                            >
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
                count={totalCount}                 // ← penting: total dari server
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

JadwalMapelTable.propTypes = {
  jadwalMapel: PropTypes.array.isRequired,
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

export default JadwalMapelTable;
