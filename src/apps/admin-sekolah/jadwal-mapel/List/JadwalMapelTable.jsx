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
  Chip, // ✅ tambah Chip untuk badge kategori
} from '@mui/material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const JadwalMapelTable = ({
  jadwalMapel,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleDelete,
  isLoading,
  isError,
  errorMessage,
}) => {
  const sliceData = rowsPerPage > 0
    ? jadwalMapel.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : jadwalMapel;

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
              {/* ✅ kolom baru: Kategori */}
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
            ) : jadwalMapel.length === 0 ? (
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
              sliceData.map((row, index) => {
                const isKBM = row.kategori === 'KBM';
                const kelasDisp = isKBM ? (row.kelas || '-') : 'ALL';
                const mapelDisp = isKBM ? (row.mata_pelajaran || '-') : '–';
                const guruDisp  = isKBM ? (row.nama_guru || '-') : '–';

                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {page * rowsPerPage + index + 1}
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
                            {row.kategori ? (row.kategori === 'KBM' ? 'KBM' : `${row.kategori}`) : '-'}
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
                        <Tooltip title="Edit" placement="bottom">
                          <IconButton onClick={() => handleEdit(row.id)}>
                            <IconEdit width={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus" placement="bottom">
                          <IconButton onClick={() => handleDelete(row.id)}>
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
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={8} 
                count={jadwalMapel.length}
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
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleDetail: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default JadwalMapelTable;
