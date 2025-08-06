import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography,
  Box,
  TableHead,
  Table,
  TableBody,
  Button,
  TableCell,
  TablePagination,
  TableRow,
  TableFooter,
  TableContainer,
  Paper,
  CircularProgress,
} from '@mui/material';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const QrCodeGenerate = ({
  siswa,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handlePreview,
  isLoading,
  isError,
  errorMessage,
}) => {
  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6">No</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6">Nama</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6">Kelas</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6">NISN</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6">Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '100px',
                    }}
                  >
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '100px',
                    }}
                  >
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : siswa.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                      minHeight: '100px',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h6">
                      Tidak ada data siswa untuk kelas yang dipilih
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              siswa
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => (
                  <TableRow key={`siswa-${item.id || index}`}>
                    <TableCell>
                      <Typography>{page * rowsPerPage + index + 1}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{item.User.name}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {item.Kelas.nama_kelas || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{item.nis || '-'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                         sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                        }}
                      >
                        <Button
                        variant="contained"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handlePreview(item.id)}
                      >
                        Preview
                      </Button>
                      </Box>      
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                colSpan={5}
                count={siswa.length}
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

QrCodeGenerate.propTypes = {
  siswa: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handlePreview: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default QrCodeGenerate;
