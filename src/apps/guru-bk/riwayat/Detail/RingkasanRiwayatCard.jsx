import PropTypes from 'prop-types';
import { Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import ChildCard from 'src/components/shared/ChildCard';
import { statusPenangananMeta } from 'src/components/jurnal-bk/jurnalConfig';

// Ringkasan riwayat: total, jumlah per status, dan kategori masalah (bar berperingkat satu warna).
const RingkasanRiwayatCard = ({ ringkasan, kategoriAktif, onPilihKategori }) => {
  const total = ringkasan?.total || 0;

  return (
    <ChildCard title="Ringkasan Permasalahan">
      <Typography variant="h3">
        {total}
        <Typography component="span" variant="body1" color="text.secondary"> catatan penanganan</Typography>
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1, mb: 2 }}>
        {(ringkasan?.per_status || []).map((s) => {
          const meta = statusPenangananMeta(s.kode);
          return <Chip key={s.kode} size="small" color={meta.color} label={`${meta.label}: ${s.jumlah}`} />;
        })}
      </Box>

      <Typography variant="subtitle2" sx={{ mb: 1 }}>Kategori masalah</Typography>
      {total === 0 ? (
        <Typography variant="body2" color="text.secondary">Belum ada catatan.</Typography>
      ) : (
        <Stack spacing={1}>
          {ringkasan.per_kategori.map((k) => {
            const aktif = kategoriAktif === k.kode;
            return (
              <Box
                key={k.kode}
                onClick={() => onPilihKategori(aktif ? '' : k.kode)}
                sx={{ cursor: 'pointer', p: 0.5, borderRadius: 1, bgcolor: aktif ? 'primary.light' : 'transparent', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight={aktif ? 600 : 400}>{k.label}</Typography>
                  <Typography variant="body2">{k.jumlah}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={(k.jumlah / total) * 100} sx={{ height: 6, borderRadius: 3 }} />
              </Box>
            );
          })}
          <Typography variant="caption" color="text.secondary">Klik kategori untuk menyaring timeline.</Typography>
        </Stack>
      )}
    </ChildCard>
  );
};

RingkasanRiwayatCard.propTypes = {
  ringkasan: PropTypes.object,
  kategoriAktif: PropTypes.string,
  onPilihKategori: PropTypes.func.isRequired,
};

export default RingkasanRiwayatCard;
