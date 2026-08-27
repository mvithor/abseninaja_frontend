import { Link } from 'react-router-dom';
import {
  Box, Typography, Chip, CircularProgress, IconButton,
  Avatar, useTheme, Divider,
} from '@mui/material';
import { IconCheck, IconX, IconArrowRight } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';

const fetchPerizinanPegawai = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/perizinan-pegawai');
  return Array.isArray(res.data.data) ? res.data.data : [];
};

const updateStatus = async ({ id, status }) => {
  await axiosInstance.put(`/api/v1/admin-sekolah/perizinan-pegawai/${id}`, { status, catatan_admin: '' });
};

const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

const JENIS_COLOR = {
  Sakit: { bg: '#FEE2E2', color: '#991B1B' },
  Izin: { bg: '#DBEAFE', color: '#1E40AF' },
};

const PerizinanPegawaiWidget = ({ onCountChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const qc = useQueryClient();

  const { data: all = [], isLoading } = useQuery({
    queryKey: ['perizinanPegawai'],
    queryFn: fetchPerizinanPegawai,
    staleTime: 30000,
    onSuccess: (data) => {
      const pending = data.filter((d) => d.status === 'Menunggu');
      if (onCountChange) onCountChange(pending.length);
    },
  });

  const pending = all.filter((d) => d.status === 'Menunggu').slice(0, 3);
  const pendingTotal = all.filter((d) => d.status === 'Menunggu').length;

  const mutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      qc.invalidateQueries(['perizinanPegawai']);
    },
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
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Perizinan pegawai
          </Typography>
          {pendingTotal > 0 && (
            <Chip
              label={`${pendingTotal} pending`}
              size="small"
              sx={{ fontSize: '0.65rem', height: 18, backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 600 }}
            />
          )}
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={20} />
        </Box>
      ) : pending.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', py: 2 }}>
          Tidak ada perizinan menunggu
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          {pending.map((item, i) => {
            const jenisColor = JENIS_COLOR[item.jenis_izin] || { bg: '#F3F4F6', color: '#374151' };
            return (
              <Box key={item.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                  <Avatar
                    sx={{ width: 32, height: 32, fontSize: '0.7rem', backgroundColor: '#6366F1', flexShrink: 0 }}
                  >
                    {initials(item.nama_pegawai)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={700} noWrap sx={{ display: 'block' }}>
                      {item.nama_pegawai || '-'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                      <Box
                        component="span"
                        sx={{
                          backgroundColor: jenisColor.bg,
                          color: jenisColor.color,
                          px: 0.5,
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      >
                        {item.jenis_izin}
                      </Box>{' '}
                      · {item.tanggal_izin}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <IconButton
                      size="small"
                      disabled={mutation.isLoading}
                      onClick={() => mutation.mutate({ id: item.id, status: 'Disetujui' })}
                      sx={{
                        backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '6px',
                        px: 1, py: 0.5,
                        '&:hover': { backgroundColor: '#A7F3D0' },
                      }}
                    >
                      <IconCheck size={13} />
                      <Typography variant="caption" fontWeight={700} sx={{ ml: 0.3 }}>OK</Typography>
                    </IconButton>
                    <IconButton
                      size="small"
                      disabled={mutation.isLoading}
                      onClick={() => mutation.mutate({ id: item.id, status: 'Ditolak' })}
                      sx={{
                        backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '6px',
                        '&:hover': { backgroundColor: '#FECACA' },
                      }}
                    >
                      <IconX size={13} />
                    </IconButton>
                  </Box>
                </Box>
                {i < pending.length - 1 && <Divider sx={{ mt: 0.5 }} />}
              </Box>
            );
          })}
        </Box>
      )}

      <Box
        component={Link}
        to="/dashboard/admin-sekolah/perizinan-pegawai"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.4, color: 'primary.main', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, mt: 1 }}
      >
        Lihat semua <IconArrowRight size={13} />
      </Box>
    </Box>
  );
};

export default PerizinanPegawaiWidget;
