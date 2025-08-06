import {
    Typography,
    Box,
    TableHead,
    Table,
    TableBody,
    TableCell,
    TablePagination,
    TableRow,
    IconButton,
    Tooltip,
    TableFooter,
    TableContainer,
    Paper,
    CircularProgress,
  } from '@mui/material';
import { IconEdit } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
  
  const AbsensiTable = ({
    absensi,
    page,
    rowsPerPage,
    handleChangePage,
    handleEdit,
    handleChangeRowsPerPage,
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
                  <Typography variant="h6">Tanggal</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h6">Jam Masuk</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h6">Jam Keluar</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h6">Status</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h6">Aksi</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>
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
                  <TableCell colSpan={7}>
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
              ) : absensi.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
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
                        Tidak ada data absensi yang tersedia
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                absensi
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item, index) => (
                    <TableRow key={item.absensi_id}>
                      <TableCell>
                        <Typography sx={{ fontSize: '1rem' }}>
                          {page * rowsPerPage + index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontSize: '1rem' }}>{item.nama}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontSize: '1rem' }}>{item.tanggal}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontSize: '1rem' }}>
                          {item.jam_masuk || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontSize: '1rem' }}>
                          {item.jam_pulang || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'inline-block',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            backgroundColor:
                              item.status_kehadiran === 'Hadir'
                                ? '#DFFFE0' // Hijau muda
                                : item.status_kehadiran === 'Pulang'
                                ? '#FFE0E0' // Merah muda
                                : item.status_kehadiran === 'Izin'
                                ? '#FFF4CC' // Kuning pucat
                                : item.status_kehadiran === 'Sakit'
                                ? '#D0E7FF' // Biru sangat muda
                                : item.status_kehadiran === 'Tanpa Keterangan'
                                ? '#FFC1B3' // Peach
                                : item.status_kehadiran === 'Terlambat'
                                ? '#FFE4B5' // Oranye sangat muda
                                : '#F5F5F5', // Default abu-abu muda
                            color:
                              item.status_kehadiran === 'Hadir'
                                ? '#008000' // Hijau
                                : item.status_kehadiran === 'Pulang'
                                ? '#FF0000' // Merah
                                : item.status_kehadiran === 'Izin'
                                ? '#CC9900' // Kuning gelap
                                : item.status_kehadiran === 'Sakit'
                                ? '#0056B3' // Biru gelap
                                : item.status_kehadiran === 'Tanpa Keterangan'
                                ? '#FF6347' // Tomat
                                : item.status_kehadiran === 'Terlambat'
                                ? '#CC6600' // Oranye gelap
                                : '#000000', // Default hitam
                            fontWeight: 500,
                            fontSize: '0.85rem',
                            textAlign: 'center',
                          }}
                        >
                          {item.status_kehadiran}
                        </Box>
                      </TableCell>
                      <TableCell>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <Tooltip title="Edit" placement="bottom">
                                <IconButton onClick={() => handleEdit(item.absensi_id)}>
                                    <IconEdit width={18} />
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
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={7}
                  count={absensi.length}
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
  
  AbsensiTable.propTypes = {
    absensi: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
  };
  
  export default AbsensiTable;
  