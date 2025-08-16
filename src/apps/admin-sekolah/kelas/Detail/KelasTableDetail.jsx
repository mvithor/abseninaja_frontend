import PropTypes from 'prop-types';
import {
  Typography,
  TableHead,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableRow,
  TableFooter,
  TableContainer,
  Box,
  Paper,
  CircularProgress,
  Checkbox
} from '@mui/material';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const KelasTableDetail = ({
  dataKelasDetail,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  isLoading,
  isError,
  errorMessage,
  selectedIds,
  onToggleOne,
  onToggleAllCurrentPage
}) => {
  const visibleRows = rowsPerPage > 0
    ? dataKelasDetail.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : dataKelasDetail;

  const currentPageIds = visibleRows.map((r) => r.id);
  const allCurrentSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.includes(id));
  const someCurrentSelected = currentPageIds.some(id => selectedIds.includes(id));

  return (
    <Paper variant='outlined'>
      <TableContainer>
        <Table aria-label="custom pagination table" sx={{ whiteSpace: 'nowrap' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={!allCurrentSelected && someCurrentSelected}
                  checked={allCurrentSelected}
                  onChange={(e) => onToggleAllCurrentPage(currentPageIds, e.target.checked)}
                  inputProps={{ 'aria-label': 'select all on page' }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>NISN</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Tanggal Lahir</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Jenis Kelamin</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nomor Telepon Siswa</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Wali</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nomor Telepon Wali</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : dataKelasDetail.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
                    <Typography variant="h6">Tidak ada data siswa yang tersedia</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((kelasDetail, index) => {
                const checked = selectedIds.includes(kelasDetail.id);
                return (
                  <TableRow key={kelasDetail.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={checked}
                        onChange={() => onToggleOne(kelasDetail.id)}
                        inputProps={{ 'aria-label': `select ${kelasDetail.User?.name || '-'}` }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{page * rowsPerPage + index + 1}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography sx={{ fontSize: '1rem' }}>{kelasDetail.User?.name}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography sx={{ fontSize: '1rem' }}>{kelasDetail.nis}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography sx={{ fontSize: '1rem' }}>{kelasDetail.tanggal_lahir || '-'}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography sx={{ fontSize: '1rem' }}>{kelasDetail.jenis_kelamin || '-'}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography sx={{ fontSize: '1rem' }}>{kelasDetail.nomor_telepon_siswa || '-'}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography sx={{ fontSize: '1rem' }}>{kelasDetail.nama_wali || '-'}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography sx={{ fontSize: '1rem' }}>{kelasDetail.nomor_telepon_wali || '-'}</Typography>
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
                colSpan={9}
                count={dataKelasDetail.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => handleChangePage(newPage)}
                onRowsPerPageChange={(e) => handleChangeRowsPerPage(e)}
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

KelasTableDetail.propTypes = {
  dataKelasDetail: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  selectedIds: PropTypes.array.isRequired,
  onToggleOne: PropTypes.func.isRequired,
  onToggleAllCurrentPage: PropTypes.func.isRequired,
};

export default KelasTableDetail;
