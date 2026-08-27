import { Link } from 'react-router-dom';
import {
  Box, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  CircularProgress, useTheme,
} from '@mui/material';
import { IconArrowRight } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';

const fetchAbsensiMapel = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/monitoring/absensi-mapel-hari-ini');
  return res.data.data;
};

const StatusDot = ({ status }) => {
  const map = {
    'Sudah diisi': { color: '#059669', label: 'Sudah diisi' },
    'Lewat, belum diisi': { color: '#D97706', label: 'Lewat, belum diisi' },
    'Belum mulai': { color: '#9CA3AF', label: 'Belum mulai' },
    'Belum waktu': { color: '#9CA3AF', label: 'Belum waktu' },
  };
  const cfg = map[status] || { color: '#9CA3AF', label: status };
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cfg.color, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: cfg.color, fontWeight: 500 }}>
        {cfg.label}
      </Typography>
    </Box>
  );
};

const AbsensiMapelPerSesi = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: sesi = [], isLoading, isError } = useQuery({
    queryKey: ['absensiMapelHariIni'],
    queryFn: fetchAbsensiMapel,
    staleTime: 30000,
    retry: false,
  });

  const cardBg = isDark ? theme.palette.action.hover : theme.palette.background.paper;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '10px',
        backgroundColor: cardBg,
        boxShadow: theme.shadows[1],
        border: isDark ? `1px solid ${theme.palette.divider}` : 'none',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Absensi mapel per sesi
        </Typography>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {isError || (!isLoading && sesi.length === 0) ? (
        <Box
          sx={{
            py: 4,
            textAlign: 'center',
            color: 'text.disabled',
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: '8px',
          }}
        >
          <Typography variant="body2">
            {isError ? 'Gagal memuat data sesi mapel' : 'Belum ada data sesi hari ini'}
          </Typography>
        </Box>
      ) : (
        <>
          <Table size="small" sx={{ '& td, & th': { py: 0.7, px: 0.5, fontSize: '0.78rem' } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: 80 }}>Jam</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Guru</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Mapel</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Kelas</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: 50 }}>H/A</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sesi.map((row, i) => (
                <TableRow key={i} hover>
                  <TableCell>
                    <Typography variant="caption" fontWeight={600} sx={{ display: 'block' }}>
                      {row.jam_mulai}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      →{row.jam_selesai}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Box
                        sx={{
                          width: 24, height: 24, borderRadius: '50%',
                          backgroundColor: 'primary.main', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6rem', fontWeight: 700, flexShrink: 0,
                        }}
                      >
                        {(row.nama_guru || '?').split(' ').map((w) => w[0]).slice(0, 2).join('')}
                      </Box>
                      <Typography variant="caption" noWrap sx={{ maxWidth: 80 }}>
                        {row.nama_guru || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" noWrap sx={{ maxWidth: 90, display: 'block' }}>
                      {row.nama_mapel || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{row.nama_kelas || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{row.hadir != null ? `${row.hadir}/${row.total}` : '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusDot status={row.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[
                { color: '#059669', label: 'Sudah diisi' },
                { color: '#D97706', label: 'Lewat, belum diisi' },
                { color: '#9CA3AF', label: 'Belum mulai' },
              ].map((leg) => (
                <Box key={leg.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: leg.color }} />
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                    {leg.label}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box
              component={Link}
              to="/dashboard/admin-sekolah/absensi-siswa"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: 'primary.main', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}
            >
              Lihat semua sesi <IconArrowRight size={13} />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AbsensiMapelPerSesi;
