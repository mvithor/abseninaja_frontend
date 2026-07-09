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
  Collapse,
} from '@mui/material';
import { IconFileDownload, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useState } from 'react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const WaliRow = ({ wali }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
    {wali.map((w, i) => (
      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
        <Typography variant="caption" color="text.secondary">
          {w?.User?.name || '-'}
        </Typography>
        <Chip
          label={w.hubungan || '-'}
          size="small"
          sx={{ fontSize: '0.65rem', height: 16 }}
        />
        {w.is_wali_utama && (
          <Chip
            label="Wali Utama"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.65rem', height: 16 }}
          />
        )}
        {w.nomor_telepon && (
          <Typography variant="caption" color="text.secondary">
            · {w.nomor_telepon}
          </Typography>
        )}
      </Box>
    ))}
  </Box>
);

const AlumniRow = ({ alumni, index, onExport, isExporting }) => {
  const [open, setOpen] = useState(false);
  const wali = alumni.WaliSiswa ?? [];

  return (
    <>
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
          <Typography sx={{ fontSize: '0.9rem' }}>{alumni?.Kelas?.nama_kelas || '-'}</Typography>
        </TableCell>
        <TableCell align="center">
          <Typography sx={{ fontSize: '0.9rem' }}>{alumni.tahun_lulus || '-'}</Typography>
        </TableCell>
        <TableCell align="center">
          {wali.length === 0 ? (
            <Typography variant="caption" color="text.secondary">-</Typography>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <Typography variant="caption">{wali.length} wali</Typography>
              <IconButton size="small" onClick={() => setOpen((v) => !v)}>
                {open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              </IconButton>
            </Box>
          )}
        </TableCell>
        <TableCell align="center">
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

      {/* Baris ekspansi wali siswa */}
      {open && wali.length > 0 && (
        <TableRow>
          <TableCell colSpan={7} sx={{ py: 0, bgcolor: 'action.hover' }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ px: 3, py: 1.5 }}>
                <Typography variant="caption" fontWeight={700} mb={0.5} display="block">
                  Data Orang Tua / Wali
                </Typography>
                <WaliRow wali={wali} />
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

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
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>Wali Siswa</Typography></TableCell>
              <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 100, alignItems: 'center' }}>
                    <Typography color="error" variant="h6">{errorMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : alumni.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
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
                />
              ))
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, { label: 'All', value: -1 }]}
                colSpan={7}
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
};

export default AlumniTable;
