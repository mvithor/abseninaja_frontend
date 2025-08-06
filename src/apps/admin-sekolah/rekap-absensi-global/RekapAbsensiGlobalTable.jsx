import PropTypes from "prop-types";
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
} from "@mui/material";
import TablePaginationActions from "src/components/table-pagination-actions/TablePaginationActions";

const RekapAbsensiGlobalTable = ({
  kelasRekap,
  page,
  rowsPerPage,
  handleLaporan,
  handleAbsensi,
  handleChangePage,
  handleChangeRowsPerPage,
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
                <Typography variant="h6">No</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6">Kelas</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6">Wali Kelas</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6">Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: "100px",
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
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: "100px",
                    }}
                  >
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : kelasRekap.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      minHeight: "100px",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6">
                      Tidak ada data kelas tersedia
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              kelasRekap
                .slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
                .map((item, index) => (
                  <TableRow key={`kelas-${item.id || index}`}>
                    <TableCell>
                      <Typography>
                        {page * rowsPerPage + index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: "1rem" }}>
                        {item.nama_kelas}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: "1rem" }}>
                        {item.nama_wali_kelas || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleLaporan(item.kelas_id)}
                        >
                          Laporan
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleAbsensi(item.kelas_id)}
                        >
                          Absensi
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={4}
                count={kelasRekap.length}
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

RekapAbsensiGlobalTable.propTypes = {
  kelasRekap: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleLaporan: PropTypes.func.isRequired,
  handleAbsensi: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default RekapAbsensiGlobalTable;
