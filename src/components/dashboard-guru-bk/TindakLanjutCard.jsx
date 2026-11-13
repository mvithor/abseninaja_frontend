import PropTypes from 'prop-types';
import { Box, Button, ButtonBase, Chip, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { IconChecks } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import DashboardCard from 'src/components/shared/DashboardCard';
import axiosInstance from 'src/utils/axiosInstance';
import { BK_API } from 'src/components/pemetaan-siswa/pemetaanConfig';
import { formatTanggalPendek, isTindakLanjutLewat, STATUS_PENANGANAN } from 'src/components/jurnal-bk/jurnalConfig';

const MAKS = 5;

// Catatan penanganan berstatus "Perlu Tindak Lanjut", diurutkan dari tanggal tindak lanjut terdekat.
const TindakLanjutCard = ({ lingkup, hariIni, onDetail, onLihatSemua }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['bk-jurnal', { status: STATUS_PENANGANAN.TINDAK_LANJUT, sort: 'tindak_lanjut', lingkup, limit: MAKS }],
    queryFn: async () => {
      const res = await axiosInstance.get(`${BK_API}/jurnal`, {
        params: { status: STATUS_PENANGANAN.TINDAK_LANJUT, sort: 'tindak_lanjut', lingkup, limit: MAKS },
      });
      return { list: res.data?.data || [], total: res.data?.meta?.total ?? 0 };
    },
  });

  const list = data?.list || [];

  return (
    <DashboardCard
      title="Tindak Lanjut Penanganan"
      subtitle={data ? `${data.total} catatan menunggu tindak lanjut` : undefined}
      action={<Button size="small" onClick={onLihatSemua} sx={{ textTransform: 'none' }}>Lihat jurnal</Button>}
    >
      {isLoading ? (
        <Stack spacing={1}>{[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}</Stack>
      ) : list.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <IconChecks size={40} color="#13DEB9" />
          <Typography variant="subtitle1" sx={{ mt: 1 }}>Tidak ada tindak lanjut yang tertunda</Typography>
        </Box>
      ) : (
        <Stack divider={<Divider flexItem />} spacing={1}>
          {list.map((e) => {
            const lewat = isTindakLanjutLewat(e, hariIni);
            return (
              <ButtonBase
                key={e.id}
                onClick={() => onDetail(e)}
                sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, textAlign: 'left', borderRadius: 1, p: 1, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap>{e.siswa.map((s) => s.nama).join(', ')}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {e.judul} · {e.kategori?.label}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  variant="outlined"
                  color={lewat ? 'error' : 'warning'}
                  label={e.tindak_lanjut?.tanggal ? `${lewat ? 'Terlewat ' : ''}${formatTanggalPendek(e.tindak_lanjut.tanggal)}` : 'Tanpa tanggal'}
                />
              </ButtonBase>
            );
          })}
        </Stack>
      )}
    </DashboardCard>
  );
};

TindakLanjutCard.propTypes = {
  lingkup: PropTypes.string,
  hariIni: PropTypes.string,
  onDetail: PropTypes.func.isRequired,
  onLihatSemua: PropTypes.func.isRequired,
};

export default TindakLanjutCard;
