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
  CircularProgress
} from '@mui/material';
import { IconEye } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const EkskulSiswaTable = ({
    ekskulSiswa,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    handleDetail,
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
                                    Ekstrakurikuler
                                </Typography>
                            </TableCell>
                            <TableCell align='center'> 
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                    Jumlah Siswa 
                                </Typography>
                            </TableCell>
                            <TableCell align='center'> 
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                    Aksi
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4}>
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
                                <TableCell colSpan={4}>
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
                        ) : ekskulSiswa.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4}>
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
                                            Tidak ada data ekstrakurikuler
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            (rowsPerPage > 0
                                ? ekskulSiswa.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : ekskulSiswa
                            ).map((ekstrakurikuler, index) => (
                                <TableRow key={ekstrakurikuler.id}>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {page * rowsPerPage + index + 1}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {ekstrakurikuler.nama_ekskul || 'Tidak ditemukan'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {ekstrakurikuler.jumlah_siswa || '0'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '100%',
                                            }}
                                        >
                                            <Tooltip title="Lihat Siswa" placement="bottom">
                                                <IconButton onClick={() => handleDetail(ekstrakurikuler.id)}>
                                                    <IconEye width={18} />
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
                                colSpan={4}
                                count={ekskulSiswa.length}
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

EkskulSiswaTable.PropTypes = {
    ekskulSiswa: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    handleDetail: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
}

export default EkskulSiswaTable;