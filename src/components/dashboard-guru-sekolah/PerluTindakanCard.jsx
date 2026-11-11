import PropTypes from 'prop-types';
import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';
import { IconCircleCheck, IconUpload } from '@tabler/icons-react';
import DashboardCard from 'src/components/shared/DashboardCard';
import {
  formatTanggalWaktu,
  isKunciDibuka,
  labelPenugasan,
  sisaWaktuDeadline,
  STATUS_PERANGKAT,
} from 'src/components/perangkat-ajar/perangkatAjarConfig';

const MAKS_ITEM = 5;

// Daftar dokumen yang bisa (dan perlu) diunggah guru sekarang, dengan tombol unggah langsung.
const PerluTindakanCard = ({ items, timezone, onUnggah, onLihatSemua }) => {
  const tampil = items.slice(0, MAKS_ITEM);

  return (
    <DashboardCard
      title="Perlu Tindakan"
      subtitle={items.length ? `${items.length} perangkat ajar menunggu unggahan Anda` : undefined}
      action={
        items.length > MAKS_ITEM ? (
          <Button size="small" onClick={onLihatSemua} sx={{ textTransform: 'none' }}>
            Lihat semua
          </Button>
        ) : null
      }
    >
      {tampil.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <IconCircleCheck size={40} color="#13DEB9" />
          <Typography variant="subtitle1" sx={{ mt: 1 }}>Tidak ada yang perlu diunggah saat ini</Typography>
        </Box>
      ) : (
        <Stack divider={<Divider flexItem />} spacing={1.5}>
          {tampil.map(({ penugasan, dokumen }) => {
            const revisi = dokumen.status === STATUS_PERANGKAT.PERLU_REVISI;
            const dibuka = isKunciDibuka(dokumen);
            const batas = dibuka ? dokumen.kunci_dibuka.sampai : dokumen.deadline;
            return (
              <Box key={`${penugasan.id}-${dokumen.jenis?.kode}`} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" fontWeight={600}>{dokumen.jenis?.label}</Typography>
                    {revisi && <Chip label="Perlu Revisi" color="error" size="small" />}
                    {dibuka && <Chip label="Akses dibuka Waka" color="warning" size="small" variant="outlined" />}
                  </Box>
                  <Typography variant="body2" color="text.secondary" noWrap>{labelPenugasan(penugasan)}</Typography>
                  {revisi && dokumen.feedback_terakhir?.catatan && (
                    <Typography variant="caption" color="error.main" sx={{ display: 'block' }} noWrap>
                      {dokumen.feedback_terakhir.catatan}
                    </Typography>
                  )}
                  {batas && (
                    <Typography variant="caption" color="text.secondary">
                      {dibuka ? 'Dibuka s.d.' : 'Deadline'} {formatTanggalWaktu(batas, timezone)} · {sisaWaktuDeadline(batas)}
                    </Typography>
                  )}
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  color={revisi ? 'error' : 'primary'}
                  startIcon={<IconUpload size={16} />}
                  onClick={() => onUnggah(penugasan, dokumen)}
                  sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                >
                  {revisi ? 'Unggah Ulang' : 'Unggah'}
                </Button>
              </Box>
            );
          })}
        </Stack>
      )}
    </DashboardCard>
  );
};

PerluTindakanCard.propTypes = {
  items: PropTypes.array.isRequired,
  timezone: PropTypes.string,
  onUnggah: PropTypes.func.isRequired,
  onLihatSemua: PropTypes.func.isRequired,
};

export default PerluTindakanCard;
