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

// py:'7px' + fontSize:0.75rem(≈17px line-height) = ~31px/row; 14 rows + header ≈ 490px
const TABLE_MAX_H = 520;

const COLS = [
  { label: 'Jam',    width: 92 },
  { label: 'Guru',   width: '26%' },
  { label: 'Mapel',  width: '24%' },
  { label: 'Kelas',  width: 52 },
  { label: 'H/A',    width: 42 },
  { label: 'Status', width: '22%' },
];

const STATUS_CFG = {
  'Sudah diisi':      { color: '#059669' },
  'Lewat, belum diisi': { color: '#D97706' },
  'Belum mulai':      { color: '#9CA3AF' },
  'Belum waktu':      { color: '#9CA3AF' },
};

const StatusDot = ({ status }) => {
  const cfg = STATUS_CFG[status] || { color: '#9CA3AF' };
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: cfg.color, flexShrink: 0 }} />
      <Typography noWrap sx={{ fontSize: '0.7rem', color: cfg.color, fontWeight: 500 }}>
        {status}
      </Typography>
    </Box>
  );
};

const LEGEND = [
  { color: '#059669', label: 'Sudah diisi' },
  { color: '#D97706', label: 'Lewat, belum diisi' },
  { color: '#9CA3AF', label: 'Belum mulai' },
];

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
  const headBg = isDark ? theme.palette.grey[900] : theme.palette.grey[50];

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '10px',
        backgroundColor: cardBg,
        boxShadow: theme.shadows[1],
        border: isDark ? `1px solid ${theme.palette.divider}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {/* ── Judul ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Absensi mapel per sesi
        </Typography>
        {!isLoading && !isError && (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {sesi.length} sesi hari ini
          </Typography>
        )}
      </Box>

      {/* ── Loading ── */}
      {isLoading && (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* ── Kosong / Error ── */}
      {!isLoading && (isError || sesi.length === 0) && (
        <Box
          sx={{
            py: 6,
            textAlign: 'center',
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: '8px',
          }}
        >
          <Typography variant="body2" color="text.disabled">
            {isError ? 'Gagal memuat data sesi mapel' : 'Belum ada data sesi hari ini'}
          </Typography>
        </Box>
      )}

      {/* ── Tabel (max 14 baris terlihat, sisanya scroll) ── */}
      {!isLoading && !isError && sesi.length > 0 && (
        <>
          <Box
            sx={{
              maxHeight: TABLE_MAX_H,
              overflowY: 'auto',
              borderRadius: '8px',
              border: `1px solid ${theme.palette.divider}`,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
              },
            }}
          >
            <Table
              size="small"
              stickyHeader
              sx={{
                tableLayout: 'fixed',
                '& td, & th': { py: '7px', px: '8px', fontSize: '0.75rem', lineHeight: 1.4 },
              }}
            >
              <TableHead>
                <TableRow>
                  {COLS.map(({ label, width }) => (
                    <TableCell
                      key={label}
                      sx={{
                        width,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        color: 'text.secondary',
                        whiteSpace: 'nowrap',
                        backgroundColor: headBg,
                        borderBottom: `1.5px solid ${theme.palette.divider}`,
                      }}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {sesi.map((row, i) => (
                  <TableRow
                    key={i}
                    hover
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      '&:nth-of-type(even)': {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.018)',
                      },
                    }}
                  >
                    {/* Jam */}
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {row.jam_mulai}
                      </Typography>
                      <Typography component="span" sx={{ fontSize: '0.7rem', color: 'text.disabled', mx: '2px' }}>
                        →
                      </Typography>
                      <Typography component="span" sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>
                        {row.jam_selesai}
                      </Typography>
                    </TableCell>

                    {/* Guru */}
                    <TableCell>
                      <Typography noWrap title={row.nama_guru || '-'} sx={{ fontSize: '0.75rem' }}>
                        {row.nama_guru || '-'}
                      </Typography>
                    </TableCell>

                    {/* Mapel */}
                    <TableCell>
                      <Typography noWrap title={row.nama_mapel || '-'} sx={{ fontSize: '0.75rem' }}>
                        {row.nama_mapel || '-'}
                      </Typography>
                    </TableCell>

                    {/* Kelas */}
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography sx={{ fontSize: '0.75rem' }}>{row.nama_kelas || '-'}</Typography>
                    </TableCell>

                    {/* H/A */}
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {row.hadir != null ? `${row.hadir}/${row.total}` : '—'}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusDot status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* ── Footer: legenda + link ── */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 0.5,
              pt: 0.5,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {LEGEND.map((leg) => (
                <Box key={leg.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: leg.color, flexShrink: 0 }} />
                  <Typography sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                    {leg.label}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box
              component={Link}
              to="/dashboard/admin-sekolah/absensi-siswa"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                color: 'primary.main',
                textDecoration: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
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
