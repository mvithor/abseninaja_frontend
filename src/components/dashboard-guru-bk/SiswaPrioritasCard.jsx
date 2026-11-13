import PropTypes from 'prop-types';
import { Box, Button, ButtonBase, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { IconMoodHappy } from '@tabler/icons-react';
import DashboardCard from 'src/components/shared/DashboardCard';
import PerhatianChips from 'src/components/pemetaan-siswa/PerhatianChips';

// Siswa dengan faktor perhatian terbanyak (>= 2), untuk didahulukan pendampingannya.
const SiswaPrioritasCard = ({ siswaList, isLoading, onDetail, onLihatSemua }) => (
  <DashboardCard
    title="Siswa Prioritas Pendampingan"
    subtitle="Memiliki 2 faktor perhatian atau lebih"
    action={
      <Button size="small" onClick={onLihatSemua} sx={{ textTransform: 'none' }}>
        Lihat semua
      </Button>
    }
  >
    {/* Ruang bawah: CardContent bawaan MUI memangkas padding bawah anak terakhir, jadi daftar terasa menempel ke tepi kartu. */}
    <Box sx={{ pb: 2 }}>
      {isLoading ? (
        <Stack spacing={1}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={56} />
          ))}
        </Stack>
      ) : siswaList.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <IconMoodHappy size={40} color="#13DEB9" />
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Tidak ada siswa dengan 2 faktor perhatian atau lebih
          </Typography>
        </Box>
      ) : (
        <Stack divider={<Divider flexItem />} spacing={1}>
          {siswaList.map((s) => (
            <ButtonBase
              key={s.id}
              onClick={() => onDetail(s)}
              sx={{
                display: 'block',
                textAlign: 'left',
                borderRadius: 1,
                p: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {s.nama}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {s.kelas?.nama} · {s.perhatian.length} faktor
                </Typography>
              </Box>
              <PerhatianChips perhatian={s.perhatian} />
            </ButtonBase>
          ))}
        </Stack>
      )}
    </Box>
  </DashboardCard>
);

SiswaPrioritasCard.propTypes = {
  siswaList: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  onDetail: PropTypes.func.isRequired,
  onLihatSemua: PropTypes.func.isRequired,
};

export default SiswaPrioritasCard;
