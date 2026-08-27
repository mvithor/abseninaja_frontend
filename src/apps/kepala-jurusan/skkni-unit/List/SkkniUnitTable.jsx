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
import { IconEdit } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const KATEGORI_LABEL = {
  kompetensi_umum: 'Kompetensi Umum',
  kompetensi_inti: 'Kompetensi Inti',
  kompetensi_pilihan: 'Kompetensi Pilihan',
};

const KATEGORI_COLOR = {
  kompetensi_umum: 'info',
  kompetensi_inti: 'primary',
  kompetensi_pilihan: 'secondary',
};

const SkkniUnitTable = ({
  skkniUnitList,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;

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
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kode Unit</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Judul Unit</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kategori</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (skkniUnitList?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
                    <Typography variant="h6">{emptyMessage || 'Belum ada unit SKKNI yang dikurasi'}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              skkniUnitList.map((unit, index) => (
                <TableRow key={unit.id || index}>
                  <TableCell>
                    <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography sx={{ fontSize: '1rem' }}>{unit.kode_unit || '-'}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography sx={{ fontSize: '1rem' }}>{unit.judul_unit || '-'}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Chip
                      label={KATEGORI_LABEL[unit.kategori] || unit.kategori}
                      color={KATEGORI_COLOR[unit.kategori] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Chip
                      label={unit.is_aktif ? 'Aktif' : 'Nonaktif'}
                      color={unit.is_aktif ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Tooltip title="Edit" placement="bottom">
                        <IconButton onClick={() => handleEdit(unit.id)}>
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
                rowsPerPageOptions={[5, 10, 20, 25, { label: 'All', value: -1 }]}
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

SkkniUnitTable.propTypes = {
  skkniUnitList: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default SkkniUnitTable;