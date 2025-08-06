import React from 'react';
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
import { IconCirclesRelation } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const AdminSekolahTable = ({
    admin,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    handleAdd,
    isLoading,
    isError,
    errorMessage
}) => {
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - admin.length) : 0;

    return (
        <Paper variant='outlined'>
            <TableContainer>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
                        </TableCell>
                        <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Sekolah</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Admin</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>NPSN</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Alamat</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
                        </TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6}>
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
                            <TableCell colSpan={6}>
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
                    ) : (
                        (rowsPerPage > 0
                        ? admin.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : admin
                        ).map((adminSekolah, index) => (
                        <TableRow key={adminSekolah.id}>
                        <TableCell>
                            <Typography sx={{ fontSize: '1rem' }}>{page * rowsPerPage + index + 1}</Typography>
                        </TableCell>
                        <TableCell align='center'>
                            <Typography sx={{ fontSize: '1rem' }}>{adminSekolah.nama}</Typography>
                        </TableCell>
                        <TableCell align='center'>
                            <Typography sx={{ fontSize: '1rem' }}>{adminSekolah.nama_admin}</Typography>
                        </TableCell>
                        <TableCell align='center'>
                            <Typography sx={{ fontSize: '1rem' }}>{adminSekolah.npsn}</Typography>
                        </TableCell>
                        <TableCell align='center'>
                            <Typography sx={{ fontSize: '1rem' }}>{adminSekolah.alamat}</Typography>
                        </TableCell>
                        <TableCell>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Tooltip title="Tambah Akun Admin" placement="bottom">
                                <IconButton onClick={() => handleAdd(adminSekolah.id)}>
                                <IconCirclesRelation width={22} />
                                </IconButton>
                            </Tooltip>
                            </Box>
                        </TableCell>
                        </TableRow>
                        ))
                    )}
                    {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                    </TableRow>
                    )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={6}
                            count={admin.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            SelectProps={{
                            inputProps: {
                                'aria-label': 'rows per page',
                            },
                            native: true,
                            }}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                        />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Paper>
    );
};

AdminSekolahTable.propTypes = {
    admin: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    handleAdd: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired, 
    isError: PropTypes.bool.isRequired, 
    errorMessage: PropTypes.string 
};

export default AdminSekolahTable;