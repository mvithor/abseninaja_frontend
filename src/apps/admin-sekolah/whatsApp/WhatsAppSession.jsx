import PropTypes from 'prop-types';
import {
  Typography,
  Box,
  TableHead,
  Table,
  TableBody,
  Button,
  TableCell,
  TablePagination,
  TableRow,
  TableFooter,
  TableContainer,
  Paper,
  CircularProgress,
} from '@mui/material';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const WhatsAppSession = ({
  scan,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  isLoading,
  isError,
  errorMessage,
  handleConnect,
  handleLogout,
  handleShowQR,
}) => {
    return (
        <Paper variant='outlined'>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                        <TableCell>
                            <Typography variant="h6">No</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="h6">Nama Sekolah</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="h6">Session Name</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="h6">Status</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="h6">Terakhir Diperbarui</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="h6">Aksi</Typography>
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
                        ) : scan.length === 0 ? (
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
                                Anda belum terhubung ke WhatsApp, Silahkan scan untuk login ke WhatsApp
                                </Typography>
                            </Box>
                            </TableCell>
                        </TableRow>
                        ) : (
                        scan
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((item, index) => (
                            <TableRow key={`session-${item.id || index}`}>
                                <TableCell>
                                <Typography>{page * rowsPerPage + index + 1}</Typography>
                                </TableCell>
                                <TableCell align="center">
                                <Typography sx={{ fontSize: '1rem' }}>{item.nama_sekolah || '-'}</Typography>
                                </TableCell>
                                <TableCell align="center">
                                <Typography sx={{ fontSize: '1rem' }}>
                                    {item.session_name || '-'}
                                </Typography>
                                </TableCell>
                                <TableCell align="center">
                                <Typography sx={{ fontSize: '1rem' }}>{item.status || '-'}</Typography>
                                </TableCell>
                                <TableCell align="center">
                                <Typography sx={{ fontSize: '1rem' }}>
                                    {item.updated_at ? new Date(item.updated_at).toLocaleString() : '-'}
                                </Typography>
                                </TableCell>
                                <TableCell align="center">
                                <Box
                                    sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 1,
                                    }}
                                >
                                    {item.status === 'connected' ? (
                                        <Button
                                          size="small"
                                          variant="contained"
                                          color="error"
                                          onClick={() => handleLogout(item.sekolah_id)}
                                        >
                                          Logout
                                        </Button>
                                    ) : item.status === 'disconnected' ? (
                                        <Button
                                          size="small"
                                          variant="contained"
                                          color="primary"
                                          onClick={() => handleConnect(item.sekolah_id)}
                                        >
                                          Connect
                                        </Button>
                                    ) : item.status === 'qr' ? (
                                        <Button
                                          size="small"
                                          variant="contained"
                                          color="secondary"
                                          onClick={() => handleShowQR(item.sekolah_id)}
                                        >
                                          Tampilkan QR
                                        </Button>
                                    ) : (
                                        <Typography variant="body2">-</Typography>
                                    )}
                                </Box>
                                </TableCell>
                            </TableRow>
                            ))
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            colSpan={6}
                            count={scan.length}
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

WhatsAppSession.propTypes = {
    scan: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
    handleConnect: PropTypes.func.isRequired,
    handleLogout: PropTypes.func.isRequired,
    handleShowQR: PropTypes.func.isRequired,
};

export default WhatsAppSession;
