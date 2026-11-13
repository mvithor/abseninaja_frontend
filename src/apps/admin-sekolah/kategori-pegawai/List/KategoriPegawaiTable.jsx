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
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import { adalahKategoriBawaan, judulAksiKategori } from 'src/apps/admin-sekolah/kategori-pegawai/kategori';

const KategoriPegawaiTable = ({
    pegawai,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    handleEdit,
    handleDetail,
    handleDelete,
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
                        <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kategori Pegawai</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
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
                                minHeight: '100px' 
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
                                minHeight: '100px'
                            }}
                            >
                            <Typography color="error" variant="h6">
                                {errorMessage}
                            </Typography>
                            </Box>
                        </TableCell>
                        </TableRow>
                    ) : pegawai.length === 0 ? (  
                        <TableRow>
                        <TableCell colSpan={3}>
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
                                Tidak ada data kategori pegawai yang tersedia
                            </Typography>
                            </Box>
                        </TableCell>
                        </TableRow>
                    ) : (
                        (rowsPerPage > 0
                        ? pegawai.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : pegawai
                        ).map((kategoriPegawai, index) => (
                        <TableRow key={kategoriPegawai.id}>
                            <TableCell>
                            <Typography sx={{ fontSize: '1rem' }}>{page * rowsPerPage + index + 1}</Typography>
                            </TableCell>
                            <TableCell align='center'>
                            <Typography component="span" sx={{ fontSize: '1rem' }}>{kategoriPegawai.nama_kategori}</Typography>
                            {adalahKategoriBawaan(kategoriPegawai) && (
                              <Chip label="Bawaan" size="small" sx={{ ml: 1, borderRadius: '8px', fontWeight: 600 }} />
                            )}
                            </TableCell>
                            <TableCell>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <Tooltip title="Lihat" placement="bottom">
                                <IconButton onClick={() => handleDetail(kategoriPegawai.id)}>
                                    <IconEye width={20} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={judulAksiKategori(kategoriPegawai, 'edit')} placement="bottom">
                                {/* span: tooltip tetap muncul pada tombol yang dinonaktifkan */}
                                <span>
                                <IconButton
                                    onClick={() => handleEdit(kategoriPegawai.id)}
                                    disabled={adalahKategoriBawaan(kategoriPegawai)}
                                    aria-label={`Edit ${kategoriPegawai.nama_kategori}`}
                                >
                                    <IconEdit width={18} />
                                </IconButton>
                                </span>
                                </Tooltip>
                                <Tooltip title={judulAksiKategori(kategoriPegawai, 'hapus')} placement="bottom">
                                <span>
                                <IconButton
                                    onClick={() => handleDelete(kategoriPegawai.id)}
                                    disabled={adalahKategoriBawaan(kategoriPegawai)}
                                    aria-label={`Hapus ${kategoriPegawai.nama_kategori}`}
                                >
                                    <IconTrash width={18} />
                                </IconButton>
                                </span>
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
                            colSpan={3}
                            count={pegawai.length}
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

KategoriPegawaiTable.propTypes = {
    pegawai: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
    handleDetail: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired, 
    isError: PropTypes.bool.isRequired, 
    errorMessage: PropTypes.string 
};

export default KategoriPegawaiTable;