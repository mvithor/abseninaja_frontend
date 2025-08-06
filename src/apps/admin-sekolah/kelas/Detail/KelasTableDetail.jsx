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
  CircularProgress
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
    errorMessage
}) => {

    return (
        <Paper variant='outlined'>
            <TableContainer>
                <Table aria-label="custom pagination table" sx={{ whiteSpace: 'nowrap' }}>
                    <TableHead>
                        <TableRow>
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
                        <TableCell colSpan={8}>
                            <Box 
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: '100px' 
                            }}
                            >
                            <CircularProgress />
                            </Box>
                        </TableCell>
                        </TableRow>
                    ) : isError ? (
                        <TableRow>
                        <TableCell colSpan={8}>
                            <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: '100px'
                            }}
                            >
                            <Typography color="error" variant="h6">
                                {errorMessage}
                            </Typography>
                            </Box>
                        </TableCell>
                        </TableRow>
                    ) : dataKelasDetail.length === 0 ? (  
                        <TableRow>
                        <TableCell colSpan={8}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%', 
                                minHeight: '100px', 
                                textAlign: 'center' 
                            }}
                            >
                            <Typography variant="h6">
                                Tidak ada data siswa yang tersedia
                            </Typography>
                            </Box>
                        </TableCell>
                        </TableRow>
                    ) : (
                        (rowsPerPage > 0
                        ? dataKelasDetail.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : dataKelasDetail
                        ).map((kelasDetail, index) => (
                        <TableRow key={kelasDetail.id}>
                            <TableCell>
                            <Typography sx={{ fontSize: '1rem' }}>{page * rowsPerPage + index + 1}</Typography>
                            </TableCell>
                            <TableCell align='center'>
                                <Typography sx={{ fontSize: '1rem' }}>{kelasDetail.User.name}</Typography>
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
                        ))
                    )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={8}
                            count={dataKelasDetail.length}
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

KelasTableDetail.propTypes = {
    dataKelasDetail: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired, 
    isError: PropTypes.bool.isRequired, 
    errorMessage: PropTypes.string 
};

export default KelasTableDetail;