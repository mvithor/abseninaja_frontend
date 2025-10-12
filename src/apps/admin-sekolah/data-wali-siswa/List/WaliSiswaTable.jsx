import PropTypes from 'prop-types';
import {
  Typography, TableHead, Table, TableBody, Tooltip, TableCell, TablePagination,
  TableRow, TableFooter, IconButton, TableContainer, Box, Paper, CircularProgress
} from '@mui/material';
import { IconEdit, IconTrash, IconRefresh, IconCheck } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const WaliSiswaTable = ({
  waliSiswa = [],
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleDelete,
  handleResend,
  resendLoadingIds = new Set(),
  resendSentIds = new Set(),
  isLoading,
  isError,
  errorMessage,
}) => {
  const startIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table aria-label="custom pagination table" sx={{ whiteSpace: 'nowrap' }}>
          <TableHead>
            <TableRow>
              <TableCell><Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography></TableCell>
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Wali</Typography></TableCell>
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Siswa</Typography></TableCell>
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>Kelas</Typography></TableCell>
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>Hubungan</Typography></TableCell>
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>Nomor Telepon</Typography></TableCell>
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>Pekerjaan</Typography></TableCell>
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>Alamat</Typography></TableCell>
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>Status Akun</Typography></TableCell>
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:100 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:100 }}>
                    <Typography color="error" variant="h6">{errorMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : waliSiswa.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:100, textAlign:'center' }}>
                    <Typography variant="h6">Tidak ada data wali siswa tersedia</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              waliSiswa.map((row, index) => {
                const isResending = resendLoadingIds.has(row.id);
                const isSent = resendSentIds.has(row.id);
                return (
                  <TableRow key={row.id}>
                    <TableCell><Typography sx={{ fontSize:'1rem' }}>{startIndex + index + 1}</Typography></TableCell>
                    <TableCell align="center"><Typography sx={{ fontSize:'1rem' }}>{row.nama_wali || 'Tidak ditemukan'}</Typography></TableCell>
                    <TableCell align="center"><Typography sx={{ fontSize:'1rem' }}>{row.nama_siswa || 'Tidak ditemukan'}</Typography></TableCell>
                    <TableCell align="center"><Typography sx={{ fontSize:'1rem' }}>{row.kelas || '-'}</Typography></TableCell>
                    <TableCell align="center"><Typography sx={{ fontSize:'1rem' }}>{row.hubungan || '-'}</Typography></TableCell>
                    <TableCell align="center"><Typography sx={{ fontSize:'1rem' }}>{row.nomor_telepon || '-'}</Typography></TableCell>
                    <TableCell align="center"><Typography sx={{ fontSize:'1rem' }}>{row.pekerjaan || '-'}</Typography></TableCell>
                    <TableCell align="center"><Typography sx={{ fontSize:'1rem' }}>{row.alamat || '-'}</Typography></TableCell>
                    <TableCell align="center"><Typography sx={{ fontSize:'1rem' }}>{row.status_akun || '-'}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', gap:0.5 }}>
                        <Tooltip title="Resend Info Akun" placement="bottom">
                          <span>
                            <IconButton onClick={() => handleResend?.(row.id)} disabled={isResending}>
                              {isResending ? <CircularProgress size={18} /> : <IconRefresh width={18} />}
                            </IconButton>
                          </span>
                        </Tooltip>
                        {isSent && (
                          <Tooltip title="Terkirim" placement="bottom">
                            <Box sx={{ color:'success.main', display:'flex', alignItems:'center' }}>
                              <IconCheck width={18} />
                            </Box>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit" placement="bottom">
                          <IconButton onClick={() => handleEdit(row.id)}><IconEdit width={18} /></IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus" placement="bottom">
                          <IconButton onClick={() => handleDelete(row.id)}><IconTrash width={18} /></IconButton>
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
                colSpan={10}
                count={totalCount || 0}             
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

WaliSiswaTable.propTypes = {
  waliSiswa: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleResend: PropTypes.func,
  resendLoadingIds: PropTypes.object,
  resendSentIds: PropTypes.object,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default WaliSiswaTable;
