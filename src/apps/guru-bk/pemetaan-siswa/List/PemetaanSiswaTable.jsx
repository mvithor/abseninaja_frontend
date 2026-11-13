import PropTypes from 'prop-types';
import { teksNis } from 'src/components/pemetaan-siswa/pemetaanConfig';
import {
  Box,
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
import { IconAlertTriangle, IconEye } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import PerhatianChips from 'src/components/pemetaan-siswa/PerhatianChips';

const KOLOM = ['No', 'Siswa', 'Kelas', 'Ekonomi', 'Geografis', 'Kesehatan', 'Kendaraan', 'Ekskul', 'Faktor Perhatian', 'Aksi'];

// Sel satu dimensi: ikon ⚠ + teks bila dimensi ini termasuk faktor perhatian siswa.
const SelDimensi = ({ perhatian, utama, tambahan }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, justifyContent: 'center' }}>
    {perhatian && <IconAlertTriangle size={14} style={{ marginTop: 3, flexShrink: 0 }} />}
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="body2" fontWeight={perhatian ? 600 : 400} color={perhatian ? 'warning.dark' : 'text.primary'}>
        {utama}
      </Typography>
      {tambahan && <Typography variant="caption" color="text.secondary">{tambahan}</Typography>}
    </Box>
  </Box>
);

SelDimensi.propTypes = { perhatian: PropTypes.bool, utama: PropTypes.node, tambahan: PropTypes.node };

const PemetaanSiswaTable = ({
  siswaList,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  onDetail,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;
  const colSpan = KOLOM.length;

  const barisInfo = (children) => (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
          {children}
        </Box>
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
                : siswaList.length === 0
                  ? barisInfo(<Typography variant="h6">{emptyMessage || 'Belum ada data siswa'}</Typography>)
                  : siswaList.map((s, index) => {
                      const faktor = new Set((s.perhatian || []).map((p) => p.dimensi));
                      return (
                        <TableRow key={s.id} hover>
                          <TableCell>
                            <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.95rem', whiteSpace: 'nowrap' }}>{s.nama}</Typography>
                            <Typography variant="caption" color="text.secondary">{teksNis(s.nis)} · {s.jenis_kelamin || '-'}</Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{s.kelas?.nama}</Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <SelDimensi
                              perhatian={faktor.has('ekonomi')}
                              utama={s.ekonomi?.label}
                              tambahan={s.ekonomi?.bantuan?.length ? s.ekonomi.bantuan.join(', ') : null}
                            />
                          </TableCell>
                          <TableCell align='center'>
                            <SelDimensi
                              perhatian={faktor.has('geografis')}
                              utama={s.geografis?.jarak_km != null ? `${s.geografis.jarak_km} km` : s.geografis?.label}
                              tambahan={s.geografis?.kecamatan}
                            />
                          </TableCell>
                          <TableCell align='center'>
                            <SelDimensi
                              perhatian={faktor.has('kesehatan')}
                              utama={s.kesehatan?.label}
                              tambahan={s.kesehatan?.kondisi?.length ? s.kesehatan.kondisi.join(', ') : null}
                            />
                          </TableCell>
                          <TableCell align='center'>
                            <SelDimensi perhatian={faktor.has('kendaraan')} utama={s.kendaraan?.label} />
                          </TableCell>
                          <TableCell align='center'>
                            <SelDimensi
                              perhatian={faktor.has('ekskul')}
                              utama={s.ekskul?.daftar?.length ? `${s.ekskul.daftar.length} ekskul` : 'Tidak ikut'}
                              tambahan={s.ekskul?.daftar?.join(', ') || null}
                            />
                          </TableCell>
                          <TableCell align='center' sx={{ minWidth: 160 }}>
                            <PerhatianChips perhatian={s.perhatian} ringkas />
                          </TableCell>
                          <TableCell align='center'>
                            <Tooltip title="Lihat Profil Pemetaan">
                              <IconButton onClick={() => onDetail(s)}>
                                <IconEye width={18} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, { label: 'All', value: -1 }]}
                colSpan={colSpan}
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

PemetaanSiswaTable.propTypes = {
  siswaList: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  onDetail: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default PemetaanSiswaTable;
