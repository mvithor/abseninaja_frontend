import PropTypes from "prop-types";
import {
  Typography,
  TableHead,
  Table,
  TableBody,
  Tooltip,
  TableCell,
  TableRow,
  IconButton,
  TableContainer,
  Box,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import {
  formatTanggalWaktu,
  isDeadlineLewat,
} from "src/components/perangkat-ajar/perangkatAjarConfig";

// Jumlah baris = jumlah jenis perangkat ajar (maks. beberapa), jadi tanpa pagination.
const DeadlinePerangkatAjarTable = ({
  deadlineList,
  timezone,
  handleEdit,
  handleDelete,
  bacaSaja = false,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
}) => (
  <Paper variant="outlined">
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                No
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                Jenis Perangkat Ajar
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                Deadline
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                Status
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                Keterangan
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                Aksi
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6}>
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
              <TableCell colSpan={6}>
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
          ) : deadlineList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100px",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6">
                    {emptyMessage || "Belum ada deadline untuk semester ini"}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            deadlineList.map((item, index) => {
              const lewat = isDeadlineLewat(item.deadline);
              return (
                <TableRow key={item.id || index}>
                  <TableCell>
                    <Typography sx={{ fontSize: "1rem" }}>
                      {index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "1rem" }}>
                      {item.jenis?.label || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: "1rem" }}>
                      {formatTanggalWaktu(item.deadline, timezone)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={lewat ? "Terkunci" : "Berjalan"}
                      color={lewat ? "default" : "success"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {item.keterangan || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      {bacaSaja ? (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      ) : (
                        <>
                          <Tooltip title="Edit" placement="bottom">
                            <IconButton onClick={() => handleEdit(item.id)}>
                              <IconEdit width={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus" placement="bottom">
                            <IconButton onClick={() => handleDelete(item.id)}>
                              <IconTrash width={18} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

DeadlinePerangkatAjarTable.propTypes = {
  deadlineList: PropTypes.array.isRequired,
  timezone: PropTypes.string,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  bacaSaja: PropTypes.bool,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default DeadlinePerangkatAjarTable;
