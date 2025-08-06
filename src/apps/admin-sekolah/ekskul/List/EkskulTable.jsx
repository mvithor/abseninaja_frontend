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
import { IconEdit, IconTrash } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const EkskulTable = ({
    ekskul,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    handleEdit,
    handleDelete,
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
                      Logo
                  </Typography>
                </TableCell>
                <TableCell align='center'> 
                  <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Ekstrakurikuler
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Pembina
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
                        ) : ekskul.length === 0 ? (
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
                                            Tidak ada data ekstrakurikuler
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            (rowsPerPage > 0
                                ? ekskul.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : ekskul
                            ).map((ekstrakurikuler, index) => (
                                <TableRow key={ekstrakurikuler.id}>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {page * rowsPerPage + index + 1}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {ekstrakurikuler.logo_url ? (
                                            <img
                                            src={ekstrakurikuler.logo_url}
                                            alt={ekstrakurikuler.nama_ekskul}
                                            style={{
                                                height: 50,
                                                maxWidth: 80,
                                                objectFit: 'contain',
                                                borderRadius: 4,
                                            }}
                                            />
                                        ) : (
                                            <Typography sx={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                                            Tidak ditemukan
                                            </Typography>
                                        )}
                                        </TableCell>
                                    <TableCell align="center">
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {ekstrakurikuler.nama_ekskul || 'Tidak ditemukan'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                    {Array.isArray(ekstrakurikuler.pembina) && ekstrakurikuler.pembina.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        {ekstrakurikuler.pembina.slice(0, 2).map((nama, idx) => (
                                            <Typography key={idx} sx={{ fontSize: '0.9rem', lineHeight: 1.3 }}>
                                             {nama}
                                            </Typography>
                                        ))}
                                        {ekstrakurikuler.pembina.length > 2 && (
                                            <Typography sx={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#6B7280' }}>
                                            +{ekstrakurikuler.pembina.length - 2} pembina lainnya
                                            </Typography>
                                        )}
                                        </Box>
                                    ) : (
                                        <Typography sx={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                                        Tidak tersedia
                                        </Typography>
                                    )}
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
                                                <IconButton onClick={() => handleEdit(ekstrakurikuler.id)}>
                                                    <IconEdit width={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Hapus" placement="bottom">
                                                <IconButton onClick={() => handleDelete(ekstrakurikuler.id)}>
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
                                count={ekskul.length}
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

EkskulTable.propTypes = {
    ekskul: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
};

export default EkskulTable;