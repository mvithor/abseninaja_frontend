import PropTypes from 'prop-types';
import { Box, ButtonBase, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';
import { IconChevronRight } from '@tabler/icons-react';
import DashboardCard from 'src/components/shared/DashboardCard';
import { DIMENSI } from 'src/components/pemetaan-siswa/pemetaanConfig';

// Satu meter per dimensi: berapa siswa yang perlu perhatian pada dimensi itu dari total binaan.
// Satu rasio terhadap batas = meter (bukan donut). Klik baris membuka Pemetaan Siswa terfilter.
const RingkasanDimensiCard = ({ ringkasan, isLoading, onPilihDimensi }) => {
  const total = ringkasan?.total_siswa || 0;

  return (
    <DashboardCard title="Pemetaan per Dimensi" subtitle="Siswa yang perlu perhatian pada tiap dimensi">
      <Stack spacing={1}>
        {DIMENSI.map((d) => {
          const Icon = d.icon;
          const jumlah = ringkasan?.dimensi?.find((x) => x.kode === d.kode)?.jumlah_perhatian ?? 0;
          const pct = total ? Math.round((jumlah / total) * 100) : 0;
          return (
            <ButtonBase
              key={d.kode}
              onClick={() => onPilihDimensi(d.kode)}
              sx={{ display: 'block', textAlign: 'left', borderRadius: 1, p: 1, '&:hover': { bgcolor: 'action.hover' } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <Icon size={18} />
                <Typography variant="subtitle2" sx={{ flex: 1 }}>{d.label}</Typography>
                {isLoading ? (
                  <Skeleton width={70} />
                ) : (
                  <Typography variant="subtitle2">
                    {jumlah}
                    <Typography component="span" variant="caption" color="text.secondary"> siswa · {pct}%</Typography>
                  </Typography>
                )}
                <IconChevronRight size={16} />
              </Box>
              <LinearProgress variant="determinate" value={isLoading ? 0 : pct} sx={{ height: 6, borderRadius: 3 }} />
            </ButtonBase>
          );
        })}
      </Stack>
    </DashboardCard>
  );
};

RingkasanDimensiCard.propTypes = {
  ringkasan: PropTypes.object,
  isLoading: PropTypes.bool,
  onPilihDimensi: PropTypes.func.isRequired,
};

export default RingkasanDimensiCard;
