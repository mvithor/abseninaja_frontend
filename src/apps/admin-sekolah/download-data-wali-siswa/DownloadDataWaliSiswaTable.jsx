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

const DownloadDataWaliSiswaTable = ({
  waliData = [],
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleDownload,
  isLoading,
  isError,
  errorMessage
}) => {
  const dataArr = Array.isArray(waliData) ? waliData : [];

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
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Jumlah Wali</Typography>
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
            ) : dataArr.length === 0 ? (
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
                ? dataArr.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : dataArr
              ).map((item, index) => (
                <TableRow key={item.id ?? item.kelas_id ?? `${item.nama_kelas}-${index}`}>
                  <TableCell>
                    <Typography sx={{ fontSize: '1rem' }}>
                      {page * rowsPerPage + index + 1}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>{item.nama_kelas}</Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>{item.jumlah_wali}</Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Tooltip title="Download" placement="bottom">
                        <span>
                          <IconButton
                            onClick={() => handleDownload(item.id ?? item.kelas_id)}
                            disabled={!handleDownload || !(item.id ?? item.kelas_id)}
                          >
                            <IconDownload width={18} />
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
                colSpan={4}
                count={dataArr.length}
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

DownloadDataWaliSiswaTable.propTypes = {
  waliData: PropTypes.array,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleDownload: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default DownloadDataWaliSiswaTable;
