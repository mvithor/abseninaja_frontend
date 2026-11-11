import PropTypes from 'prop-types';
import { Alert, Box, Button, ButtonBase, Chip, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { IconInbox } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import DashboardCard from 'src/components/shared/DashboardCard';
import axiosInstance from 'src/utils/axiosInstance';
import { BK_API } from 'src/components/pemetaan-siswa/pemetaanConfig';
import { metaUrgensi, waktuRelatif } from 'src/components/pengaduan-bk/pengaduanConfig';

const MAKS = 4;

// Pengaduan aktif paling mendesak + angka ringkas (baru, belum ditugaskan, menunggu balasan).
const PengaduanRingkasCard = ({ onBuka, onLihatSemua }) => {
  const params = { kelompok: 'aktif', limit: MAKS };
  const { data, isLoading } = useQuery({
    queryKey: ['bk-pengaduan', params],
    queryFn: async () => {
      const res = await axiosInstance.get(`${BK_API}/pengaduan`, { params });
      return { list: res.data?.data || [], ringkasan: res.data?.meta?.ringkasan || {} };
    },
    refetchInterval: 60_000,
  });
  const r = data?.ringkasan || {};

  return (
    <DashboardCard
      title="Pengaduan Anonim"
      subtitle={data ? `${r.aktif || 0} aktif · ${r.baru || 0} baru · ${r.menunggu_balasan || 0} menunggu balasan` : undefined}
      action={<Button size="small" onClick={onLihatSemua} sx={{ textTransform: 'none' }}>Kotak masuk</Button>}
    >
      {r.darurat_aktif > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>{r.darurat_aktif} pengaduan darurat perlu ditangani hari ini.</Alert>
      )}
      {isLoading ? (
        <Stack spacing={1}>{[1, 2].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}</Stack>
      ) : !data?.list.length ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <IconInbox size={40} color="#94A3B8" />
          <Typography variant="subtitle1" sx={{ mt: 1 }}>Tidak ada pengaduan aktif</Typography>
        </Box>
      ) : (
        <Stack divider={<Divider flexItem />} spacing={1}>
          {data.list.map((p) => {
            const u = metaUrgensi(p.urgensi?.kode);
            return (
              <ButtonBase
                key={p.id}
                onClick={() => onBuka(p)}
                sx={{ display: 'block', textAlign: 'left', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                  <Typography variant="subtitle2">{p.kategori?.label}</Typography>
                  <Chip size="small" label={u.label} color={u.color} variant={p.urgensi?.kode === 'darurat' ? 'filled' : 'outlined'} />
                  {p.menunggu_balasan && <Chip size="small" label="Pesan baru" color="error" variant="outlined" />}
                </Box>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {waktuRelatif(p.dibuat_pada)} · {p.ditugaskan_ke?.nama || 'Belum ditugaskan'}
                </Typography>
              </ButtonBase>
            );
          })}
        </Stack>
      )}
    </DashboardCard>
  );
};

PengaduanRingkasCard.propTypes = {
  onBuka: PropTypes.func.isRequired,
  onLihatSemua: PropTypes.func.isRequired,
};

export default PengaduanRingkasCard;
