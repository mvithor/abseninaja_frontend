import PropTypes from 'prop-types';
import { Badge, Box, ButtonBase, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { IconAlertOctagon, IconInbox, IconMessage, IconUser } from '@tabler/icons-react';
import { metaStatusPengaduan, metaUrgensi, waktuRelatif } from 'src/components/pengaduan-bk/pengaduanConfig';

// Kotak masuk pengaduan: satu baris per laporan. Darurat diberi garis kiri & ikon (bukan warna saja).
const PengaduanInbox = ({ rows, isLoading, isError, errorMessage, emptyMessage, onBuka }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (isError) return <Typography color="error" variant="h6" align="center" sx={{ py: 6 }}>{errorMessage}</Typography>;
  if (rows.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <IconInbox size={44} color="#94A3B8" />
        <Typography variant="h6" sx={{ mt: 1 }}>{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1}>
      {rows.map((p) => {
        const urgensi = metaUrgensi(p.urgensi?.kode);
        const status = metaStatusPengaduan(p.status?.kode);
        const darurat = p.urgensi?.kode === 'darurat';
        return (
          <Paper
            key={p.id}
            variant="outlined"
            sx={{ borderLeft: 4, borderLeftColor: darurat ? 'error.main' : p.status?.kode === 'baru' ? 'primary.main' : 'divider' }}
          >
            <ButtonBase onClick={() => onBuka(p)} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%', textAlign: 'left', p: 2 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mb: 0.5 }}>
                  {darurat && <IconAlertOctagon size={18} color="currentColor" />}
                  <Typography variant="subtitle1" fontWeight={p.status?.kode === 'baru' ? 700 : 600}>{p.kategori?.label}</Typography>
                  <Chip size="small" label={urgensi.label} color={urgensi.color} variant={darurat ? 'filled' : 'outlined'} />
                  <Chip size="small" label={status.label} color={status.color} variant="outlined" />
                  <Typography variant="caption" color="text.secondary">{p.kode_tiket}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.cuplikan}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.75, color: 'text.secondary' }}>
                  <Typography variant="caption">Masuk {waktuRelatif(p.dibuat_pada)}</Typography>
                  {p.tingkat && <Typography variant="caption">Tingkat {p.tingkat}</Typography>}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconUser size={13} />
                    <Typography variant="caption" color={p.ditugaskan_ke ? 'text.secondary' : 'warning.dark'}>
                      {p.ditugaskan_ke?.nama || 'Belum ditugaskan'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Badge color="error" variant="dot" invisible={!p.menunggu_balasan} sx={{ mt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: p.menunggu_balasan ? 'error.main' : 'text.secondary' }}>
                  <IconMessage size={16} />
                  <Typography variant="caption">{p.jumlah_pesan}</Typography>
                </Box>
              </Badge>
            </ButtonBase>
          </Paper>
        );
      })}
    </Stack>
  );
};

PengaduanInbox.propTypes = {
  rows: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  errorMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
  onBuka: PropTypes.func.isRequired,
};

export default PengaduanInbox;
