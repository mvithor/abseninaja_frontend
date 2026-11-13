import PropTypes from 'prop-types';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { IconSchool } from '@tabler/icons-react';

const TimBkTable = ({ timList, bolehKelola, idSaya, onAturKelas, onToggleAktif, isLoading, isError, errorMessage }) => {
  const kolom = ['No', 'Nama', 'Peran', 'Kelas Tanggung Jawab', 'Siswa Binaan', 'Status', ...(bolehKelola ? ['Aksi'] : [])];

  const barisInfo = (children) => (
    <TableRow>
      <TableCell colSpan={kolom.length}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>{children}</Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Paper variant='outlined'>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {kolom.map((judul, i) => (
                <TableCell key={judul} align={i < 2 ? 'left' : 'center'}>
                  <Typography variant="h6" sx={{ fontSize: '1rem' }}>{judul}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? barisInfo(<CircularProgress />)
              : isError
                ? barisInfo(<Typography color="error" variant="h6">{errorMessage}</Typography>)
                : timList.length === 0
                  ? barisInfo(<Typography variant="h6">Belum ada anggota Tim BK</Typography>)
                  : timList.map((t, index) => (
                      <TableRow key={t.id} hover sx={{ opacity: t.aktif ? 1 : 0.6 }}>
                        <TableCell>
                          <Typography sx={{ fontSize: '1rem' }}>{index + 1}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.95rem' }}>
                            {t.pegawai?.nama}
                            {t.id === idSaya && <Typography component="span" variant="caption" color="primary"> (Anda)</Typography>}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{t.pegawai?.nip} · {t.pegawai?.email}</Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            size="small"
                            label={t.is_koordinator ? 'Koordinator' : 'Anggota'}
                            color={t.is_koordinator ? 'primary' : 'default'}
                            variant={t.is_koordinator ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align='center'>
                          {t.kelas.length ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                              {t.kelas.map((k) => <Chip key={k.id} size="small" label={k.nama} />)}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="warning.dark">Belum ada kelas</Typography>
                          )}
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant="body2">{t.jumlah_siswa}</Typography>
                        </TableCell>
                        <TableCell align='center'>
                          {bolehKelola && !t.is_koordinator ? (
                            <Tooltip title={t.aktif ? 'Nonaktifkan akun BK' : 'Aktifkan akun BK'}>
                              <Switch checked={t.aktif} onChange={() => onToggleAktif(t)} size="small" />
                            </Tooltip>
                          ) : (
                            <Chip size="small" label={t.aktif ? 'Aktif' : 'Nonaktif'} color={t.aktif ? 'success' : 'default'} />
                          )}
                        </TableCell>
                        {bolehKelola && (
                          <TableCell align='center'>
                            <Tooltip title="Atur Kelas Tanggung Jawab">
                              <span>
                                <IconButton onClick={() => onAturKelas(t)} disabled={!t.aktif}>
                                  <IconSchool width={18} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

TimBkTable.propTypes = {
  timList: PropTypes.array.isRequired,
  bolehKelola: PropTypes.bool,
  idSaya: PropTypes.string,
  onAturKelas: PropTypes.func.isRequired,
  onToggleAktif: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default TimBkTable;
