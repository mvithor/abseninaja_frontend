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
  Chip,
} from '@mui/material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const MataPelajaranTableDetail = ({
    mapelDetail,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    isLoading,
    handleEdit,
    handleDelete,
    isError,
    errorMessage
}) => {
    const rows = Array.isArray(mapelDetail) ? mapelDetail : [];
    const pagedRows = rowsPerPage > 0 ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rows;

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
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kode Offering</Typography>
                            </TableCell>
                            <TableCell align='center'>
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kelas</Typography>
                            </TableCell>
                            <TableCell align='center'>
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Guru Pengampu</Typography>
                            </TableCell>
                            <TableCell align='center'>
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Box 
                                      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}
                                    >
                                        <CircularProgress />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                                        <Typography color="error" variant="h6">{errorMessage}</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : rows.length === 0 ? (  
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
                                        <Typography variant="h6">Tidak ada penawaran (offering) pada semester aktif</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            pagedRows.map((offering, index) => (
                                <TableRow key={offering.id}>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {page * (rowsPerPage > 0 ? rowsPerPage : rows.length) + index + 1}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <Typography sx={{ fontSize: '1rem' }}>{offering.kode_offering}</Typography>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <Typography sx={{ fontSize: '1rem' }}>{offering.nama_kelas}</Typography>
                                    </TableCell>
                                    <TableCell align='center'>
                                        {Array.isArray(offering.guru) && offering.guru.length > 0 ? (
                                            offering.guru.map((g, i) => (
                                                <Chip key={`${offering.id}-g-${i}`} label={g} size="small" variant="outlined" sx={{ mr: 0.75, mb: 0.5 }} />
                                            ))
                                        ) : (
                                            <Typography sx={{ fontSize: '0.9rem' }} color="text.secondary">
                                                Belum ada guru pengampu
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                            <Tooltip title="Edit" placement="bottom">
                                                <IconButton onClick={() => handleEdit(offering.id)}>
                                                    <IconEdit width={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Hapus" placement="bottom">
                                                <IconButton onClick={() => handleDelete(offering.id)}>
                                                    <IconTrash width={18} />
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
                                colSpan={5}
                                count={rows.length}
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

MataPelajaranTableDetail.propTypes = {
    mapelDetail: PropTypes.array, // boleh undefined saat loading
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired, 
    isError: PropTypes.bool.isRequired, 
    errorMessage: PropTypes.string 
};

MataPelajaranTableDetail.defaultProps = {
    mapelDetail: [],
    errorMessage: "Terjadi kesalahan saat memuat data"
};

export default MataPelajaranTableDetail;
