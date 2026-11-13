import PropTypes from 'prop-types';
import { teksNis } from 'src/components/pemetaan-siswa/pemetaanConfig';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { IconDownload, IconHistory } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import PerhatianChips from 'src/components/pemetaan-siswa/PerhatianChips';
import { formatTanggalPendek, statusPenangananMeta } from 'src/components/jurnal-bk/jurnalConfig';

const KOLOM = ['No', 'Siswa', 'Kelas', 'Penanganan', 'Kategori Utama', 'Terakhir Ditangani', 'Faktor Pemetaan', 'Aksi'];

const RiwayatSiswaTable = ({
  rows,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  onRiwayat,
  onUnduh,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;
  const barisInfo = (children) => (
    <TableRow>
      <TableCell colSpan={KOLOM.length}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>{children}</Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Paper variant='outlined'>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {KOLOM.map((judul, i) => (
                <TableCell key={judul} align={i < 2 ? 'left' : 'center'}>
                  <Typography variant="h6" sx={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>{judul}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? barisInfo(<CircularProgress />)
              : isError
                ? barisInfo(<Typography color="error" variant="h6">{errorMessage}</Typography>)
                : rows.length === 0
                  ? barisInfo(<Typography variant="h6">{emptyMessage || 'Belum ada riwayat permasalahan'}</Typography>)
                  : rows.map((r, index) => {
                      const status = r.terakhir ? statusPenangananMeta(r.terakhir.status?.kode) : null;
                      return (
                        <TableRow key={r.siswa.id} hover>
                          <TableCell><Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography></TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.95rem', whiteSpace: 'nowrap' }}>{r.siswa.nama}</Typography>
                            <Typography variant="caption" color="text.secondary">{teksNis(r.siswa.nis)}</Typography>
                          </TableCell>
                          <TableCell align='center'><Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{r.siswa.kelas?.nama}</Typography></TableCell>
                          <TableCell align='center'>
                            <Typography variant="subtitle1">{r.jumlah_penanganan}</Typography>
                            {r.tindak_lanjut_terbuka > 0 && (
                              <Typography variant="caption" color="warning.dark">{r.tindak_lanjut_terbuka} tindak lanjut</Typography>
                            )}
                          </TableCell>
                          <TableCell align='center'>
                            {r.kategori_utama ? <Chip size="small" variant="outlined" label={r.kategori_utama.label} /> : '-'}
                          </TableCell>
                          <TableCell align='center'>
                            {r.terakhir ? (
                              <>
                                <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{formatTanggalPendek(r.terakhir.tanggal)}</Typography>
                                <Chip size="small" label={status.label} color={status.color} sx={{ mt: 0.5 }} />
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary">Belum pernah</Typography>
                            )}
                          </TableCell>
                          <TableCell align='center' sx={{ minWidth: 150 }}><PerhatianChips perhatian={r.perhatian} ringkas /></TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <Tooltip title="Riwayat Permasalahan">
                                <IconButton onClick={() => onRiwayat(r.siswa)}><IconHistory width={18} /></IconButton>
                              </Tooltip>
                              <Tooltip title="Unduh Profil Siswa">
                                <IconButton onClick={() => onUnduh(r.siswa)}><IconDownload width={18} /></IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, { label: 'All', value: -1 }]}
                colSpan={KOLOM.length}
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

RiwayatSiswaTable.propTypes = {
  rows: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  onRiwayat: PropTypes.func.isRequired,
  onUnduh: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default RiwayatSiswaTable;
