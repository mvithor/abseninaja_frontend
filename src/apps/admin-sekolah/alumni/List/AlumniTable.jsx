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
} from '@mui/material';
import { IconFileDownload, IconEye } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const AlumniRow = ({ alumni, index, onExport, isExporting, onDetail }) => (
  <TableRow key={alumni.id}>
    <TableCell>
      <Typography sx={{ fontSize: '0.9rem' }}>{index + 1}</Typography>
    </TableCell>
    <TableCell>
      <Typography sx={{ fontSize: '0.9rem' }}>{alumni?.User?.name || '-'}</Typography>
    </TableCell>
    <TableCell align="center">
      <Typography sx={{ fontSize: '0.9rem' }}>{alumni.nis || '-'}</Typography>
    </TableCell>
    <TableCell align="center">
      <Typography sx={{ fontSize: '0.9rem' }}>{alumni?.KelasTermakhir?.nama_kelas || alumni?.Kelas?.nama_kelas || '-'}</Typography>
    </TableCell>
    <TableCell align="center">
      <Typography sx={{ fontSize: '0.9rem' }}>{alumni.tahun_lulus || '-'}</Typography>
    </TableCell>
    <TableCell align="center">
      <Tooltip title="Detail Alumni" placement="bottom">
        <IconButton onClick={() => onDetail(alumni.id)}>
          <IconEye width={18} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Export Data Alumni" placement="bottom">
        <span>
          <IconButton
            onClick={() => onExport(alumni.id, alumni?.User?.name)}
            disabled={isExporting === alumni.id}
          >
            {isExporting === alumni.id
              ? <CircularProgress size={16} />
              : <IconFileDownload width={18} />}
          </IconButton>
        </span>
      </Tooltip>
    </TableCell>
  </TableRow>
);

const AlumniTable = ({
  alumni,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  onExport,
  exportingId,
  isLoading,
  isError,
  errorMessage,
  onDetail,
}) => {
  const baseIndex = page * rowsPerPage;

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography></TableCell>
              <TableCell><Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Alumni</Typography></TableCell>
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>NIS</Typography></TableCell>
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>Kelas Terakhir</Typography></TableCell>
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>Tahun Lulus</Typography></TableCell>
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 100, alignItems: 'center' }}>
                    <Typography color="error" variant="h6">{errorMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : alumni.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 100, alignItems: 'center' }}>
                    <Typography variant="h6">Belum ada data alumni</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              alumni.map((item, index) => (
                <AlumniRow
                  key={item.id}
                  alumni={item}
                  index={baseIndex + index}
                  onExport={onExport}
                  isExporting={exportingId}
                  onDetail={onDetail}
                />
              ))
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, { label: 'All', value: -1 }]}
                colSpan={6}
                count={totalCount}
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

AlumniTable.propTypes = {
  alumni: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  exportingId: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  onDetail: PropTypes.func.isRequired,
};

export default AlumniTable;
