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
import { IconEdit } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const PerizinanSiswaTable = ({
    perizinan,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    handleEdit,
    isLoading,
    isError,
    errorMessage,
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
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Siswa</Typography>
                        </TableCell>
                        <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Wali</Typography>
                        </TableCell>
                        <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kelas</Typography>
                        </TableCell>
                        <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Jenis Izin</Typography>
                        </TableCell>
                        <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kategori Izin</Typography>
                        </TableCell>
                        <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Tanggal Izin</Typography>
                        </TableCell>
                        <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Diajukan</Typography>
                        </TableCell>
                        <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
                        </TableCell>
                        <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Disetujui</Typography>
                        </TableCell>
                        <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
                        </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={11}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                                <CircularProgress />
                            </Box>
                            </TableCell>
                        </TableRow>
                        ) : isError ? (
                        <TableRow>
                            <TableCell colSpan={11}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                                <Typography color="error" variant="h6">
                                {errorMessage}
                                </Typography>
                            </Box>
                            </TableCell>
                        </TableRow>
                        ) : perizinan.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={11}>
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
                                <Typography variant="h6">Tidak ada data perizinan</Typography>
                            </Box>
                            </TableCell>
                        </TableRow>
                        ) : (
                        (rowsPerPage > 0
                            ? perizinan.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : perizinan
                        ).map((perizinanSiswa, index) => (
                            <TableRow key={perizinanSiswa.id}>
                            <TableCell>
                                <Typography sx={{ fontSize: '1rem' }}>
                                {page * rowsPerPage + index + 1}
                                </Typography>
                            </TableCell>

                            <TableCell align="center">
                                <Typography sx={{ fontSize: '1rem' }}>
                                {perizinanSiswa.nama_siswa || '-'}
                                </Typography>
                            </TableCell>

                            <TableCell align="center">
                                <Typography sx={{ fontSize: '1rem' }}>
                                {perizinanSiswa.nama_wali_utama || '-'}
                                </Typography>
                            </TableCell>

                            <TableCell align="center">
                                <Typography sx={{ fontSize: '1rem' }}>
                                {perizinanSiswa.kelas || '-'}
                                </Typography>
                            </TableCell>

                            <TableCell align="center">
                                <Typography sx={{ fontSize: '1rem' }}>
                                {perizinanSiswa.jenis_izin || '-'}
                                </Typography>
                            </TableCell>

                            <TableCell align="center">
                                <Typography sx={{ fontSize: '1rem' }}>
                                {perizinanSiswa.kategori_izin || '-'}
                                </Typography>
                            </TableCell>

                            <TableCell align="center">
                                <Typography sx={{ fontSize: '1rem' }}>
                                {perizinanSiswa.tanggal_izin || '-'}
                                </Typography>
                            </TableCell>

                            <TableCell align="center">
                                <Typography sx={{ fontSize: '1rem' }}>
                                {perizinanSiswa.diajukan || '-'}
                                </Typography>
                            </TableCell>

                            <TableCell align="center">
                                <Typography sx={{ fontSize: '1rem' }}>
                                {perizinanSiswa.status || '-'}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Typography sx={{ fontSize: '1rem' }}>
                                {perizinanSiswa.disetujui_oleh || '-'}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <Tooltip title="Edit" placement="bottom">
                                    <IconButton onClick={() => handleEdit(perizinanSiswa.id)}>
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
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={11}
                            count={perizinan.length}
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

PerizinanSiswaTable.propTypes = {
    perizinan: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
};

export default PerizinanSiswaTable;