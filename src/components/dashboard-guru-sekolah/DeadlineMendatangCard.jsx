import PropTypes from 'prop-types';
import { Box, Chip, Divider, Stack, Typography } from '@mui/material';
import { IconCalendarDue } from '@tabler/icons-react';
import DashboardCard from 'src/components/shared/DashboardCard';
import { formatTanggalWaktu, sisaWaktuDeadline } from 'src/components/perangkat-ajar/perangkatAjarConfig';

const TIGA_HARI_MS = 3 * 24 * 60 * 60 * 1000;

// Deadline per jenis perangkat ajar yang belum lewat, beserta sisa dokumen yang belum diunggah.
const DeadlineMendatangCard = ({ items, timezone }) => (
  <DashboardCard title="Deadline Mendatang">
    {items.length === 0 ? (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <IconCalendarDue size={40} color="#94A3B8" />
        <Typography variant="subtitle1" sx={{ mt: 1 }}>Tidak ada deadline mendatang</Typography>
      </Box>
    ) : (
      <Stack divider={<Divider flexItem />} spacing={1.5}>
        {items.map((item) => {
          const mendesak = item.waktu - Date.now() <= TIGA_HARI_MS;
          const lengkap = item.sisa === 0;
          return (
            <Box key={item.jenis?.kode} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={600}>{item.jenis?.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTanggalWaktu(item.deadline, timezone)} · {sisaWaktuDeadline(item.deadline)}
                </Typography>
              </Box>
              <Chip
                size="small"
                label={lengkap ? 'Lengkap' : `${item.sisa}/${item.total} belum`}
                color={lengkap ? 'success' : mendesak ? 'error' : 'warning'}
                variant={lengkap ? 'filled' : 'outlined'}
              />
            </Box>
          );
        })}
      </Stack>
    )}
  </DashboardCard>
);

DeadlineMendatangCard.propTypes = {
  items: PropTypes.array.isRequired,
  timezone: PropTypes.string,
};

export default DeadlineMendatangCard;
