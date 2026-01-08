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
import { IconDownload } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const DownloadDataSiswaTable = ({
    kelasData,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    handleDownload,
    isLoading,
    isError,
    errorMessage
}) => {

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
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Jumlah Siswa</Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
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
                    ) : kelasData.length === 0 ? (
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
                            <Typography variant="h6">Tidak ada kelas yang tersedia</Typography>
                        </Box>
                        </TableCell>
                    </TableRow>
                    ) : (
                    (rowsPerPage > 0
                        ? kelasData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : kelasData
                    ).map((item, index) => (
                        <TableRow key={item.id}>
                        <TableCell>
                            <Typography sx={{ fontSize: '1rem' }}>
                            {page * rowsPerPage + index + 1}
                            </Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography sx={{ fontSize: '1rem' }}>{item.nama_kelas}</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography sx={{ fontSize: '1rem' }}>{item.jumlah_siswa}</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Tooltip title="Download" placement="bottom">
                                <IconButton onClick={() => handleDownload(item.id)}>
                                <IconDownload width={18} />
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
                        count={kelasData.length}
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

DownloadDataSiswaTable.propTypes = {
    kelasData: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    handleDownload: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
};

export default DownloadDataSiswaTable;
