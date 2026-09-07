import PropTypes from 'prop-types';
import {
  Typography, TableHead, Table, TableBody, Tooltip, TableCell,
  TablePagination, TableRow, TableFooter, IconButton, TableContainer,
  Box, Paper, CircularProgress,
} from '@mui/material';
import { IconEye } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import { KuadranCell, EwsCell, StatusPenempatanChip } from 'src/helpers/monitoringPklHelpers';
import { JALUR_LABEL, formatTanggal } from 'src/utils/monitoringPklUtils';

const RiwayatPklTable = ({
  rosterList, page, rowsPerPage, totalCount,
  handleChangePage, handleChangeRowsPerPage,
  onLihatDetail,
  isLoading, isError, errorMessage, emptyMessage,
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;

  return (
    <Paper variant='outlined'>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography></TableCell>
              <TableCell align='center'><Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama</Typography></TableCell>
              <TableCell align='center'><Typography variant="h6" sx={{ fontSize: '1rem' }}>Kelas</Typography></TableCell>
              <TableCell align='center'><Typography variant="h6" sx={{ fontSize: '1rem' }}>Mitra Industri</Typography></TableCell>
              <TableCell align='center'><Typography variant="h6" sx={{ fontSize: '1rem' }}>Kuadran</Typography></TableCell>
              <TableCell align='center'><Typography variant="h6" sx={{ fontSize: '1rem' }}>EWS</Typography></TableCell>
              <TableCell align='center'><Typography variant="h6" sx={{ fontSize: '1rem' }}>Jalur</Typography></TableCell>
              <TableCell align='center'><Typography variant="h6" sx={{ fontSize: '1rem' }}>Tanggal</Typography></TableCell>
              <TableCell align='center'><Typography variant="h6" sx={{ fontSize: '1rem' }}>Status Penempatan</Typography></TableCell>
              <TableCell align='center'><Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <Typography color="error" variant="h6">{errorMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (rosterList?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
                    <Typography variant="h6">{emptyMessage || 'Tidak ada riwayat pada semester ini'}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rosterList.map((row, index) => {
                const isAlumni = row.statusSiswa === 'alumni';
                return (
                  <TableRow key={row.placementId}>
                    <TableCell><Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography></TableCell>
                    <TableCell align='center'><Typography sx={{ fontSize: '1rem' }}>{row.nama || '-'}</Typography></TableCell>
                    <TableCell align='center'><Typography sx={{ fontSize: '1rem' }}>{row.kelas || '-'}</Typography></TableCell>
                    <TableCell align='center'>
                      <Tooltip title={[row.mitra?.namaKontak, row.mitra?.teleponKontak].filter(Boolean).join(' · ')}>
                        <Typography sx={{ fontSize: '1rem' }}>{row.mitra?.nama || '-'}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align='center'><KuadranCell row={row} /></TableCell>
                    <TableCell align='center'><EwsCell row={row} /></TableCell>
                    <TableCell align='center'><Typography sx={{ fontSize: '0.9rem' }}>{JALUR_LABEL[row.jalurKeputusan] || row.jalurKeputusan}</Typography></TableCell>
                    <TableCell align='center'><Typography sx={{ fontSize: '0.9rem' }}>{formatTanggal(row.keputusanPada)}</Typography></TableCell>
                    <TableCell align='center'><StatusPenempatanChip row={row} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Tooltip title={isAlumni ? 'Profil tidak lagi tersedia untuk alumni' : 'Lihat Profil Siswa'} placement="bottom">
                          <span>
                            <IconButton onClick={() => !isAlumni && onLihatDetail(row.siswaId)} disabled={isAlumni}>
                              <IconEye width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 25, { label: 'All', value: -1 }]}
                colSpan={10}
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

RiwayatPklTable.propTypes = {
  rosterList: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  onLihatDetail: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default RiwayatPklTable;