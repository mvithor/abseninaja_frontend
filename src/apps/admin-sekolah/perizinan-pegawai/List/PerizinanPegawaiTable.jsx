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
  Link as MuiLink,
  Chip,
} from '@mui/material';
import { IconEdit } from '@tabler/icons-react';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

// ===== Helpers untuk tampilan Lampiran =====
const isPdfUrl = (url = '') => /\.pdf($|\?)/i.test(url);

const isCloudinaryImage = (url = '') =>
  /res\.cloudinary\.com\/[^/]+\/image\/upload\//i.test(url);

const toCloudinaryThumb = (
  url,
  // c_thumb = crop thumbnail, w/h = ukuran, f_auto = pilih format optimal, q_auto = kualitas otomatis
  opts = 'c_thumb,w_56,h_56,f_auto,q_auto'
) => (isCloudinaryImage(url) ? url.replace('/upload/', `/upload/${opts}/`) : url);

const PerizinanPegawaiTable = ({
  perizinan,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  isLoading,
  isError,
  errorMessage,
}) => {
  return (
    <Paper variant='outlined'>
      <TableContainer>
        <Table aria-label="custom pagination table" sx={{ whiteSpace: 'nowrap' }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kategori Pegawai</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Sub Kategori Pegawai</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Jenis Izin</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Tanggal Izin</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Keterangan</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Diajukan</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Lampiran</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Catatan Admin</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Disetujui Oleh</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={13}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={13}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : perizinan.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13}>
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
                    <Typography variant="h6">Tidak ada data perizinan</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              (rowsPerPage > 0
                ? perizinan.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : perizinan
              ).map((perizinanPegawai, index) => (
                <TableRow key={perizinanPegawai.id}>
                  <TableCell>
                    <Typography sx={{ fontSize: '1rem' }}>
                      {page * rowsPerPage + index + 1}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {perizinanPegawai.nama_pegawai || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {perizinanPegawai.kategori || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {perizinanPegawai.sub_kategori || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {perizinanPegawai.jenis_izin || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {perizinanPegawai.tanggal_izin || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {perizinanPegawai.alasan || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {perizinanPegawai.createdAt || '-'}
                    </Typography>
                  </TableCell>

                  {/* ==== Lampiran (thumbnail/Chip, bukan URL panjang) ==== */}
                  <TableCell align="center">
                    {perizinanPegawai.lampiran ? (
                      isPdfUrl(perizinanPegawai.lampiran) ? (
                        <Tooltip title="Lihat PDF">
                          <MuiLink
                            href={perizinanPegawai.lampiran}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="none"
                          >
                            <Chip
                              icon={<PictureAsPdfIcon fontSize="small" />}
                              label="Lihat PDF"
                              variant="outlined"
                              sx={{ cursor: 'pointer' }}
                            />
                          </MuiLink>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Lihat gambar">
                          <MuiLink
                            href={perizinanPegawai.lampiran}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="none"
                            sx={{ display: 'inline-flex' }}
                          >
                            <img
                              src={toCloudinaryThumb(perizinanPegawai.lampiran)}
                              alt="Lampiran"
                              style={{
                                width: 56,
                                height: 56,
                                borderRadius: 6,
                                objectFit: 'cover',
                                display: 'block',
                              }}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          </MuiLink>
                        </Tooltip>
                      )
                    ) : (
                      <Typography sx={{ fontSize: '1rem' }}>-</Typography>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {perizinanPegawai.status || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {perizinanPegawai.catatan_admin || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {perizinanPegawai.disetujui_oleh || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Tooltip title="Edit" placement="bottom">
                        <IconButton onClick={() => handleEdit(perizinanPegawai.id)}>
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
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={13}
                count={perizinan.length}
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

PerizinanPegawaiTable.propTypes = {
  perizinan: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default PerizinanPegawaiTable;
