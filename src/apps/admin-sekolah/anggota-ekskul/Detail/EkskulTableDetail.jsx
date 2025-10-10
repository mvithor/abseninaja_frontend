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
} from '@mui/material';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const EkskulTableDetail = ({
    ekskulSiswaDetail,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    isLoading,
    isError,
    errorMessage,
}) => {
    return (
        <Paper variant='outlined'>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                    No
                                </Typography>
                            </TableCell>
                            <TableCell align='center'> 
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                    Nama
                                </Typography>
                            </TableCell>
                            <TableCell align='center'> 
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                    Kelas
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3}>
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
                                <TableCell colSpan={3}>
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
                        ) : ekskulSiswaDetail.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3}>
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
                                            Tidak ada siswa yang mengikuti ekstrakurikuler ini
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            (rowsPerPage > 0
                                ? ekskulSiswaDetail.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : ekskulSiswaDetail
                            ).map((ekskulSiswa, index) => (
                                <TableRow key={ekskulSiswa.siswa_id ?? `${page}-${index}`}>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {page * rowsPerPage + index + 1}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {ekskulSiswa.nama_siswa || 'Tidak ditemukan'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {ekskulSiswa.kelas || '-'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                colSpan={3}
                                count={ekskulSiswaDetail.length}
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
    )
};

EkskulTableDetail.propTypes = {
    ekskulSiswaDetail: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
};

export default EkskulTableDetail;
