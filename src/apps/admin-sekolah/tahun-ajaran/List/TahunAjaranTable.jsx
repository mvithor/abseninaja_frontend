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
  Chip
} from '@mui/material';
import { IconEdit } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const TahunAjaranTable = ({
    tahun,
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
                <Table>
                    <TableHead>
                        <TableRow>
                        <TableCell>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                No
                            </Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                Tahun Ajaran
                            </Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                Status Tahun Ajaran
                            </Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                Status Penguncian
                            </Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                Aksi
                            </Typography>
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
                    ) : tahun.length === 0 ? (
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
                                Tahun Ajaran Belum Tersedia
                            </Typography>
                        </Box>
                        </TableCell>
                    </TableRow>
                    ) : (
                    (rowsPerPage > 0
                        ? tahun.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : tahun
                    ).map((item, index) => (
                        <TableRow key={item.id} sx={(item)}>
                        <TableCell>
                            <Typography sx={{ fontSize: '1rem' }}>
                            {page * rowsPerPage + index + 1}
                            </Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography sx={{ fontSize: '1rem' }}>
                            {item.tahun_ajaran || 'Tidak ditemukan'}
                            </Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Chip
                                label={item.is_aktif ? "Aktif" : "Nonaktif"}
                                size="medium"
                                sx={{
                                borderRadius: '8px',
                                backgroundColor: item.is_aktif ? '#34C759' : '#E0E0E0',
                                color: item.is_aktif ? '#fff' : '#424242',
                                fontWeight: 600
                                }}
                            />
                            </TableCell>

                            <TableCell align="center">
                            <Chip
                                label={item.is_locked ? "Terkunci" : "Terbuka"}
                                size="medium"
                                sx={{
                                borderRadius: '8px',
                                backgroundColor: item.is_locked ? '#FF3B30' : '#007AFF',
                                color: '#fff',
                                fontWeight: 600
                                }}
                            />
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
                            <Tooltip title="Edit" placement="bottom">
                                <IconButton onClick={() => handleEdit(item.id)}>
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
                        colSpan={5}
                        count={tahun.length}
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

TahunAjaranTable.propTypes = {
    tahun: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
};

export default TahunAjaranTable;