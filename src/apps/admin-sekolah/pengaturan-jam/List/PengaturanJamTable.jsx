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
import { IconEdit } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const PengaturanJamTable = ({
    jam,
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
        <Paper variant="outlined">
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Jam Masuk</Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Jam Terlambat</Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Jam Alpa</Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Jam Pulang</Typography>
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
                                            minHeight: '100px',
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
                                            minHeight: '100px',
                                        }}
                                    >
                                        <Typography color="error" variant="h6">
                                            {errorMessage}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : jam.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6}>
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
                                            Tidak ada jam tersedia
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            (rowsPerPage > 0
                                ? jam.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : jam
                            ).map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {page * rowsPerPage + index + 1}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {item.jam_masuk || 'Tidak ditemukan'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {item.jam_terlambat || 'Tidak ditemukan'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {item.jam_alpa || 'Tidak ditemukan'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {item.jam_pulang || 'Tidak ditemukan'}
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
                                colSpan={6}
                                count={jam.length}
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

PengaturanJamTable.propTypes = {
    jam: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
};

export default PengaturanJamTable;
